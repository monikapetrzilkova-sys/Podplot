import { CURRENT_USER } from "./mockData.js";
import { getAccountType } from "./accountTypes.js";

/**
 * Přeskočit registraci jen při lokálním vývoji.
 * Na Vercelu (produkční build) je vždy registrační obrazovka + uložený účet v prohlížeči.
 */
export const SKIP_REGISTRATION = import.meta.env?.PROD !== true;

/**
 * Developer Mode — přepínač rolí v profilu.
 * V ostré verzi vypnuto.
 */
export const ENABLE_DEV_ROLE_SWITCH =
  import.meta.env?.VITE_ENABLE_DEV_ROLE_SWITCH === "true" ||
  import.meta.env?.VITE_ENABLE_DEV_ROLE_SWITCH === "1" ||
  (import.meta.env?.PROD ? false : SKIP_REGISTRATION);

export function getDevTestUser() {
  const accountType = "soused";
  const acc = getAccountType(accountType);
  const address = "Lípová 12, 252 42 Jesenice";

  return {
    id: "monika",
    name: CURRENT_USER.name,
    email: "monika.petrzilkova@email.cz",
    address,
    accountType,
    initials: CURRENT_USER.initials,
    role: acc.role,
    location: "Jesenice",
    radius: "7 km",
    isVerified: true,
    verifiedDomain: null,
    geo: { city: "Jesenice", lat: 49.966, lng: 14.512 },
    geolocVerified: true,
    neighborhoodConfirmations: 2,
    isPremium: false,
    allowPublicAreaLabel: false,
    publicAreaLabel: "",
  };
}
