/** Jednotné vyhledávání v okolí — místa, hlášení, inzeráty, výpomoc, aktuality */

import { institutionMatchesSearch } from "../data/institutionsMapData.js";

export function normalizeSearchText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

const AMENITY_SEARCH_LABELS = {
  "detske-hriste": "detske hriste playground houpacky piskoviste deti",
  "sportovni-hriste": "sportovni hriste tenis sport",
  "psi-hriste": "psi hriste psi pejsci",
};

/** Rozšířený match místa — amenityType, synonyma, bez diakritiky */
export function placeMatchesGlobalSearch(place, query) {
  if (!query?.trim()) return true;
  if (institutionMatchesSearch(place, query)) return true;

  const q = normalizeSearchText(query);
  const tokens = q.split(/\s+/).filter(Boolean);
  const amenityExtra = AMENITY_SEARCH_LABELS[place.amenityType] ?? "";
  const haystack = normalizeSearchText(
    [
      place.name,
      place.tagline,
      place.address,
      place.extraInfo,
      place.category,
      place.amenityType?.replace(/-/g, " "),
      amenityExtra,
      place.emoji,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (haystack.includes(q)) return true;
  return tokens.every((t) => haystack.includes(t));
}

function textMatches(haystack, query) {
  const q = normalizeSearchText(query);
  if (!q) return true;
  const h = normalizeSearchText(haystack);
  if (h.includes(q)) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.length > 1 && tokens.every((t) => h.includes(t));
}

function reportMatches(report, query) {
  return textMatches(
    [report.type, report.body, report.author, report.distance, report.reportCategoryId]
      .filter(Boolean)
      .join(" "),
    query
  );
}

function postMatches(post, query) {
  return textMatches(
    [
      post.title,
      post.body,
      post.author,
      post.type,
      post.meta,
      ...(post.keywords ?? []),
      post.marketCategory,
      post.feedSubtype,
    ]
      .filter(Boolean)
      .join(" "),
    query
  );
}

function helpMatches(item, query) {
  return textMatches([item.title, item.body, item.author, item.type].filter(Boolean).join(" "), query);
}

function newsMatches(item, query) {
  return textMatches(
    [item.title, item.body, item.author, item.type].filter(Boolean).join(" "),
    query
  );
}

function serviceMatches(svc, query) {
  return textMatches(
    [svc.name, svc.profession, svc.tagline, svc.description, svc.categoryLabel, ...(svc.keywords ?? [])]
      .filter(Boolean)
      .join(" "),
    query
  );
}

/**
 * @returns {{ places, reports, listings, help, news, services, total }}
 */
export function buildGlobalSearchResults({
  query,
  places = [],
  reports = [],
  listings = [],
  help = [],
  news = [],
  services = [],
  limitPerGroup = 8,
}) {
  const q = query?.trim() ?? "";
  if (!q) {
    return { places: [], reports: [], listings: [], help: [], news: [], services: [], total: 0 };
  }

  const placeHits = places.filter((p) => placeMatchesGlobalSearch(p, q)).slice(0, limitPerGroup);
  const reportHits = reports.filter((r) => reportMatches(r, q)).slice(0, limitPerGroup);
  const listingHits = listings.filter((p) => postMatches(p, q)).slice(0, limitPerGroup);
  const helpHits = help.filter((h) => helpMatches(h, q)).slice(0, limitPerGroup);
  const newsHits = news.filter((n) => newsMatches(n, q)).slice(0, limitPerGroup);
  const serviceHits = services.filter((s) => serviceMatches(s, q)).slice(0, limitPerGroup);

  return {
    places: placeHits,
    reports: reportHits,
    listings: listingHits,
    help: helpHits,
    news: newsHits,
    services: serviceHits,
    total:
      placeHits.length +
      reportHits.length +
      listingHits.length +
      helpHits.length +
      newsHits.length +
      serviceHits.length,
  };
}
