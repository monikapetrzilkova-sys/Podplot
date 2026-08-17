import {
  DEFAULT_EVENTS_MAP_RADIUS_KM,
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  filterByMapRadius,
  mapPosToDistanceKm,
} from "./mapRadiusSettings.js";
import { URGENT_SCOPE } from "./reportUrgency.js";

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

/** Volné párování názvů obcí (Jesenice / jesenice u Prahy). */
export function municipalitiesMatch(a, b) {
  const left = String(a ?? "").trim().toLowerCase();
  const right = String(b ?? "").trim().toLowerCase();
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function withinActiveRadius(item, activeLocation, radiusKm) {
  if (item.lat == null || item.lng == null || !activeLocation) return true;
  if (activeLocation.lat == null || activeLocation.lng == null) return true;
  return distanceBetweenKm(activeLocation, item) <= radiusKm;
}

/** Komerční/komunitní obsah — v okruhu rádiusu od středu lokality */
export function filterByRadius(items, location, radiusKm = location?.radiusKm ?? 7) {
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
 */
export function filterByActiveLocation(items, activeLocationId, activeLocation, legacyDefault = "domov") {
  if (!activeLocationId) return items;
  const radius = activeLocation?.radiusKm ?? 7;
  const activeMun = activeLocation?.municipality ?? activeLocation?.shortLabel ?? null;

  return items.filter((item) => {
    const itemMun = item.municipality;

    if (itemMun && itemMun !== "all" && activeMun) {
      if (!municipalitiesMatch(itemMun, activeMun)) return false;
      return withinActiveRadius(item, activeLocation, radius);
    }

    if (itemMun === "all") {
      return withinActiveRadius(item, activeLocation, radius);
    }

    // Legacy mock bez obce — osobní slot (domov / práce / …)
    if (resolveLocationId(item, legacyDefault) !== activeLocationId) return false;
    return withinActiveRadius(item, activeLocation, radius);
  });
}

/** Oficiální/krizová hlášení — striktně podle obce */
export function filterByMunicipality(items, municipality) {
  if (!municipality) return items;
  return items.filter(
    (item) =>
      !item.municipality ||
      item.municipality === "all" ||
      municipalitiesMatch(item.municipality, municipality)
  );
}

/** Hlášení z mapy — podle aktivní lokality (obec, ne jen osobní slot) */
export function filterSecurityReportsByLocation(
  reports,
  activeLocationId,
  activeLocation,
  legacyDefault = "domov"
) {
  if (!activeLocationId || !activeLocation) return reports;
  const activeMun = activeLocation.municipality ?? activeLocation.shortLabel ?? null;

  return reports.filter((report) => {
    const reportMun = report.municipality;

    if (report.urgentScope === "municipality" && report.urgent) {
      if (reportMun && reportMun !== "all" && activeMun) {
        return municipalitiesMatch(reportMun, activeMun);
      }
      return resolveLocationId(report, legacyDefault) === activeLocationId;
    }

    if (reportMun && reportMun !== "all" && activeMun) {
      return municipalitiesMatch(reportMun, activeMun);
    }

    return resolveLocationId(report, legacyDefault) === activeLocationId;
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
    const hasGps = report?.lat != null && report?.lng != null;
    const hasPct =
      report?.mapPos &&
      Number.isFinite(Number(report.mapPos.x)) &&
      Number.isFinite(Number(report.mapPos.y));
    const hasPos = hasGps || hasPct || (report?.mapPos?.lat != null && report?.mapPos?.lng != null);

    if (report.urgent && report.urgentScope === URGENT_SCOPE.MUNICIPALITY) {
      return hasPos;
    }

    if (hasGps && center?.lat != null && center?.lng != null) {
      return distanceBetweenKm(center, report) <= radiusKm;
    }

    if (report?.mapPos?.lat != null && report?.mapPos?.lng != null && center?.lat != null) {
      return distanceBetweenKm(center, { lat: report.mapPos.lat, lng: report.mapPos.lng }) <= radiusKm;
    }

    if (!hasPct) return false;
    return mapPosToDistanceKm(report.mapPos, referenceRadiusKm) <= radiusKm;
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
