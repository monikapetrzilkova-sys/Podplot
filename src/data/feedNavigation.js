/** Navigace domovské obrazovky */

export {
  APP_WORLDS,
  KOMUNITA_SUBFILTERS,
  SOUSEDE_SUBFILTERS,
  PRUVODCE_SUBFILTERS,
  FEED_MAIN_MODES,
  getSubfilters,
  getDefaultSubfilter,
  getSkupinySubfilters,
  normalizeWorldId,
  normalizeSubFilter,
} from "./worldNavigation.js";

import { APP_WORLDS, getSubfilters, normalizeWorldId } from "./worldNavigation.js";

const CATEGORY_TO_FEED = {
  daruji: { feedType: "komunita", feedSubtype: "veci" },
  prodam: { feedType: "komunita", feedSubtype: "veci" },
  shanim: { feedType: "komunita", feedSubtype: "veci" },
  pujcovna: { feedType: "komunita", feedSubtype: "veci" },
};

const ACCOUNT_TO_FEED = {
  remeslnik: { feedType: "pruvodce", feedSubtype: "pruvodce" },
  podnik: { feedType: "pruvodce", feedSubtype: "pruvodce" },
  instituce: { feedType: "pruvodce", feedSubtype: "pruvodce" },
};

export function inferFeedClassification(categoryId, accountType) {
  if (categoryId && CATEGORY_TO_FEED[categoryId]) return CATEGORY_TO_FEED[categoryId];
  if (accountType && ACCOUNT_TO_FEED[accountType]) return ACCOUNT_TO_FEED[accountType];
  return { feedType: "komunita", feedSubtype: "veci" };
}

export function postMatchesFeedFilter(post, mainMode, subFilter) {
  const world =
    mainMode === "komunita" || mainMode === "sousede" || mainMode === "zbozi"
      ? "komunita"
      : mainMode === "sluzby"
        ? "pruvodce"
        : mainMode;
  if (!post.feedType) return false;
  const postWorld =
    post.feedType === "komunita" || post.feedType === "sousede" || post.feedType === "zbozi"
      ? "komunita"
      : post.feedType === "sluzby" || post.feedType === "pruvodce"
        ? "pruvodce"
        : post.feedType;
  if (postWorld !== world) return false;
  if (world === "pruvodce") {
    return postWorld === "pruvodce" || post.feedType === "sluzby";
  }
  if (subFilter && subFilter !== "vse" && subFilter !== "veci" && post.feedSubtype !== subFilter) {
    if (world === "komunita" && subFilter === "veci") {
      return postWorld === "komunita" || post.feedType === "zbozi";
    }
    return false;
  }
  return true;
}

export function getFeedFilterLabel(mainMode, subFilter, activeGroups = []) {
  const world = APP_WORLDS.find((m) => m.id === mainMode || m.id === normalizeWorldId(mainMode));
  const subs = getSubfilters(mainMode, activeGroups);
  if (normalizeWorldId(mainMode) === "pruvodce") return world?.label ?? "Průvodce";
  const sub = subs.find((s) => s.id === subFilter) ?? subs[0];
  if (!subFilter || subFilter === "veci") return world?.label ?? "";
  return `${world?.shortLabel ?? world?.label} · ${sub?.label ?? ""}`;
}

export function categoryIdToFeedSubtype(categoryId) {
  return CATEGORY_TO_FEED[categoryId]?.feedSubtype ?? null;
}

export function isHomeWallView(mainMode, subFilter) {
  return mainMode == null;
}
