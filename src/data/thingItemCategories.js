/**
 * Společné věcné kategorie pro Daruji / Prodám / Sháním / Půjčovna.
 * Pořadí: nejčastěji využívané napřed, Jiné vždy na konci.
 * Matice 4×2.
 */

export const THING_ITEM_CATEGORIES = [
  { id: "domacnost", label: "Domácnost", emoji: "🏠" },
  { id: "deti", label: "Pro děti", emoji: "🧸" },
  { id: "naradi", label: "Nářadí", emoji: "🔧" },
  { id: "zahrada", label: "Zahrada", emoji: "🌿" },
  { id: "sport", label: "Sport", emoji: "⚽" },
  { id: "zvirata", label: "Zvířata", emoji: "🐾" },
  { id: "hobby", label: "Hobby", emoji: "🎨" },
  { id: "jine", label: "Jiné", emoji: "📦" },
];

/** Víceřádkové popisky v matici */
export const THING_ITEM_MULTILINE_LABELS = {
  deti: ["Pro", "děti"],
};

/** Staré ID → kanonické */
export const THING_ITEM_LEGACY_ALIASES = {
  nastroje: "naradi",
  "pro-deti": "deti",
  detske: "deti",
  akce: "hobby",
  doprava: "jine",
  ostatni: "jine",
  "volny-cas": "sport",
  elektro: "domacnost",
  dum: "domacnost",
  automoto: "jine",
};

export function normalizeThingItemCategory(id) {
  if (!id) return null;
  if (THING_ITEM_LEGACY_ALIASES[id]) return THING_ITEM_LEGACY_ALIASES[id];
  if (THING_ITEM_CATEGORIES.some((c) => c.id === id)) return id;
  return "jine";
}

export function getThingItemCategory(id) {
  const resolved = normalizeThingItemCategory(id);
  return THING_ITEM_CATEGORIES.find((c) => c.id === resolved) ?? null;
}

export function getThingItemCategoryLabel(id) {
  return getThingItemCategory(id)?.label ?? id;
}
