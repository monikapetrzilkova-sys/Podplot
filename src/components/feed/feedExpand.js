/** Odpovídá sbalenému náhledu LiveFeedCard (`line-clamp-1`). */
export const COLLAPSED_FEED_PREVIEW_CHARS = 56;

/** Odhad, zda line-clamp-1 skryje část textu. */
export function bodyExceedsCollapsedPreview(text, maxChars = COLLAPSED_FEED_PREVIEW_CHARS) {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (t.includes("\n")) return true;
  return t.length > maxChars;
}

export function postHasFeedPhotos(post) {
  const photos = post?.photos;
  if (!Array.isArray(photos)) return false;
  return photos.some(Boolean);
}

/**
 * Má smysl rozbalovat kartu feedu?
 * Krátký text bez fotek a bez dalšího obsahu → ne (ať se neukazuje stejný text znovu).
 */
export function feedItemNeedsExpand(post, { preview = null, hasExtraDetail = false } = {}) {
  if (hasExtraDetail) return true;
  if (postHasFeedPhotos(post)) return true;
  const body = String(post?.body ?? preview ?? "").trim();
  if (bodyExceedsCollapsedPreview(body)) return true;
  return false;
}
