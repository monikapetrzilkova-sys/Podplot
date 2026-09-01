/** Typy příspěvků, které se ukládají do feedu / localStorage. */

export const HELP_FEED_SUBTYPE = "vypomoc";
export const EVENT_FEED_SUBTYPE = "akce";
export const HOSTED_ACTIVITY_FEED_SUBTYPE = "krouzek";
export const COMMENT_FEED_SUBTYPE = "komentar";
export const EVENT_JOIN_FEED_SUBTYPE = "event-join";
export const EVENT_CHAT_FEED_SUBTYPE = "event-chat";
export const EVENT_GALLERY_FEED_SUBTYPE = "event-gallery";
export const HELP_OFFER_FEED_SUBTYPE = "nabidka-pomoci";

export const ACTIVITY_FEED_SUBTYPES = new Set([
  COMMENT_FEED_SUBTYPE,
  EVENT_JOIN_FEED_SUBTYPE,
  EVENT_CHAT_FEED_SUBTYPE,
  EVENT_GALLERY_FEED_SUBTYPE,
  HELP_OFFER_FEED_SUBTYPE,
]);

export function isActivityFeedPost(post) {
  if (!post) return false;
  if (ACTIVITY_FEED_SUBTYPES.has(post.feedSubtype)) return true;
  const kind = post.activityPayload?.kind;
  return Boolean(kind && ACTIVITY_FEED_SUBTYPES.has(kind));
}

export function isHelpFeedPost(post) {
  if (!post) return false;
  if (isActivityFeedPost(post)) return false;
  if (post.feedSubtype === HELP_FEED_SUBTYPE) return true;
  if (post.helpType === "hledam" || post.helpType === "nabizim") return true;
  const type = String(post.type ?? "").toLowerCase();
  return type.includes("hledám pomoc") || type.includes("nabízím pomoc") || type.includes("hledam pomoc");
}

export function isEventFeedPost(post) {
  if (!post) return false;
  if (isActivityFeedPost(post)) return false;
  if (isHostedActivityFeedPost(post)) return false;
  if (post.feedSubtype === EVENT_FEED_SUBTYPE || post.feedType === "akce") return true;
  return Boolean(post.eventPayload && typeof post.eventPayload === "object");
}

export function isHostedActivityFeedPost(post) {
  if (!post) return false;
  if (isActivityFeedPost(post)) return false;
  if (post.feedSubtype === HOSTED_ACTIVITY_FEED_SUBTYPE) return true;
  return Boolean(post.hostedActivityPayload && typeof post.hostedActivityPayload === "object");
}

function activityAuthorFields(user, extras = {}) {
  return {
    author: extras.author ?? user?.name ?? "Soused",
    authorId: extras.authorId ?? user?.id ?? "me",
    initials: extras.initials ?? user?.initials,
    accountType: extras.accountType ?? user?.accountType ?? "soused",
    locationId: extras.locationId ?? null,
    municipality: extras.municipality ?? null,
    createdAt: extras.createdAt ?? Date.now(),
    mine: extras.mine ?? true,
  };
}

export function commentToFeedPost(comment, user, extras = {}) {
  const text = String(comment?.text ?? "").trim();
  return {
    id: comment.id,
    title: `Komentář: ${text.slice(0, 80)}`,
    body: text,
    type: "Komentář",
    feedType: "komunita",
    feedSubtype: COMMENT_FEED_SUBTYPE,
    boardPost: false,
    activityPayload: {
      kind: COMMENT_FEED_SUBTYPE,
      targetPostId: comment.postId,
      comment,
    },
    meta: extras.meta ?? "Právě teď",
    ...activityAuthorFields(user, {
      ...extras,
      author: comment.authorName,
      authorId: comment.authorId,
      initials: comment.authorInitials,
      accountType: comment.accountType,
      createdAt: comment.createdAt,
    }),
  };
}

export function feedPostToComment(post) {
  const stored = post?.activityPayload?.comment;
  const postId = stored?.postId || post?.activityPayload?.targetPostId;
  if (!postId) return null;
  return {
    id: stored?.id || post.id,
    postId,
    authorId: stored?.authorId || post.authorId,
    authorName: stored?.authorName || post.author,
    authorInitials: stored?.authorInitials || post.initials,
    accountType: stored?.accountType || post.accountType,
    mine: Boolean(stored?.mine || post.mine),
    text: String(stored?.text ?? post.body ?? "").trim(),
    createdAt: stored?.createdAt ?? post.createdAt ?? Date.now(),
  };
}

