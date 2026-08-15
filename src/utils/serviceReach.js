/** Porovnání polohy uživatele s akčním rádiusem poskytovatele služby */

import { isNationwideRadius } from "../data/craftsmanSettings.js";

export const LOCAL_SERVICE_RADIUS_KM = 2;

export function isServiceInReach(service, userDistanceKm = null) {
  const dist = userDistanceKm ?? service.distanceKm ?? Infinity;
  const radius = service.actionRadius ?? 15;
  if (isNationwideRadius(radius)) return true;
  return dist <= radius;
}

export function getServiceReachLabel(service, userDistanceKm = null) {
  const dist = userDistanceKm ?? service.distanceKm ?? Infinity;
  const radius = service.actionRadius ?? 15;
  if (isNationwideRadius(radius)) {
    return { label: "Působí v celé ČR", type: "nationwide" };
  }
  if (dist > radius) return null;
  if (dist <= LOCAL_SERVICE_RADIUS_KM) {
    return { label: "Působí ve vašem okolí", type: "local" };
  }
  return { label: "Dojíždí k vám", type: "travel" };
}

export function filterServicesByReach(services, userDistanceKm = null) {
  return services.filter((s) => isServiceInReach(s, userDistanceKm));
}
