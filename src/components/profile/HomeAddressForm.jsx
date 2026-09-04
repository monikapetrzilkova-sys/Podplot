import { useState } from "react";
import {
  validateAddressFields,
  formatFullAddress,
  parseStoredAddress,
} from "../../data/addressValidation.js";
import StructuredAddressFields from "../StructuredAddressFields.jsx";
import LocalityRadiusPreview from "../LocalityRadiusPreview.jsx";
import { DEFAULT_NEIGHBOR_RADIUS_KM, clampNeighborRadius } from "../../data/mapRadiusSettings.js";
import { buildMapPickResult } from "../../utils/geoCoordinates.js";

export default function HomeAddressForm({
  initialAddress = "",
  initialLabel = "",
  showLabel = false,
  labelRequired = false,
  labelPlaceholder = "Název místa (např. Práce, Chata)",
  onSave,
  onCancel,
  compact = false,
  submitLabel = "Uložit adresu",
  initialRadiusKm = DEFAULT_NEIGHBOR_RADIUS_KM,
  initialLat = null,
  initialLng = null,
}) {
  const parsed = parseStoredAddress(initialAddress);
  const [placeLabel, setPlaceLabel] = useState(initialLabel);
  const [street, setStreet] = useState(parsed.street);
  const [houseNumber, setHouseNumber] = useState(parsed.houseNumber);
  const [psc, setPsc] = useState(parsed.psc);
  const [city, setCity] = useState(parsed.city);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(
    initialLat != null && initialLng != null
      ? buildMapPickResult(Number(initialLat), Number(initialLng), { lat: Number(initialLat), lng: Number(initialLng) }, initialRadiusKm)
      : null
  );
  const [radiusKm, setRadiusKm] = useState(clampNeighborRadius(initialRadiusKm));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const nextErrors = {};
    if (showLabel && labelRequired && !placeLabel.trim()) {
      nextErrors.label = "Zadej název místa.";
    }
    const result = validateAddressFields({ street, houseNumber, psc, city });
    Object.assign(nextErrors, result.errors);
    setFieldErrors(nextErrors);
    if (!result.valid || nextErrors.label) {
      setSubmitError("Zkontroluj údaje — některé chybí nebo nejsou správně.");
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
        lng: pickedCoords?.lng ?? pickedCoords?.lon ?? null,
        label: placeLabel.trim(),
        radiusKm,
      });
      if (ok === false) setSubmitError("Adresu se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-2" : "space-y-3"}>
      {showLabel ? (
        <div>
          <label className="block text-[11px] text-stone-500 mb-1">Název místa</label>
          <input
            type="text"
            value={placeLabel}
            onChange={(e) => {
              setPlaceLabel(e.target.value);
              if (fieldErrors.label) setFieldErrors((p) => ({ ...p, label: "" }));
            }}
            placeholder={labelPlaceholder}
            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
              fieldErrors.label ? "border-red-300" : "border-stone-200"
            }`}
          />
          {fieldErrors.label && <p className="mt-1 text-xs text-red-600">{fieldErrors.label}</p>}
        </div>
      ) : null}

      <StructuredAddressFields
        street={street}
        houseNumber={houseNumber}
        psc={psc}
        city={city}
        onStreetChange={setStreet}
        onHouseNumberChange={setHouseNumber}
        onPscChange={setPsc}
        onCityChange={setCity}
        onSuggestionPick={(item) => {
          if (item.lat != null && (item.lon != null || item.lng != null)) {
            const lat = Number(item.lat);
            const lng = Number(item.lon ?? item.lng);
            setPickedCoords(buildMapPickResult(lat, lng, { lat, lng }, radiusKm));
          }
        }}
        fieldErrors={fieldErrors}
        onClearError={(key) => setFieldErrors((prev) => ({ ...prev, [key]: "" }))}
        onFieldError={(key, message) => setFieldErrors((prev) => ({ ...prev, [key]: message }))}
        showLegend={false}
        required
      />

      <LocalityRadiusPreview
        street={street}
        houseNumber={houseNumber}
        psc={psc}
        city={city}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        pin={pickedCoords}
        onPinChange={setPickedCoords}
      />

      {submitError && <p className="text-xs text-red-600">{submitError}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold border border-stone-200 rounded-xl"
          >
            Zrušit
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#3D7A68] rounded-xl disabled:opacity-60"
        >
          {saving ? "Ukládám…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
