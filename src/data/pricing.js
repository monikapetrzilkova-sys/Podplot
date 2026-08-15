/** TOP / bump — ceník z monetization.js + pomocné funkce */

import {
  TOP_PLANS as MONETIZATION_TOP_PLANS,
  calculateTopCost as calcTopCost,
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

export function sortPostsByTop(posts) {
  return [...posts].sort((a, b) => {
    if (a.topped && !b.topped) return -1;
    if (!a.topped && b.topped) return 1;
    return 0;
  });
}
