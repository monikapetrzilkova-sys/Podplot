/** Odhad, zda line-clamp-2 skryje část textu. */
export function bodyExceedsCollapsedPreview(text, maxChars = 140) {
  return String(text ?? "").trim().length > maxChars;
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
