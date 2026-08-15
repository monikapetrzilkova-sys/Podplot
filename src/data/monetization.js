/** Hybridní monetizace Podplot — ceník a servisní poplatek */

export const SERVICE_FEE_PERCENT = 10;

export const TOP_BAZAR_PLANS = [
  { id: "3d", days: 3, price: 29, label: "3 dny", hint: "Rychlý boost ve feedu" },
  { id: "7d", days: 7, price: 59, label: "7 dní", hint: "Delší viditelnost", popular: true },
];

export const CATALOG_PREMIUM_PLANS = [
  { id: "7d", days: 7, price: 149, label: "7 dní", hint: "Přednostní výpis v katalogu" },
  { id: "30d", days: 30, price: 449, label: "30 dní", hint: "Nejlepší viditelnost", popular: true },
];

export const SPONSORED_STRIP_PLANS = [
  {
    id: "24h",
    hours: 24,
    price: 99,
    label: "24 hodin",
    hint: "Proužek Partner na domovské zdi sousedů",
    durationLabel: "1 den",
  },
  {
    id: "weekend",
    days: 3,
    price: 249,
    label: "Víkend (Pá–Ne)",
    hint: "Od aktivace cca 3 dny — ideální na víkendovou akci",
    popular: true,
    durationLabel: "3 dny",
  },
  {
    id: "7d",
    days: 7,
    price: 449,
    label: "7 dní",
    hint: "Týdenní viditelnost na domovské zdi",
    durationLabel: "7 dní",
  },
];

export const PAYMENT_METHODS = [
  { id: "card", label: "Kartou / Apple Pay / Google Pay", icon: "💳", hint: "Platební brána" },
  { id: "wallet", label: "Podplot kredity", icon: "👛", hint: "Volitelně z peněženky (1 kredit = 1 Kč)" },
];

export function calcServiceFee(amount) {
  const fee = Math.round(amount * (SERVICE_FEE_PERCENT / 100));
  return { fee, sellerGets: amount - fee };
}

export function getMonetizationPlan(type, planId) {
  const lists = {
    top: TOP_BAZAR_PLANS,
    catalog: CATALOG_PREMIUM_PLANS,
    sponsored: SPONSORED_STRIP_PLANS,
  };
  return lists[type]?.find((p) => p.id === planId) ?? lists[type]?.[0];
}

/** Zpětná kompatibilita s pricing.js */
export const TOP_PLANS = TOP_BAZAR_PLANS.map((p) => ({
  id: p.id,
  days: p.days,
  label: p.label,
  hint: p.hint,
  baseCost: p.price,
  popular: p.popular,
}));

export function calculateTopCost(planId) {
  return getMonetizationPlan("top", planId)?.price ?? 29;
}

/** Chráněná transakce služeb — 3 % (2 % brána + 1 % provize) */
export const ESCROW_FEE_PERCENT = 3;

export function calcEscrowFee(amount) {
  const fee = Math.round(amount * (ESCROW_FEE_PERCENT / 100));
  return { fee, providerGets: amount - fee };
}

export const ESCROW_STATUSES = {
  pending: "Čeká na zaplacení",
  held: "Peníze v bezpečné úschově",
  released: "Vyplaceno řemeslníkovi / Dokončeno",
};

/** Prodej inzerátu (bazar) — platba držená do „Převzato a zaplaceno“ */
export const LISTING_SALE_STATUSES = {
  held: "V rezervaci — platba v úschově Podplotu",
  released: "Převzato · platba uvolněna prodejci",
};
