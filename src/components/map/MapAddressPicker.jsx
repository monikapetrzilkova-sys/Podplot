import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  createAddressAutocomplete,
  formatSuggestionAddress,
} from "../../data/addressAutocomplete.js";
import { addressSuggestionToPick } from "../../utils/geoCoordinates.js";

/**
 * Napsání adresy jako rovnocenná cesta k výběru místa na mapě.
 *
 * Klepnutí do mapy vyžaduje myš nebo prst — kdo ovládá appku klávesnicí, neměl
 * jak špendlík posunout (dřív vždy spadl doprostřed mapy). Adresa navíc bývá
 * rychlejší i na telefonu, než trefovat se do malé mapy.
 *
 * Výsledek je záměrně shodný s klepnutím: špendlík se objeví v mapě a uživatel
 * vidí, kam adresa dopadla. Žádná druhá „skrytá" poloha vedle špendlíku.
 */
export default function MapAddressPicker({
  onPick,
  referenceRadiusKm,
  center,
  /** Obec a PSČ aktivní lokality — našeptávač bez nich nehledá (canSearchAddress). */
  city = "",
  psc = "",
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const listId = useId();

  const autocomplete = useMemo(
    () => createAddressAutocomplete(setItems, setLoading, setError),
    []
  );
  useEffect(() => () => autocomplete.cancel(), [autocomplete]);

  // Klepnutí mimo pole náš seznam zavře — jinak by přebil mapu pod ním.
  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [open]);

  const runSearch = (value) => {
    setQuery(value);
    setOpen(true);
    // Hledáme v obci, kterou má uživatel právě otevřenou — bez obce nebo PSČ
    // našeptávač vůbec nezačne (viz canSearchAddress) a pole by mlčky nedělalo nic.
    autocomplete.search(value, { city, psc });
  };

  const choose = (item) => {
    const pick = addressSuggestionToPick(item, center, referenceRadiusKm);
    if (!pick) {
      setError("Tato adresa nemá souřadnice — zkus jinou nebo klepni do mapy.");
      return;
    }
    setQuery(formatSuggestionAddress(item));
    setItems([]);
    setOpen(false);
    setError(null);
    onPick?.(pick);
  };

  const hasList = open && items.length > 0;

  return (
    <div ref={boxRef} className={`pp-map-address-picker relative ${className}`.trim()}>
      <label htmlFor={`${listId}-input`} className="sr-only">
        Najít místo podle adresy
      </label>
      <input
        id={`${listId}-input`}
        type="text"
        value={query}
        onChange={(e) => runSearch(e.target.value)}
        onFocus={() => items.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && hasList) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        placeholder="Nebo napiš adresu — např. Lípová 12"
        autoComplete="off"
        role="combobox"
        aria-expanded={hasList}
        aria-controls={hasList ? listId : undefined}
        aria-describedby={`${listId}-hint`}
        className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/40"
      />
      <p id={`${listId}-hint`} className="sr-only">
        Vyber adresu ze seznamu a špendlík se přesune na mapě. Místo psaní můžeš
        také klepnout přímo do mapy.
      </p>

      {loading && (
        <p className="mt-1 text-[11px] text-stone-500" role="status">
          Hledám adresu…
        </p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-600" role="alert">
          {error}
        </p>
      )}

      {hasList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Nalezené adresy"
          className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg py-1"
        >
          {items.map((item) => {
            const label = formatSuggestionAddress(item) || item.label;
            return (
              <li key={item.id} role="option" aria-selected="false">
                <button
                  type="button"
                  onClick={() => choose(item)}
                  className="w-full text-left px-3 py-2 text-sm text-stone-800 hover:bg-stone-50 focus:bg-stone-50 focus:outline-none"
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
