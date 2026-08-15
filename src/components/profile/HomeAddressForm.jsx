import { useEffect, useRef, useState } from "react";
import {
  validateAddressFields,
  formatFullAddress,
  formatPscInput,
  pscDigits,
  lookupCityByPsc,
  parseStoredAddress,
  ADDRESS_PRIVACY_NOTE_INLINE,
} from "../../data/addressValidation.js";
import {
  createAddressAutocomplete,
  formatSuggestionAddress,
  ADDRESS_SEARCH_HINT,
} from "../../data/addressAutocomplete.js";

export default function HomeAddressForm({ initialAddress = "", onSave, onCancel, compact = false }) {
  const parsed = parseStoredAddress(initialAddress);
  const [street, setStreet] = useState(parsed.street);
  const [houseNumber, setHouseNumber] = useState(parsed.houseNumber);
  const [psc, setPsc] = useState(parsed.psc);
  const [city, setCity] = useState(parsed.city);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityManual, setCityManual] = useState(Boolean(parsed.city && !parsed.psc));
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const [pickedCoords, setPickedCoords] = useState(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    autocompleteRef.current = createAddressAutocomplete(setSuggestions, setSuggestLoading, setSuggestError);
    return () => autocompleteRef.current?.cancel();
  }, []);

  useEffect(() => {
    const digits = pscDigits(psc);
    if (digits.length !== 5 || cityManual) return;

    let cancelled = false;
    setCityLoading(true);
    lookupCityByPsc(digits).then((result) => {
      if (cancelled) return;
      if (result?.city) {
        setCity(result.city);
        setFieldErrors((prev) => ({ ...prev, city: "", psc: "" }));
      }
      setCityLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [psc, cityManual]);

  const handlePscChange = (value) => {
    setPsc(formatPscInput(value));
    setCityManual(false);
    if (fieldErrors.psc || fieldErrors.city) {
      setFieldErrors((prev) => ({ ...prev, psc: "", city: "" }));
    }
  };

  const handleStreetChange = (value) => {
    setStreet(value);
    setPickedCoords(null);
    if (fieldErrors.street) setFieldErrors((prev) => ({ ...prev, street: "" }));
    autocompleteRef.current?.search(`${value} ${city}`.trim());
  };

  const applySuggestion = (item) => {
    if (item.street) setStreet(item.street);
    if (item.houseNumber) setHouseNumber(item.houseNumber);
    if (item.psc) {
      setPsc(item.psc);
      setCityManual(false);
    }
    if (item.city) setCity(item.city);
    if (item.lat != null && item.lon != null) {
      setPickedCoords({ lat: item.lat, lng: item.lon });
    }
    setSuggestions([]);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const result = validateAddressFields({ street, houseNumber, psc, city });
    setFieldErrors(result.errors);
    if (!result.valid) {
      setSubmitError("Zkontrolujte adresu — některé údaje chybí nebo nejsou správně.");
      return;
    }

    setSaving(true);
    try {
      const fullAddress = formatFullAddress({ street, houseNumber, psc, city });
      const ok = await onSave({
        street: street.trim(),
        houseNumber: houseNumber.trim(),
        psc,
        city: city.trim(),
        fullAddress,
        lat: pickedCoords?.lat ?? null,
        lng: pickedCoords?.lng ?? null,
      });
      if (ok === false) setSubmitError("Adresu se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-2" : "space-y-3"}>
      <div>
        <label className="block text-[11px] text-stone-500 mb-1">Ulice</label>
        <input
          type="text"
          value={street}
          onChange={(e) => handleStreetChange(e.target.value)}
          placeholder="Na Louce"
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
            fieldErrors.street ? "border-red-300" : "border-stone-200"
          }`}
        />
        {fieldErrors.street && <p className="mt-1 text-xs text-red-600">{fieldErrors.street}</p>}
        {suggestLoading && <p className="mt-1 text-[11px] text-stone-400">Hledám adresy…</p>}
        {suggestError && <p className="mt-1 text-[11px] text-amber-700">{suggestError}</p>}
        {suggestions.length > 0 && (
          <ul className="mt-1 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => applySuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-emerald-50 border-b border-stone-100 last:border-0"
                >
                  {formatSuggestionAddress(item)}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-[10px] text-stone-400">{ADDRESS_SEARCH_HINT}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-stone-500 mb-1">Číslo popisné</label>
          <input
            type="text"
            inputMode="numeric"
            value={houseNumber}
            onChange={(e) => {
              setHouseNumber(e.target.value);
              setPickedCoords(null);
              if (fieldErrors.houseNumber) setFieldErrors((p) => ({ ...p, houseNumber: "" }));
            }}
            placeholder="12"
            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
              fieldErrors.houseNumber ? "border-red-300" : "border-stone-200"
            }`}
          />
          {fieldErrors.houseNumber && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.houseNumber}</p>
          )}
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
            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
              fieldErrors.psc ? "border-red-300" : "border-stone-200"
            }`}
          />
          {fieldErrors.psc && <p className="mt-1 text-xs text-red-600">{fieldErrors.psc}</p>}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-stone-500 mb-1">Obec</label>
        <input
          type="text"
          value={cityLoading ? "Načítám obec…" : city}
          onChange={(e) => {
            setCityManual(true);
            setCity(e.target.value);
            setPickedCoords(null);
            if (fieldErrors.city) setFieldErrors((p) => ({ ...p, city: "" }));
          }}
          readOnly={cityLoading && !cityManual}
          placeholder="Jesenice"
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
            fieldErrors.city ? "border-red-300" : city && !cityManual ? "bg-emerald-50/50 border-emerald-200" : "border-stone-200"
          }`}
        />
        {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
      </div>

      <p className="text-[11px] text-stone-400 leading-relaxed">{ADDRESS_PRIVACY_NOTE_INLINE}</p>

      {submitError && <p className="text-xs text-red-600">{submitError}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-semibold border border-stone-200 rounded-xl hover:bg-stone-50"
          >
            Zrušit
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
          style={{ background: "#1B4332" }}
        >
          {saving ? "Ukládám…" : "Uložit adresu"}
        </button>
      </div>
    </form>
  );
}
