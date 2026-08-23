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
 * Krátký text bez fotek a bez dalšího obsahu v children → ne.
 */
export function feedItemNeedsExpand(post, { preview = null, hasExtraDetail = false } = {}) {
  if (hasExtraDetail) return true;
  if (postHasFeedPhotos(post)) return true;
  const body = String(post?.body ?? preview ?? "").trim();
  if (bodyExceedsCollapsedPreview(body)) return true;
  const cat = post?.categoryId ?? post?.feedSubtype;
  if (["daruji", "prodam", "shanim", "pujcovna"].includes(cat)) return true;
  if (["Daruji", "Prodám", "Sháním", "Půjčovna"].includes(post?.type)) return true;
  return false;
}
