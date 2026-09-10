import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import ReportsMapModule from "../modules/ReportsMapModule.jsx";
import { IconMapPin } from "../data/icons.jsx";
import { ANNOUNCEMENT_SCOPES } from "../data/officeAnnouncementScope.js";
import {
  createAddressAutocomplete,
  reverseGeocodeStreet,
} from "../data/addressAutocomplete.js";

const TYPES = [
  { id: "crisis", label: "Mimořádné", hint: "SOS pruh u sousedů" },
  { id: "news", label: "Běžná aktualita", hint: "Na Domů u sousedů" },
  { id: "prompt", label: "Podnět / návrh", hint: "Jen do evidence úřadu" },
];

const SCOPES = [
  ANNOUNCEMENT_SCOPES.municipality,
  ANNOUNCEMENT_SCOPES.place,
  ANNOUNCEMENT_SCOPES.streets,
];

/**
 * Nové oznámení úřadu — stejný plný formulář jako hlášení sousedů.
 * Rozsah: celá obec, konkrétní místo, nebo ulice z mapy / vyhledávání.
 */
export default function OfficeAnnouncementForm({ open, initialType = "news", onClose }) {
  const {
    activeLocation,
    publishAreaNews,
    publishCrisisAlert,
    createOfficePrompt,
  } = useApp();

  const municipality = activeLocation?.municipality || "obec";
  const [type, setType] = useState(initialType || "news");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scope, setScope] = useState("municipality");
  const [address, setAddress] = useState("");
  const [streets, setStreets] = useState([]);
  const [streetQuery, setStreetQuery] = useState("");
  const [streetHits, setStreetHits] = useState([]);
  const [streetLoading, setStreetLoading] = useState(false);
  const [draftPin, setDraftPin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(initialType || "news");
    setTitle("");
    setBody("");
    setScope("municipality");
    setAddress("");
    setStreets([]);
    setStreetQuery("");
    setStreetHits([]);
    setDraftPin(null);
    setError("");
  }, [open, initialType]);

  const autocomplete = useMemo(
    () =>
      createAddressAutocomplete(
        (rows) => {
          const names = [];
          const seen = new Set();
          for (const row of rows ?? []) {
            const name = String(row.street || "").trim();
            const key = name.toLocaleLowerCase("cs");
            if (!name || seen.has(key)) continue;
            seen.add(key);
            names.push(name);
          }
          setStreetHits(names.slice(0, 8));
        },
        setStreetLoading,
        () => {}
      ),
    []
  );

  useEffect(() => () => autocomplete.cancel(), [autocomplete]);

  useEffect(() => {
    if (scope !== "streets") return;
    autocomplete.search(streetQuery, {
      city: activeLocation?.municipality || "",
      psc: activeLocation?.psc || "",
    });
  }, [streetQuery, scope, autocomplete, activeLocation?.municipality, activeLocation?.psc]);

  const addStreet = (name) => {
    const street = String(name || "").trim();
    if (!street) return;
    setStreets((prev) =>
      prev.some((s) => s.toLocaleLowerCase("cs") === street.toLocaleLowerCase("cs"))
        ? prev
        : [...prev, street]
    );
    setStreetQuery("");
    setStreetHits([]);
  };

  const onPickPin = async (pos) => {
    setDraftPin(pos);
    if (scope === "streets" && pos?.lat != null && pos?.lng != null) {
      const street = await reverseGeocodeStreet(pos.lat, pos.lng);
      if (street) addStreet(street);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Doplň nadpis i text.");
      return;
    }
    if (scope === "place" && !address.trim() && !draftPin) {
      setError("Vyber místo na mapě, nebo napiš adresu.");
      return;
    }
    if (scope === "streets" && streets.length === 0) {
      setError("Přidej aspoň jednu ulici — zapsáním nebo klepnutím do mapy.");
      return;
    }
    const payload = {
      title: title.trim(),
      body: body.trim(),
      scope,
      streets,
      address: address.trim(),
      mapPos: draftPin,
      municipality,
    };
    if (type === "crisis") publishCrisisAlert(payload);
    else if (type === "prompt") createOfficePrompt(payload);
    else publishAreaNews(payload);
    onClose?.();
  };

  if (!open) return null;

  const typeMeta = TYPES.find((t) => t.id === type) ?? TYPES[1];

  return (
    <AppPanelPortal>
      <div className="pp-security-form-overlay pointer-events-none">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-security-form-modal pointer-events-auto" role="dialog" aria-label="Nové oznámení">
          <div className="pp-security-form-modal-header">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-stone-900 leading-snug">Nové oznámení</h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-snug">{typeMeta.hint}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none"
              aria-label="Zavřít"
            >
              ×
            </button>
          </div>

          {scope !== "municipality" ? (
            <div className="pp-security-form-modal-map">
              <ReportsMapModule
                reports={[]}
                pickMode
                draftPin={draftPin}
                onPickPin={onPickPin}
                compact
                large={false}
                hideLegend
                hideStats
                singleReportMode
                draftPinOnly
                showHomePin={false}
                focusDraftPin
              />
            </div>
          ) : null}

          <form onSubmit={submit} className="pp-security-form-modal-form" noValidate>
            <div className="pp-security-form-modal-body space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${
                      type === t.id
                        ? "border-[#3D7A68] bg-[#E8F3EF] text-[#1B4D3E]"
                        : "border-stone-200 text-stone-600 bg-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div>
                <p className="text-[11px] font-semibold text-stone-600 mb-1.5">Platí pro</p>
                <div className="space-y-1.5">
                  {SCOPES.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                        scope === s.id
                          ? "border-[#3D7A68] bg-[#F1F6F5] text-[#1B4D3E]"
                          : "border-stone-200 text-stone-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="announce-scope"
                        checked={scope === s.id}
                        onChange={() => setScope(s.id)}
                        className="accent-[#3D7A68]"
                      />
                      {s.id === "municipality" ? `Celá ${municipality}` : s.label}
                    </label>
                  ))}
                </div>
              </div>

              {scope === "place" ? (
                <label className="block">
                  <span className="text-[11px] font-semibold text-stone-600">Místo / adresa</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="např. hřiště Na Louce, nebo Budějovická 12"
                    className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
                  />
                  <p className="text-[10px] text-stone-400 mt-1 inline-flex items-center gap-1">
                    <IconMapPin className="w-3 h-3" />
                    Nebo klepni do mapy nahoře
                  </p>
                </label>
              ) : null}

              {scope === "streets" ? (
                <div>
                  <span className="text-[11px] font-semibold text-stone-600">Ulice</span>
                  {streets.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {streets.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStreets((prev) => prev.filter((x) => x !== s))}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E8F3EF] text-[#1B4D3E] text-[11px] font-semibold"
                        >
                          {s}
                          <span className="text-stone-400">×</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <input
                    type="search"
                    value={streetQuery}
                    onChange={(e) => setStreetQuery(e.target.value)}
                    placeholder="Začni psát ulici, nebo klepni do mapy"
                    className="mt-1.5 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
                  />
                  {streetLoading ? (
                    <p className="text-[10px] text-stone-400 mt-1">Hledám ulice…</p>
                  ) : null}
                  {streetHits.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {streetHits.map((name) => (
                        <li key={name}>
                          <button
                            type="button"
                            onClick={() => addStreet(name)}
                            className="w-full text-left px-3 py-2 rounded-xl border border-stone-100 hover:bg-[#F7FAF9] text-sm"
                          >
                            {name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <label className="block">
                <span className="text-[11px] font-semibold text-stone-600">Nadpis</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder={
                    type === "crisis"
                      ? "Např. Havárie vody v části obce"
                      : "Např. Blokové čištění ulic ve středu"
                  }
                  className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-stone-600">Text</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Co platí, od kdy, co mají sousedé udělat…"
                  className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none"
                />
              </label>
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
            </div>
            <div className="pp-security-form-modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-stone-200"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1B4D3E]"
              >
                {type === "crisis" ? "Odeslat SOS" : type === "prompt" ? "Uložit" : "Publikovat"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppPanelPortal>
  );
}
