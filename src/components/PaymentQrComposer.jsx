/** Formulář QR platby do chatu (česká SPD QR platba) */

import { useEffect, useState } from "react";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import {
  buildSpdString,
  formatAmountCzk,
  formatPaymentSummary,
  loadSavedPaymentAccount,
  savePaymentAccount,
  spdToQrDataUrl,
  toCzechIban,
} from "../utils/czechPaymentQr.js";

export default function PaymentQrComposer({
  open,
  onClose,
  onSend,
  defaultMessage = "",
  defaultAmount = "",
  senderName = "",
}) {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [vs, setVs] = useState("");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAccount(loadSavedPaymentAccount());
    setAmount(defaultAmount ? String(defaultAmount) : "");
    setVs("");
    setMessage(defaultMessage || "");
    setPreviewUrl(null);
    setError("");
    setBusy(false);
  }, [open, defaultAmount, defaultMessage]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const run = async () => {
      setError("");
      setPreviewUrl(null);
      const am = formatAmountCzk(amount);
      const iban = toCzechIban(account);
      if (!am || !iban) return;
      try {
        const spd = buildSpdString({
          iban: account,
          amount,
          message,
          variableSymbol: vs,
          recipientName: senderName,
        });
        const url = await spdToQrDataUrl(spd);
        if (!cancelled) setPreviewUrl(url);
      } catch (err) {
        if (!cancelled) setError(err.message || "QR se nepodařilo sestavit.");
      }
    };
    const t = window.setTimeout(run, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, account, amount, message, vs, senderName]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const spd = buildSpdString({
        iban: account,
        amount,
        message,
        variableSymbol: vs,
        recipientName: senderName,
      });
      const qrDataUrl = await spdToQrDataUrl(spd);
      const iban = toCzechIban(account);
      savePaymentAccount(account.trim());
      onSend?.({
        text: formatPaymentSummary({ amount, message }),
        meta: {
          kind: "payment_qr",
          amount: formatAmountCzk(amount),
          currency: "CZK",
          iban,
          accountDisplay: account.trim(),
          variableSymbol: String(vs || "").replace(/\D/g, "").slice(0, 10) || null,
          paymentMessage: String(message || "").trim() || null,
          recipientName: senderName || null,
          spd,
          qrDataUrl,
        },
      });
      onClose?.();
    } catch (err) {
      setError(err.message || "Nepodařilo se odeslat QR platbu.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay pp-app-sheet-overlay--center" style={{ zIndex: 12 }}>
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <form
          onSubmit={submit}
          className="pp-app-sheet max-w-[360px] mx-auto rounded-2xl pointer-events-auto overflow-hidden relative z-[1]"
          role="dialog"
          aria-labelledby="payment-qr-title"
        >
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h2 id="payment-qr-title" className="text-base font-bold text-stone-900">
                  QR platba do zprávy
                </h2>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  Příjemce naskenuje kód v bankovní aplikaci (česká QR platba).
                </p>
              </div>
              <button type="button" onClick={onClose} className="text-stone-400 text-xl px-1" aria-label="Zavřít">
                ×
              </button>
            </div>

            <label className="block text-xs mb-2">
              <span className="font-semibold text-stone-700">Účet / IBAN</span>
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="CZ65… nebo 19-2000145399/0800"
                className="w-full mt-1 px-2.5 py-2 border border-stone-200 rounded-xl text-sm bg-white"
                autoComplete="off"
                required
              />
            </label>

            <label className="block text-xs mb-2">
              <span className="font-semibold text-stone-700">Částka (Kč)</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="např. 350"
                className="w-full mt-1 px-2.5 py-2 border border-stone-200 rounded-xl text-sm bg-white"
                required
              />
            </label>

            <label className="block text-xs mb-2">
              <span className="font-semibold text-stone-700">VS (volitelně)</span>
              <input
                value={vs}
                onChange={(e) => setVs(e.target.value)}
                inputMode="numeric"
                className="w-full mt-1 px-2.5 py-2 border border-stone-200 rounded-xl text-sm bg-white"
              />
            </label>

            <label className="block text-xs mb-2">
              <span className="font-semibold text-stone-700">Zpráva pro platbu</span>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="např. Smyslohrání"
                maxLength={60}
                className="w-full mt-1 px-2.5 py-2 border border-stone-200 rounded-xl text-sm bg-white"
              />
            </label>

            {previewUrl ? (
              <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <img src={previewUrl} alt="Náhled QR platby" className="w-40 h-40 rounded-lg bg-white" />
                <p className="text-[10px] text-stone-500 text-center">
                  {formatPaymentSummary({ amount, message })}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-stone-400 text-center py-6 border border-dashed border-stone-200 rounded-xl">
                Vyplň účet a částku — zobrazí se náhled QR.
              </p>
            )}

            {error ? <p className="mt-2 text-[11px] text-[#A85858] font-medium">{error}</p> : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 text-stone-600 bg-white"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={busy || !previewUrl}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#3D7A68] text-white disabled:opacity-50"
              >
                {busy ? "Odesílám…" : "Poslat do chatu"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppPanelPortal>
  );
}
