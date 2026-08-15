import ThingCategoryGrid from "./ThingCategoryGrid.jsx";

/** Matice věcných kategorií (Daruji / Prodám / Sháním / Půjčovna) */
export default function FormMarketCategoryPicker({
  value,
  onChange,
  disabled = false,
  showHint = false,
  legend = "Věcná kategorie",
}) {
  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#0C361F" }}>
        {legend} <span style={{ color: "#A85858" }}>*</span>
      </legend>

      <ThingCategoryGrid
        value={value || null}
        onChange={(id) => onChange(id || "")}
        allowDeselect={false}
        disabled={disabled}
      />

      {showHint && (
        <p className="text-[11px] mt-1.5" style={{ color: "#A85858" }}>
          Vyberte kategorii.
        </p>
      )}
    </fieldset>
  );
}

export function isZboziListingType(categoryId) {
  return ["daruji", "prodam", "shanim", "pujcovna"].includes(categoryId);
}