export function eventJoinToFeedPost(eventId, eventTitle, user, extras = {}) {
  const attendee = extras.attendee ?? {
    id: user?.id ?? "me",
    name: user?.name,
    initials: user?.initials,
  };
  return {
    id: extras.id ?? `join-${user?.id ?? "me"}-${eventId}`,
    title: `Jdu na akci: ${eventTitle || "Akce"}`,
    body: "",
    type: "Účast na akci",
    feedType: "komunita",
    feedSubtype: EVENT_JOIN_FEED_SUBTYPE,
    boardPost: false,
    activityPayload: {
      kind: EVENT_JOIN_FEED_SUBTYPE,
      eventId,
      joining: extras.joining !== false,
      attendee,
    },
    meta: extras.meta ?? "Právě teď",
    ...activityAuthorFields(user, extras),
  };
}

export function feedPostToEventJoin(post) {
  const payload = post?.activityPayload && typeof post.activityPayload === "object" ? post.activityPayload : {};
  const eventId = payload.eventId;
  if (!eventId) return null;
  return {
    eventId,
    joining: payload.joining !== false,
    attendee: payload.attendee && typeof payload.attendee === "object"
      ? payload.attendee
      : {
          id: post.authorId,
          name: post.author,
          initials: post.initials,
        },
    mine: Boolean(post.mine),
  };
}

export function eventChatToFeedPost(eventId, message, user, extras = {}) {
  const text = String(message?.text ?? "").trim();
  return {
    id: extras.id ?? `evchat-${eventId}-${message?.time ?? Date.now()}`,
    title: `Chat u akce`,
    body: text,
    type: "Chat akce",
    feedType: "komunita",
    feedSubtype: EVENT_CHAT_FEED_SUBTYPE,
    boardPost: false,
    activityPayload: {
      kind: EVENT_CHAT_FEED_SUBTYPE,
      eventId,
      message,
    },
    meta: message?.time ?? "Právě teď",
    ...activityAuthorFields(user, extras),
  };
}

export function feedPostToEventChat(post) {
  const payload = post?.activityPayload && typeof post.activityPayload === "object" ? post.activityPayload : {};
  if (!payload.eventId) return null;
  const message =
    payload.message && typeof payload.message === "object"
      ? payload.message
      : { sender: post.author, text: post.body, time: post.meta };
  return { eventId: payload.eventId, message };
}

export function eventGalleryToFeedPost(eventId, photo, user, extras = {}) {
  return {
    id: photo?.id ?? `evgal-${Date.now()}`,
    title: "Fotka z akce",
    body: "",
    type: "Galerie akce",
    feedType: "komunita",
    feedSubtype: EVENT_GALLERY_FEED_SUBTYPE,
    boardPost: false,
    photos: photo?.url ? [photo.url] : [],
    activityPayload: {
      kind: EVENT_GALLERY_FEED_SUBTYPE,
      eventId,
      photo,
    },
    meta: photo?.time ?? "Právě teď",
    ...activityAuthorFields(user, extras),
  };
}

export function feedPostToEventGallery(post) {
  const payload = post?.activityPayload && typeof post.activityPayload === "object" ? post.activityPayload : {};
  if (!payload.eventId) return null;
  const photo =
    payload.photo && typeof payload.photo === "object"
      ? payload.photo
      : post.photos?.[0]
        ? { id: post.id, url: post.photos[0], authorId: post.authorId, authorName: post.author }
        : null;
  if (!photo) return null;
  return { eventId: payload.eventId, photo };
}

export function helpOfferToFeedPost(postId, offer, user, extras = {}) {
  return {
    id: extras.id ?? `offer-${offer?.helperId ?? user?.id ?? "me"}-${postId}`,
    title: `Nabízím pomoc: ${offer?.postTitle || "Výpomoc"}`,
    body: extras.body ?? "",
    type: "Nabídka pomoci",
    feedType: "komunita",
    feedSubtype: HELP_OFFER_FEED_SUBTYPE,
    boardPost: false,
    activityPayload: {
      kind: HELP_OFFER_FEED_SUBTYPE,
      targetPostId: postId,
      offer,
    },
    meta: offer?.time ?? "Právě teď",
    ...activityAuthorFields(user, extras),
  };
}

export function feedPostToHelpOffer(post) {
  const payload = post?.activityPayload && typeof post.activityPayload === "object" ? post.activityPayload : {};
  const postId = payload.targetPostId;
  const offer = payload.offer && typeof payload.offer === "object" ? payload.offer : null;
  if (!postId || !offer) return null;
  return { postId, offer };
}

