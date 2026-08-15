import { CURRENT_USER } from "./mockData.js";
import { getAccountType } from "./accountTypes.js";

/** Pro testování: true = rovnou přihlášená Monika, bez registrační obrazovky */
export const SKIP_REGISTRATION = true;

/**
 * Developer Mode — přepínač rolí v profilu.
 * V ostré verzi nastavte false (nebo VITE_ENABLE_DEV_ROLE_SWITCH=false).
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
    geo: { city: "Jesenice" },
    geolocVerified: true,
    neighborhoodConfirmations: 2,
    isPremium: false,
    allowPublicAreaLabel: false,
    publicAreaLabel: "",
  };
}
