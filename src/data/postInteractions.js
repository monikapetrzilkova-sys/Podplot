/** Typy sousedských interakcí u příspěvků (bez lajků) */

export const INTERACTION_TYPES = {
  TIP: "tip",
  HELP: "help",
  SEARCH: "search",
};

export function getPostInteractionType(post) {
  if (post.interactionType) return post.interactionType;
  const listingTypes = ["Daruji", "Prodám", "Sháním", "Půjčovna"];
  if (listingTypes.includes(post.type)) return null;
  if (["daruji", "prodam", "shanim", "pujcovna"].includes(post.categoryId ?? post.feedSubtype)) {
    return null;
  }
  const text = `${post.title ?? ""} ${post.body ?? ""} ${post.type ?? ""}`.toLowerCase();
  if (
    post.type === "Sháním" ||
    post.categoryId === "shanim" ||
    /hledám pomoc|hlíd|venč|půjč|sháním|potřebuji/i.test(text)
  ) {
    return INTERACTION_TYPES.HELP;
  }
  if (/ztrát|nález|zaběhl|pátr|hledám psa|hledám kočk|ztracen/i.test(text)) {
    return INTERACTION_TYPES.SEARCH;
  }
  if (/^tip:/i.test(post.title ?? "") || post.type === "Tip") {
    return INTERACTION_TYPES.TIP;
  }
  return INTERACTION_TYPES.TIP;
}
