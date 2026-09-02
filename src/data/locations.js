/** Geografické lokality uživatele — střed, obec, rádius */

import { parseStoredAddress, pscDigits } from "./addressValidation.js";
import { isBareStatutoryCity, localityShortLabel, refineLocalityFromPsc } from "./czechCityDistricts.js";
import { DEFAULT_NEIGHBOR_RADIUS_KM } from "./mapRadiusSettings.js";

export const DEFAULT_RADIUS_KM = 7;

export const USER_LOCATIONS = [
  {
    id: "domov",
    emoji: "🏠",
    label: "Domov",
    shortLabel: "Jesenice",
    municipality: "Jesenice",
    address: "Lípová 12, Jesenice",
    lat: 49.966,
    lng: 14.512,
    radiusKm: DEFAULT_RADIUS_KM,
  },
  {
    id: "prace",
    emoji: "💼",
    label: "Práce",
    shortLabel: "Praha",
    municipality: "Praha",
    address: "Václavské nám. 1, Praha",
    lat: 50.081,
    lng: 14.427,
    radiusKm: DEFAULT_RADIUS_KM,
  },
  {
    id: "chata",
    emoji: "🌲",
    label: "Chata",
    shortLabel: "Přední Lhota",
    municipality: "Přední Lhota",
    address: "Přední Lhota 15, 290 01 Přední Lhota",
    lat: 50.135,
    lng: 15.09,
    radiusKm: DEFAULT_RADIUS_KM,
  },
];

export const STOCK_JESENICE_COORDS = { lat: 49.966, lng: 14.512 };

/** Souřadnice stále ukazují na demo Domov (Jesenice), i když obec je jiná. */
export function isStockJeseniceCoords(lat, lng, epsilon = 0.02) {
  if (lat == null || lng == null) return false;
  return (
    Math.abs(Number(lat) - STOCK_JESENICE_COORDS.lat) < epsilon &&
    Math.abs(Number(lng) - STOCK_JESENICE_COORDS.lng) < epsilon
  );
}
export function isStockDemoExtraLocation(loc) {
  if (!loc?.id || (loc.id !== "prace" && loc.id !== "chata")) return false;
  const demo = USER_LOCATIONS.find((d) => d.id === loc.id);
  if (!demo) return false;
  const sameAddress = String(loc.address ?? "").trim() === String(demo.address).trim();
  const sameMun = String(loc.municipality ?? "").trim() === String(demo.municipality).trim();
  const sameCoords =
    Number(loc.lat) === Number(demo.lat) && Number(loc.lng) === Number(demo.lng);
  return sameAddress || (sameMun && sameCoords);
}

/** Jen místa, která uživatel opravdu má (bez stock demo Práce/Chata). */
export function sanitizeUserLocations(locations, homeFallback = null) {
  const cleaned = (locations ?? []).filter((loc) => loc?.id && !isStockDemoExtraLocation(loc));
  if (cleaned.length) return cleaned;
  if (homeFallback?.id) return [homeFallback];
  return [
    {
      ...USER_LOCATIONS[0],
      label: "Domov",
    },
  ];
}

/** Domov z registrace / profilu — bez cizích demo lokalit. */
export function buildHomeLocation({
  address,
  municipality,
  shortLabel,
  lat,
  lng,
  radiusKm = DEFAULT_RADIUS_KM,
  psc = null,
} = {}) {
  const parsed = parseStoredAddress(address || "");
  const zip = pscDigits(psc || parsed.psc || "");
  const mun = refineLocalityFromPsc(zip, String(municipality || shortLabel || parsed.city || "Obec").trim()) || "Obec";
  const label = String(shortLabel || localityShortLabel(mun) || mun).trim() || mun;
  return {
    id: "domov",
    emoji: "🏠",
    label: "Domov",
    shortLabel: label,
    municipality: mun,
    address: String(address || mun).trim() || mun,
    lat: lat ?? null,
    lng: lng ?? null,
    radiusKm,
    psc: zip || null,
  };
}

/** Starší účty s holou „Prahou“ a výchozím 7 km — městská část z PSČ a užší okruh. */
export function migrateLocationDistricts(locations = []) {
  return locations.map((loc) => {
    if (!loc) return loc;
    const parsed = parseStoredAddress(loc.address || "");
    const zip = pscDigits(loc.psc || parsed.psc || "");
    const refined = refineLocalityFromPsc(zip, loc.municipality || parsed.city || loc.shortLabel);
    const wasBare = isBareStatutoryCity(loc.municipality);
    const next = { ...loc };
    if (refined && refined !== loc.municipality) {
      next.municipality = refined;
      next.shortLabel = localityShortLabel(refined) || loc.shortLabel;
    }
    if (zip) next.psc = zip;
    if (wasBare && (loc.radiusKm == null || Number(loc.radiusKm) >= DEFAULT_RADIUS_KM)) {
      next.radiusKm = DEFAULT_NEIGHBOR_RADIUS_KM;
    }
    return next;
  });
}

