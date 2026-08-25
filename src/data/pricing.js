/** TOP / bump — ceník z monetization.js + pomocné funkce */

import {
  TOP_PLANS as MONETIZATION_TOP_PLANS,
  calculateTopCost as calcTopCost,
  isTopPostActive,
} from "./monetization.js";

export const TOP_PLANS = MONETIZATION_TOP_PLANS;

export const TOP_ELIGIBLE_CATEGORIES = new Set([
  "prodam",
  "pujcovna",
  "hlidani",
  "krouzek",
  "skolka",
  "nabidka",
]);

export function canTopCategory(categoryId) {
  return TOP_ELIGIBLE_CATEGORIES.has(categoryId);
}

export function getTopPlan(planId) {
  return TOP_PLANS.find((p) => p.id === planId) ?? TOP_PLANS[0];
}

export function calculateTopCost(planId, _listingPriceKc = 0) {
  return calcTopCost(planId);
}

/** TOP nahoře (podle topRank / zbývající doby), pak organické. */
export function sortPostsByTop(posts) {
  return [...posts].sort((a, b) => {
    const aTop = isTopPostActive(a);
    const bTop = isTopPostActive(b);
    if (aTop && !bTop) return -1;
    if (!aTop && bTop) return 1;
    if (aTop && bTop) {
      const rankDiff = (b.topRank ?? 0) - (a.topRank ?? 0);
      if (rankDiff !== 0) return rankDiff;
      return String(b.toppedUntil ?? "").localeCompare(String(a.toppedUntil ?? ""));
    }
    return 0;
  });
}
