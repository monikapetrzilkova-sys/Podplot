/** Jak chce prodejce u inzerátu Prodám přijmout platbu. */

export const LISTING_PAYMENT_METHODS = [
  {
    id: "podplot",
    label: "Přes Podplot",
    hint: "Kupující zaplatí v appce, peníze zůstanou v úschově do předání",
  },
  {
    id: "in_person",
    label: "Jen osobně",
    hint: "Domluvíte se ve zprávě a zaplatíte při předání — bez úschovy Podplotu",
  },
];

export const DEFAULT_LISTING_PAYMENT_METHOD = "podplot";

export function getListingPaymentMethod(id) {
  return LISTING_PAYMENT_METHODS.find((m) => m.id === id) ?? LISTING_PAYMENT_METHODS[0];
}

export function normalizeListingPaymentMethod(id) {
  return String(id || "").toLowerCase() === "in_person" ? "in_person" : DEFAULT_LISTING_PAYMENT_METHOD;
}

export function listingPaysInPerson(postOrMethod) {
  if (postOrMethod == null) return false;
  if (typeof postOrMethod === "string") {
    return normalizeListingPaymentMethod(postOrMethod) === "in_person";
  }
  return normalizeListingPaymentMethod(postOrMethod.listingPaymentMethod) === "in_person";
}

export function listingAcceptsPodplotPay(post) {
  if (!post || post.categoryId !== "prodam") return false;
  if (!(Number(post.listingPrice) > 0)) return false;
  return !listingPaysInPerson(post);
}
