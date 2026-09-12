import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const PRESETS = [
  "Předání o víkendu (sobota–neděle).",
  "Předání ráno před prací (7:00–8:00) nebo večer po práci (17:00–19:00).",
  "Předání ve všední dny po 18:00, o víkendu dopoledne.",
];

export default function LendingAvailabilityPanel({ offerCount }) {
  const { lendingAvailability, updateLendingAvailability } = useApp();
  const availability = lendingAvailability ?? { onVacation: false, availabilityMessage: "" };
  const [open, setOpen] = useState(false);
  const [onVacation, setOnVacation] = useState(Boolean(availability.onVacation));
  const [message, setMessage] = useState(availability.availabilityMessage ?? "");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setOnVacation(Boolean(availability.onVacation));
    setMessage(availability.availabilityMessage ?? "");
  }, [availability.onVacation, availability.availabilityMessage]);

  const dirty =
    onVacation !== Boolean(availability.onVacation) ||
    message.trim() !== (availability.availabilityMessage ?? "").trim();

  const save = () => {
    updateLendingAvailability({
      onVacation,
      availabilityMessage: message.trim(),
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  const summary = availability.onVacation
    ? "Dovolená — rezervace vypnuté"
    : availability.availabilityMessage?.trim()
      ? "Zpráva k předání nastavená"
      : "Nastavit dovolenou a předání";

  return (
    <div className="pp-card mb-2 border border-[#3D7A68]/25 bg-[#F7FAF9] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-3 py-2.5 flex items-center gap-2"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-xs font-bold text-[#1B4D3E]">Dostupnost půjčovny</span>
          <span className="block text-[11px] text-stone-500 mt-0.5 truncate">{summary}</span>
        </span>
        <span
          className={`shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="px-3 pb-3 pt-1 border-t border-[#3D7A68]/15 space-y-3">
          <p className="text-[11px] text-stone-500">
            Platí automaticky pro všech {offerCount}{" "}
            {offerCount === 1 ? "tvoji věc" : offerCount < 5 ? "tvoje věci" : "tvých věcí"} k půjčení.
          </p>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onVacation}
              onChange={(e) => setOnVacation(e.target.checked)}
              className="mt-0.5 accent-[#1B4D3E]"
            />
            <span>
              <span className="text-sm font-semibold text-stone-800 block">Jsem na dovolené</span>
              <span className="text-[11px] text-stone-500">
                U všech nabídek se zobrazí, že teď nepůjčujete, a rezervace se vypne.
              </span>
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-stone-700">Zpráva k předání</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Např. Standardně předávám o víkendu, nebo ve všední dny 7:00–8:00 před prací a 17:30–19:00 po práci."
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#3D7A68]"
            />
          </label>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMessage(preset)}
                className="text-[10px] font-medium text-[#3D7A68] bg-white border border-[#3D7A68]/30 px-2 py-1 rounded-lg hover:bg-[#E8F0ED]"
              >
                {preset.length > 42 ? `${preset.slice(0, 40)}…` : preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={save}
            disabled={!dirty && !savedFlash}
            className="w-full py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: "#1B4332" }}
          >
            {savedFlash ? "Uloženo — platí u všech nabídek" : "Uložit nastavení"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
