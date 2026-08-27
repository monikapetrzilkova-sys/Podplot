/** Lokální záloha sousedských akcí: účast na akci, komentáře, chat, nabídky pomoci. */

export const USER_ACTIVITY_STORAGE_KEY = "podplot-user-activity-v1";

export const DEFAULT_JOINED_EVENT_IDS = ["ev-past2"];
export const DEFAULT_MY_USEFUL_POSTS = ["f2"];
export const DEFAULT_USEFUL_COUNTS = { f2: 3, f4: 1, f12: 5 };
export const DEFAULT_MY_SEARCH_HELP_POSTS = ["f11"];
export const DEFAULT_SEARCH_HELP_COUNTS = { f11: 4 };
export const DEFAULT_SEARCH_HIGHLIGHTED_POSTS = ["f11"];

export function defaultUserActivity() {
  return {
    joinedEventIds: [...DEFAULT_JOINED_EVENT_IDS],
    comments: [],
    helpOffersByPost: {},
    myUsefulPosts: [...DEFAULT_MY_USEFUL_POSTS],
    usefulCounts: { ...DEFAULT_USEFUL_COUNTS },
    mySearchHelpPosts: [...DEFAULT_MY_SEARCH_HELP_POSTS],
    searchHelpCounts: { ...DEFAULT_SEARCH_HELP_COUNTS },
    searchHighlightedPosts: [...DEFAULT_SEARCH_HIGHLIGHTED_POSTS],
    eventPatches: {},
  };
}

function normalizeIdList(value, fallback) {
  if (!Array.isArray(value)) return [...fallback];
  return value.filter((id) => typeof id === "string" && id).slice(0, 200);
}

function normalizeCountMap(value, fallback) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...fallback };
  const out = {};
  for (const [key, count] of Object.entries(value)) {
    const n = Number(count);
    if (key && Number.isFinite(n) && n >= 0) out[key] = n;
  }
  return out;
}

function normalizeComments(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((c) => c && typeof c === "object" && c.id && c.postId)
    .map((c) => ({
      ...c,
      createdAt:
        typeof c.createdAt === "number" ? c.createdAt : Date.parse(c.createdAt) || Date.now(),
      text: String(c.text ?? "").trim(),
    }))
    .filter((c) => c.text)
    .slice(-200);
}

function normalizeHelpOffers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [postId, list] of Object.entries(value)) {
    if (!postId || !Array.isArray(list)) continue;
    const offers = list.filter((o) => o && typeof o === "object" && o.helperId);
    if (offers.length) out[postId] = offers.slice(-40);
  }
  return out;
}

function normalizeEventPatches(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [eventId, patch] of Object.entries(value)) {
    if (!eventId || !patch || typeof patch !== "object") continue;
    out[eventId] = {
      chat: Array.isArray(patch.chat) ? patch.chat.filter(Boolean).slice(-80) : [],
      galleryPhotos: Array.isArray(patch.galleryPhotos)
        ? patch.galleryPhotos.filter((p) => p?.id).slice(-80)
        : [],
      attendees: Array.isArray(patch.attendees)
        ? patch.attendees.filter((a) => a && (a.id || a.name)).slice(-80)
        : [],
    };
  }
  return out;
}

