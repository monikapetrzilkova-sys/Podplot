/** Cílené push notifikace — poptávky a polední menu (MVP simulace in-app) */

export const SERVICE_REQUEST_PUSH_PRICE = 29;

/** Prodleva pro neplacící mobilní služby (ms) — MVP simulace */
export const SERVICE_REQUEST_FREE_DELAY_MS = 15 * 60 * 1000;

export const MOBILNI_PUSH_SUBSCRIPTION = {
  id: "mobilni_push_monthly",
  label: "Push poptávky v okruhu",
  price: 199,
  period: "měsíc",
  hint: "Okamžitá notifikace, když soused ve vaší kategorii a dojezdu zadá poptávku.",
};

export const LUNCH_MENU_PUSH_PRICE = 19;

export const DEFAULT_NOTIFICATION_PREFS = {
  /** Soused — zájem o polední menu z gastro podniků v okolí */
  lunchMenuAlerts: false,
  lunchMenuRadiusKm: 2,
};

export const DEFAULT_BUSINESS_NOTIFICATION_PREFS = {
  /** Mobilní podnik — předplatné push poptávek */
  serviceRequestPushEnabled: false,
  serviceRequestPushUntil: null,
};
