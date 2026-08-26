/** Jednotková cena u inzerátu Prodám — celkem, za kus nebo za kilogram. */

export const LISTING_PRICE_UNITS = [
  {
    id: "total",
    label: "Celkem",
    short: "",
    hint: "Jedna cena za celou nabídku (kolo, skříň…)",
    quantityLabel: null,
    availableLabel: null,
  },
  {
    id: "ks",
    label: "Za kus",
    short: "/ks",
    hint: "Kupující zadá počet kusů, cenu spočítáme",
    quantityLabel: "Počet kusů",
    availableLabel: "Kolik kusů máte?",
    step: 1,
    min: 1,
    max: 999,
  },
  {
    id: "kg",
    label: "Za kilogram",
    short: "/kg",
    hint: "Kupující zadá kilogramy, cenu spočítáme",
    quantityLabel: "Množství (kg)",
    availableLabel: "Kolik kg máte?",
    step: 0.1,
    min: 0.1,
    max: 200,
  },
];

export const DEFAULT_LISTING_PRICE_UNIT = "total";

export function getListingPriceUnit(id) {
  return LISTING_PRICE_UNITS.find((u) => u.id === id) ?? LISTING_PRICE_UNITS[0];
}

export function normalizeListingPriceUnit(id) {
  const unit = String(id || "").toLowerCase();
  if (unit === "ks" || unit === "kg") return unit;
  return DEFAULT_LISTING_PRICE_UNIT;
}

export function isVariablePriceUnit(unit) {
  const id = normalizeListingPriceUnit(unit);
  return id === "ks" || id === "kg";
}

export function listingUsesVariablePrice(postOrUnit) {
  if (postOrUnit == null) return false;
  if (typeof postOrUnit === "string") return isVariablePriceUnit(postOrUnit);
  return isVariablePriceUnit(postOrUnit.listingPriceUnit);
}

function roundToStep(value, step) {
  if (!step || step >= 1) return Math.round(value);
  const decimals = String(step).includes(".") ? String(step).split(".")[1].length : 0;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function parseListingQuantity(raw, unitId) {
  const unit = getListingPriceUnit(normalizeListingPriceUnit(unitId));
  if (!isVariablePriceUnit(unit.id)) return 1;
  const n = Number(String(raw ?? "").replace(",", ".").trim());
  if (!Number.isFinite(n) || n <= 0) return 0;
  const stepped = roundToStep(n, unit.step);
  return Math.min(unit.max, Math.max(unit.min, stepped));
}

export function clampListingQuantity(quantity, unitId, available = null) {
  const parsed = parseListingQuantity(quantity, unitId);
  if (!parsed) return 0;
  if (available == null || available === "") return parsed;
  const maxAvail = parseListingQuantity(available, unitId);
  if (!maxAvail) return parsed;
  return Math.min(parsed, maxAvail);
}

export function calcListingSaleAmount(unitPrice, quantity, unitId) {
  const price = Number(unitPrice) || 0;
  if (price <= 0) return 0;
  if (!isVariablePriceUnit(unitId)) return Math.round(price);
  const qty = parseListingQuantity(quantity, unitId);
  if (!qty) return 0;
  return Math.max(1, Math.round(price * qty));
}

export function formatListingQuantity(quantity, unitId) {
  const unit = normalizeListingPriceUnit(unitId);
  if (unit === "kg") {
    const n = Number(quantity);
    if (!Number.isFinite(n)) return "";
    const text = Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
    return `${text} kg`;
  }
  if (unit === "ks") return `${parseListingQuantity(quantity, "ks") || quantity} ks`;
  return String(quantity ?? "");
}

export function formatListingUnitPrice(price, unitId) {
  const p = Number(price);
  if (!p) return null;
  const unit = normalizeListingPriceUnit(unitId);
  if (unit === "ks") return `${p} Kč/ks`;
  if (unit === "kg") return `${p} Kč/kg`;
  return `${p} Kč`;
}

export function formatListingPriceLabel(post) {
  if (!post) return null;
  const unitPrice = formatListingUnitPrice(post.listingPrice, post.listingPriceUnit);
  if (!unitPrice) return null;
  if (
    isVariablePriceUnit(post.listingPriceUnit) &&
    post.listingQuantity != null &&
    Number(post.listingQuantity) > 0
  ) {
    return `${unitPrice} · ${formatListingQuantity(post.listingQuantity, post.listingPriceUnit)}`;
  }
  return unitPrice;
}

export function listingPriceInputLabel(unitId) {
  const unit = normalizeListingPriceUnit(unitId);
  if (unit === "ks") return "Cena za kus (Kč)";
  if (unit === "kg") return "Cena za kilogram (Kč)";
  return "Cena (Kč)";
}

export function listingQuantityStep(unitId) {
  return getListingPriceUnit(unitId).step ?? 1;
}
