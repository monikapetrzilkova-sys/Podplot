/** Správa entit — návrhy míst, claiming, stavy */

import { INSTITUTION_INSTITUCE_CATEGORIES } from "./institutionsMapData.js";

export const SUGGESTION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const CLAIM_STATUS = {
  UNCLAIMED: "unclaimed",
  PENDING: "pending",
  CLAIMED: "claimed",
};

export const INSTITUTION_CATEGORY_EMOJI = {
  skoly: "🏫",
  gastro: "🍽️",
  zdravi: "🏥",
};

export function suggestionToPlace(suggestion) {
  return {
    id: suggestion.placeId ?? suggestion.id,
    name: suggestion.name,
    tagline: suggestion.description ?? "Nové místo v okolí",
    emoji: INSTITUTION_CATEGORY_EMOJI[suggestion.category] ?? "📍",
    category: suggestion.category,
    address: suggestion.address ?? "",
    phone: suggestion.phone ?? "",
    email: suggestion.email ?? "",
    website: suggestion.website ?? "",
    hours: suggestion.hours ?? "",
    mapPos: suggestion.mapPos,
    locationId: suggestion.locationId,
    accountType: INSTITUTION_INSTITUCE_CATEGORIES.has(suggestion.category) ? "instituce" : "podnik",
    distance: suggestion.distance ?? "—",
    isSuggested: true,
    claimStatus: CLAIM_STATUS.UNCLAIMED,
    photos: suggestion.photos ?? [],
  };
}

export function mergeInstitutionPlace(base, override = {}) {
  if (!override || Object.keys(override).length === 0) return base;
  return { ...base, ...override };
}

export function getInstitutionClaimStatus(place, claims, userId) {
  const pending = claims.find((c) => c.placeId === place.id && c.status === SUGGESTION_STATUS.PENDING);
  const approved = claims.find((c) => c.placeId === place.id && c.status === SUGGESTION_STATUS.APPROVED);
  if (approved?.userId === userId) return CLAIM_STATUS.CLAIMED;
  if (pending?.userId === userId) return CLAIM_STATUS.PENDING;
  if (place.claimedByUserId) return CLAIM_STATUS.CLAIMED;
  return CLAIM_STATUS.UNCLAIMED;
}
