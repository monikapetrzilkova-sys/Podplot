import {
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  MAP_CENTER,
  mapPosToDistanceKm,
} from "./mapRadiusSettings.js";

/** Simulované mapové souřadnice v okolí uživatele (procenta 0–100, střed = domov). */

export { MAP_CENTER };
/** @deprecated Použijte reportsMapRadiusKm z AppContext nebo DEFAULT_REPORTS_MAP_RADIUS_KM */
export const MAP_RADIUS_KM = DEFAULT_REPORTS_MAP_RADIUS_KM;

export function posToDistanceLabel(
  x,
  y,
  cx = MAP_CENTER.x,
  cy = MAP_CENTER.y,
  radiusKm = DEFAULT_REPORTS_MAP_RADIUS_KM
) {
  const meters = Math.max(0, Math.round(mapPosToDistanceKm({ x, y }, radiusKm, cx, cy) * 1000));
  if (meters < 50) return "0 m · vaše hlášení";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function clampMapPos(x, y) {
  return {
    x: Math.min(92, Math.max(8, x)),
    y: Math.min(92, Math.max(8, y)),
  };
}

export function eventToMapPos(event, container) {
  const rect = container.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  return clampMapPos(x, y);
}

/** Výchozí střed mapy podle geokódované adresy nebo textu. */
export function centerFromAddress(address = "", geo = null) {
  if (geo?.city) {
    return { x: 50, y: 50, label: geo.city };
  }
  const a = address.toLowerCase();
  const cityPart = address.split(",").pop()?.trim() || address;
  if (a.includes("brno")) return { x: 50, y: 50, label: "Brno" };
  if (a.includes("jesenice")) return { x: 50, y: 50, label: "Jesenice" };
  if (a.includes("lhotka")) return { x: 50, y: 50, label: "Lhotka u Prahy" };
  if (a.includes("praha")) return { x: 50, y: 50, label: "Praha" };
  if (a.includes("přední lhota") || a.includes("predni lhota")) {
    return { x: 50, y: 50, label: "Přední Lhota" };
  }
  if (a.includes("poděbrady") || a.includes("podebrady")) {
    return { x: 50, y: 50, label: "Poděbrady" };
  }
  if (a.includes("sázava") || a.includes("sazava")) return { x: 50, y: 50, label: "Sázava" };
  return { x: 50, y: 50, label: cityPart || "Vaše okolí" };
}

function hashAddress(address) {
  let h = 0;
  for (let i = 0; i < address.length; i += 1) {
    h = (h * 31 + address.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Simulované umístění špendlíku z textu adresy (procenta na mapě). */
export function addressToMapPos(address = "") {
  const trimmed = address.trim();
  if (trimmed.length < 5) return null;

  const normalized = trimmed.toLowerCase();
  const known = [
    { match: "lípová 12", pos: { x: 50, y: 50 } },
    { match: "václavské nám", pos: { x: 52, y: 46 } },
    { match: "u řeky 3", pos: { x: 48, y: 54 } },
    { match: "přední lhota 15", pos: { x: 50, y: 50 } },
    { match: "predni lhota 15", pos: { x: 50, y: 50 } },
    { match: "park na louce", pos: { x: 55, y: 48 } },
    { match: "dětské hřiště", pos: { x: 62, y: 52 } },
  ];
  const exact = known.find((k) => normalized.includes(k.match));
  if (exact) return clampMapPos(exact.pos.x, exact.pos.y);

  const base = centerFromAddress(trimmed);
  const h = hashAddress(normalized);
  const dx = ((h % 23) - 11) * 0.85;
  const dy = (((h >> 6) % 23) - 11) * 0.85;
  return clampMapPos(base.x + dx, base.y + dy);
}

export function requestUserGeolocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ mode: "address", accuracy: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => resolve({ mode: "gps", accuracy: "high" }),
      () => resolve({ mode: "address", accuracy: null }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

export const GEO_LABELS = {
  loading: "Načítám polohu…",
  gps: "Vaše poloha (GPS)",
  address: "Vaše adresa (zafixovaná geolokace)",
  default: "Vaše adresa · okruh 1,2 km",
};
