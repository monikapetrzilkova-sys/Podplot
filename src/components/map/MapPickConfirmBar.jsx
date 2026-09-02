import { IconMapPin } from "../../data/icons.jsx";
import { DoodleTargetIcon } from "../doodle/doodleIcons.jsx";

/** Lišta při výběru místa hlášení / podnětu přímo na mapě. */
export default function MapPickConfirmBar({
  mode = "report",
  pinError,
  onConfirm,
  onCancel,
  onUseCurrentLocation,
}) {
  const isReport = mode === "report";

  return (
    <div className="pp-map-pick-bar" role="region" aria-label="Výběr místa na mapě">
      <div className="pp-map-pick-bar-inner">
        <DoodleTargetIcon className="w-8 h-8 shrink-0 text-[#1B4332] mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-stone-900 leading-snug">
            {isReport ? "Nové hlášení — vyber místo" : "Podnět úřadu — vyber místo"}
          </p>
          <p className="text-xs text-stone-500 mt-0.5 leading-snug">
            {isReport
              ? "Klepni na mapu nebo použij svou polohu — formulář se otevře hned."
              : "Klepni na mapu, nebo pokračuj bez místa."}
          </p>
          {pinError && <p className="text-xs text-red-600 mt-1">{pinError}</p>}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 text-lg leading-none"
          aria-label="Zrušit výběr"
        >
          ×
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2.5">
        {onUseCurrentLocation && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
          >
            <IconMapPin className="w-3.5 h-3.5 shrink-0" />
            Moje poloha
          </button>
        )}
        {!isReport && (
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-w-[8rem] py-2 text-xs font-bold text-stone-700 border border-stone-200 rounded-xl bg-white hover:bg-stone-50"
          >
            Pokračovat bez místa
          </button>
        )}
      </div>
    </div>
  );
}
