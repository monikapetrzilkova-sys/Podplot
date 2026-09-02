import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import ModalDoodleBackdrop from "../ModalDoodleBackdrop.jsx";
import AppPanelPortal from "../AppPanelPortal.jsx";
import {
  CLAIM_DEMO_OTP,
  CLAIM_OTP_LENGTH,
  getOfficialClaimContacts,
  maskClaimEmail,
  maskClaimPhone,
} from "../../data/placeClaimVerification.js";

/**
 * Převzetí profilu místa — ověření kódem na oficiální telefon nebo e-mail
 * (údaje z Google Maps / veřejných dat místa), ne přes IČO.
 */
export default function ClaimProfileModal({ place, open, onClose }) {
  const { requestPlaceClaimCode, confirmPlaceClaimWithCode } = useApp();
  const contacts = useMemo(() => getOfficialClaimContacts(place), [place]);

  const [channel, setChannel] = useState(null); // "phone" | "email"
  const [step, setStep] = useState("choose"); // choose | code
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode("");
    setStep("choose");
    setSending(false);
    setVerifying(false);
    if (contacts.hasPhone) setChannel("phone");
    else if (contacts.hasEmail) setChannel("email");
    else setChannel(null);
  }, [open, place?.id, contacts.hasPhone, contacts.hasEmail]);

  if (!open || !place) return null;

  const selectedLabel =
    channel === "phone" && contacts.phone
      ? maskClaimPhone(contacts.phone)
      : channel === "email" && contacts.email
        ? maskClaimEmail(contacts.email)
        : null;

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!channel || !contacts.canVerify) return;
    setSending(true);
    const ok = await requestPlaceClaimCode({
      placeId: place.id,
      googlePlaceId: place.googlePlaceId ?? null,
      channel,
      place,
    });
    setSending(false);
    if (ok) {
      setStep("code");
      setCode("");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setVerifying(true);
    const ok = await confirmPlaceClaimWithCode({
      placeId: place.id,
      googlePlaceId: place.googlePlaceId ?? null,
      channel,
      code: code.trim(),
      place,
    });
    setVerifying(false);
    if (ok) onClose();
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-app-sheet p-5 space-y-3" role="dialog" aria-label="Převzít profil">
          <h2 className="text-lg font-bold text-stone-900">Převzít profil</h2>

          <div className="rounded-xl border border-[#C5DDD4] bg-[#F1F6F5] px-3 py-2.5 space-y-1.5">
            <p className="text-[11px] text-[#1B4D3E] leading-relaxed">
              Chceš spravovat <strong>{place.name}</strong> jako provozovatel. Podplot ti pošle
              jednorázový kód na <strong>telefon nebo e-mail, který u místa dohledáme</strong> (např.
              Google Maps nebo oficiální web) — ne na libovolný kontakt, který si vymyslíte.
            </p>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              IČO nestačí: to si najde kdokoli. Kód dokáže jen ten, kdo má přístup k oficiální
              schránce / telefonu podniku.
            </p>
            {contacts.sourceLabel ? (
              <p className="text-[10px] text-stone-500">
                Zdroj kontaktů: {contacts.sourceLabel}.
              </p>
            ) : null}
          </div>

          {!contacts.canVerify ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                U tohoto místa teď <strong>nemáme oficiální telefon ani e-mail</strong>, na který
                bychom kód poslali.
                {contacts.website ? (
                  <>
                    {" "}
                    Web známe ({contacts.website.replace(/^https?:\/\//, "")}), ale e-mail z něj
                    zatím nenačítáme automaticky.
                  </>
                ) : null}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Doplň telefon nebo e-mail do firemního profilu na <strong>Google Maps</strong> (nebo
                na oficiální web, ze kterého kontakty bereme) a zkus převzetí znovu. Bez ověřitelného
                kontaktu profil nepřiřadíme.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-sm font-semibold border border-stone-200 rounded-xl"
              >
                Zavřít
              </button>
            </div>
          ) : step === "choose" ? (
            <form onSubmit={handleSendCode} className="space-y-3">
              <p className="text-[11px] font-semibold text-stone-600">Kam má přijít kód?</p>
              <div className="space-y-2">
                {contacts.hasPhone && (
                  <button
                    type="button"
                    onClick={() => setChannel("phone")}
                    className={`w-full text-left px-3 py-3 rounded-xl border transition-colors ${
                      channel === "phone"
                        ? "border-[#3D7A68] bg-[#F1F6F5]"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-stone-900">Telefon</span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">
                      SMS na {maskClaimPhone(contacts.phone)}
                    </span>
                  </button>
                )}
                {contacts.hasEmail && (
                  <button
                    type="button"
                    onClick={() => setChannel("email")}
                    className={`w-full text-left px-3 py-3 rounded-xl border transition-colors ${
                      channel === "email"
                        ? "border-[#3D7A68] bg-[#F1F6F5]"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-stone-900">E-mail</span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">
                      Kód na {maskClaimEmail(contacts.email)}
                    </span>
                  </button>
                )}
              </div>
              {!contacts.hasPhone && contacts.hasEmail && (
                <p className="text-[10px] text-stone-500">
                  Telefon u místa chybí — ověření jde jen přes oficiální e-mail.
                </p>
              )}
              {contacts.hasPhone && !contacts.hasEmail && (
                <p className="text-[10px] text-stone-500">
                  E-mail u místa chybí — ověření jde jen přes telefon z mapových údajů.
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-sm border border-stone-200 rounded-xl"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={!channel || sending}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                  style={{ background: "#1B4332" }}
                >
                  {sending ? "Odesílám…" : "Poslat kód"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Zadej {CLAIM_OTP_LENGTH}místný kód, který jsme poslali na{" "}
                <strong>{selectedLabel}</strong>. Kód platí cca 10 minut.
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CLAIM_OTP_LENGTH))}
                placeholder={`Kód z ${channel === "phone" ? "SMS" : "e-mailu"}`}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm tracking-[0.2em] text-center font-semibold"
                required
              />
              <p className="text-[10px] text-stone-400">
                Demo: v toastu uvidíš vygenerovaný kód; funguje i {CLAIM_DEMO_OTP}.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("choose");
                    setCode("");
                  }}
                  className="flex-1 py-2.5 text-sm border border-stone-200 rounded-xl"
                >
                  Zpět
                </button>
                <button
                  type="submit"
                  disabled={code.length !== CLAIM_OTP_LENGTH || verifying}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                  style={{ background: "#1B4332" }}
                >
                  {verifying ? "Ověřuji…" : "Ověřit a převzít"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending}
                className="w-full text-[11px] text-[#3D7A68] font-semibold underline-offset-2 hover:underline"
              >
                Poslat kód znovu
              </button>
            </form>
          )}
        </div>
      </div>
    </AppPanelPortal>
  );
}
