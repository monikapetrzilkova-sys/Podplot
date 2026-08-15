/** Vzorové B2B/B2G profily pro testování dashboardů — úřad z registru institucí */

import { getDefaultDemoInstitution } from "./institutions/index.js";

const demoOffice = getDefaultDemoInstitution();

export const TEST_PERSONAS = {
  remeslnik: {
    id: "craft-libor",
    name: "Libor Novák — instalatér",
    businessName: "Instalatér Libor",
    initials: "LN",
    ico: "12345678",
    rating: 4.9,
    stats: { views: 342, phoneClicks: 28, webClicks: 11 },
    menuViewsToday: 0,
    subscribers: 0,
  },
  podnik: {
    id: "biz-javor",
    name: "Hospoda U Javoru",
    businessName: "Hospoda U Javoru",
    initials: "UJ",
    rating: 4.7,
    stats: { menuViewsToday: 86, subscribers: 52 },
    hours: "Po–Ne 11:00–23:00",
  },
  urad: {
    id: demoOffice?.id ?? "inst-demo",
    name: demoOffice?.name?.replace(/^Městský úřad\s+/i, "Město ").replace(/^Obecní úřad\s+/i, "Obec ") ?? "Obec",
    businessName: demoOffice?.name ?? "Obecní / městský úřad",
    initials: (demoOffice?.seatCity ?? "OU")
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    municipality: demoOffice?.seatCity ?? "",
    institutionId: demoOffice?.id ?? null,
    allowedEmailDomain: demoOffice?.allowedEmailDomain ?? null,
    seatAddress: demoOffice?.seatAddress ?? null,
    ico: demoOffice?.ico ?? null,
  },
};

export const CRAFTSMAN_NEARBY_REQUESTS = [
  {
    id: "req1",
    title: "Oprava kohoutku v kuchyni",
    text: "Kapalo to celou noc, potřebuji rychle instalatéra.",
    author: "Marie Nováková",
    authorId: "marie",
    distanceKm: 0.4,
    time: "před 25 min",
    categoryLabel: "Instalatér",
    profession: "Instalatér",
  },
  {
    id: "req2",
    title: "Montáž sprchy",
    text: "Nová sprchová baterie, potřebuji namontovat.",
    author: "Petr Dvořák",
    authorId: "pavel-d",
    distanceKm: 0.9,
    time: "před 2 h",
    categoryLabel: "Instalatér",
    profession: "Instalatér",
  },
  {
    id: "req3",
    title: "Ucpaný odpad v koupelně",
    text: "Prosím o co nejdřívější termín — vodoinstalace.",
    author: "Eva Malá",
    authorId: "eva",
    distanceKm: 1.8,
    time: "dnes ráno",
    categoryLabel: "Instalatér",
    profession: "Instalatér",
  },
  {
    id: "req4",
    title: "Sekání trávníku u domu",
    text: "Hledám zahradníka na jednorázové posekání.",
    author: "Jan Veselý",
    authorId: "jan-v",
    distanceKm: 1.2,
    time: "včera",
    categoryLabel: "Zahrada",
    profession: "Zahradník",
  },
  {
    id: "req5",
    title: "Oprava střechy — Brno",
    text: "Potřebuji pokrývače, jsem mimo běžný dojezd.",
    author: "Klára Horáková",
    authorId: "klara",
    distanceKm: 185,
    time: "včera",
    categoryLabel: "Střechy",
    profession: "Pokrývač",
  },
];
