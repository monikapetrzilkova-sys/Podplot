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
  ADDRESS_SEARCH_HINT,
} from "../data/addressAutocomplete.js";
import { splitStreetAndHouseNumber, stripDiacritics } from "../../lib/ruianAddress.mjs";

function ReqStar() {
  return (
    <span className="text-teal-800" aria-hidden="true">
      {" *"}
    </span>
  );
}

function AddressSuggestList({ items, header, onPick, listRef, renderLabel }) {
  if (!items.length) return null;
  return (
    <ul
      ref={listRef}
      className="pp-address-suggest-list"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
    >
      {header ? (
        <li className="px-3 py-1.5 text-[10px] text-stone-400 border-b border-stone-100">{header}</li>
      ) : null}
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(item)}
            className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-[#E8F3EF] border-b border-stone-100 last:border-0"
          >
            {renderLabel(item)}
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Stejný formát adresy jako při registraci: PSČ → obec → ulice → po výběru ulice všechna č.p.
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
  const [suggestMode, setSuggestMode] = useState("streets");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const autocompleteRef = useRef(null);
  const suggestWrapRef = useRef(null);
  const suggestListRef = useRef(null);
  const houseInputRef = useRef(null);
  const streetKodRef = useRef(null);
  const selectedStreetRef = useRef("");
  const pscReady = pscDigits(psc).length === 5;
  const streetSuggestions = suggestMode === "streets" ? suggestions : [];
  const houseSuggestions = suggestMode === "houses" ? suggestions : [];
  const houseTypedInStreet = Boolean(splitStreetAndHouseNumber(street).houseNumber);
  const streetFieldSuggestions = houseTypedInStreet ? houseSuggestions : streetSuggestions;

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
    if (suggestions.length === 0) return;
    suggestListRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [suggestions.length]);

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

  const runStreetSearch = (nextStreet = street, nextCity = city, nextPsc = psc) => {
    setSuggestMode("streets");
    autocompleteRef.current?.search(nextStreet, {
      city: nextCity,
      psc: nextPsc,
      mode: "streets",
    });
  };

  const runHouseSearch = (nextStreet = street, nextHouse = houseNumber, nextCity = city, nextPsc = psc) => {
    setSuggestMode("houses");
    autocompleteRef.current?.search(nextStreet, {
      houseNumber: nextHouse,
      city: nextCity,
      psc: nextPsc,
      mode: "houses",
      streetKod: streetKodRef.current,
    });
  };

  const handleStreetQuery = (value) => {
    const parsed = splitStreetAndHouseNumber(value);
    const selected = stripDiacritics(selectedStreetRef.current);
    const typed = stripDiacritics(parsed.street);
    if (!selected || typed !== selected) {
      streetKodRef.current = null;
      selectedStreetRef.current = "";
    }
    if (parsed.street && parsed.houseNumber) {
      setSuggestions([]);
      if (parsed.houseNumber !== houseNumber) onHouseNumberChange?.(parsed.houseNumber);
      runHouseSearch(parsed.street, parsed.houseNumber, city, psc);
      return;
    }
    runStreetSearch(parsed.street || value, city, psc);
  };

  const handlePscChange = (value) => {
    setCityManual(false);
    streetKodRef.current = null;
    selectedStreetRef.current = "";
    setSuggestMode("streets");
    onPscChange?.(formatPscInput(value));
    onClearError?.("psc");
    onClearError?.("city");
    setSuggestions([]);
  };

  const applySuggestion = (item) => {
    if (item.street) onStreetChange?.(item.street);
    if (item.psc && pscDigits(psc).length !== 5) {
      setCityManual(Boolean(item.city));
      onPscChange?.(formatPscInput(item.psc));
    }
    if (item.city && !String(city ?? "").trim()) {
      setCityManual(true);
      onCityChange?.(refineLocalityFromPsc(item.psc || psc, item.city));
    }
    setSuggestError(null);
    onClearError?.("street");
    onClearError?.("houseNumber");
    onClearError?.("psc");
    onClearError?.("city");

    if (item.kind === "street" || (item.street && !item.houseNumber)) {
      streetKodRef.current = item.streetKod ?? null;
      selectedStreetRef.current = item.street || "";
      onHouseNumberChange?.("");
      onSuggestionPick?.(item);
      runHouseSearch(item.street, "", item.city || city, item.psc || psc);
      queueMicrotask(() => houseInputRef.current?.focus());
      return;
    }

    if (item.houseNumber) onHouseNumberChange?.(item.houseNumber);
    if (item.street) selectedStreetRef.current = item.street;
    if (item.streetKod) streetKodRef.current = item.streetKod;
    onSuggestionPick?.(item);
    setSuggestions([]);
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
            if (street) runStreetSearch(street, e.target.value, psc);
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

      <div ref={suggestWrapRef} className="space-y-3">
        <div>
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
              handleStreetQuery(value);
            }}
            onFocus={() => {
              if (street) handleStreetQuery(street);
            }}
            onBlur={() => {
              const parsed = splitStreetAndHouseNumber(street);
              if (parsed.street && parsed.houseNumber) {
                if (parsed.street !== street) onStreetChange?.(parsed.street);
                if (parsed.houseNumber !== houseNumber) onHouseNumberChange?.(parsed.houseNumber);
              }
            }}
            placeholder={pscReady ? "Název ulice" : "Nejdřív zadej PSČ"}
            autoComplete="off"
            className={inputClass(fieldErrors.street)}
          />
          <AddressSuggestList
            items={streetFieldSuggestions}
            header={
              houseTypedInStreet && houseSuggestions.length
                ? `Adresa v ulici ${splitStreetAndHouseNumber(street).street}`
                : null
            }
            listRef={houseTypedInStreet || suggestMode === "streets" ? suggestListRef : undefined}
            onPick={applySuggestion}
            renderLabel={(item) =>
              houseTypedInStreet
                ? `${item.street} ${item.houseNumber}`.trim()
                : item.street || item.label
            }
          />
          {fieldErrors.street ? <p className="mt-1 text-xs text-red-600">{fieldErrors.street}</p> : null}
          {!fieldErrors.street ? <p className="mt-1 text-[10px] text-stone-400">{ADDRESS_SEARCH_HINT}</p> : null}
          {suggestLoading && suggestMode === "streets" ? (
            <p className="mt-1 text-[11px] text-stone-400">Hledám ulice…</p>
          ) : null}
          {suggestError && suggestMode === "streets" ? (
            <p className="mt-1 text-[11px] text-amber-700">{suggestError}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-[11px] text-stone-500 mb-1">
            Číslo popisné
            {required ? <ReqStar /> : null}
          </label>
          <input
            ref={houseInputRef}
            type="text"
            inputMode="numeric"
            value={houseNumber}
            onChange={(e) => {
              const value = e.target.value;
              onHouseNumberChange?.(value);
              onClearError?.("houseNumber");
              if (street) runHouseSearch(street, value, city, psc);
            }}
            onFocus={() => {
              if (street) runHouseSearch(street, houseNumber, city, psc);
            }}
            placeholder={street ? "Vyber číslo z nabídky" : "Nejdřív vyber ulici"}
            autoComplete="off"
            className={inputClass(fieldErrors.houseNumber)}
          />
          <AddressSuggestList
            items={houseSuggestions}
            header={
              houseSuggestions.length
                ? `Čísla popisná v ulici ${splitStreetAndHouseNumber(street).street || houseSuggestions[0].street} (${houseSuggestions.length})`
                : null
            }
            listRef={suggestMode === "houses" ? suggestListRef : undefined}
            onPick={applySuggestion}
            renderLabel={(item) => item.houseNumber || item.label}
          />
          {fieldErrors.houseNumber ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.houseNumber}</p>
          ) : null}
          {suggestLoading && suggestMode === "houses" ? (
            <p className="mt-1 text-[11px] text-stone-400">Načítám čísla popisná…</p>
          ) : null}
          {suggestError && suggestMode === "houses" ? (
            <p className="mt-1 text-[11px] text-amber-700">{suggestError}</p>
          ) : null}
        </div>
      </div>

      {privacyNote ? (
        <p className="text-[10px] text-stone-400 leading-relaxed">{privacyNote}</p>
      ) : null}
    </fieldset>
  );
}
