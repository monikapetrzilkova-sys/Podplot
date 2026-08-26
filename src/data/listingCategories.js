import { GROUP_EXTRA_CATEGORIES } from "./groups.js";

export const BASE_CATEGORIES = [
  { id: "daruji", label: "Daruji", hint: "Nabídnu zdarma", type: "Daruji" },
  {
    id: "prodam",
    label: "Prodám",
    hint: "Prodej za kus, kilo nebo celkem",
    type: "Prodám",
    priceField: true,
    priceLabel: "Cena (Kč)",
  },
  { id: "shanim", label: "Sháním", hint: "Hledám něco v okolí", type: "Sháním" },
  {
    id: "pujcovna",
    label: "Půjčovna",
    hint: "Půjčím věc za poplatek",
    type: "Půjčovna",
    priceField: true,
    priceLabel: "Cena (Kč / den)",
    isLending: true,
  },
];

/** Kategorie pro filtr na domovské obrazovce */
export const FEED_FILTERS = [
  { id: "daruji", label: "Daruji" },
  { id: "prodam", label: "Prodám" },
  { id: "shanim", label: "Sháním" },
  { id: "pujcovna", label: "Půjčovna" },
];

/** Nástěnka skupiny = seznámení a tipy, ne tržiště Věcí */
const GROUP_WALL_BASE = {
  id: "diskuse",
  label: "Příspěvek",
  hint: "Otázka, tip nebo seznámení se sousedy",
  type: "Příspěvek",
};

export function getCategoriesForGroup(groupId) {
  if (!groupId) return BASE_CATEGORIES;
  const extras = GROUP_EXTRA_CATEGORIES[groupId] ?? [];
  const merged = [GROUP_WALL_BASE];
  for (const extra of extras) {
    if (!merged.some((c) => c.id === extra.id)) merged.push(extra);
  }
  return merged;
}

export function getCategory(id, groupId = null) {
  if (!id) return null;
  if (groupId) {
    const inGroup = getCategoriesForGroup(groupId).find((c) => c.id === id);
    if (inGroup) return inGroup;
  }
  if (id === GROUP_WALL_BASE.id) return GROUP_WALL_BASE;
  return BASE_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function postMatchesCategory(post, categoryId) {
  if (!categoryId) return true;
  if (post.categoryId === categoryId) return true;
  const cat = getCategory(categoryId, post.groupId);
  return cat ? post.type === cat.type : false;
}
