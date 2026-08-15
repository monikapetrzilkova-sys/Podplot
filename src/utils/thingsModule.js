import { clampMapPos } from "../data/mapData.js";
import {
  mapPosToDistanceKm,
  filterByMapRadius,
  DEFAULT_THINGS_MAP_RADIUS_KM,
} from "../data/mapRadiusSettings.js";
import { getPostInteractionType, INTERACTION_TYPES } from "../data/postInteractions.js";
import {
  inferLendingMeta,
  lendingCategoryToPujcovnaSub,
  getPujcovnaSubFilter,
} from "../data/lendingCategories.js";
import { resolveLendingItemTypeLabel } from "../data/lendingItemTypes.js";

const THING_CATEGORY_IDS = new Set(["daruji", "prodam", "shanim", "pujcovna"]);
const THING_FEED_TYPES = new Set(["zbozi", "komunita", "sousede"]);

/** Hlášení / pátrání — nepatří do modulu Věci */
export function isCommunityAnnouncementPost(post) {
  if (!post) return false;
  const cat = post.categoryId ?? post.feedSubtype;
  if (THING_CATEGORY_IDS.has(cat)) return false;
  if (post.feedSubtype === "hlaseni") return true;
  const interaction = getPostInteractionType(post);
  if (interaction === INTERACTION_TYPES.SEARCH) return true;
  if (interaction === INTERACTION_TYPES.TIP) return true;
  const type = (post.type ?? "").toLowerCase();
  return /hlášení|pátrání|ztrát|nález|zatoulan|zaběhl|tip:/i.test(type);
}

/** Inzerát do modulu Věci (daruji / prodám / sháním věc / půjčovna) */
export function isThingsModuleListing(post) {
  if (!post || !THING_FEED_TYPES.has(post.feedType)) return false;
  if (isCommunityAnnouncementPost(post)) return false;
  const cat = post.categoryId ?? post.feedSubtype;
  return THING_CATEGORY_IDS.has(cat);
}

/** Filtry v modulu Věci — pouze typ nabídky (bez kategorií zboží). */
export const VECI_TYPE_FILTERS = [
  { id: "vse", label: "Vše" },
  { id: "daruji", label: "Daruji" },
  { id: "prodam", label: "Prodám" },
  { id: "shanim", label: "Sháním" },
  { id: "pujcovna", label: "Půjčovna", emoji: "🔄" },
];

export const THINGS_CATEGORIES = VECI_TYPE_FILTERS.map((c) => ({ ...c, emoji: c.emoji ?? "" }));

export {
  MIN_THINGS_MAP_RADIUS_KM,
  MAX_THINGS_MAP_RADIUS_KM,
  DEFAULT_THINGS_MAP_RADIUS_KM,
} from "../data/mapRadiusSettings.js";

