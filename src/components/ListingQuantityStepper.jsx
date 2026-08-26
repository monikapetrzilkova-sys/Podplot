import {
  clampListingQuantity,
  getListingPriceUnit,
  listingQuantityStep,
  parseListingQuantity,
} from "../data/listingPriceUnits.js";

export default function ListingQuantityStepper({
  unitId,
  value,
  onChange,
  available = null,
  disabled = false,
}) {
  const unit = getListingPriceUnit(unitId);
  const step = listingQuantityStep(unitId);
  const max = available != null && available !== "" ? parseListingQuantity(available, unitId) : unit.max;
  const qty = parseListingQuantity(value, unitId) || unit.min;

  const setQty = (next) => {
    const clamped = clampListingQuantity(next, unitId, max);
    if (clamped) onChange(clamped);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled || qty <= unit.min}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setQty(qty - step)}
        className="w-11 h-11 rounded-xl border border-stone-200 text-lg font-semibold text-[#1B4D3E] disabled:opacity-30 disabled:text-stone-400"
        aria-label="Méně"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={String(value).replace(".", ",")}
        onChange={(e) => {
          const raw = e.target.value.replace(",", ".");
          if (raw === "" || raw === ".") {
            onChange(raw === "." ? "0." : "");
            return;
          }
          const parsed = parseListingQuantity(raw, unitId);
          onChange(parsed || raw);
        }}
        onBlur={() => setQty(qty)}
        className="flex-1 min-w-0 text-center text-lg font-bold text-[#1B4D3E] px-2 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#3D7A68]"
        aria-label={unit.quantityLabel || "Množství"}
      />
      <button
        type="button"
        disabled={disabled || (max != null && qty >= max)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setQty(qty + step)}
        className="w-11 h-11 rounded-xl border border-stone-200 text-lg font-semibold text-[#1B4D3E] disabled:opacity-30 disabled:text-stone-400"
        aria-label="Více"
      >
        +
      </button>
    </div>
  );
}
