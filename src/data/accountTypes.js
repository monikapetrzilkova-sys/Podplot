/** Tři hlavní kategorie účtů (Nextdoor-style) + podtyp podniku/služby */

export const BUSINESS_SUBTYPES = {
  fyzicka: {
    id: "fyzicka",
    label: "Fyzická pobočka / provozovna",
    shortLabel: "Provozovna",
    hint: "Kamenná adresa — zákazníci k vám mohou přijít (gastro, obchod, služba na místě).",
    nameLabel: "Název podniku",
    namePlaceholder: "Kavárna U Ráje",
    addressLabel: "Adresa provozovny",
    addressPlaceholder: "např. Náměstí 5, 602 00 Brno",
  },
  mobilni: {
    id: "mobilni",
    label: "Mobilní / dojíždějící řemeslník / služba",
    shortLabel: "Mobilní služba",
    hint: "Bez stálé provozovny — jezdíte za zákazníky, definujete oblast působnosti.",
    nameLabel: "Jméno nebo název služby",
    namePlaceholder: "Tomáš Kovář — instalatér",
    addressLabel: "Výchozí adresa / působnost",
    addressPlaceholder: "např. Vaše ulice, obec",
  },
};

export const ACCOUNT_TYPES = {
  soused: {
    id: "soused",
    label: "Soused",
    shortLabel: "Soused",
    icon: "🏠",
    role: "soused",
    hint: "Běžný obyvatel — půjčování, hlášení, komunitní život",
    nameLabel: "Jméno a příjmení",
    namePlaceholder: "Monika Petržílková",
    addressLabel: "Domovská adresa",
    addressPlaceholder: "např. Karlova 12, 602 00 Brno",
  },
  urad: {
    id: "urad",
    label: "Úřad",
    shortLabel: "Úřad",
    icon: "🏛️",
    role: "urad",
    hint: "Veřejná správa, město, obec — krizová hlášení a podněty",
    nameLabel: "Název úřadu / instituce",
    namePlaceholder: "Název úřadu (doplní se výběrem)",
    addressLabel: "Sídlo úřadu",
    addressPlaceholder: "např. Hlavní 1, 252 42 …",
  },
  podnik: {
    id: "podnik",
    label: "Podnik / Služba",
    shortLabel: "Podnik",
    icon: "🏪",
    role: "podnik",
    hint: "Firmy, obchody, gastro i mobilní řemeslníci — jedna kategorie, dva režimy fungování",
    nameLabel: "Název podniku nebo služby",
    namePlaceholder: "Kavárna U Ráje",
    addressLabel: "Adresa",
    addressPlaceholder: "např. Náměstí 5, 602 00 Brno",
  },
};

/** @deprecated mapování starých ID registrace */
const LEGACY_ACCOUNT_TYPE_MAP = {
  remeslnik: "podnik",
  instituce: "urad",
  podnikatel: "podnik",
};

/** @deprecated mapování starých ID na podtyp podniku */
const LEGACY_BUSINESS_SUBTYPE_MAP = {
  remeslnik: "mobilni",
  podnik: "fyzicka",
  podnikatel: "fyzicka",
};

export const ADDRESS_PRIVACY_NOTE =
  "Adresa nebude veřejně zobrazena ostatním na profilu — slouží pouze k zafixování vaší geolokace v okolí.";

export const ACCOUNT_TYPE_LIST = Object.values(ACCOUNT_TYPES);

export function normalizeAccountType(accountTypeId) {
  if (!accountTypeId) return "soused";
  return LEGACY_ACCOUNT_TYPE_MAP[accountTypeId] ?? accountTypeId;
}

export function resolveBusinessSubtype(userOrType, explicitSubtype) {
  if (explicitSubtype) return explicitSubtype;
  if (userOrType && typeof userOrType === "object") {
    if (userOrType.businessSubtype) return userOrType.businessSubtype;
    return LEGACY_BUSINESS_SUBTYPE_MAP[userOrType.accountType] ?? null;
  }
  return LEGACY_BUSINESS_SUBTYPE_MAP[userOrType] ?? null;
}

export function getAccountType(id) {
  const normalized = normalizeAccountType(id);
  return ACCOUNT_TYPES[normalized] ?? ACCOUNT_TYPES.soused;
}

export function getBusinessSubtype(id) {
  return BUSINESS_SUBTYPES[id] ?? null;
}

export function isBusinessAccount(userOrType) {
  const type = typeof userOrType === "object" ? normalizeAccountType(userOrType?.accountType) : normalizeAccountType(userOrType);
  return type === "podnik";
}

export function isMobilniBusiness(userOrAccountType) {
  if (!isBusinessAccount(userOrAccountType)) return false;
  return resolveBusinessSubtype(userOrAccountType) === "mobilni";
}

export function isFyzickaBusiness(userOrAccountType) {
  if (!isBusinessAccount(userOrAccountType)) return false;
  return resolveBusinessSubtype(userOrAccountType) === "fyzicka";
}

export function isUradAccount(userOrType) {
  const type = typeof userOrType === "object" ? normalizeAccountType(userOrType?.accountType) : normalizeAccountType(userOrType);
  return type === "urad";
}

/** Zpětná kompatibilita */
export function isPodnikatelAccount(accountTypeId) {
  return isBusinessAccount(accountTypeId);
}

export function getPodnikatelSubtypeLabel(userOrType) {
  const subtype = resolveBusinessSubtype(userOrType);
  return subtype ? BUSINESS_SUBTYPES[subtype]?.label ?? null : null;
}

export function formatAuthorName(author, accountTypeId) {
  const acc = getAccountType(accountTypeId);
  const normalized = normalizeAccountType(accountTypeId);
  if (normalized === "soused") {
    return author.split(" ")[0];
  }
  if (normalized === "podnik") {
    return `${author} (Podnik)`;
  }
  if (normalized === "urad") {
    return `${author} (${acc.shortLabel})`;
  }
  return author.split(" ")[0];
}

export function getRegistrationFields(accountTypeId, businessSubtype) {
  const acc = getAccountType(accountTypeId);
  if (normalizeAccountType(accountTypeId) === "podnik" && businessSubtype) {
    const sub = getBusinessSubtype(businessSubtype);
    if (sub) {
      return {
        nameLabel: sub.nameLabel,
        namePlaceholder: sub.namePlaceholder,
        addressLabel: sub.addressLabel,
        addressPlaceholder: sub.addressPlaceholder,
      };
    }
  }
  return {
    nameLabel: acc.nameLabel,
    namePlaceholder: acc.namePlaceholder,
    addressLabel: acc.addressLabel,
    addressPlaceholder: acc.addressPlaceholder,
  };
}
