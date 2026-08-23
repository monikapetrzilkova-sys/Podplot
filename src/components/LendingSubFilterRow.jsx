import { useEffect, useState } from "react";
import ThingCategoryGrid from "./ThingCategoryGrid.jsx";
import { getThingItemCategory } from "../data/thingItemCategories.js";
import { MarketCategoryIcon } from "../data/marketCategoryIcons.jsx";

/**
 * Věcné kategorie (Domácnost, Nářadí…) — ve výchozím stavu sbalené.
 * Rozbalí se až po klepnutí na „Filtrovat dle kategorií“.
 */
export default function LendingSubFilterRow({
  value,
  onChange,
  className = "",
  allowDeselect = true,
  /** Při změně typu (Daruji→Prodám) znovu sbalit matici */
  resetKey = null,
}) {
  const [open, setOpen] = useState(Boolean(value));
  const active = value ? getThingItemCategory(value) : null;

  useEffect(() => {
    setOpen(Boolean(value));
  }, [resetKey]);

  return (
    <div className={`pp-thing-cat-filter ${className}`.trim()}>
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`pp-thing-cat-filter__toggle flex-1 min-w-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-left text-[11px] font-semibold border transition-colors ${
            open || active
              ? "border-[#C5DDD4] bg-[#F1F6F5] text-[#1B4D3E]"
              : "border-stone-200 bg-white/90 text-stone-600 hover:bg-stone-50"
          }`}
        >
          {active ? (
            <>
              <MarketCategoryIcon id={active.id} className="w-3.5 h-3.5 shrink-0 text-[#3D7A68]" />
              <span className="truncate">{active.label}</span>
            </>
          ) : (
            <span className="truncate">Filtrovat dle kategorií</span>
          )}
          <span className="ml-auto shrink-0 text-[10px] text-stone-400" aria-hidden>
            {open ? "▲" : "▼"}
          </span>
        </button>
        {active ? (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="shrink-0 px-2 py-1.5 rounded-xl text-[10px] font-semibold text-stone-500 hover:bg-stone-100 border border-transparent"
            aria-label="Zrušit filtr kategorie"
          >
            Zrušit
          </button>
        ) : null}
      </div>

      {open ? (
        <ThingCategoryGrid
          value={value}
          onChange={(id) => {
            onChange(id);
            if (id) setOpen(false);
          }}
          className="mt-1.5"
          allowDeselect={allowDeselect}
          ariaLabel="Věcná kategorie"
        />
      ) : null}
    </div>
  );
}
