/** Jednotné vyhledávání v okolí — místa, hlášení, inzeráty, akce, skupiny, výpomoc… */

import { institutionMatchesSearch } from "../data/institutionsMapData.js";
import { getGroup } from "../data/groups.js";

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

const CATEGORY_SEARCH_LABELS = {
  daruji: "daruji darovani",
  prodam: "prodam prodej",
  shanim: "shanim hledam",
  pujcovna: "pujcovna pujceni naradi",
  hlidani: "hlidani deti",
  krouzek: "krouzek aktivita",
  skolka: "skolka jesle",
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

export function textMatches(haystack, query) {
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
  const group = post.groupId ? getGroup(post.groupId) : null;
  const catExtra = CATEGORY_SEARCH_LABELS[post.categoryId ?? post.feedSubtype] ?? "";
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
      post.categoryId,
      catExtra,
      group?.name,
      group?.description,
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

function eventMatches(ev, query) {
  return textMatches(
    [
      ev.title,
      ev.description,
      ev.location,
      ev.address,
      ev.organizer,
      ev.category,
      ev.categoryLabel,
      ev.date,
      ...(ev.interestTags ?? []),
    ]
      .filter(Boolean)
      .join(" "),
    query
  );
}

function lendingMatches(item, query) {
  return textMatches(
    [
      item.title,
      item.body,
      item.name,
      item.author,
      item.type,
      item.category,
      item.categoryLabel,
      item.itemType,
      item.meta,
      ...(item.keywords ?? []),
    ]
      .filter(Boolean)
      .join(" "),
    query
  );
}

function groupMatches(group, query) {
  return textMatches(
    [group.name, group.description, group.emoji, ...(group.tags ?? [])].filter(Boolean).join(" "),
    query
  );
}

function neighborMatches(neighbor, query) {
  return textMatches(
    [neighbor.name, neighbor.location, neighbor.municipality, neighbor.distance]
      .filter(Boolean)
      .join(" "),
    query
  );
}

/**
 * @returns {{ places, reports, listings, help, news, services, events, groupPosts, lending, groups, neighbors, total }}
 */
export function buildGlobalSearchResults({
  query,
  places = [],
  reports = [],
  listings = [],
  help = [],
  news = [],
  services = [],
  events = [],
  groupPosts = [],
  lending = [],
  groups = [],
  neighbors = [],
  limitPerGroup = 8,
}) {
  const q = query?.trim() ?? "";
  if (!q) {
    return {
      places: [],
      reports: [],
      listings: [],
      help: [],
      news: [],
      services: [],
      events: [],
      groupPosts: [],
      lending: [],
      groups: [],
      neighbors: [],
      total: 0,
    };
  }

  const placeHits = places.filter((p) => placeMatchesGlobalSearch(p, q)).slice(0, limitPerGroup);
  const reportHits = reports.filter((r) => reportMatches(r, q)).slice(0, limitPerGroup);
  const listingHits = listings.filter((p) => postMatches(p, q)).slice(0, limitPerGroup);
  const helpHits = help.filter((h) => helpMatches(h, q)).slice(0, limitPerGroup);
  const newsHits = news.filter((n) => newsMatches(n, q)).slice(0, limitPerGroup);
  const serviceHits = services.filter((s) => serviceMatches(s, q)).slice(0, limitPerGroup);
  const eventHits = events.filter((e) => eventMatches(e, q)).slice(0, limitPerGroup);
  const groupPostHits = groupPosts.filter((p) => postMatches(p, q)).slice(0, limitPerGroup);
  const lendingHits = lending.filter((i) => lendingMatches(i, q)).slice(0, limitPerGroup);
  const groupHits = groups.filter((g) => groupMatches(g, q)).slice(0, limitPerGroup);
  const neighborHits = neighbors.filter((n) => neighborMatches(n, q)).slice(0, limitPerGroup);

  return {
    places: placeHits,
    reports: reportHits,
    listings: listingHits,
    help: helpHits,
    news: newsHits,
    services: serviceHits,
    events: eventHits,
    groupPosts: groupPostHits,
    lending: lendingHits,
    groups: groupHits,
    neighbors: neighborHits,
    total:
      placeHits.length +
      reportHits.length +
      listingHits.length +
      helpHits.length +
      newsHits.length +
      serviceHits.length +
      eventHits.length +
      groupPostHits.length +
      lendingHits.length +
      groupHits.length +
      neighborHits.length,
  };
}
