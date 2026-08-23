/** Řazení katalogu služeb: volná kapacita → zaplacené topování → náhodné pořadí */

function hashSortKey(seed, id) {
  const s = `${seed}:${id ?? ""}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Aktivní boost katalogu (topování) */
export function isServiceCatalogBoosted(svc, now = Date.now()) {
  if (!svc) return false;
  if (svc.catalogBoostUntil) {
    const until = new Date(svc.catalogBoostUntil).getTime();
    if (Number.isFinite(until) && until < now) return false;
  }
  return Boolean(svc.isPremium) || (svc.catalogBoostRank ?? 0) > 0;
}

/**
 * 1) Přijímá zakázky nahoře, plná kapacita dole
 * 2) Mezi volnými: topování / premium nahoře (novější boost výš)
 * 3) Jinak náhodné stabilní pořadí (seed), ne abeceda
 */
export function compareServicesForCatalog(a, b, shuffleSeed = "0") {
  const aFull = Boolean(a?.kapacitaPlna);
  const bFull = Boolean(b?.kapacitaPlna);
  if (aFull !== bFull) return aFull ? 1 : -1;

  const aBoost = isServiceCatalogBoosted(a);
  const bBoost = isServiceCatalogBoosted(b);
  if (aBoost !== bBoost) return aBoost ? -1 : 1;

  if (aBoost && bBoost) {
    const boostDiff = (b.catalogBoostRank ?? 0) - (a.catalogBoostRank ?? 0);
    if (boostDiff !== 0) return boostDiff;
  }

  return hashSortKey(shuffleSeed, a?.id) - hashSortKey(shuffleSeed, b?.id);
}

export function sortServicesForCatalog(list, shuffleSeed = "0") {
  return [...(list ?? [])].sort((a, b) => compareServicesForCatalog(a, b, shuffleSeed));
}
