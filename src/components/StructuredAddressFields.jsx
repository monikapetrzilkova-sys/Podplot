import { useEffect, useState } from "react";
import {
  formatPscInput,
  pscDigits,
  lookupCityByPsc,
  ADDRESS_PRIVACY_NOTE_INLINE,
} from "../data/addressValidation.js";

/**
 * Stejný formát adresy jako při registraci: ulice, č.p., PSČ, obec (z PSČ).
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
  fieldErrors = {},
  onClearError,
  legend = "Výchozí adresa / působnost",
  showLegend = true,
  privacyNote = ADDRESS_PRIVACY_NOTE_INLINE,
  className = "",
}) {
  const [cityLoading, setCityLoading] = useState(false);
  const [cityManual, setCityManual] = useState(Boolean(city && !pscDigits(psc)));

  useEffect(() => {
    const digits = pscDigits(psc);
    if (digits.length !== 5 || cityManual) return;

    let cancelled = false;
    setCityLoading(true);
    lookupCityByPsc(digits).then((result) => {
      if (cancelled) return;
      if (result?.city) {
        onCityChange?.(result.city);
        onClearError?.("city");
        onClearError?.("psc");
      }
      setCityLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [psc, cityManual]); // eslint-disable-line react-hooks/exhaustive-deps -- sync city from PSC only

  const handlePscChange = (value) => {
    setCityManual(false);
    onPscChange?.(formatPscInput(value));
    onClearError?.("psc");
    onClearError?.("city");
  };

  return (
    <fieldset className={`space-y-2 ${className}`.trim()}>
      {showLegend ? (
        <legend className="text-xs font-semibold text-stone-600 mb-0.5">{legend}</legend>
      ) : null}

      <div>
        <label className="block text-[11px] text-stone-500 mb-1">Ulice</label>
        <input
          type="text"
          value={street}
          onChange={(e) => {
            onStreetChange?.(e.target.value);
            onClearError?.("street");
          }}
          placeholder="např. Hlavní"
          className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/30 ${
            fieldErrors.street ? "border-red-300" : "border-stone-200"
          }`}
        />
        {fieldErrors.street ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.street}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-stone-500 mb-1">Číslo popisné</label>
          <input
            type="text"
            inputMode="numeric"
            value={houseNumber}
            onChange={(e) => {
              onHouseNumberChange?.(e.target.value);
              onClearError?.("houseNumber");
            }}
            placeholder="12"
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/30 ${
              fieldErrors.houseNumber ? "border-red-300" : "border-stone-200"
            }`}
          />
          {fieldErrors.houseNumber ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.houseNumber}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-[11px] text-stone-500 mb-1">PSČ</label>
          <input
            type="text"
            inputMode="numeric"
            value={psc}
            onChange={(e) => handlePscChange(e.target.value)}
            placeholder="142 00"
            maxLength={6}
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/30 ${
              fieldErrors.psc ? "border-red-300" : "border-stone-200"
            }`}
          />
          {fieldErrors.psc ? <p className="mt-1 text-xs text-red-600">{fieldErrors.psc}</p> : null}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-stone-500 mb-1">Obec (dle PSČ)</label>
        <input
          type="text"
          value={cityLoading ? "Načítám obec…" : city}
          onChange={(e) => {
            setCityManual(true);
            onCityChange?.(e.target.value);
            onClearError?.("city");
          }}
          disabled={cityLoading}
          placeholder={
            pscDigits(psc).length === 5 ? "Doplní se automaticky" : "Nejdřív zadejte PSČ"
          }
          className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/30 ${
            fieldErrors.city
              ? "border-red-300"
              : city && !cityManual
                ? "bg-[#F1F6F5] border-[#C5DDD4]"
                : "border-stone-200"
          }`}
        />
        {fieldErrors.city ? <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p> : null}
        {city && !cityManual && !cityLoading ? (
          <p className="mt-1 text-[11px] text-[#3D7A68]">✓ Obec doplněna podle PSČ</p>
        ) : null}
      </div>

      {privacyNote ? (
        <p className="text-[10px] text-stone-400 leading-relaxed">{privacyNote}</p>
      ) : null}
    </fieldset>
  );
}
