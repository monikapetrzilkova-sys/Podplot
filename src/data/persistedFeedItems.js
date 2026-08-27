/** Typy příspěvků, které se ukládají do feedu / localStorage. */

export const HELP_FEED_SUBTYPE = "vypomoc";
export const EVENT_FEED_SUBTYPE = "akce";

export function isHelpFeedPost(post) {
  if (!post) return false;
  if (post.feedSubtype === HELP_FEED_SUBTYPE) return true;
  if (post.helpType === "hledam" || post.helpType === "nabizim") return true;
  const type = String(post.type ?? "").toLowerCase();
  return type.includes("hledám pomoc") || type.includes("nabízím pomoc") || type.includes("hledam pomoc");
}

export function isEventFeedPost(post) {
  if (!post) return false;
  if (post.feedSubtype === EVENT_FEED_SUBTYPE || post.feedType === "akce") return true;
  return Boolean(post.eventPayload && typeof post.eventPayload === "object");
}

export function helpItemToFeedPost(item, user) {
  const helpType = item.type === "nabizim" ? "nabizim" : "hledam";
  return {
    id: item.id,
    title: item.title,
    body: item.body ?? "",
    type: helpType === "nabizim" ? "Nabízím pomoc" : "Hledám pomoc",
    feedType: "komunita",
    feedSubtype: HELP_FEED_SUBTYPE,
    helpType,
    author: item.author ?? user?.name ?? "Soused",
    authorId: user?.id ?? item.authorId ?? "me",
    initials: item.initials ?? user?.initials,
    accountType: item.accountType ?? user?.accountType ?? "soused",
    mine: true,
    locationId: item.locationId ?? null,
    municipality: item.municipality ?? null,
    createdAt: item.createdAt ?? Date.now(),
    meta: item.distance || "Právě teď · 0 m",
  };
}

export function feedPostToHelpItem(post) {
  const helpType =
    post.helpType === "nabizim" || String(post.type ?? "").toLowerCase().includes("nabíz")
      ? "nabizim"
      : "hledam";
  return {
    id: post.id,
    type: helpType,
    title: post.title,
    body: post.body ?? "",
    author: post.author,
    authorId: post.authorId,
    initials: post.initials,
    accountType: post.accountType,
    distance: post.meta || "Právě teď · 0 m",
    time: "Právě teď",
    locationId: post.locationId ?? null,
    municipality: post.municipality ?? null,
    mine: Boolean(post.mine),
    createdAt: post.createdAt ?? Date.now(),
  };
}

export function eventToFeedPost(event, user) {
  return {
    id: event.id,
    title: event.title,
    body: event.description ?? "",
    type: "Akce",
    feedType: "akce",
    feedSubtype: EVENT_FEED_SUBTYPE,
    eventPayload: event,
    author: event.organizer ?? user?.name ?? "Soused",
    authorId: user?.id ?? event.organizerId ?? "me",
    initials: user?.initials,
    accountType: event.accountType ?? user?.accountType ?? "soused",
    mine: true,
    locationId: event.locationId ?? null,
    municipality: event.municipality ?? null,
    createdAt: event.createdAt ?? Date.now(),
    meta: event.date || "Právě teď",
    mapPos: event.mapPos ?? null,
    lat: event.lat ?? event.mapPos?.lat ?? null,
    lng: event.lng ?? event.mapPos?.lng ?? null,
  };
}

export function feedPostToEvent(post) {
  const payload = post.eventPayload && typeof post.eventPayload === "object" ? post.eventPayload : {};
  return {
    ...payload,
    id: post.id,
    title: payload.title || post.title,
    description: payload.description ?? post.body ?? "",
    organizer: payload.organizer || post.author,
    accountType: payload.accountType || post.accountType,
    locationId: payload.locationId ?? post.locationId ?? null,
    municipality: payload.municipality ?? post.municipality ?? null,
    mapPos: payload.mapPos ?? post.mapPos ?? null,
    lat: payload.lat ?? post.lat ?? null,
    lng: payload.lng ?? post.lng ?? null,
    mine: true,
    createdAt: payload.createdAt ?? post.createdAt ?? Date.now(),
  };
}

export function lendingItemFromPost(post) {
  if (!post) return null;
  const cat = post.categoryId ?? post.feedSubtype;
  const isLending =
    post.thingKind === "lending" ||
    cat === "pujcovna" ||
    String(post.type ?? "").toLowerCase().includes("půjčovna");
  if (!isLending) return null;
  return {
    id: post.id,
    role: post.role,
    accountType: post.accountType,
    author: post.author,
    authorId: post.authorId,
    initials: post.initials,
    item: post.itemTypeLabel || post.title,
    description: post.body,
    credits: post.listingPrice ?? post.credits ?? 0,
    period: "den",
    distance: post.meta ?? "",
    mine: Boolean(post.mine),
    groupId: post.groupId ?? null,
    groupIds: Array.isArray(post.groupIds) ? post.groupIds : [],
    boardPost: false,
    photos: post.photos ?? [],
    lendingCategory: post.lendingCategory ?? null,
    itemType: post.itemType ?? null,
    itemTypeLabel: post.itemTypeLabel ?? null,
    marketCategory: post.marketCategory ?? null,
    locationId: post.locationId ?? null,
    municipality: post.municipality ?? null,
    createdAt: post.createdAt ?? Date.now(),
  };
}
