/** Skupiny, nástěnky a propojení s kategoriemi inzerátů */

import { MY_GROUP_IDS_BY_LOCATION } from "./locations.js";

export const GROUPS = [
  {
    id: "maminky",
    name: "Maminky",
    emoji: "👶",
    members: 84,
    description: "Sdílení, výměny, hlídání a tipy pro rodiny s dětmi.",
  },
  {
    id: "zahradkari",
    name: "Zahrádkáři",
    emoji: "🌱",
    members: 41,
    description: "Úroda, nářadí, semínka a sousedská zahrada.",
  },
  {
    id: "sport",
    name: "Sport",
    emoji: "⚽",
    members: 32,
    description: "Běh, cyklistika, teamové sporty a společné tréninky.",
  },
  {
    id: "kultura",
    name: "Kultura",
    emoji: "🎭",
    members: 28,
    description: "Divadlo, koncerty, workshopy a kulturní akce v okolí.",
  },
  {
    id: "pejskari",
    name: "Pejskaři",
    emoji: "🐕",
    members: 56,
    description: "Venčení, tipy na místa a pomoc se psy v okolí.",
  },
];

export const MY_GROUP_IDS = MY_GROUP_IDS_BY_LOCATION.domov;

export const GROUP_EXTRA_CATEGORIES = {
  maminky: [
    { id: "hlidani", label: "Hlídání", hint: "Nabídnu hlídání dětí", type: "Hlídání" },
    { id: "krouzek", label: "Kroužek", hint: "Dětský kroužek nebo aktivita", type: "Kroužek" },
    { id: "skolka", label: "Školka", hint: "Volná místa, jesle, školka", type: "Školka" },
  ],
  pejskari: [
    { id: "nabidka", label: "Nabízím", hint: "Venčení, hlídání psa", type: "Nabízím" },
  ],
  zahradkari: [
    { id: "pujcovna", label: "Půjčovna", hint: "Nářadí ke zapůjčení", type: "Půjčovna", priceField: true, priceLabel: "Cena (Kč / den)", isLending: true },
  ],
};

/** Příspěvky na nástěnkách skupin */
export const GROUP_POSTS = [
  {
    id: "gp1",
    groupId: "maminky",
    categoryId: "daruji",
    role: "soused",
    author: "Lucie H.",
    initials: "LH",
    title: "Daruji balíček chlapeckého oblečení 62–74",
    body: "Celkem asi 15 ks — body, trička, tepláky. Uklidím do tašky.",
    meta: "před 2 h · Maminky",
    type: "Daruji",
    photos: ["https://images.unsplash.com/photo-1519238263530-9822fec6b934?w=400&h=300&fit=crop"],
  },
  {
    id: "gp2",
    groupId: "maminky",
    categoryId: "prodam",
    role: "soused",
    author: "Katka M.",
    initials: "KM",
    title: "Prodám kočárek Britax — málo jetý",
    body: "Včetně pláštěnky a adaptéru. Možnost vyzkoušet u nás.",
    meta: "500 Kč · před 5 h · Maminky",
    type: "Prodám",
    topped: true,
    topPlanId: "7d",
    topDays: 7,
    listingPrice: 500,
    photos: ["https://images.unsplash.com/photo-1515488042361-ee00e945bfa0?w=400&h=300&fit=crop"],
  },
  {
    id: "gp3",
    groupId: "maminky",
    categoryId: "hlidani",
    role: "soused",
    author: "Monika V.",
    initials: "MV",
    title: "Nabízím hlídání večer o víkendu",
    body: "Zkušená maminka dvou dětí, okruh do 500 m od hřiště.",
    meta: "200 Kč/h · před 1 dnem · Maminky",
    type: "Hlídání",
  },
  {
    id: "gp4",
    groupId: "maminky",
    categoryId: "krouzek",
    role: "instituce",
    author: "Kulturní dům Lhotka",
    initials: "KD",
    title: "Dětský taneční kroužek — volná místa od září",
    body: "Pro děti 4–7 let, úterý 15:30. První lekce zdarma.",
    meta: "800 m · Maminky",
    type: "Kroužek",
  },
  {
    id: "gp5",
    groupId: "pejskari",
    categoryId: "nabidka",
    role: "soused",
    author: "Honza P.",
    initials: "HP",
    title: "Venčení psů ráno před prací",
    body: "Projdu se psem v okolí parku, 30–45 min. Mám zkušenost s většími plemeny.",
    meta: "150 Kč · před 3 h · Pejskaři",
    type: "Nabízím",
  },
  {
    id: "gp6",
    groupId: "zahradkari",
    categoryId: "daruji",
    role: "soused",
    author: "Franta Z.",
    initials: "FZ",
    title: "Daruji sazenice rajčat a paprik",
    body: "Mám přebytek ze skleníku — cca 20 sazenic.",
    meta: "před 6 h · Zahrádkáři",
    type: "Daruji",
  },
];

export function getGroup(id) {
  return GROUPS.find((g) => g.id === id);
}

export function getMyGroups(locationId = "domov") {
  const ids = MY_GROUP_IDS_BY_LOCATION[locationId] ?? MY_GROUP_IDS_BY_LOCATION.domov;
  return GROUPS.filter((g) => ids.includes(g.id));
}

export function getGroupPosts(groupId, userGroupPosts = []) {
  const mock = GROUP_POSTS.filter((p) => p.groupId === groupId);
  const user = userGroupPosts.filter((p) => p.groupId === groupId);
  return [...user, ...mock];
}

export function getRecentGroupPosts(userGroupPosts = [], limit = 5) {
  const all = [...userGroupPosts, ...GROUP_POSTS].filter((p) => MY_GROUP_IDS.includes(p.groupId));
  return all.slice(0, limit);
}
