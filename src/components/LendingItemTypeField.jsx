/** Nadpis půjčovny = typ věci s našeptáváním */

import { useEffect, useId, useRef, useState } from "react";
import {
  filterLendingItemTypeSuggestions,
  resolveLendingItemTypeLabel,
} from "../data/lendingItemTypes.js";

export default function LendingItemTypeField({
  value,
  onChange,
  categoryId = null,
  disabled = false,
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const suggestions = filterLendingItemTypeSuggestions(value, categoryId);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (label) => {
    onChange(label);
    setOpen(false);
  };

  const commitClean = () => {
    const resolved = resolveLendingItemTypeLabel(value, categoryId);
    if (resolved && resolved !== value) onChange(resolved);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={listId} className="block text-sm font-semibold text-stone-800 mb-1.5">
        Typ věci
      </label>
      <p className="text-xs text-stone-500 mb-1.5">
        V nadpisu vždy typ (nářadí, sekačka…). Ne „Půjčím … na víkend“ — to patří do popisu.
      </p>
      <input
        id={listId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${listId}-list`}
        aria-autocomplete="list"
        value={value}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={commitClean}
        placeholder="Začněte psát — např. Aku vrtačka"
        className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#D8F3DC] disabled:bg-[#FAF9F6]"
      />
      {open && !disabled && suggestions.length > 0 && (
        <ul
          id={`${listId}-list`}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg py-1"
        >
          {suggestions.map((s) => (
            <li key={s.label} role="option">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s.label)}
                className="w-full text-left px-3 py-2 text-sm text-stone-800 hover:bg-[#F1F6F5]"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