export function collectActivityFromPosts(posts) {
  const comments = [];
  const myJoinedEventIds = [];
  const attendeesByEvent = {};
  const chatsByEvent = {};
  const photosByEvent = {};
  const helpOffersByPost = {};
  for (const post of posts ?? []) {
    if (!isActivityFeedPost(post)) continue;
    const kind = post.feedSubtype || post.activityPayload?.kind;
    if (kind === COMMENT_FEED_SUBTYPE) {
      const comment = feedPostToComment(post);
      if (comment) comments.push(comment);
      continue;
    }
    if (kind === EVENT_JOIN_FEED_SUBTYPE) {
      const join = feedPostToEventJoin(post);
      if (!join?.eventId || join.joining === false) continue;
      if (post.mine) myJoinedEventIds.push(join.eventId);
      if (join.attendee) {
        attendeesByEvent[join.eventId] = [...(attendeesByEvent[join.eventId] ?? []), join.attendee];
      }
      continue;
    }
    if (kind === EVENT_CHAT_FEED_SUBTYPE) {
      const chat = feedPostToEventChat(post);
      if (chat?.eventId && chat.message) {
        chatsByEvent[chat.eventId] = [...(chatsByEvent[chat.eventId] ?? []), chat.message];
      }
      continue;
    }
    if (kind === EVENT_GALLERY_FEED_SUBTYPE) {
      const gallery = feedPostToEventGallery(post);
      if (gallery?.eventId && gallery.photo) {
        photosByEvent[gallery.eventId] = [...(photosByEvent[gallery.eventId] ?? []), gallery.photo];
      }
      continue;
    }
    if (kind === HELP_OFFER_FEED_SUBTYPE) {
      const offer = feedPostToHelpOffer(post);
      if (offer?.postId && offer.offer) {
        helpOffersByPost[offer.postId] = [...(helpOffersByPost[offer.postId] ?? []), offer.offer];
      }
    }
  }
  return {
    comments,
    myJoinedEventIds,
    attendeesByEvent,
    chatsByEvent,
    photosByEvent,
    helpOffersByPost,
  };
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
    hostedActivityId: event.hostedActivityId ?? null,
    placeId: event.placeId ?? null,
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
    hostedActivityId: payload.hostedActivityId ?? post.hostedActivityId ?? null,
    placeId: payload.placeId ?? post.placeId ?? null,
    mine: Boolean(post.mine || payload.mine),
    createdAt: payload.createdAt ?? post.createdAt ?? Date.now(),
  };
}

export function hostedActivityToFeedPost(activity, user) {
  return {
    id: activity.id,
    title: activity.title,
    body: activity.description ?? "",
    type: "Kroužek",
    feedType: "akce",
    feedSubtype: HOSTED_ACTIVITY_FEED_SUBTYPE,
    hostedActivityPayload: activity,
    author: activity.hostName ?? user?.name ?? "Soused",
    authorId: user?.id ?? activity.hostUserId ?? "me",
    initials: user?.initials,
    accountType: activity.accountType ?? user?.accountType ?? "soused",
    mine: true,
    locationId: activity.locationId ?? null,
    municipality: activity.municipality ?? null,
    groupId: activity.groupId ?? null,
    createdAt: activity.createdAt ?? Date.now(),
    meta: activity.placeName || activity.address || "Kroužek / lekce",
    mapPos: activity.mapPos ?? null,
    lat: activity.lat ?? activity.mapPos?.lat ?? null,
    lng: activity.lng ?? activity.mapPos?.lng ?? null,
    photos: activity.photo ? [activity.photo] : [],
  };
}

export function feedPostToHostedActivity(post) {
  const payload =
    post.hostedActivityPayload && typeof post.hostedActivityPayload === "object"
      ? post.hostedActivityPayload
      : {};
  return {
    ...payload,
    id: post.id,
    title: payload.title || post.title,
    description: payload.description ?? post.body ?? "",
    hostName: payload.hostName || post.author,
    hostUserId: payload.hostUserId || post.authorId,
    accountType: payload.accountType || post.accountType,
    locationId: payload.locationId ?? post.locationId ?? null,
    municipality: payload.municipality ?? post.municipality ?? null,
    mapPos: payload.mapPos ?? post.mapPos ?? null,
    lat: payload.lat ?? post.lat ?? null,
    lng: payload.lng ?? post.lng ?? null,
    groupId: payload.groupId ?? post.groupId ?? null,
    photo: payload.photo ?? post.photos?.[0] ?? null,
    mine: Boolean(post.mine || payload.mine),
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
