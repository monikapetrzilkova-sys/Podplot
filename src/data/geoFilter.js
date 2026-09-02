import {
  DEFAULT_EVENTS_MAP_RADIUS_KM,
  DEFAULT_NEIGHBOR_RADIUS_KM,
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  filterByMapRadius,
  mapPosToDistanceKm,
} from "./mapRadiusSettings.js";
import { URGENT_SCOPE } from "./reportUrgency.js";
import { isBareStatutoryCity, parseCityDistrict } from "./czechCityDistricts.js";

/** Filtrace obsahu podle vzdálenosti a obce */

export function distanceBetweenKm(a, b) {
  if (!a?.lat || !b?.lat) return 999;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function normalizeMunName(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("cs")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ");
}

function statutoryCityKey(name) {
  const district = parseCityDistrict(name);
  if (district) return district.city;
  if (isBareStatutoryCity(name)) {
    const n = normalizeMunName(name)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (n === "plzen" || n === "plzeň") return "plzen";
    return n;
  }
  return null;
}

/** Alias malých obcí (Jesenice / Jesenice u Prahy) — ne „Praha“ uvnitř „u Prahy“. */
function smallTownAlias(left, right) {
  if (left === right) return true;
  const shorter = left.length <= right.length ? left : right;
  const longer = left.length <= right.length ? right : left;
  return longer.startsWith(`${shorter} `) || longer.startsWith(`${shorter}-`) || longer.startsWith(`${shorter},`);
}

/**
 * Sousedské párování obcí.
 * Praha 4 ≠ Praha 1 a holé „Praha“ se neslévá s městskou částí.
 */
export function municipalitiesMatch(a, b) {
  const left = normalizeMunName(a);
  const right = normalizeMunName(b);
  if (!left || !right) return false;
  if (left === right) {
    // Holé „Praha“/„Brno“ nestačí — bez městské části nebo GPS by se slilo celé město.
    if (isBareStatutoryCity(a) && isBareStatutoryCity(b)) return false;
    return true;
  }

  const leftD = parseCityDistrict(a);
  const rightD = parseCityDistrict(b);
  const leftBare = isBareStatutoryCity(a);
  const rightBare = isBareStatutoryCity(b);

  if (leftBare || rightBare || leftD || rightD) {
    if (leftBare && rightBare) return statutoryCityKey(a) === statutoryCityKey(b);
    if (leftD && rightD) {
      if (leftD.city !== rightD.city) return false;
      return leftD.district === rightD.district;
    }
    return false;
  }

  return smallTownAlias(left, right);
}

/** Oficiální zpráva za celé město (úřad Praha) smí dorazit i do městské části. */
export function officialMunicipalityMatch(officialMun, userMun) {
  if (municipalitiesMatch(officialMun, userMun)) return true;
  const officialKey = statutoryCityKey(officialMun);
  const userKey = statutoryCityKey(userMun);
  if (!officialKey || !userKey || officialKey !== userKey) return false;
  return isBareStatutoryCity(officialMun) || isBareStatutoryCity(userMun);
}

/** Známá místa v textech demo/seed příspěvků — ať se nevezou na každou mapu jako „kousek odsud“. */
const KNOWN_PLACE_COORDS = [
  { test: /václavsk/i, lat: 50.0813, lng: 14.4273, municipality: "Praha 1" },
];

export function inferItemCoords(item) {
  if (!item) return null;
  const lat = item.lat ?? item.mapPos?.lat ?? null;
  const lng = item.lng ?? item.mapPos?.lng ?? null;
  if (lat != null && lng != null) return { lat: Number(lat), lng: Number(lng) };
  const blob = `${item.title ?? ""} ${item.body ?? ""} ${item.type ?? ""} ${item.placeLabel ?? ""} ${item.address ?? ""}`;
  const known = KNOWN_PLACE_COORDS.find((p) => p.test.test(blob));
  return known ? { lat: known.lat, lng: known.lng } : null;
}

function withinActiveRadius(item, activeLocation, radiusKm) {
  const point = inferItemCoords(item);
  if (!point || !activeLocation) return true;
  if (activeLocation.lat == null || activeLocation.lng == null) return true;
  return distanceBetweenKm(activeLocation, point) <= radiusKm;
}

function demoMunicipalityForSlot(locationId) {
  if (locationId === "prace") return "Praha 1";
  if (locationId === "chata") return "Přední Lhota";
  return "Jesenice";
}

/** Komerční/komunitní obsah — v okruhu rádiusu od středu lokality */
export function filterByRadius(items, location, radiusKm = location?.radiusKm ?? DEFAULT_NEIGHBOR_RADIUS_KM) {
  if (!location) return items;
  return items.filter((item) => {
    if (item.distanceKm != null) return item.distanceKm <= radiusKm;
    if (item.lat != null && item.lng != null) {
      return distanceBetweenKm(location, item) <= radiusKm;
    }
    if (item.locationId) return item.locationId === location.id;
    return true;
  });
}

/** ID lokality u položky (domov / prace / chata) — legacy mock bez tagu = domov */
export function resolveLocationId(item, legacyDefault = "domov") {
  return item?.locationId ?? legacyDefault;
}

/**
 * Komunitní obsah pro aktivní místo.
 * Stejná obec = viditelné napříč osobními sloty (domov / vlastní místo),
 * aby sousedé ve stejné obci viděli stejné příspěvky.
 * Bez obce (starý mock) → fallback na locationId.
 * Vlastní položky (mine) vždy zůstanou viditelné — geocode nesmí akci „schovat“.
 */
export function filterByActiveLocation(items, activeLocationId, activeLocation, legacyDefault = "domov") {
  if (!activeLocationId) return items;
  const radius = activeLocation?.radiusKm ?? DEFAULT_NEIGHBOR_RADIUS_KM;
  const activeMun = activeLocation?.municipality ?? activeLocation?.shortLabel ?? null;
  const hasCenter = activeLocation?.lat != null && activeLocation?.lng != null;

  return items.filter((item) => {
    if (item?.mine) return true;

    const itemMun = item.municipality;
    const point = inferItemCoords(item);
    const hasGps = hasCenter && point != null;

    // GPS + zvolený okruh mají přednost — Václavák nesmí spadnout do Lhotky.
    if (hasGps) {
      return withinActiveRadius(item, activeLocation, radius);
    }

    if (itemMun && itemMun !== "all" && activeMun) {
      return municipalitiesMatch(itemMun, activeMun);
    }

    if (itemMun === "all") {
      return true;
    }

    const slot = resolveLocationId(item, legacyDefault);
    if (slot !== activeLocationId) return false;
    // Starý mock bez obce: jen ve stejné demo obci (Jesenice ≠ každý „domov“).
    if (!activeMun) return true;
    return (
      municipalitiesMatch(activeMun, demoMunicipalityForSlot(slot)) ||
      municipalitiesMatch(activeMun, "Jesenice u Prahy")
    );
  });
}

/** Oficiální/krizová hlášení — striktně podle obce, město-wide úřad i do městské části */
export function filterByMunicipality(items, municipality) {
  if (!municipality) return items;
  return items.filter(
    (item) =>
      !item.municipality ||
      item.municipality === "all" ||
      officialMunicipalityMatch(item.municipality, municipality)
  );
}

/** Hlášení z mapy — podle aktivní lokality (obec, ne jen osobní slot) */
export function filterSecurityReportsByLocation(
  reports,
  activeLocationId,
  activeLocation,
  legacyDefault = "domov"
) {
  if (!activeLocationId || !activeLocation) return [];
  const activeMun = activeLocation.municipality ?? activeLocation.shortLabel ?? null;
  const radius = activeLocation.radiusKm ?? DEFAULT_REPORTS_MAP_RADIUS_KM;
  const hasCenter = activeLocation.lat != null && activeLocation.lng != null;

  return reports.filter((report) => {
    // Vlastní hlášení vždy vidět — nesmí zmizet kvůli GPS mimo demo střed obce
    if (report?.mine) return true;

    const point = inferItemCoords(report);
    if (hasCenter && point) {
      return distanceBetweenKm(activeLocation, point) <= radius;
    }

    const reportMun = report.municipality;

    if (report.urgentScope === "municipality" && report.urgent) {
      if (reportMun && reportMun !== "all" && activeMun) {
        return officialMunicipalityMatch(reportMun, activeMun);
      }
      return resolveLocationId(report, legacyDefault) === activeLocationId;
    }

    if (reportMun && reportMun !== "all" && activeMun) {
      return municipalitiesMatch(reportMun, activeMun);
    }

    const slot = resolveLocationId(report, legacyDefault);
    if (slot !== activeLocationId) return false;
    if (!activeMun) return true;
    return municipalitiesMatch(activeMun, demoMunicipalityForSlot(slot));
  });
}

/** Hlášení viditelná na mapě v daném okruhu — urgentní pro celou obec zůstávají vždy. */
export function filterReportsForMapView(
  reports,
  radiusKm,
  referenceRadiusKm = DEFAULT_REPORTS_MAP_RADIUS_KM,
  center = null
) {
  return reports.filter((report) => {
    if (report?.mine) return true;

    const hasGps = report?.lat != null && report?.lng != null;
    const hasPct =
      report?.mapPos &&
      Number.isFinite(Number(report.mapPos.x)) &&
      Number.isFinite(Number(report.mapPos.y));
    const hasPos = hasGps || hasPct || (report?.mapPos?.lat != null && report?.mapPos?.lng != null);

    if (report.urgent && report.urgentScope === URGENT_SCOPE.MUNICIPALITY) {
      return hasPos;
    }

    const inferred = inferItemCoords(report);
    if (inferred && center?.lat != null && center?.lng != null) {
      return distanceBetweenKm(center, inferred) <= radiusKm;
    }

    // % pozice na schématu — jen když hlášení nemá reálné / odvozené GPS
    if (hasPct) {
      return mapPosToDistanceKm(report.mapPos, referenceRadiusKm) <= radiusKm;
    }

    if (hasGps && center?.lat != null && center?.lng != null) {
      return distanceBetweenKm(center, report) <= radiusKm;
    }

    if (report?.mapPos?.lat != null && report?.mapPos?.lng != null && center?.lat != null) {
      return distanceBetweenKm(center, { lat: report.mapPos.lat, lng: report.mapPos.lng }) <= radiusKm;
    }

    return false;
  });
}

/** Akce a události v okruhu mapy akcí. */
export function filterEventsForMapView(
  events,
  radiusKm,
  referenceRadiusKm = DEFAULT_EVENTS_MAP_RADIUS_KM,
  center = null
) {
  return filterByMapRadius(events, radiusKm, referenceRadiusKm, center);
}
