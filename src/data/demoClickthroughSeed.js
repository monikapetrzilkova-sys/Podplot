/**
 * Ukázkový obsah pro proklikání všech typů příspěvků v testovacích profilech.
 * ID s prefixem demo- se při každém vstupu sloučí (nepřepisují vlastní uložená data).
 */

import { markAsSample } from "./sampleContent.js";
import { CRAFTSMAN_NEARBY_REQUESTS } from "./businessProfiles.js";
import { formatCzechDate, formatCzechTime } from "./czechDateTime.js";

const DEMO_PREFIX = "demo-";

export function isDemoClickthroughId(id) {
  return String(id ?? "").startsWith(DEMO_PREFIX);
}

function daysFromNow(days, hour = 17, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function formatEventWhen(date) {
  const day = formatCzechDate(date, { weekday: true, year: false });
  const time = formatCzechTime(date);
  return day && time ? `${day} · ${time}` : date.toLocaleString("cs-CZ");
}

function mergeById(existing = [], extras = []) {
  const ids = new Set((existing ?? []).map((item) => item?.id).filter(Boolean));
  const add = (extras ?? []).filter((item) => item?.id && !ids.has(item.id));
  return add.length ? [...existing, ...add] : existing;
}

/** Odstraní staré demo položky a doplní aktuální sadu pro daného uživatele. */
export function replaceDemoItems(existing = [], nextDemo = []) {
  const kept = (existing ?? []).filter((item) => !isDemoClickthroughId(item?.id));
  return mergeById(kept, nextDemo);
}

export function buildDemoNeighborPosts(user) {
  const uid = user?.id ?? "monika";
  const name = user?.name ?? "Soused";
  const initials = user?.initials ?? "SO";
  const createdAt = Date.now();

  return markAsSample([
    {
      id: `${DEMO_PREFIX}daruji`,
      role: "soused",
      accountType: "soused",
      author: name,
      authorId: uid,
      initials,
      title: "Daruji přebytečné květináče",
      body: "Ukázka Daruji — 4 ks terakotových květináčů, vyzvednutí u plotu.",
      meta: "doma · ukázka",
      type: "Daruji",
      categoryId: "daruji",
      marketCategory: "zahrada",
      keywords: ["květináče", "daruji"],
      feedType: "zbozi",
      feedSubtype: "daruji",
      locationId: "domov",
      mine: true,
      createdAt,
    },
    {
      id: `${DEMO_PREFIX}prodam`,
      role: "soused",
      accountType: "soused",
      author: name,
      authorId: uid,
      initials,
      title: "Prodám dětský stan do pokoje",
      body: "Ukázka Prodám — málo používaný, čistý, 350 Kč.",
      meta: "doma · 350 Kč · ukázka",
      type: "Prodám",
      categoryId: "prodam",
      marketCategory: "deti",
      keywords: ["stan", "děti"],
      listingPrice: 350,
      listingPriceUnit: "total",
      listingPaymentMethod: "in_person",
      feedType: "zbozi",
      feedSubtype: "prodam",
      locationId: "domov",
      mine: true,
      createdAt: createdAt - 1,
    },
    {
      id: `${DEMO_PREFIX}shanim`,
      role: "soused",
      accountType: "soused",
      author: name,
      authorId: uid,
      initials,
      title: "Sháním přenosný gril na víkend",
      body: "Ukázka Sháním — ideálně s uhlím, vrátím v neděli večer.",
      meta: "doma · ukázka",
      type: "Sháním",
      categoryId: "shanim",
      marketCategory: "zahrada",
      keywords: ["gril"],
      interactionType: "help",
      feedType: "zbozi",
      feedSubtype: "shanim",
      locationId: "domov",
      mine: true,
      createdAt: createdAt - 2,
    },
    {
      id: `${DEMO_PREFIX}pujcovna`,
      role: "soused",
      accountType: "soused",
      author: name,
      authorId: uid,
      initials,
      title: "Žebřík 3 m",
      body: "Ukázka Půjčovna — hliníkový žebřík, 40 Kč/den.",
      meta: "doma · 40 Kč/den · ukázka",
      type: "Půjčovna",
      categoryId: "pujcovna",
      marketCategory: "naradi",
      lendingCategory: "naradi",
      itemType: "zebrík",
      itemTypeLabel: "Žebřík",
      keywords: ["žebřík"],
      feedType: "zbozi",
      feedSubtype: "pujcovna",
      locationId: "domov",
      mine: true,
      createdAt: createdAt - 3,
    },
    {
      id: `${DEMO_PREFIX}hlaseni`,
      role: "soused",
      accountType: "soused",
      author: name,
      authorId: uid,
      initials,
      title: "Poškozená lavička u stezky",
      body: "Ukázka Hlášení — prasklé prkno, ať se nikdo nezraní.",
      meta: "doma · ukázka",
      type: "Hlášení",
      feedSubtype: "hlaseni",
      reportCategoryId: "damage",
      untilResolved: true,
      locationId: "domov",
      mine: true,
      createdAt: createdAt - 4,
    },
  ]);
}

export function buildDemoGroupPosts(user) {
  const uid = user?.id ?? "monika";
  const name = user?.name ?? "Soused";
  const initials = user?.initials ?? "SO";

  return markAsSample([
    {
      id: `${DEMO_PREFIX}group-maminky`,
      groupId: "maminky",
      groupName: "Maminky",
      categoryId: "diskuse",
      boardPost: true,
      role: "soused",
      author: name,
      authorId: uid,
      initials,
      title: "Ukázka: tip na dětské hřiště v okolí?",
      body: "Testovací příspěvek ve skupině Maminky — jde otevřít a komentovat.",
      meta: "ukázka · Maminky",
      type: "Příspěvek",
      locationId: "domov",
      municipality: "Jesenice",
      mine: true,
      createdAt: Date.now(),
    },
    {
      id: `${DEMO_PREFIX}group-pejskari`,
      groupId: "pejskari",
      groupName: "Pejskaři",
      categoryId: "diskuse",
      boardPost: true,
      role: "soused",
      author: name,
      authorId: uid,
      initials,
      title: "Ukázka: kam ráno na venčení?",
      body: "Testovací příspěvek ve skupině Pejskaři.",
      meta: "ukázka · Pejskaři",
      type: "Příspěvek",
      locationId: "domov",
      municipality: "Jesenice",
      mine: true,
      createdAt: Date.now() - 10,
    },
  ]);
}

export function buildDemoHelpPosts(user) {
  const uid = user?.id ?? "monika";
  const name = user?.name ?? "Soused";
  const initials = user?.initials ?? "SO";

  return markAsSample([
    {
      id: `${DEMO_PREFIX}help-hledam`,
      type: "hledam",
      title: "Ukázka: hledám výpomoc se stěhováním krabice",
      body: "Stačí 20 minut, lehká krabice do auta.",
      author: name,
      authorId: uid,
      initials,
      distance: "doma",
      time: "ukázka",
      locationId: "domov",
      mine: true,
      createdAt: Date.now(),
    },
    {
      id: `${DEMO_PREFIX}help-nabizim`,
      type: "nabizim",
      title: "Ukázka: nabízím odvoz na nákup",
      body: "Jednou týdně můžu vzít souseda do obchodu.",
      author: name,
      authorId: uid,
      initials,
      distance: "doma",
      time: "ukázka",
      locationId: "domov",
      mine: true,
      createdAt: Date.now() - 5,
    },
  ]);
}

export function buildDemoEvents(user) {
  const uid = user?.id ?? "monika";
  const name = user?.name ?? "Soused";
  const start = daysFromNow(5, 17, 0);
  const officeStart = daysFromNow(12, 10, 0);

  return markAsSample([
    {
      id: `${DEMO_PREFIX}event-grill`,
      title: "Ukázka: sousedské odpoledne u ohniště",
      date: formatEventWhen(start),
      startsAt: start.toISOString(),
      location: "Park Na Louce, Jesenice",
      address: "Park Na Louce, Jesenice",
      mapPos: { x: 52, y: 46 },
      locationId: "domov",
      distanceKm: 0.5,
      category: "komunita",
      organizer: name,
      organizerId: uid,
      body: "Testovací akce — přihlášení, chat i galerie.",
      participants: 3,
      mine: true,
      createdAt: Date.now(),
    },
    {
      id: `${DEMO_PREFIX}event-office`,
      title: "Ukázka: den otevřených dveří úřadu",
      date: formatEventWhen(officeStart),
      startsAt: officeStart.toISOString(),
      location: "Budova úřadu, Jesenice",
      address: "Budějovická 97, Jesenice",
      mapPos: { x: 48, y: 42 },
      locationId: "domov",
      distanceKm: 0.9,
      category: "oficialni",
      organizer: "Obec Jesenice",
      accountType: "urad",
      fromOffice: true,
      body: "Oficiální ukázková akce z úřadu.",
      participants: 12,
      createdAt: Date.now() - 20,
    },
  ]);
}

export function buildDemoReports(user) {
  const uid = user?.id ?? "monika";
  const name = user?.name ?? "Soused";

  return markAsSample([
    {
      id: `${DEMO_PREFIX}report-warning`,
      type: "Varování",
      reportCategoryId: "warning",
      body: "Ukázka varování — kluzký chodník po dešti u kapličky.",
      author: name,
      authorId: uid,
      time: "ukázka",
      locationId: "domov",
      lat: 49.9665,
      lng: 14.5125,
      untilResolved: true,
      mine: true,
    },
    {
      id: `${DEMO_PREFIX}report-animal`,
      type: "Zvíře",
      reportCategoryId: "animal",
      body: "Ukázka — potulný pejsek u hřiště, má obojek.",
      author: name,
      authorId: uid,
      time: "ukázka",
      locationId: "domov",
      lat: 49.9658,
      lng: 14.511,
      untilResolved: true,
      mine: true,
    },
  ]);
}

export function buildDemoCraftsmanInquiries() {
  return CRAFTSMAN_NEARBY_REQUESTS.map((r) => ({
    id: `${DEMO_PREFIX}bi-${r.id}`,
    type: "service_request",
    title: r.title,
    text: r.text,
    author: r.author,
    authorId: r.authorId,
    time: r.time,
    distanceKm: r.distanceKm,
    categoryLabel: r.categoryLabel,
    profession: r.profession,
    read: false,
    priority: "immediate",
    visibleAt: Date.now(),
    sample: true,
  }));
}

export function buildDemoLunchMenu(user) {
  const name = user?.businessName || user?.name || "Hospoda U Javoru";
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");

  return markAsSample([
    {
      id: `${DEMO_PREFIX}lunch-mine`,
      businessId: user?.id || "biz-javor",
      businessName: name,
      emoji: "🍽️",
      locationId: "domov",
      lat: 49.966,
      lng: 14.512,
      distanceKm: 0.1,
      menuText:
        "Ukázkové polední menu: kulajda · řízek s bramborem · vegetariánské těstoviny",
      date: `${y}-${m}-${d}`,
      priceRange: "od 129 Kč",
      isTop: true,
      publishedPlan: "top",
      mine: true,
    },
  ]);
}

export function buildDemoOwnedService(user) {
  const uid = user?.id ?? "monika";
  const name = user?.businessName || user?.name || "Mobilní služba";
  const initials = user?.initials ?? "MS";
  const sub = user?.primarySubcategory || user?.serviceSubcategory || "instalater";

  return markAsSample([
    {
      id: `${DEMO_PREFIX}svc-mine`,
      name,
      profession: "Instalatér",
      keywords: ["instalatér", "ukázka", name],
      subcategory: sub,
      subcategoryLabel: "Instalatér",
      address: user?.address || "Jesenice",
      locationId: "domov",
      defaultAddress: user?.location || "Jesenice",
      actionRadius: 15,
      isVerified: true,
      isPremium: false,
      kapacitaPlna: false,
      distanceKm: 0.2,
      rating: 4.8,
      serviceDescription: "Ukázkový katalogový profil mobilní služby pro testování poptávek a recenzí.",
      ownerUserId: uid,
      reviews: [
        {
          author: "Marie N.",
          location: "Lhotka",
          verified: true,
          text: "Ukázková recenze — rychlá domluva.",
          stars: 5,
        },
        {
          author: "Petr D.",
          location: "Jesenice",
          verified: true,
          text: "Ukázková recenze — doporučuji.",
          stars: 4,
        },
      ],
      ico: true,
      accountType: "podnik",
      businessSubtype: "mobilni",
      pushPoptavkyEnabled: true,
      initials,
      mine: true,
    },
  ]);
}

export function buildDemoOfficeAnnouncements(user) {
  const name = user?.name || "Obecní úřad";
  const initials = user?.initials ?? "OU";

  return markAsSample([
    {
      id: `${DEMO_PREFIX}office-news`,
      role: "urad",
      accountType: "urad",
      author: name,
      authorId: user?.id,
      initials,
      title: "Ukázka: uzavírka silnice v pátek 9–15 h",
      body: "Oficiální oznámení úřadu — testovací příspěvek pro proklikání.",
      meta: "Oficiální oznámení · ukázka",
      type: "Hlášení",
      feedType: "sluzby",
      feedSubtype: "instituce",
      locationId: "domov",
      mine: true,
      createdAt: Date.now(),
      isVerified: true,
    },
  ]);
}

/** Výchozí skupiny, ať jsou nástěnky hned k dispozici. */
export const DEMO_JOINED_GROUP_IDS = ["maminky", "pejskari", "zahradkari", "sport"];

/**
 * Kompletní sada sousedského obsahu (vlastní ukázky) pro daného uživatele.
 */
export function buildDemoNeighborPack(user) {
  return {
    posts: buildDemoNeighborPosts(user),
    groupPosts: buildDemoGroupPosts(user),
    help: buildDemoHelpPosts(user),
    events: buildDemoEvents(user),
    reports: buildDemoReports(user),
  };
}
