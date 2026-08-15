/** Kompaktní mřížka kategorií — všechny najednou viditelné bez scrollu */

import { GuideCategoryIcon } from "./guideCategoryIcons.jsx";

export default function CategoryGrid({ categories, activeId, onSelect, columns = 4, className = "" }) {
  return (
    <div
      className={`grid gap-1.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="group"
      aria-label="Kategorie"
    >
      {categories.map((cat) => {
        const active = activeId === cat.id;
        const label = cat.shortLabel ?? cat.label;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={active}
            title={cat.label}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[3.5rem] px-1 py-1.5 rounded-xl border text-center transition-all ${
              active
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm scale-[1.02]"
                : "bg-white text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50"
            }`}
          >
            <GuideCategoryIcon
              id={cat.id}
              className={`w-6 h-6 ${active ? "text-white" : "text-stone-600"}`}
            />
            <span className="text-[10px] font-semibold leading-tight line-clamp-2 px-0.5">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
