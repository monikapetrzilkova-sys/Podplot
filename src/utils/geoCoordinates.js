import { clampMapPos } from "../data/mapData.js";
import {
  BASE_MAP_ELLIPSE_PERCENT,
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  MAP_CENTER,
} from "../data/mapRadiusSettings.js";

const METERS_PER_DEG_LAT = 111_320;

function metersPerDegLng(lat) {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

/** Posun souřadnic o dx/dy v metrech (dx = východ, dy = sever). */
export function offsetLatLng(lat, lng, dxMeters, dyMeters) {
  const dLat = dyMeters / METERS_PER_DEG_LAT;
  const dLng = dxMeters / metersPerDegLng(lat);
  return { lat: lat + dLat, lng: lng + dLng };
}

export function latLngOffsetMeters(origin, target) {
  const dyMeters = (target.lat - origin.lat) * METERS_PER_DEG_LAT;
  const dxMeters = (target.lng - origin.lng) * metersPerDegLng(origin.lat);
  return { dxMeters, dyMeters };
}

/** Simulované mapPos → GPS (střed = aktivní lokalita). */
export function mapPosToLatLng(
  mapPos,
  center,
  referenceRadiusKm = DEFAULT_REPORTS_MAP_RADIUS_KM
) {
  if (!mapPos || center?.lat == null || center?.lng == null) return null;
  if (mapPos.lat != null && mapPos.lng != null) {
    return { lat: Number(mapPos.lat), lng: Number(mapPos.lng) };
  }
  const dxKm =
    ((Number(mapPos.x) - MAP_CENTER.x) / BASE_MAP_ELLIPSE_PERCENT) * referenceRadiusKm;
  const dyKm =
    ((MAP_CENTER.y - Number(mapPos.y)) / BASE_MAP_ELLIPSE_PERCENT) * referenceRadiusKm;
  return offsetLatLng(center.lat, center.lng, dxKm * 1000, dyKm * 1000);
}

/** GPS → simulované mapPos (zpětná kompatibilita). */
export function latLngToMapPos(
  lat,
  lng,
  center,
  referenceRadiusKm = DEFAULT_REPORTS_MAP_RADIUS_KM
) {
  if (center?.lat == null || center?.lng == null) {
    return clampMapPos(MAP_CENTER.x, MAP_CENTER.y);
  }
  const { dxMeters, dyMeters } = latLngOffsetMeters(center, { lat, lng });
  const dxKm = dxMeters / 1000;
  const dyKm = dyMeters / 1000;
  return clampMapPos(
    MAP_CENTER.x + (dxKm / referenceRadiusKm) * BASE_MAP_ELLIPSE_PERCENT,
    MAP_CENTER.y - (dyKm / referenceRadiusKm) * BASE_MAP_ELLIPSE_PERCENT
  );
}

/** Výsledek výběru na mapě — GPS + mapPos pro uložení. */
export function buildMapPickResult(lat, lng, center, referenceRadiusKm) {
  const mapPos = latLngToMapPos(lat, lng, center, referenceRadiusKm);
  return { ...mapPos, lat, lng };
}

export function entityLatLng(entity, center, referenceRadiusKm = DEFAULT_REPORTS_MAP_RADIUS_KM) {
  if (!entity) return null;
  // Reálné GPS (Google Places / seed) mají přednost před % mapPos — jinak špendlík nesedí na mapě
  if (entity.lat != null && entity.lng != null) {
    return { lat: Number(entity.lat), lng: Number(entity.lng) };
  }
  if (entity.mapPos?.lat != null && entity.mapPos?.lng != null) {
    return { lat: Number(entity.mapPos.lat), lng: Number(entity.mapPos.lng) };
  }
  if (entity.mapPos) return mapPosToLatLng(entity.mapPos, center, referenceRadiusKm);
  return null;
}
