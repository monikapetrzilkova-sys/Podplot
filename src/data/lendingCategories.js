/** Kategorie předmětů v půjčovně — stejné jako Daruji / Prodám / Sháním */

import {
  THING_ITEM_CATEGORIES,
  normalizeThingItemCategory,
  getThingItemCategory,
} from "./thingItemCategories.js";
import { resolveLendingItemTypeLabel } from "./lendingItemTypes.js";

export const LENDING_CATEGORIES = [
  { id: "vse", label: "Vše", emoji: "📋" },
  ...THING_ITEM_CATEGORIES,
];

/** Subkategorie v modulu Věci → Půjčovna — matice 4×2 */
export const PUJCOVNA_SUB_FILTERS = THING_ITEM_CATEGORIES;

export function lendingCategoryToPujcovnaSub(lendingCategory) {
  return normalizeThingItemCategory(lendingCategory) ?? "jine";
}

export function getPujcovnaSubFilter(id) {
  return getThingItemCategory(id);
}

export function getLendingCategory(id) {
  if (id === "vse") return LENDING_CATEGORIES[0];
  return getThingItemCategory(id);
}

/** Odhad kategorie a typu z názvu věci */
export function inferLendingMeta(title) {
  const typeLabel = resolveLendingItemTypeLabel(title);
  const t = `${title} ${typeLabel}`.toLowerCase();
  const itemType = slugify(typeLabel || title);
  const itemTypeLabel = typeLabel || normalizeItemLabel(title);

  if (/kočár|kocarek|autosedačk|autosedačka|hračk|lego|chodítk|postýlk|dětsk|detsk|nosítk|trojkol/.test(t)) {
    return { lendingCategory: "deti", itemType, itemTypeLabel };
  }
  if (/vrtačk|vrták|kladiv|šroubov|bruska|detektor|žebřík|laser|nářad|svářeč|pila/.test(t)) {
    return { lendingCategory: "naradi", itemType, itemTypeLabel };
  }
  if (/sekačk|zahrad|hadice|nůžk|trávník|kompost|křovinořez|plotostřih|kultivátor/.test(t)) {
    return { lendingCategory: "zahrada", itemType, itemTypeLabel };
  }
  if (/barv|malíř|štětec|šicí|háčkov|pleten|keramik|modelář|hobby|lepidl/.test(t)) {
    return { lendingCategory: "hobby", itemType, itemTypeLabel };
  }
  if (/kolo|lyž|sport|míč|koloběž|brusle|stan|gril|párty|party|člun/.test(t)) {
    return { lendingCategory: "sport", itemType, itemTypeLabel };
  }
  if (/pes|kočk|kotě|štěně|akvári|klec|vodítk|pelíšek|zvíř|přepravk/.test(t)) {
    return { lendingCategory: "zvirata", itemType, itemTypeLabel };
  }
  if (/vysavač|žehlič|parní|mixer|nádob|hrnec|povlečen|nábytek|projektor/.test(t)) {
    return { lendingCategory: "domacnost", itemType, itemTypeLabel };
  }
  return { lendingCategory: "jine", itemType, itemTypeLabel };
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
}

function normalizeItemLabel(title) {
  const t = title.trim();
  if (/vrtačk/i.test(t)) return "Aku vrtačka";
  if (/žebřík/i.test(t)) return "Hliníkový žebřík";
  if (/sekačk/i.test(t)) return "Zahradní sekačka";
  if (/detektor/i.test(t)) return "Detektor kabelů";
  if (/stan/i.test(t)) return "Párty stan";
  return t.length > 35 ? t.slice(0, 35) + "…" : t;
}

export function groupLendingItems(items) {
  const map = new Map();
  for (const item of items) {
    const type = item.itemType ?? inferLendingMeta(item.item).itemType;
    const label = item.itemTypeLabel ?? inferLendingMeta(item.item).itemTypeLabel;
    const key = type || label;
    if (!map.has(key)) {
      map.set(key, {
        itemType: key,
        itemTypeLabel: label,
        lendingCategory: normalizeThingItemCategory(item.lendingCategory) ?? item.lendingCategory,
        offers: [],
      });
    }
    map.get(key).offers.push(item);
  }
  return [...map.values()].sort((a, b) => a.itemTypeLabel.localeCompare(b.itemTypeLabel, "cs"));
}

function normalizeSearch(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function matchesLendingSearch(group, query) {
  const q = normalizeSearch(query);
  if (!q) return true;
  const cat = getLendingCategory(group.lendingCategory);
  const haystack = [
    group.itemTypeLabel,
    cat?.label,
    ...group.offers.flatMap((o) => [o.item, o.description, o.author]),
  ]
    .filter(Boolean)
    .map(normalizeSearch);
  return haystack.some((s) => s.includes(q));
}

export function filterLendingGroups(groups, { category = "vse", query = "" } = {}) {
  return groups.filter((g) => {
    if (category !== "vse" && lendingCategoryToPujcovnaSub(g.lendingCategory) !== category) {
      return false;
    }
    return matchesLendingSearch(g, query);
  });
}
