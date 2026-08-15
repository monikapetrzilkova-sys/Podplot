/** Hybridní recenze míst — Google + komunita PodPlotu */

import { isVerifiedNeighbor } from "./serviceReviews.js";

export function placeReviewKey(place) {
  if (!place) return null;
  return place.googlePlaceId ?? place.id ?? null;
}

export function isPlaceOwner(user, place, institutionClaims = [], institutionPlaceOverrides = {}) {
  if (!user || !place) return false;
  const uid = user.id ?? "me";
  if (place.claimedByUserId === uid) return true;
  const override = institutionPlaceOverrides[place.id];
  if (override?.claimedByUserId === uid) return true;
  return institutionClaims.some(
    (c) => c.placeId === place.id && c.userId === uid && c.status === "approved"
  );
}

export function canWritePlaceReview(user, place, institutionClaims, institutionPlaceOverrides) {
  return (
    isVerifiedNeighbor(user) &&
    !isPlaceOwner(user, place, institutionClaims, institutionPlaceOverrides)
  );
}

export function getVisiblePlaceReviews(reviews, placeKey) {
  return reviews.filter(
    (r) => r.placeKey === placeKey && r.verified && !r.hiddenPendingReview
  );
}

export function computeCommunityPlaceRating(reviews, placeKey) {
  const visible = getVisiblePlaceReviews(reviews, placeKey);
  if (visible.length === 0) return null;
  const sum = visible.reduce((acc, r) => acc + (r.stars ?? 5), 0);
  return Math.round((sum / visible.length) * 10) / 10;
}

export function computeHybridPlaceRating(googleRating, googleCount, communityRating, communityCount) {
  const g = googleRating != null && googleCount > 0 ? { rating: googleRating, count: googleCount } : null;
  const c =
    communityRating != null && communityCount > 0
      ? { rating: communityRating, count: communityCount }
      : null;
  if (!g && !c) return null;
  if (g && !c) return { rating: g.rating, count: g.count, source: "google" };
  if (!g && c) return { rating: c.rating, count: c.count, source: "community" };
  const total = g.count + c.count;
  const weighted = (g.rating * g.count + c.rating * c.count) / total;
  return {
    rating: Math.round(weighted * 10) / 10,
    count: total,
    source: "hybrid",
    googleRating: g.rating,
    googleCount: g.count,
    communityRating: c.rating,
    communityCount: c.count,
  };
}