export const GROUPS_BY_LOCATION = {
  domov: [
    {
      id: "maminky",
      name: "Maminky",
      emoji: "👶",
      members: 84,
      clubCategory: "deti",
      description: "Rodiny s dětmi v Jesenici.",
    },
    {
      id: "krouzky",
      name: "Kroužky",
      emoji: "🎨",
      members: 36,
      clubCategory: "deti",
      description: "Volnočasové kroužky a tipy pro děti.",
    },
    {
      id: "hriste",
      name: "Hřiště",
      emoji: "🛝",
      members: 29,
      clubCategory: "deti",
      description: "Setkání u hřišť a tipy na místa pro děti.",
    },
    {
      id: "tenis",
      name: "Tenis",
      emoji: "🎾",
      members: 14,
      clubCategory: "sport",
      description: "Rezervace kurtů a společné tréninky.",
    },
    {
      id: "fotbal",
      name: "Fotbal",
      emoji: "⚽",
      members: 22,
      clubCategory: "sport",
      description: "Amatérský fotbal a tréninky.",
    },
    {
      id: "beh",
      name: "Běh",
      emoji: "🏃",
      members: 18,
      clubCategory: "sport",
      description: "Společné běhy a trasy v okolí.",
    },
    {
      id: "cyklistika",
      name: "Cyklistika",
      emoji: "🚴",
      members: 16,
      clubCategory: "sport",
      description: "Společné vyjížďky a tipy na trasy.",
    },
    {
      id: "zahradkari",
      name: "Zahrádkáři",
      emoji: "🌱",
      members: 41,
      clubCategory: "dum",
      description: "Zahrady a úroda v okolí.",
    },
    {
      id: "kutilove",
      name: "Kutilové",
      emoji: "🔧",
      members: 23,
      clubCategory: "dum",
      description: "Opravy, tipy a půjčování nářadí.",
    },
    {
      id: "kultura",
      name: "Kultura",
      emoji: "🎭",
      members: 28,
      clubCategory: "hobby",
      description: "Akce, workshopy a kultura v okolí.",
    },
    {
      id: "pejskari",
      name: "Pejskaři",
      emoji: "🐶",
      members: 33,
      clubCategory: "hobby",
      description: "Venčení, tipy a setkání pejskařů.",
    },
    {
      id: "foto",
      name: "Fotografování",
      emoji: "📷",
      members: 12,
      clubCategory: "hobby",
      description: "Společné focení a tipy na místa.",
    },
  ],
  prace: [
    {
      id: "praha-sousede",
      name: "Sousedé z práce",
      emoji: "💼",
      members: 19,
      clubCategory: "hobby",
      description: "Kolegové z okolí kanceláře.",
    },
    {
      id: "praha-obedy",
      name: "Kam na oběd",
      emoji: "🍽️",
      members: 45,
      clubCategory: "hobby",
      description: "Tipy na polední menu v centru.",
    },
  ],
  chata: [
    {
      id: "zahradkari",
      name: "Zahrádkáři",
      emoji: "🌱",
      members: 22,
      clubCategory: "dum",
      description: "Chata a zahrada v Přední Lhotě.",
    },
    {
      id: "houbari",
      name: "Houbaři",
      emoji: "🍄",
      members: 17,
      clubCategory: "hobby",
      description: "Výpravy do lesa kolem Přední Lhoty a Poděbrad.",
    },
    {
      id: "kultura",
      name: "Kultura",
      emoji: "🎭",
      members: 11,
      clubCategory: "hobby",
      description: "Akce v Přední Lhotě a okolí Poděbrad.",
    },
  ],
};

export function getLocation(id) {
  return USER_LOCATIONS.find((l) => l.id === id);
}

export function getGroupsForLocation(locationId) {
  return GROUPS_BY_LOCATION[locationId] ?? GROUPS_BY_LOCATION.domov;
}

/** Demo členství jen pro lokální SKIP_REGISTRATION — reálný účet začíná prázdný. */
export const MY_GROUP_IDS_BY_LOCATION = {
  domov: ["maminky", "zahradkari", "tenis"],
  prace: ["praha-sousede", "praha-obedy"],
  chata: ["zahradkari", "houbari"],
};

export function demoMemberGroupIds(locationId = "domov") {
  return [...(MY_GROUP_IDS_BY_LOCATION[locationId] ?? MY_GROUP_IDS_BY_LOCATION.domov)];
}

export function getMyMemberGroups(communityGroups, joinedGroupIds = []) {
  const ids = new Set(joinedGroupIds ?? []);
  return (communityGroups ?? []).filter((g) => ids.has(g.id));
}

export function getDiscoverGroups(communityGroups, joinedGroupIds = []) {
  const ids = new Set(joinedGroupIds ?? []);
  return (communityGroups ?? []).filter((g) => !ids.has(g.id));
}
