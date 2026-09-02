import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const PRESETS = [
  "Předání o víkendu (sobota–neděle).",
  "Předání ráno před prací (7:00–8:00) nebo večer po práci (17:00–19:00).",
  "Předání ve všední dny po 18:00, o víkendu dopoledne.",
];

export default function LendingAvailabilityPanel({ offerCount }) {
  const { lendingAvailability, updateLendingAvailability } = useApp();
  const [onVacation, setOnVacation] = useState(Boolean(lendingAvailability.onVacation));
  const [message, setMessage] = useState(lendingAvailability.availabilityMessage ?? "");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setOnVacation(Boolean(lendingAvailability.onVacation));
    setMessage(lendingAvailability.availabilityMessage ?? "");
  }, [lendingAvailability.onVacation, lendingAvailability.availabilityMessage]);

  const dirty =
    onVacation !== Boolean(lendingAvailability.onVacation) ||
    message.trim() !== (lendingAvailability.availabilityMessage ?? "").trim();

  const save = () => {
    updateLendingAvailability({
      onVacation,
      availabilityMessage: message.trim(),
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <div className="pp-card p-3 mb-2 border border-[#3D7A68]/25 bg-[#F7FAF9]">
      <p className="text-xs font-bold text-[#1B4D3E] mb-0.5">Dostupnost půjčovny</p>
      <p className="text-[11px] text-stone-500 mb-3">
        Platí automaticky pro všech {offerCount}{" "}
        {offerCount === 1 ? "tvoji věc" : offerCount < 5 ? "tvoje věci" : "tvých věcí"} k půjčení.
      </p>

      <label className="flex items-start gap-2.5 mb-3 cursor-pointer">
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

      <label className="block mb-2">
        <span className="text-xs font-semibold text-stone-700">Zpráva k předání</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Např. Standardně předávám o víkendu, nebo ve všední dny 7:00–8:00 před prací a 17:30–19:00 po práci."
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#3D7A68]"
        />
      </label>

      <div className="flex flex-wrap gap-1.5 mb-3">
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
  );
}
