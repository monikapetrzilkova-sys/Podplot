/** Kroužky a lekce — pojmenovaná aktivita s termíny v kalendáři Akcí. */

import {
  combineDateAndTime,
  eventDateSortValue,
  formatCzechEventScheduleFromParts,
  isEventPast,
} from "./czechDateTime.js";

export const HOSTED_ACTIVITY_GROUP_ID = "krouzky";

export const VENUE_KINDS = [
  {
    id: "place",
    label: "Místo z Průvodce",
    hint: "Budova, která vám nepatří — třeba MC nebo kulturní dům",
  },
  {
    id: "address",
    label: "Adresa",
    hint: "Konkrétní adresa, která v Průvodci zatím není",
  },
  {
    id: "outdoor",
    label: "Venku / park",
    hint: "Lekce bez budovy — park, hřiště, zahrada",
  },
];

export const EVENTS_KIND_FILTERS = [
  { id: "all", label: "Vše" },
  { id: "krouzky", label: "Kroužky a lekce" },
  { id: "jednorazove", label: "Jednorázové" },
];

export function isHostedActivityEvent(event) {
  return Boolean(event?.hostedActivityId);
}

export function activityVenueLabel(activity) {
  if (!activity) return "";
  if (activity.venueKind === "outdoor") {
    return activity.address || activity.placeName || "Venku";
  }
  return activity.placeName || activity.address || "";
}

export function getVenueKind(id) {
  return VENUE_KINDS.find((k) => k.id === id) ?? VENUE_KINDS[0];
}

export function filterEventsByKind(events, kind) {
  if (kind === "krouzky") return (events ?? []).filter(isHostedActivityEvent);
  if (kind === "jednorazove") return (events ?? []).filter((e) => !isHostedActivityEvent(e));
  return events ?? [];
}

export function activitiesForPlace(activities, placeId) {
  if (!placeId) return [];
  return (activities ?? []).filter((a) => a.placeId === placeId);
}

export function upcomingEventsForActivity(events, activityId, now = new Date()) {
  return (events ?? [])
    .filter((e) => e.hostedActivityId === activityId && !isEventPast(e, now))
    .sort((a, b) => (a.dateSort ?? 0) - (b.dateSort ?? 0));
}

export function nextEventForActivity(events, activityId, now = new Date()) {
  return upcomingEventsForActivity(events, activityId, now)[0] ?? null;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYmd(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Nejbližší nadcházející dny v týdnu (0=ne … 3=st). */
export function upcomingWeekdayDates(weekday, count = 4, from = new Date()) {
  const out = [];
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12, 0, 0, 0);
  for (let i = 0; i < 80 && out.length < count; i += 1) {
    const cand = new Date(start);
    cand.setDate(start.getDate() + i);
    if (cand.getDay() !== weekday) continue;
    if (i === 0 && from.getHours() >= 16) continue;
    out.push(toYmd(cand));
  }
  return out;
}

const MC_POHADKA_ID = "inst-mc-pohadka";
const SMYSLOHRANNI_ID = "act-smyslohranni";

const SEED_MAP_POS = { x: 51, y: 47, lat: 49.968, lng: 14.514 };
const SEED_ADDRESS = "Budějovická 12, Jesenice";

export const INITIAL_HOSTED_ACTIVITIES = [
  {
    id: SMYSLOHRANNI_ID,
    title: "Smyslohranní",
    description:
      "Smyslové hraní pro batolata. Termíny na další měsíc vypisuje lektorka průběžně. Probíhá v prostorách MC Pohádka — budova patří centru, kroužek vede Marie.",
    category: "rodina",
    ageRange: "1–4 roky",
    hostUserId: "marie-k",
    hostName: "Marie K.",
    accountType: "soused",
    venueKind: "place",
    placeId: MC_POHADKA_ID,
    placeName: "MC Pohádka",
    address: SEED_ADDRESS,
    mapPos: SEED_MAP_POS,
    lat: SEED_MAP_POS.lat,
    lng: SEED_MAP_POS.lng,
    photo: null,
    locationId: "domov",
    municipality: "Jesenice",
    groupId: HOSTED_ACTIVITY_GROUP_ID,
    createdAt: Date.parse("2026-08-20T10:00:00+02:00"),
    mine: false,
  },
];

function buildSeedSession(activity, eventDate, eventTime, index) {
  const startsAt = combineDateAndTime(eventDate, eventTime, false);
  return {
    id: `ev-${activity.id}-${eventDate}`,
    title: activity.title,
    date: formatCzechEventScheduleFromParts(eventDate, eventTime, false),
    dateSort: eventDateSortValue(startsAt),
    startsAt,
    eventDate,
    timeTbd: false,
    location: activityVenueLabel(activity),
    address: activity.address,
    mapPos: activity.mapPos,
    lat: activity.lat,
    lng: activity.lng,
    locationId: activity.locationId,
    municipality: activity.municipality,
    distanceKm: 0.6,
    category: activity.category,
    categoryLabel: "Rodina a děti",
    description: activity.description,
    photo: activity.photo,
    organizer: activity.hostName,
    accountType: activity.accountType,
    hostedActivityId: activity.id,
    placeId: activity.placeId,
    participants: 6 + index,
    participantIds: [],
    attendees: [
      { id: "marie-k", name: "Marie K.", initials: "MK" },
      { id: "jana", name: "Jana S.", initials: "JS" },
    ],
    interestTags: [activity.category],
    notifyInterested: false,
    chat: [],
    galleryPhotos: [],
    mine: false,
    createdAt: activity.createdAt,
  };
}

function buildSeedEvents() {
  const activity = INITIAL_HOSTED_ACTIVITIES[0];
  return upcomingWeekdayDates(3, 4).map((eventDate, index) =>
    buildSeedSession(activity, eventDate, "16:00", index)
  );
}

export const HOSTED_ACTIVITY_SEED_EVENTS = buildSeedEvents();

export function isOwnHostedActivity(activity, user) {
  if (!activity || !user) return false;
  if (activity.mine) return true;
  if (activity.hostUserId && (activity.hostUserId === user.id || activity.hostUserId === "me")) {
    return true;
  }
  if (user.name && activity.hostName && String(activity.hostName).trim() === String(user.name).trim()) {
    return true;
  }
  return false;
}
