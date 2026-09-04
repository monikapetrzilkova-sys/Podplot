import { useEffect, useRef, useState } from "react";
import {
  formatPscInput,
  pscDigits,
  lookupCityByPsc,
  ADDRESS_PRIVACY_NOTE_INLINE,
} from "../data/addressValidation.js";
import { refineLocalityFromPsc } from "../data/czechCityDistricts.js";
import {
  createAddressAutocomplete,
  formatSuggestionAddress,
  ADDRESS_SEARCH_HINT,
} from "../data/addressAutocomplete.js";

function ReqStar() {
  return (
    <span className="text-teal-800" aria-hidden="true">
      {" *"}
    </span>
  );
}

/**
 * Stejný formát adresy jako při registraci: PSČ → obec → ulice (našeptávání včetně č.p.) → číslo popisné.
 */
export default function StructuredAddressFields({
  street,
  houseNumber,
  psc,
  city,
  onStreetChange,
  onHouseNumberChange,
  onPscChange,
  onCityChange,
  onSuggestionPick,
  fieldErrors = {},
  onClearError,
  onFieldError,
  legend = "Výchozí adresa / působnost",
  showLegend = true,
  required = false,
  privacyNote = ADDRESS_PRIVACY_NOTE_INLINE,
  className = "",
}) {
  const [cityLoading, setCityLoading] = useState(false);
  const [cityManual, setCityManual] = useState(Boolean(city && !pscDigits(psc)));
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const autocompleteRef = useRef(null);
  const suggestWrapRef = useRef(null);
  const pscReady = pscDigits(psc).length === 5;

  useEffect(() => {
    autocompleteRef.current = createAddressAutocomplete(setSuggestions, setSuggestLoading, setSuggestError);
    return () => autocompleteRef.current?.cancel();
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (!suggestWrapRef.current?.contains(e.target)) setSuggestions([]);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const digits = pscDigits(psc);
    if (digits.length !== 5 || cityManual) return;

    let cancelled = false;
    setCityLoading(true);
    lookupCityByPsc(digits).then((result) => {
      if (cancelled) return;
      if (result?.city) {
        onCityChange?.(refineLocalityFromPsc(digits, result.city, result.suburb));
        onClearError?.("city");
        onClearError?.("psc");
      } else {
        onCityChange?.("");
        onFieldError?.("city", "Obec k tomuto PSČ nenašla — doplň ji ručně níže.");
      }
      setCityLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [psc, cityManual]); // eslint-disable-line react-hooks/exhaustive-deps -- sync city from PSC only

  const runSearch = (nextStreet = street, nextHouse = houseNumber, nextCity = city, nextPsc = psc) => {
    autocompleteRef.current?.search(nextStreet, {
      houseNumber: nextHouse,
      city: nextCity,
      psc: nextPsc,
    });
  };

  const handlePscChange = (value) => {
    setCityManual(false);
    onPscChange?.(formatPscInput(value));
    onClearError?.("psc");
    onClearError?.("city");
    setSuggestions([]);
  };

  const applySuggestion = (item) => {
    if (item.street) onStreetChange?.(item.street);
    if (item.houseNumber) onHouseNumberChange?.(item.houseNumber);
    if (item.psc && pscDigits(psc).length !== 5) {
      setCityManual(Boolean(item.city));
      onPscChange?.(formatPscInput(item.psc));
    }
    if (item.city && !String(city ?? "").trim()) {
      setCityManual(true);
      onCityChange?.(refineLocalityFromPsc(item.psc || psc, item.city));
    }
    onSuggestionPick?.(item);
    setSuggestions([]);
    setSuggestError(null);
    onClearError?.("street");
    onClearError?.("houseNumber");
    onClearError?.("psc");
    onClearError?.("city");
    if (item.street && !item.houseNumber) {
      runSearch(item.street, "", item.city || city, item.psc || psc);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/30 ${
      hasError ? "border-red-300" : "border-stone-200"
    }`;

  return (
    <fieldset className={`space-y-3 ${className}`.trim()}>
      {showLegend ? (
        <legend className="text-xs font-semibold text-stone-600 mb-1">
          {legend}
          {required ? <ReqStar /> : null}
        </legend>
      ) : null}

      <div>
        <label className="block text-[11px] text-stone-500 mb-1">
          PSČ
          {required ? <ReqStar /> : null}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={psc}
          onChange={(e) => handlePscChange(e.target.value)}
          placeholder="142 00"
          maxLength={6}
          className={inputClass(fieldErrors.psc)}
        />
        {fieldErrors.psc ? <p className="mt-1 text-xs text-red-600">{fieldErrors.psc}</p> : null}
      </div>

      <div>
        <label className="block text-[11px] text-stone-500 mb-1">
          Obec / městská část (dle PSČ)
          {required ? <ReqStar /> : null}
        </label>
        <input
          type="text"
          value={cityLoading ? "Načítám obec…" : city}
          onChange={(e) => {
            setCityManual(true);
            onCityChange?.(e.target.value);
            onClearError?.("city");
            runSearch(street, houseNumber, e.target.value, psc);
          }}
          disabled={cityLoading}
          placeholder={pscReady ? "Doplní se automaticky" : "Nejdřív zadej PSČ"}
          className={`${inputClass(fieldErrors.city)} ${
            city && !cityManual && !fieldErrors.city ? "bg-[#F1F6F5] border-[#C5DDD4]" : ""
          }`}
        />
        {fieldErrors.city ? <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p> : null}
        {city && !cityManual && !cityLoading ? (
          <p className="mt-1 text-[11px] text-[#3D7A68]">✓ Lokalita doplněna podle PSČ</p>
        ) : null}
      </div>

      <div ref={suggestWrapRef}>
        <label className="block text-[11px] text-stone-500 mb-1">
          Ulice
          {required ? <ReqStar /> : null}
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => {
            const value = e.target.value;
            onStreetChange?.(value);
            onClearError?.("street");
            runSearch(value, houseNumber, city, psc);
          }}
          onFocus={() => runSearch(street, houseNumber, city, psc)}
          placeholder={pscReady ? "Stačí P — nabídneme ulice i č.p. v obci" : "Nejdřív zadej PSČ"}
          autoComplete="off"
          className={inputClass(fieldErrors.street)}
        />
        {fieldErrors.street ? <p className="mt-1 text-xs text-red-600">{fieldErrors.street}</p> : null}
        {!fieldErrors.street ? <p className="mt-1 text-[10px] text-stone-400">{ADDRESS_SEARCH_HINT}</p> : null}
        {suggestLoading ? <p className="mt-1 text-[11px] text-stone-400">Hledám adresy…</p> : null}
        {suggestError ? <p className="mt-1 text-[11px] text-amber-700">{suggestError}</p> : null}
        {suggestions.length > 0 ? (
          <ul className="mt-1 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => applySuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-[#E8F3EF] border-b border-stone-100 last:border-0"
                >
                  {formatSuggestionAddress(item)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <label className="block text-[11px] text-stone-500 mb-1">
          Číslo popisné
          {required ? <ReqStar /> : null}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={houseNumber}
          onChange={(e) => {
            const value = e.target.value;
            onHouseNumberChange?.(value);
            onClearError?.("houseNumber");
            runSearch(street, value, city, psc);
          }}
          placeholder={pscReady ? "Doplní se z nabídky, nebo zadej ručně" : "12"}
          autoComplete="off"
          className={inputClass(fieldErrors.houseNumber)}
        />
        {fieldErrors.houseNumber ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.houseNumber}</p>
        ) : null}
      </div>

      {privacyNote ? (
        <p className="text-[10px] text-stone-400 leading-relaxed">{privacyNote}</p>
      ) : null}
    </fieldset>
  );
}
