export const MAP_RADIUS_STORAGE_KEY = "podplot-map-radius";

/** Střed simulované mapy — sdílený s mapData.js (bez importu kvůli cyklu modulů). */
export const MAP_CENTER = { x: 50, y: 50 };

export const DEFAULT_THINGS_MAP_RADIUS_KM = 5;
export const MIN_THINGS_MAP_RADIUS_KM = 1;
export const MAX_THINGS_MAP_RADIUS_KM = 10;

export const DEFAULT_REPORTS_MAP_RADIUS_KM = 1;
export const MIN_REPORTS_MAP_RADIUS_KM = 0.5;
export const MAX_REPORTS_MAP_RADIUS_KM = 3;

export const DEFAULT_EVENTS_MAP_RADIUS_KM = 10;
export const MIN_EVENTS_MAP_RADIUS_KM = 2;
export const MAX_EVENTS_MAP_RADIUS_KM = 20;

/** Poloměr elipsy na mapě při výchozím rádiusu daného režimu (procenta). */
export const BASE_MAP_ELLIPSE_PERCENT = 42;
export const MAX_MAP_ELLIPSE_PERCENT = 48;

export function clampThingsMapRadius(km) {
  const n = Number(km);
  if (Number.isNaN(n)) return DEFAULT_THINGS_MAP_RADIUS_KM;
  return Math.min(MAX_THINGS_MAP_RADIUS_KM, Math.max(MIN_THINGS_MAP_RADIUS_KM, Math.round(n)));
}

export function clampReportsMapRadius(km) {
  const n = Number(km);
  if (Number.isNaN(n)) return DEFAULT_REPORTS_MAP_RADIUS_KM;
  return Math.min(MAX_REPORTS_MAP_RADIUS_KM, Math.max(MIN_REPORTS_MAP_RADIUS_KM, Math.round(n * 10) / 10));
}

export function clampEventsMapRadius(km) {
  const n = Number(km);
  if (Number.isNaN(n)) return DEFAULT_EVENTS_MAP_RADIUS_KM;
  return Math.min(MAX_EVENTS_MAP_RADIUS_KM, Math.max(MIN_EVENTS_MAP_RADIUS_KM, Math.round(n)));
}

export function loadMapRadiusSettings() {
  try {
    const raw = localStorage.getItem(MAP_RADIUS_STORAGE_KEY);
    if (!raw) {
      return {
        reports: DEFAULT_REPORTS_MAP_RADIUS_KM,
        events: DEFAULT_EVENTS_MAP_RADIUS_KM,
        things: DEFAULT_THINGS_MAP_RADIUS_KM,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      reports: clampReportsMapRadius(parsed.reports ?? DEFAULT_REPORTS_MAP_RADIUS_KM),
      events: clampEventsMapRadius(parsed.events ?? DEFAULT_EVENTS_MAP_RADIUS_KM),
      things: clampThingsMapRadius(parsed.things ?? DEFAULT_THINGS_MAP_RADIUS_KM),
    };
  } catch {
    return {
      reports: DEFAULT_REPORTS_MAP_RADIUS_KM,
      events: DEFAULT_EVENTS_MAP_RADIUS_KM,
      things: DEFAULT_THINGS_MAP_RADIUS_KM,
    };
  }
}

export function persistMapRadiusSettings(settings) {
  try {
    localStorage.setItem(
      MAP_RADIUS_STORAGE_KEY,
      JSON.stringify({
        reports: clampReportsMapRadius(settings.reports),
        events: clampEventsMapRadius(settings.events),
        things: clampThingsMapRadius(settings.things ?? DEFAULT_THINGS_MAP_RADIUS_KM),
      })
    );
  } catch {
    /* quota / private mode */
  }
}

export function mapRadiusToEllipsePercent(radiusKm, defaultRadiusKm) {
  const base = defaultRadiusKm || DEFAULT_REPORTS_MAP_RADIUS_KM;
  return Math.min(MAX_MAP_ELLIPSE_PERCENT, (radiusKm / base) * BASE_MAP_ELLIPSE_PERCENT);
}

export function mapPosToDistanceKm(mapPos, referenceRadiusKm = DEFAULT_REPORTS_MAP_RADIUS_KM, cx = MAP_CENTER.x, cy = MAP_CENTER.y) {
  if (!mapPos) return Infinity;
  const dx = mapPos.x - cx;
  const dy = mapPos.y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return (dist / BASE_MAP_ELLIPSE_PERCENT) * referenceRadiusKm;
}

export function formatMapRadiusKm(km) {
  if (km % 1 === 0) return `${km} km`;
  return `${String(km).replace(".", ",")} km`;
}

/** Filtr podle vzdálenosti na simulované mapě (mapPos nebo distanceKm). */
export function filterByMapRadius(items, radiusKm, referenceRadiusKm = DEFAULT_REPORTS_MAP_RADIUS_KM) {
  return items.filter((item) => {
    if (item.mapPos) {
      return mapPosToDistanceKm(item.mapPos, referenceRadiusKm) <= radiusKm;
    }
    if (item.distanceKm != null) return item.distanceKm <= radiusKm;
    return false;
  });
}