function hashId(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function thingCategoryId(item) {
  if (item.thingKind === "lending") return "pujcovna";
  return item.categoryId ?? item.feedSubtype ?? "vse";
}

export function ensureThingMapPos(item) {
  if (item.mapPos) return item.mapPos;
  const h = hashId(item.id);
  return clampMapPos(50 + ((h % 21) - 10) * 0.9, 50 + (((h >> 5) % 21) - 10) * 0.9);
}

export function normalizeFeedPostToThing(post) {
  const categoryId = post.categoryId ?? post.feedSubtype;
  const priceMatch =
    post.meta?.match(/(\d+)\s*Kč\/den/i) ??
    post.meta?.match(/(\d+)\s*kredit/i) ??
    (post.listingPrice != null ? [null, String(post.listingPrice)] : null);
  const isLending = categoryId === "pujcovna";
  const typeLabel = isLending
    ? post.itemTypeLabel || resolveLendingItemTypeLabel(post.title ?? "", post.lendingCategory ?? post.marketCategory)
    : null;
  return {
    ...post,
    thingKind: "post",
    label: typeLabel || post.title,
    subtitle: post.body,
    categoryId,
    itemTypeLabel: typeLabel || post.itemTypeLabel,
    credits:
      categoryId === "pujcovna"
        ? Number(priceMatch?.[1] ?? post.credits ?? post.listingPrice ?? 0)
        : post.credits,
    mapPos: ensureThingMapPos(post),
    distanceKm: post.distanceKm ?? mapPosToDistanceKm(ensureThingMapPos(post), DEFAULT_THINGS_MAP_RADIUS_KM / 5),
  };
}

export function normalizeLendingToThing(item) {
  const lendingCategory = item.lendingCategory ?? inferLendingMeta(item.item ?? "").lendingCategory;
  const typeLabel =
    item.itemTypeLabel ||
    resolveLendingItemTypeLabel(item.item ?? "", lendingCategory);
  return {
    ...item,
    thingKind: "lending",
    label: typeLabel,
    subtitle: item.description,
    categoryId: "pujcovna",
    lendingCategory,
    itemTypeLabel: typeLabel,
    mapPos: ensureThingMapPos(item),
    distanceKm: item.distanceKm ?? mapPosToDistanceKm(ensureThingMapPos(item), DEFAULT_THINGS_MAP_RADIUS_KM / 5),
  };
}

export function thingLendingSubCategoryId(item) {
  const raw =
    item.lendingCategory ??
    (item.thingKind === "lending" || item.item
      ? inferLendingMeta(item.item ?? item.label ?? "").lendingCategory
      : null);
  if (raw) return lendingCategoryToPujcovnaSub(raw);
  if (thingCategoryId(item) === "pujcovna") {
    return lendingCategoryToPujcovnaSub(
      inferLendingMeta(item.label ?? item.title ?? "").lendingCategory
    );
  }
  return null;
}

/** Věcná kategorie položky (sdílená matice Daruji / Prodám / Sháním / Půjčovna) */
export function thingItemCategoryId(item) {
  const fromLending = thingLendingSubCategoryId(item);
  if (fromLending) return fromLending;
  if (!item.marketCategory) return null;
  return lendingCategoryToPujcovnaSub(item.marketCategory);
}

/** Normalizace starých subfiltrů (volny-cas → sport, ostatni → jine) */
export function normalizePujcovnaSubFilter(id) {
  if (!id) return null;
  return lendingCategoryToPujcovnaSub(id);
}

export function thingMatchesLendingSubCategory(item, subCategoryId) {
  if (!subCategoryId) return true;
  return thingItemCategoryId(item) === lendingCategoryToPujcovnaSub(subCategoryId);
}

export function thingMatchesCategory(item, categoryId) {
  if (!categoryId || categoryId === "vse") return true;
  return thingCategoryId(item) === categoryId;
}

export function thingMatchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const sub = getPujcovnaSubFilter(thingItemCategoryId(item));
  const hay = [
    item.label,
    item.subtitle,
    item.author,
    item.item,
    item.title,
    item.body,
    sub?.label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function filterThingsItems(items, { categoryId, lendingSubCategory = null, radiusKm, search = "", skipRadius = false }) {
  const matched = items.filter(
    (i) =>
      thingMatchesCategory(i, categoryId) &&
      thingMatchesLendingSubCategory(i, lendingSubCategory) &&
      thingMatchesSearch(i, search)
  );
  if (skipRadius) return matched;
  return filterByMapRadius(matched, radiusKm, DEFAULT_THINGS_MAP_RADIUS_KM);
}

export function sortInstitutionsByPriority(items) {
  return [...items].sort((a, b) => {
    const score = (x) =>
      (x.isSponsored ? 4 : 0) +
      (x.isTop ? 2 : 0) +
      (x.isVerified ? 3 : 0) +
      (x.claimStatus === "claimed" ? 1 : 0);
    return score(b) - score(a);
  });
}

/** Bílá karta inzerátu + třída kategorie — viz index.css */
export function thingRowTone(categoryId) {
  switch (categoryId) {
    case "daruji":
      return { row: "ad-card daruji" };
    case "prodam":
      return { row: "ad-card prodam" };
    case "shanim":
      return { row: "ad-card shanim" };
    case "pujcovna":
      return { row: "ad-card pujcovna" };
    default:
      return { row: "ad-card daruji" };
  }
}

export function thingPinVariant(item) {
  const cat = thingCategoryId(item);
  if (cat === "daruji") return "thingDaruji";
  if (cat === "prodam") return "thingProdam";
  if (cat === "shanim") return "thingShanim";
  if (cat === "pujcovna") return "thingPujcovna";
  return "thingDefault";
}

export function thingPinEmoji(item) {
  const cat = thingCategoryId(item);
  const found = THINGS_CATEGORIES.find((c) => c.id === cat);
  return found?.emoji ?? "📦";
}
