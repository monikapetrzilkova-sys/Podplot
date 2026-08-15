/** Kompaktní mřížka 2×4 — minimalistické line-art ikony */

import { GuideCategoryIcon } from "./guideCategoryIcons.jsx";

/** Dlouhé názvy zobrazíme na 2 řádcích místo zmenšeného fontu */
const MULTILINE_LABELS = {
  "verejny-prostor": ["Veřejný", "prostor"],
  remeslnici: ["Služby u vás", "doma"],
};

function GuideLabel({ id, label, active }) {
  const lines = MULTILINE_LABELS[id] ?? [label];
  const color = active ? "text-[#1B4D3E]" : "text-[#4D8B7A]";

  if (lines.length === 1) {
    return (
      <span className={`pp-guide-grid-label w-full text-[10px] font-semibold leading-tight text-center ${color}`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`pp-guide-grid-label w-full text-[9px] font-semibold leading-[1.2] text-center ${color}`}>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

export default function CompactGuideGrid({ categories, activeId, onSelect, className = "" }) {
  return (
    <div
      className={`pp-guide-grid grid grid-cols-4 grid-rows-2 gap-x-0 gap-y-1 ${className}`}
      role="group"
      aria-label="Kategorie průvodce"
    >
      {categories.map((cat) => {
        const active = activeId === cat.id;
        const multiline = Boolean(MULTILINE_LABELS[cat.id]);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={active}
            className={`pp-guide-grid-tile pp-pressable flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-colors ${
              multiline ? "min-h-[56px]" : "min-h-[50px]"
            } ${active ? "pp-guide-tile--active" : "text-[#1B4D3E] hover:bg-white/80"}`}
          >
            <GuideCategoryIcon
              id={cat.id}
              className={`w-[18px] h-[18px] shrink-0 ${active ? "text-[#1B4D3E]" : "text-[#4D8B7A]"}`}
            />
            <GuideLabel id={cat.id} label={cat.label} active={active} />
          </button>
        );
      })}
    </div>
  );
}
