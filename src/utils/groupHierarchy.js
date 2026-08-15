import { CLUB_CATEGORIES } from "../data/clubCategories.js";

/** Seskupí komunitní skupiny pod hlavní kmenové kategorie */
export function buildGroupHierarchy(groups, { includeEmpty = true } = {}) {
  const cats = CLUB_CATEGORIES.map((cat) => ({
    ...cat,
    subgroups: groups.filter((g) => g.clubCategory === cat.id),
  }));
  return includeEmpty ? cats : cats.filter((cat) => cat.subgroups.length > 0);
}

/** Počet návrhů „V přípravě“ u kmene */
export function countPendingProposalsForCategory(proposals, categoryId) {
  return (proposals ?? []).filter(
    (p) =>
      !p.active &&
      (p.status === "pending" || p.status === "v-priprave") &&
      (p.clubCategory === categoryId || p.categoryId === categoryId)
  ).length;
}
