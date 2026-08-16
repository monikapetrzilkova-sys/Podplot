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

/** Komunitní obsah vázaný na aktivní oblast (domov, práce, chata) */
export function filterByActiveLocation(items, activeLocationId, activeLocation, legacyDefault = "domov") {
  if (!activeLocationId) return items;
  const radius = activeLocation?.radiusKm ?? 7;
  return items.filter((item) => {
    if (resolveLocationId(item, legacyDefault) !== activeLocationId) return false;
    if (
      item.municipality &&
      item.municipality !== "all" &&
      activeLocation?.municipality &&
      item.municipality !== activeLocation.municipality
    ) {
      return false;
    }
    if (item.lat != null && item.lng != null && activeLocation) {
      return distanceBetweenKm(activeLocation, item) <= radius;
    }
    return true;
  });
}

/** Oficiální/krizová hlášení — striktně podle obce */
export function filterByMunicipality(items, municipality) {
  if (!municipality) return items;
  return items.filter(
    (item) =>
      !item.municipality ||
      item.municipality === municipality ||
      item.municipality === "all"
  );
}

/** Hlášení z mapy — podle aktivní lokality (domov / práce / chata) */
export function filterSecurityReportsByLocation(
  reports,
  activeLocationId,
  activeLocation,
  legacyDefault = "domov"
) {
  if (!activeLocationId || !activeLocation) return reports;

  return reports.filter((report) => {
    const reportLocId = resolveLocationId(report, legacyDefault);

    if (report.urgentScope === "municipality" && report.urgent) {
      if (reportLocId !== activeLocationId) return false;
      if (
        report.municipality &&
        report.municipality !== activeLocation.municipality &&
        report.municipality !== "all"
      ) {
        return false;
      }
      return true;
    }

    return reportLocId === activeLocationId;
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
  referenceRadiusKm = DEFAULT_EVENTS_MAP_RADIUS_KM
) {
  return filterByMapRadius(events, radiusKm, referenceRadiusKm);
}
