/** Skupiny, nástěnky a propojení — nástěnka je na seznámení a tipy, ne na tržiště */

import { MY_GROUP_IDS_BY_LOCATION } from "./locations.js";
import { isThingsModuleListing } from "../utils/thingsModule.js";

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

/** Doplňkové kategorie jen pro starší create flow — nástěnka používá „Přidat příspěvek“. */
export const GROUP_EXTRA_CATEGORIES = {
  maminky: [
    { id: "hlidani", label: "Hlídání", hint: "Nabídnu hlídání dětí", type: "Hlídání" },
    { id: "krouzek", label: "Kroužek", hint: "Dětský kroužek nebo aktivita", type: "Kroužek" },
    { id: "skolka", label: "Školka", hint: "Volná místa, jesle, školka", type: "Školka" },
  ],
  pejskari: [
    { id: "nabidka", label: "Nabízím", hint: "Venčení, hlídání psa", type: "Nabízím" },
  ],
  zahradkari: [],
};

/** Příspěvky na nástěnkách — tipy a seznámení, ne inzeráty Věcí */
export const GROUP_POSTS = [
  {
    id: "gp1",
    groupId: "maminky",
    groupName: "Maminky",
    categoryId: "diskuse",
    role: "soused",
    author: "Lucie H.",
    initials: "LH",
    title: "Ahoj, jsme noví v ulici — máte tip na dětské hřiště?",
    body: "Stěhujeme se s dvouletým synem. Kde se u vás nejčastěji scházíte s dětmi?",
    meta: "před 2 h · Maminky",
    type: "Příspěvek",
  },
  {
    id: "gp2",
    groupId: "maminky",
    groupName: "Maminky",
    categoryId: "diskuse",
    role: "soused",
    author: "Katka M.",
    initials: "KM",
    title: "Společné odpoledne na hřišti v sobotu?",
    body: "Kdyby měl někdo chuť, můžeme dát sraz kolem 15:00 u pískoviště.",
    meta: "před 5 h · Maminky",
    type: "Příspěvek",
  },
  {
    id: "gp3",
    groupId: "maminky",
    groupName: "Maminky",
    categoryId: "krouzek",
    role: "instituce",
    author: "Kulturní dům Lhotka",
    initials: "KD",
    title: "Dětský taneční kroužek — volná místa od září",
    body: "Pro děti 4–7 let, úterý 15:30. První lekce zdarma — napište do komentáře.",
    meta: "800 m · Maminky",
    type: "Kroužek",
  },
  {
    id: "gp4",
    groupId: "pejskari",
    groupName: "Pejskaři",
    categoryId: "diskuse",
    role: "soused",
    author: "Honza P.",
    initials: "HP",
    title: "Nový pejskař v okolí — tipy na venčení?",
    body: "Máme labradora, rádi bychom věděli, kde se dají potkat ostatní pejskaři ráno.",
    meta: "před 3 h · Pejskaři",
    type: "Příspěvek",
  },
  {
    id: "gp5",
    groupId: "zahradkari",
    groupName: "Zahrádkáři",
    categoryId: "diskuse",
    role: "soused",
    author: "Franta Z.",
    initials: "FZ",
    title: "Kdo pěstuje rajčata — jaká odrůda se vám osvědčila?",
    body: "Letos zkouším nové semínka, rád si porovnám zkušenosti se sousedy.",
    meta: "před 6 h · Zahrádkáři",
    type: "Příspěvek",
  },
  {
    id: "gp6",
    groupId: "sport",
    groupName: "Sport",
    categoryId: "diskuse",
    role: "soused",
    author: "Petr D.",
    initials: "PD",
    title: "Ranní běh kolem rybníka — přidá se někdo?",
    body: "Úterý a čtvrtek v 6:30, tempo pohodové. Stačí napsat.",
    meta: "před 1 dnem · Sport",
    type: "Příspěvek",
  },
];

/** Inzeráty Věcí nepatří na nástěnku skupiny */
export function isGroupWallPost(post) {
  if (!post) return false;
  if (isThingsModuleListing(post)) return false;
  const type = String(post.type ?? "").toLowerCase();
  if (/prodám|prodam|daruji|půjčovna|pujcovna|sháním|shanim/.test(type)) return false;
  return true;
}

/**
 * Diskuse (komentáře) jen u příspěvků na nástěnce skupiny.
 * groupIds u inzerátu s boardPost:false = jen omezení viditelnosti, ne diskuse.
 */
export function isGroupBoardDiscussionPost(post) {
  if (!post) return false;
  if (post.boardPost === false) return false;
  if (post.boardPost === true) return true;
  // Legacy / seed nástěnka — není inzerát Věcí a patří ke skupině
  if (!isGroupWallPost(post)) return false;
  return Boolean(post.groupId) || (Array.isArray(post.groupIds) && post.groupIds.length > 0);
}

export function postVisibleInGroup(post, groupId) {
  if (!post || !groupId) return false;
  if (post.groupId === groupId) return true;
  return Array.isArray(post.groupIds) && post.groupIds.includes(groupId);
}

export function resolveGroupName(post, communityGroups = []) {
  if (post?.groupName) return post.groupName;
  const fromStatic = getGroup(post?.groupId);
  if (fromStatic?.name) return fromStatic.name;
  const fromLive = communityGroups.find((g) => g.id === post?.groupId);
  return fromLive?.name ?? "Skupina";
}

export function getGroup(id) {
  return GROUPS.find((g) => g.id === id);
}

export function getMyGroups(locationId = "domov") {
  const ids = MY_GROUP_IDS_BY_LOCATION[locationId] ?? MY_GROUP_IDS_BY_LOCATION.domov;
  return GROUPS.filter((g) => ids.includes(g.id));
}

export function getGroupPosts(groupId, userGroupPosts = []) {
  const isBoardInGroup = (p) =>
    isGroupBoardDiscussionPost(p) && postVisibleInGroup(p, groupId);
  const mock = GROUP_POSTS.filter(isBoardInGroup);
  const user = userGroupPosts.filter(isBoardInGroup);
  return [...user, ...mock];
}

export function getRecentGroupPosts(userGroupPosts = [], limit = 5) {
  const all = [...userGroupPosts, ...GROUP_POSTS].filter(
    (p) => isGroupBoardDiscussionPost(p) && MY_GROUP_IDS.some((id) => postVisibleInGroup(p, id))
  );
  return all.slice(0, limit);
}
