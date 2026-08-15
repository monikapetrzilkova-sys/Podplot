import {
  THING_ITEM_CATEGORIES,
  THING_ITEM_MULTILINE_LABELS,
  normalizeThingItemCategory,
} from "../data/thingItemCategories.js";
import { MarketCategoryIcon } from "../data/marketCategoryIcons.jsx";

/** Společná matice 4×2 pro Daruji / Prodám / Sháním / Půjčovna */
export default function ThingCategoryGrid({
  value,
  onChange,
  className = "",
  allowDeselect = true,
  disabled = false,
  ariaLabel = "Věcná kategorie",
}) {
  const activeId = value ? normalizeThingItemCategory(value) : null;

  return (
    <div
      className={`pp-guide-grid grid grid-cols-4 grid-rows-2 gap-x-0 gap-y-1 ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {THING_ITEM_CATEGORIES.map((cat) => {
        const active = activeId === cat.id;
        const lines = THING_ITEM_MULTILINE_LABELS[cat.id] ?? [cat.label];
        const multiline = lines.length > 1;

        return (
          <button
            key={cat.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(active && allowDeselect ? null : cat.id)}
            aria-pressed={active}
            className={`pp-guide-grid-tile pp-pressable flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-colors disabled:opacity-40 ${
              multiline ? "min-h-[52px]" : "min-h-[48px]"
            } ${active ? "pp-guide-tile--active" : "text-[#1B4D3E] hover:bg-white/80"}`}
          >
            <MarketCategoryIcon
              id={cat.id}
              className={`w-[18px] h-[18px] shrink-0 ${active ? "text-[#1B4D3E]" : "text-[#4D8B7A]"}`}
            />
            <span
              className={`pp-guide-grid-label w-full font-semibold text-center ${
                multiline ? "text-[9px] leading-[1.2]" : "text-[10px] leading-tight"
              } ${active ? "text-[#1B4D3E]" : "text-[#4D8B7A]"}`}
            >
              {multiline
                ? lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))
                : cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
