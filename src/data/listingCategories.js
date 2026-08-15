import { GROUP_EXTRA_CATEGORIES } from "./groups.js";

export const BASE_CATEGORIES = [
  { id: "daruji", label: "Daruji", hint: "Nabídnu zdarma", type: "Daruji" },
  {
    id: "prodam",
    label: "Prodám",
    hint: "Prodej za pevnou cenu",
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

export function getCategoriesForGroup(groupId) {
  if (!groupId) return BASE_CATEGORIES;
  const extras = GROUP_EXTRA_CATEGORIES[groupId] ?? [];
  const merged = [...BASE_CATEGORIES];
  for (const extra of extras) {
    if (!merged.some((c) => c.id === extra.id)) merged.push(extra);
  }
  if (groupId === "maminky") {
    return merged.filter((c) => ["daruji", "prodam", "shanim", "hlidani", "krouzek", "skolka"].includes(c.id));
  }
  if (groupId === "pejskari") {
    return merged.filter((c) => ["daruji", "prodam", "nabidka", "shanim"].includes(c.id));
  }
  if (groupId === "zahradkari") {
    return merged.filter((c) => ["daruji", "prodam", "shanim", "pujcovna"].includes(c.id));
  }
  return merged;
}

export function getCategory(id, groupId = null) {
  const all = getCategoriesForGroup(groupId);
  return all.find((c) => c.id === id) ?? BASE_CATEGORIES.find((c) => c.id === id);
}

export function postMatchesCategory(post, categoryId) {
  if (!categoryId) return true;
  if (post.categoryId === categoryId) return true;
  const cat = getCategory(categoryId, post.groupId);
  return cat ? post.type === cat.type : false;
}
