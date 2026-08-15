/** Nastavení dojezdu a filtrování poptávek pro mobilní služby / řemeslníky */

import {
  getServiceCategory,
  getServiceSubcategoryIds,
  formatServiceSubcategoryLabels,
} from "./serviceCategories.js";

export const CRAFTSMAN_RADIUS_MIN_KM = 5;
export const CRAFTSMAN_RADIUS_MAX_KM = 50;
/** Sentinel — bez omezení vzdálenosti (celá ČR) */
export const CRAFTSMAN_RADIUS_NATIONWIDE_KM = 999;

export function isNationwideRadius(km) {
  return km == null || Number(km) >= CRAFTSMAN_RADIUS_NATIONWIDE_KM;
}

export function formatCraftsmanRadiusLabel(km) {
  if (isNationwideRadius(km)) return "Celá republika (bez omezení)";
  return `${km} km od výchozí adresy`;
}

export function inquiryInTravelRadius(inquiry, radiusKm) {
  if (isNationwideRadius(radiusKm)) return true;
  if (inquiry?.distanceKm == null) return true;
  return Number(inquiry.distanceKm) <= Number(radiusKm);
}

/** Shoda poptávky s oborovým zaměřením (profese / klíčová slova služby) */
export function inquiryMatchesProfession(inquiry, service) {
  if (!service) return true;
  const hay = `${inquiry.title ?? ""} ${inquiry.text ?? ""} ${inquiry.categoryLabel ?? ""} ${inquiry.profession ?? ""}`.toLowerCase();
  const subIds = getServiceSubcategoryIds(service);
  const terms = [
    service.profession,
    service.subcategoryLabel,
    formatServiceSubcategoryLabels(subIds),
    ...subIds,
    ...subIds.map((id) => getServiceCategory(id)?.label),
    service.homeGroupId,
    ...(service.keywords ?? []),
  ]
    .filter(Boolean)
    .flatMap((t) => String(t).split(/\s*[·,]\s*/))
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean);

  if (terms.length === 0) return true;
  return terms.some((term) => {
    if (hay.includes(term)) return true;
    const stem = term.slice(0, Math.min(5, term.length));
    return stem.length >= 4 && hay.includes(stem);
  });
}

export function filterCraftsmanInquiries(inquiries, { radiusKm, service, now = Date.now() } = {}) {
  return (inquiries ?? []).filter((i) => {
    if (i.type && i.type !== "service_request") return false;
    if (i.visibleAt && i.visibleAt > now) return false;
    if (!inquiryInTravelRadius(i, radiusKm)) return false;
    if (!inquiryMatchesProfession(i, service)) return false;
    return true;
  });
}
