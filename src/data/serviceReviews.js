/** Recenze služeb — ověření sousedů, hlášení, průměr */

export const REVIEW_MODERATION = {
  none: "none",
  pending: "pending",
  removed: "removed",
  dismissed: "dismissed",
};

export const REVIEW_REPORT_REASONS = [
  {
    id: "fake_job",
    label: "Neexistující zakázka",
    hint: "S tímto člověkem jsme nikdy nepracovali",
  },
  {
    id: "fake_profile",
    label: "Falešný / podezřelý profil",
    hint: "Účet vypadá jako trolling nebo podvod",
  },
  {
    id: "spam",
    label: "Nevhodný obsah / spam",
    hint: "Urážky, reklama nebo nesouvisející text",
  },
  {
    id: "other",
    label: "Jiný důvod",
    hint: "Doplňte krátký komentář pro moderátora",
  },
];

export function getReviewReportReason(id) {
  return REVIEW_REPORT_REASONS.find((r) => r.id === id);
}

export function isVerifiedNeighbor(user) {
  if (!user) return false;
  if (user.isVerified) return true;
  return (user.neighborhoodConfirmations ?? 0) >= 3;
}

export function isServiceOwner(user, service) {
  if (!user || !service?.ownerUserId) return false;
  return service.ownerUserId === (user.id ?? "me");
}

export function canWriteServiceReview(user, service) {
  return isVerifiedNeighbor(user) && !isServiceOwner(user, service);
}

export function initReviewsFromCatalog(services) {
  return services.flatMap((svc) =>
    (svc.reviews ?? []).map((r, i) => ({
      id: `${svc.id}-seed-${i}`,
      serviceId: svc.id,
      authorId: `seed-${r.author}`,
      authorName: r.author,
      text: r.text,
      stars: r.stars ?? 5,
      verified: Boolean(r.verified),
      location: r.location ?? "",
      reported: false,
      moderationStatus: REVIEW_MODERATION.none,
      reportReason: null,
      reportComment: "",
      reportedAt: null,
      /** @deprecated — recenze se při hlášení už neskryjí; ponecháno kvůli starším datům */
      hiddenPendingReview: false,
      createdAt: new Date().toISOString(),
    }))
  );
}

/** Veřejný výpis — skryté jen po rozhodnutí moderátora (removed) */
export function getVisibleReviews(reviews, serviceId) {
  return reviews.filter(
    (r) =>
      r.serviceId === serviceId &&
      r.verified &&
      r.moderationStatus !== REVIEW_MODERATION.removed &&
      !r.hiddenPendingReview
  );
}

/** Přehled pro majitele služby — včetně nahlášených čekajících na posouzení */
export function getOwnerReviews(reviews, serviceId) {
  return reviews.filter(
    (r) =>
      r.serviceId === serviceId &&
      r.verified &&
      r.moderationStatus !== REVIEW_MODERATION.removed
  );
}

export function computeServiceRating(reviews, serviceId) {
  const visible = getVisibleReviews(reviews, serviceId);
  if (visible.length === 0) return null;
  const sum = visible.reduce((acc, r) => acc + (r.stars ?? 5), 0);
  return Math.round((sum / visible.length) * 10) / 10;
}

export function isReviewPendingModeration(review) {
  return (
    review?.moderationStatus === REVIEW_MODERATION.pending ||
    (review?.reported && review?.moderationStatus !== REVIEW_MODERATION.dismissed)
  );
}
