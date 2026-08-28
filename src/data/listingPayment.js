/** Jak chce prodejce u inzerátu Prodám přijmout platbu.
 * Úschova přes Podplot je vypnutá — jen osobní předání / domluva. */

export const LISTING_PAYMENT_METHODS = [
  {
    id: "in_person",
    label: "Osobně při předání",
    hint: "Domluvíte se ve zprávě a zaplatíte při předání — Podplot peníze nedrží",
  },
];

export const DEFAULT_LISTING_PAYMENT_METHOD = "in_person";

export function getListingPaymentMethod(id) {
  return LISTING_PAYMENT_METHODS.find((m) => m.id === id) ?? LISTING_PAYMENT_METHODS[0];
}

export function normalizeListingPaymentMethod(_id) {
  return DEFAULT_LISTING_PAYMENT_METHOD;
}

export function listingPaysInPerson(_postOrMethod) {
  return true;
}

export function listingAcceptsPodplotPay(_post) {
  return false;
}
