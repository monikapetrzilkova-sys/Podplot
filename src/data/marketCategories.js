/** Kategorie komunitního trhu (Věci) — sdílené s půjčovnou */

import {
  THING_ITEM_CATEGORIES,
  normalizeThingItemCategory,
  getThingItemCategoryLabel,
} from "./thingItemCategories.js";

export const FORM_MARKET_CATEGORIES = THING_ITEM_CATEGORIES;

export const MARKET_CATEGORIES = [
  { id: "vse", label: "Vše", emoji: "🎨" },
  ...THING_ITEM_CATEGORIES,
];

export function getMarketCategoryLabel(id) {
  if (id === "vse") return "Vše";
  return getThingItemCategoryLabel(id) ?? id;
}

/** Půjčovna i trh používají stejná ID */
export function lendingCategoryToMarket(lendingCategory) {
  return normalizeThingItemCategory(lendingCategory) ?? "jine";
}

function resolveMarketCategory(item) {
  const raw = item.marketCategory ?? item.lendingCategory;
  return normalizeThingItemCategory(raw) ?? "jine";
}

export function itemMatchesMarketCategory(item, categoryId) {
  if (!categoryId || categoryId === "vse") return true;
  return resolveMarketCategory(item) === normalizeThingItemCategory(categoryId);
}

export function itemMatchesSearch(item, query, fields = []) {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase();
  const blob = fields
    .flatMap((f) => {
      const v = item[f];
      if (Array.isArray(v)) return v;
      return v != null ? [String(v)] : [];
    })
    .join(" ")
    .toLowerCase();
  return blob.includes(q);
}

export function postMatchesMarketFilters(post, query, categoryId) {
  if (!itemMatchesMarketCategory(post, categoryId)) return false;
  return itemMatchesSearch(post, query, [
    "title",
    "body",
    "type",
    "marketCategory",
    "keywords",
    "item",
    "itemTypeLabel",
    "description",
  ]);
}
