/**
 * Barvy špendlíků míst (Okolí / Průvodce) — v paletě Podplotu,
 * kategorie jsou rozlišitelné podobně jako u hlášení (ne Google modrá / neonové barvy).
 */
export const INSTITUTION_PIN_COLORS = {
  /** Gastro — teplá olivová */
  gastro: { bg: "#A8B971", border: "#5C6640" },
  /** Obchody — světlá máta */
  shop: { bg: "#95D5B2", border: "#2D6A4F" },
  /** Služby — značková střední zelená */
  services: { bg: "#3D7A68", border: "#1B4D3E" },
  /** Zdraví — teal */
  health: { bg: "#4D9B86", border: "#1B4332" },
  /** Instituce / úřady — nejtmavší brand */
  public: { bg: "#1B4D3E", border: "#0F2E24" },
  /** Veřejný prostor — světlejší zelená */
  sport: { bg: "#52B788", border: "#1B4332" },
  /** Odpad — sytá lesní */
  waste: { bg: "#2D6A4F", border: "#1B4332" },
  /** Ostatní — šedozelená */
  leisure: { bg: "#8A9A8B", border: "#4A5568" },
  /** Fallback */
  institution: { bg: "#40916C", border: "#1B4332" },
  default: { bg: "#B7E4C7", border: "#2D6A4F" },
};

/** Vybraný špendlík — výrazný brand, ne oranžová. */
export const INSTITUTION_PIN_SELECTED = {
  bg: "#1B4D3E",
  border: "#FFFFFF",
  haloFill: "#E8F3EF",
  haloStroke: "#3D7A68",
};

/** Kategorie průvodce → hex pro legendu */
export const INSTITUTION_CATEGORY_LEGEND_COLORS = {
  gastro: INSTITUTION_PIN_COLORS.gastro.bg,
  obchody: INSTITUTION_PIN_COLORS.shop.bg,
  sluzby: INSTITUTION_PIN_COLORS.services.bg,
  zdravi: INSTITUTION_PIN_COLORS.health.bg,
  instituce: INSTITUTION_PIN_COLORS.public.bg,
  "verejny-prostor": INSTITUTION_PIN_COLORS.sport.bg,
  ostatni: INSTITUTION_PIN_COLORS.leisure.bg,
};

export function institutionPinColorsForVariant(variant) {
  return INSTITUTION_PIN_COLORS[variant] ?? INSTITUTION_PIN_COLORS.default;
}