export function loadUserActivity(userId) {
  const fallback = defaultUserActivity();
  try {
    const raw = localStorage.getItem(`${USER_ACTIVITY_STORAGE_KEY}-${userId || "anon"}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;
    return {
      joinedEventIds: normalizeIdList(parsed.joinedEventIds, fallback.joinedEventIds),
      comments: normalizeComments(parsed.comments),
      helpOffersByPost: normalizeHelpOffers(parsed.helpOffersByPost),
      myUsefulPosts: normalizeIdList(parsed.myUsefulPosts, fallback.myUsefulPosts),
      usefulCounts: normalizeCountMap(parsed.usefulCounts, fallback.usefulCounts),
      mySearchHelpPosts: normalizeIdList(parsed.mySearchHelpPosts, fallback.mySearchHelpPosts),
      searchHelpCounts: normalizeCountMap(parsed.searchHelpCounts, fallback.searchHelpCounts),
      searchHighlightedPosts: normalizeIdList(
        parsed.searchHighlightedPosts,
        fallback.searchHighlightedPosts
      ),
      eventPatches: normalizeEventPatches(parsed.eventPatches),
    };
  } catch {
    return fallback;
  }
}

export function persistUserActivity(userId, activity) {
  try {
    if (!userId) return;
    const payload = {
      joinedEventIds: normalizeIdList(activity?.joinedEventIds, []),
      comments: normalizeComments(activity?.comments),
      helpOffersByPost: normalizeHelpOffers(activity?.helpOffersByPost),
      myUsefulPosts: normalizeIdList(activity?.myUsefulPosts, []),
      usefulCounts: normalizeCountMap(activity?.usefulCounts, {}),
      mySearchHelpPosts: normalizeIdList(activity?.mySearchHelpPosts, []),
      searchHelpCounts: normalizeCountMap(activity?.searchHelpCounts, {}),
      searchHighlightedPosts: normalizeIdList(activity?.searchHighlightedPosts, []),
      eventPatches: normalizeEventPatches(activity?.eventPatches),
    };
    localStorage.setItem(`${USER_ACTIVITY_STORAGE_KEY}-${userId}`, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function persistActivityMerge(userId, patch) {
  if (!userId) return;
  const current = loadUserActivity(userId);
  persistUserActivity(userId, { ...current, ...patch });
}

export function mergeIdLists(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const id of list ?? []) {
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function mergeCountMaps(...maps) {
  const out = {};
  for (const map of maps) {
    for (const [key, count] of Object.entries(map ?? {})) {
      const n = Number(count);
      if (!key || !Number.isFinite(n)) continue;
      out[key] = Math.max(out[key] ?? 0, n);
    }
  }
  return out;
}

export function mergeHelpOffersByPost(...maps) {
  const out = {};
  for (const map of maps) {
    for (const [postId, list] of Object.entries(map ?? {})) {
      if (!postId) continue;
      const byHelper = new Map((out[postId] ?? []).map((o) => [o.helperId, o]));
      for (const offer of list ?? []) {
        if (!offer?.helperId) continue;
        byHelper.set(offer.helperId, offer);
      }
      out[postId] = [...byHelper.values()];
    }
  }
  return out;
}

export function userOwnedHelpOffers(offersByPost, userId) {
  const uid = userId || "me";
  const out = {};
  for (const [postId, list] of Object.entries(offersByPost ?? {})) {
    const mine = (list ?? []).filter((o) => o?.helperId === uid || o?.helperId === "me");
    if (mine.length) out[postId] = mine;
  }
  return out;
}

export function mergeById(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const item of list ?? []) {
      if (!item?.id) continue;
      byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}

export function mergeAttendees(...lists) {
  const byKey = new Map();
  for (const list of lists) {
    for (const attendee of list ?? []) {
      if (!attendee) continue;
      const key = attendee.id || attendee.name;
      if (!key) continue;
      byKey.set(key, attendee);
    }
  }
  return [...byKey.values()];
}

export function mergeChatMessages(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const msg of list ?? []) {
      if (!msg?.text) continue;
      const key = `${msg.sender ?? ""}|${msg.text}|${msg.time ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(msg);
    }
  }
  return out;
}

export function buildEventPatches(events) {
  const patches = {};
  for (const event of events ?? []) {
    if (!event?.id) continue;
    const chat = Array.isArray(event.chat) ? event.chat : [];
    const galleryPhotos = Array.isArray(event.galleryPhotos) ? event.galleryPhotos : [];
    const attendees = Array.isArray(event.attendees) ? event.attendees : [];
    if (!chat.length && !galleryPhotos.length && !attendees.length) continue;
    patches[event.id] = { chat, galleryPhotos, attendees };
  }
  return patches;
}

export function attendeeFromUser(user) {
  if (!user) return null;
  return {
    id: user.id ?? "me",
    name: user.name,
    initials: user.initials,
    allowPublicAreaLabel: Boolean(user.allowPublicAreaLabel),
    publicAreaLabel: user.publicAreaLabel ?? "",
  };
}

export function applyEventPatches(events, patches = {}, joinedEventIds = [], userEntry = null) {
  return (events ?? []).map((event) => {
    if (!event?.id) return event;
    const patch = patches?.[event.id];
    let next = event;
    if (patch) {
      next = {
        ...event,
        chat: mergeChatMessages(event.chat, patch.chat),
        galleryPhotos: mergeById(event.galleryPhotos, patch.galleryPhotos),
        attendees: mergeAttendees(event.attendees, patch.attendees),
      };
    }
    if (joinedEventIds?.includes(event.id) && userEntry) {
      const attendees = next.attendees ?? [];
      if (
        !attendees.some(
          (a) => a.id === userEntry.id || a.id === "me" || a.name === userEntry.name
        )
      ) {
        next = { ...next, attendees: [...attendees, userEntry] };
      }
    }
    if (Array.isArray(next.attendees)) {
      next = { ...next, participants: next.attendees.length };
    }
    return next;
  });
}

export function applyCollectedActivityToEvents(events, collected) {
  if (!collected) return events ?? [];
  const { attendeesByEvent = {}, chatsByEvent = {}, photosByEvent = {} } = collected;
  return (events ?? []).map((event) => {
    const extraAttendees = attendeesByEvent[event.id];
    const extraChat = chatsByEvent[event.id];
    const extraPhotos = photosByEvent[event.id];
    if (!extraAttendees && !extraChat && !extraPhotos) return event;
    const attendees = extraAttendees
      ? mergeAttendees(event.attendees, extraAttendees)
      : event.attendees;
    return {
      ...event,
      attendees,
      chat: extraChat ? mergeChatMessages(event.chat, extraChat) : event.chat,
      galleryPhotos: extraPhotos ? mergeById(event.galleryPhotos, extraPhotos) : event.galleryPhotos,
      participants: Array.isArray(attendees) ? attendees.length : event.participants,
    };
  });
}
