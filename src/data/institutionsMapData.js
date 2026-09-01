/** Veřejná místa a podniky — kategorie mapy institucí */



/** Místní průvodce — kategorie katalogu míst (vázáno na provozovnu) */

export const LOCAL_GUIDE_CATEGORIES = [
  { id: "vse", label: "Vše" },
  { id: "gastro", label: "Gastro" },
  { id: "obchody", label: "Obchody" },
  { id: "sluzby", label: "Provozovny" },
  { id: "zdravi", label: "Zdraví" },
  { id: "instituce", label: "Instituce" },
  { id: "verejny-prostor", label: "Veřejný prostor" },
  { id: "remeslnici", label: "Služby u vás doma" },
  { id: "ostatni", label: "Ostatní" },
];

/** 8 kategorií pro mřížku 2×4 (bez „Vše“) */
export const GUIDE_GRID_CATEGORIES = LOCAL_GUIDE_CATEGORIES.filter((c) => c.id !== "vse");

export const REMESLICI_CATEGORY_ID = "remeslnici";
export const SLUZBY_CATEGORY_ID = "sluzby";

/** Mřížka na stránce Mapa — Průvodce (Vše + mapové kategorie bez řemeslníků) */
export const MAP_GUIDE_FILTER_CATEGORIES = [
  { id: "vse", label: "Vše" },
  ...GUIDE_GRID_CATEGORIES.filter((c) => c.id !== REMESLICI_CATEGORY_ID),
];

/** Kategorie zobrazující mapu (ne řemeslníci) */
export const GUIDE_MAP_CATEGORY_IDS = ["vse", ...GUIDE_GRID_CATEGORIES.filter((c) => c.id !== REMESLICI_CATEGORY_ID).map(
  (c) => c.id
)];

/** Typy provozoven (filtr v kategorii Provozovny) — ikony bez textu */
export const PROVOZOVNY_TYPE_FILTERS = [
  { id: "krasa", label: "Péče a krása" },
  { id: "auto", label: "Auto" },
  { id: "klicove", label: "Klíče" },
  { id: "bankomat", label: "Bankomat" },
  { id: "cistirna", label: "Čistírna" },
  { id: "sport", label: "Sport" },
  { id: "ostatni", label: "Ostatní" },
];

/** Starší / detailní typy → skupina filtru */
export const PROVOZOVNA_TYPE_ALIASES = {
  krasa: ["krasa", "kadernictvi", "kosmetika", "beauty"],
  auto: ["auto", "autoservis", "automycka"],
  klicove: ["klicove"],
  bankomat: ["bankomat"],
  cistirna: ["cistirna", "pradelna"],
  sport: ["sport", "fitness", "gym"],
  ostatni: ["ostatni"],
};

export function getProvozovnaType(id) {
  return PROVOZOVNY_TYPE_FILTERS.find((t) => t.id === id);
}

export function normalizeProvozovnaTypeId(typeId) {
  if (!typeId) return "ostatni";
  for (const [groupId, aliases] of Object.entries(PROVOZOVNA_TYPE_ALIASES)) {
    if (aliases.includes(typeId)) return groupId;
  }
  return "ostatni";
}

/** Mapování starých / interních kategorií na filtry mřížky */
const GUIDE_CATEGORY_GROUPS = {
  gastro: ["gastro"],
  obchody: ["obchody"],
  sluzby: ["sluzby"],
  zdravi: ["zdravi"],
  instituce: ["instituce", "urady"],
  "verejny-prostor": ["verejny-prostor", "vybavenost", "odpad"],
  ostatni: ["ostatni"],
};

/** @deprecated alias */
export const INSTITUTION_MAP_CATEGORIES = LOCAL_GUIDE_CATEGORIES;

export const INSTITUTION_INSTITUCE_CATEGORIES = new Set(["instituce", "urady", "zdravi"]);



export const INSTITUTION_CATEGORY_EMOJI = Object.fromEntries(

  INSTITUTION_MAP_CATEGORIES.filter((c) => c.id !== "vse" && c.id !== "remeslnici").map((c) => [c.id, "📍"])

);



export const INSTITUTIONS_MAP_PLACES = [

  {

    id: "inst-skola1",

    name: "ZŠ Jesenice",

    tagline: "Základní škola · 1.–9. třída",

    emoji: "🏫",

    category: "instituce",

    address: "Školní 4, Jesenice",

    phone: "+420 123 111 222",

    hours: "Po–Pá 7:30–16:00",

    mapPos: { x: 48, y: 44 },

    locationId: "domov",

    accountType: "instituce",

    distance: "600 m",

    acceptsPatients: null,

    extraInfo: "Družina do 17:00 · jídelna pro veřejnost po domluvě",

  },

  {

    id: "inst-mc-pohadka",

    name: "MC Pohádka",

    tagline: "Mateřské centrum · kroužky a setkání rodin",

    emoji: "🏡",

    category: "instituce",

    address: "Budějovická 12, Jesenice",

    phone: "+420 123 555 666",

    hours: "Po–Pá podle programu kroužků",

    mapPos: { x: 51, y: 47 },

    locationId: "domov",

    accountType: "instituce",

    distance: "520 m",

    extraInfo: "Budova patří centru — kroužky v ní vedou různí lektoři. Smyslohranní a další aktivity najdete v kalendáři.",

  },

  {

    id: "inst-ms1",

    name: "MŠ Na Louce",

    tagline: "Mateřská škola · volná místa od září",

    emoji: "🧒",

    category: "instituce",

    address: "Na Louce 11, Lhotka u Prahy",

    phone: "+420 123 333 444",

    hours: "Po–Pá 7:00–17:00",

    mapPos: { x: 56, y: 50 },

    locationId: "domov",

    accountType: "instituce",

    distance: "450 m",

    extraInfo: "Registrace online · adaptační program pro nové děti",

  },

  {

    id: "inst-knihovna",

    name: "Knihovna Lhotka",

    tagline: "Půjčovna · internet · klub pro seniory",

    emoji: "📚",

    category: "instituce",

    address: "Náměstí 8, Lhotka u Prahy",

    phone: "+420 123 222 333",

    hours: "Po, St 13:00–18:00 · Út, Čt 9:00–12:00",

    mapPos: { x: 54, y: 47 },

    locationId: "domov",

    accountType: "instituce",

    distance: "380 m",

    extraInfo: "Bezplatná registrace · dětský koutek o středách",

  },

  {

    id: "sp-obchod1",

    name: "Potraviny Coop",

    tagline: "Potraviny · pečivo · drobnosti",

    emoji: "🛒",

    category: "obchody",

    address: "Lípová 2, Lhotka u Prahy",

    phone: "+420 234 111 222",

    hours: "Po–So 7:00–20:00",

    mapPos: { x: 42, y: 46 },

    locationId: "domov",

    accountType: "podnik",

    distance: "290 m",

    isVerified: true,

  },

  {

    id: "sp-obchod2",

    name: "Drogerie Teta",

    tagline: "Kosmetika · drogerie · dárkové sady",

    emoji: "🧴",

    category: "obchody",

    address: "Náměstí 3, Lhotka u Prahy",

    phone: "+420 234 333 444",

    hours: "Po–Pá 8:00–18:00, So 8:00–12:00",

    mapPos: { x: 51, y: 45 },

    locationId: "domov",

    accountType: "podnik",

    distance: "340 m",

  },

  {
    id: "sp-albert-jesenice",
    name: "Albert",
    tagline: "Supermarket · potraviny",
    emoji: "🛒",
    category: "obchody",
    address: "Budějovická 371, 252 42 Jesenice",
    hours: "Po–Ne 7:00–22:00",
    lat: 49.96632,
    lng: 14.51789,
    mapPos: { x: 62, y: 49 },
    locationId: "domov",
    accountType: "podnik",
    distance: "420 m",
  },

  {
    id: "sp-penny-jesenice",
    name: "Penny Market",
    tagline: "Diskontní supermarket",
    emoji: "🛒",
    category: "obchody",
    address: "Zbraslavská 68, 252 42 Jesenice",
    hours: "Po–Ne 7:00–21:00",
    lat: 49.96757,
    lng: 14.51245,
    mapPos: { x: 51, y: 42 },
    locationId: "domov",
    accountType: "podnik",
    distance: "180 m",
  },

  {
    id: "sp-lidl-jesenice",
    name: "Lidl",
    tagline: "Supermarket · potraviny",
    emoji: "🛒",
    category: "obchody",
    address: "Budějovická 1143, 252 42 Jesenice",
    hours: "Po–So 7:00–22:00 · Ne 8:00–22:00",
    lat: 49.96558,
    lng: 14.51737,
    mapPos: { x: 61, y: 52 },
    locationId: "domov",
    accountType: "podnik",
    distance: "450 m",
  },

  {

    id: "sp1",

    name: "Restaurace U Ráje",

    tagline: "Domácí kuchyně · snídaně od 7:00",

    emoji: "🍽️",

    category: "gastro",

    address: "Náměstí 5, Lhotka u Prahy",

    phone: "+420 123 456 789",

    hours: "Po–Ne 7:00–22:00",

    mapPos: { x: 52, y: 46 },

    locationId: "domov",

    accountType: "podnik",

    distance: "350 m",

    isSponsored: true,

    isTop: true,

    isVerified: true,

  },

  {

    id: "sp2",

    name: "Pekárna U Kapličky",

    tagline: "Čerstvé pečivo · káva zdarma sousedům",

    emoji: "🥐",

    category: "gastro",

    address: "Kapliční 12, Lhotka u Prahy",

    phone: "+420 987 654 321",

    hours: "Po–So 6:00–18:00",

    mapPos: { x: 38, y: 55 },

    locationId: "domov",

    accountType: "podnik",

    distance: "500 m",

  },

  {

    id: "sp3",

    name: "Kavárna Na Louce",

    tagline: "Týdenní koláče −20 % pro Podplot",

    emoji: "☕",

    category: "gastro",

    address: "Na Louce 3, Lhotka u Prahy",

    phone: "+420 555 123 456",

    hours: "Po–Ne 8:00–20:00",

    mapPos: { x: 61, y: 52 },

    locationId: "domov",

    accountType: "podnik",

    distance: "280 m",

    isSponsored: true,

  },

  {

    id: "inst-lekar1",

    name: "Ordinace MUDr. Nováková",

    tagline: "Praktický lékař pro dospělé",

    emoji: "🩺",

    category: "zdravi",

    address: "Lípová 14, Lhotka u Prahy",

    phone: "+420 234 567 890",

    email: "ordinace@novakova-lhotka.cz",

    website: "https://www.novakova-lhotka.cz",

    hours: "Po, St, Pá 8:00–12:00",

    mapPos: { x: 44, y: 48 },

    locationId: "domov",

    accountType: "instituce",

    distance: "320 m",

    acceptsPatients: true,

    isTop: true,

    extraInfo: "Objednání přes recepci nebo telefonicky. Preventivní prohlídky po domluvě.",

  },

  {

    id: "inst-lekarna1",

    name: "Lékárna Jesenice",

    tagline: "Výdej receptů · zdravotnické potřeby",

    emoji: "💊",

    category: "zdravi",

    address: "Náměstí 2, Jesenice",

    phone: "+420 345 678 901",

    email: "info@lekarna-jesenice.cz",

    website: "https://www.lekarna-jesenice.cz",

    hours: "Po–Pá 8:00–18:00, So 8:00–12:00",

    mapPos: { x: 50, y: 42 },

    locationId: "domov",

    accountType: "instituce",

    distance: "700 m",

    acceptsPatients: null,

    extraInfo: "Výdej e-receptů · očkování po domluvě",

  },

  {

    id: "inst-zubari",

    name: "Zubní ordinace Smile",

    tagline: "Preventivní péče · bělení",

    emoji: "🦷",

    category: "zdravi",

    address: "Kapliční 6, Lhotka u Prahy",

    phone: "+420 456 789 012",

    email: "recepce@smile-lhotka.cz",

    website: "https://www.smile-lhotka.cz",

    hours: "Út–Pá 7:30–18:00",

    mapPos: { x: 40, y: 52 },

    locationId: "domov",

    accountType: "podnik",

    distance: "480 m",

    acceptsPatients: false,

    extraInfo: "",

  },

  {

    id: "sp4",

    name: "Salon Krása",

    tagline: "Manikúra, pedikúra · sleva pro sousedky",

    emoji: "💅",

    category: "zdravi",

    address: "Lípová 8, Lhotka u Prahy",

    phone: "+420 777 888 999",

    hours: "Út–So 9:00–19:00",

    mapPos: { x: 45, y: 42 },

    locationId: "domov",

    accountType: "podnik",

    distance: "420 m",

  },

  {

    id: "sp-kadernictvi",

    name: "Studio Vlas",

    tagline: "Střih · barvení · svatební účesy",

    emoji: "💇",

    category: "zdravi",

    address: "Kapliční 4, Lhotka u Prahy",

    phone: "+420 777 111 222",

    hours: "Po–Pá 9:00–18:00, So 8:00–14:00",

    mapPos: { x: 39, y: 49 },

    locationId: "domov",

    accountType: "podnik",

    distance: "510 m",

  },

  {

    id: "inst-fitness",

    name: "Fitcentrum Jesenice",

    tagline: "Posilovna · skupinová cvičení · sauna",

    emoji: "🏋️",

    category: "zdravi",

    address: "Sportovní 1, Jesenice",

    phone: "+420 567 890 123",

    hours: "Po–Ne 6:00–22:00",

    mapPos: { x: 47, y: 53 },

    locationId: "domov",

    accountType: "podnik",

    distance: "550 m",

    isTop: true,

  },

  {

    id: "inst-hriste",

    name: "Sportovní areál Na Louce",

    tagline: "Tenis · fotbal · venkovní workout",

    emoji: "⚽",

    category: "verejny-prostor",
    amenityType: "sportovni-hriste",

    address: "Na Louce 20, Lhotka u Prahy",

    phone: "+420 567 111 222",

    hours: "Po–Ne 7:00–21:00",

    mapPos: { x: 58, y: 54 },

    locationId: "domov",

    accountType: "instituce",

    distance: "620 m",

    extraInfo: "Veřejné hřiště zdarma · tenis po rezervaci",

  },

  {

    id: "inst-detske-hriste",

    name: "Dětské hřiště Na Louce",

    tagline: "Houpačky · pískoviště · prolézačky",

    emoji: "🛝",

    category: "verejny-prostor",
    amenityType: "detske-hriste",

    address: "Na Louce 18, Lhotka u Prahy",

    hours: "Po–Ne 7:00–20:00",

    mapPos: { x: 57, y: 52 },

    locationId: "domov",

    accountType: "instituce",

    distance: "540 m",

    extraInfo: "Bezbariérový přístup · lavičky pro rodiče",

  },

  {

    id: "inst-psi-hriste",

    name: "Psí hřiště u řeky",

    tagline: "Ohrada · míčky · fontánka pro psy",

    emoji: "🐕",

    category: "verejny-prostor",
    amenityType: "psi-hriste",

    address: "U řeky 12, Lhotka u Prahy",

    hours: "Po–Ne nonstop",

    mapPos: { x: 52, y: 58 },

    locationId: "domov",

    accountType: "instituce",

    distance: "710 m",

  },

  {

    id: "inst-posta",

    name: "Pošta Jesenice",

    tagline: "Balíkovna · poštovní služby · Western Union",

    emoji: "📮",

    category: "instituce",

    address: "Náměstí 1, Jesenice",

    phone: "+420 800 123 456",

    hours: "Po–Pá 8:00–17:00, So 8:00–11:00",

    mapPos: { x: 49, y: 41 },

    locationId: "domov",

    accountType: "instituce",

    distance: "720 m",

  },

  {

    id: "inst-urad",

    name: "Městský úřad Jesenice",

    tagline: "Občanské průkazy · stavební úřad · Czech POINT",

    emoji: "🏛️",

    category: "instituce",

    address: "Radniční 3, Jesenice",

    phone: "+420 123 999 000",

    hours: "Po, St 8:00–17:00 · Út, Čt 8:00–15:00",

    mapPos: { x: 46, y: 40 },

    locationId: "domov",

    accountType: "instituce",

    distance: "780 m",

    isVerified: true,

    extraInfo: "Objednání online · parkování u budovy",

  },

  {

    id: "inst-hasici",

    name: "SDH Lhotka",

    tagline: "Sbor dobrovolných hasičů · kulturní akce",

    emoji: "🚒",

    category: "instituce",

    address: "Hasičská 1, Lhotka u Prahy",

    phone: "+420 123 888 777",

    hours: "Pohotovost 24/7 · klubovna po domluvě",

    mapPos: { x: 43, y: 38 },

    locationId: "domov",

    accountType: "instituce",

    distance: "850 m",

    isVerified: true,

    extraInfo: "Nahlášení požáru 150 · sbírka na nové vybavení v březnu",

  },

  {

    id: "inst-policie",

    name: "Obvodní oddělení Jesenice",

    tagline: "Policie ČR · služebna pro veřejnost",

    emoji: "🚔",

    category: "instituce",

    address: "Polní 6, Jesenice",

    phone: "158",

    hours: "Po–Ne nonstop (služebna Po–Pá 8:00–18:00)",

    mapPos: { x: 47, y: 39 },

    locationId: "domov",

    accountType: "instituce",

    distance: "810 m",

    extraInfo: "Tísňová linka 158 · Czech POINT po domluvě",

  },

  {

    id: "sp-benzinka",

    name: "OMV Jesenice",

    tagline: "Čerpací stanice · myčka · občerstvení",

    emoji: "⛽",

    category: "obchody",

    address: "Hlavní 22, Jesenice",

    phone: "+420 234 555 666",

    hours: "Nonstop",

    mapPos: { x: 53, y: 58 },

    locationId: "domov",

    accountType: "podnik",

    distance: "920 m",

    isTop: true,

  },

  {

    id: "sp-automycka",

    name: "Auto myčka Na Louce",

    tagline: "Ruční mytí · vysavače zdarma",

    emoji: "🚗",

    category: "sluzby",

    address: "Na Louce 18, Lhotka u Prahy",

    phone: "+420 777 333 444",

    hours: "Po–Ne 8:00–20:00",

    mapPos: { x: 57, y: 56 },

    locationId: "domov",

    accountType: "podnik",

    distance: "640 m",

    provozovnaType: "automycka",

  },

  {

    id: "sp-autoservis",

    name: "Autoservis Jesenice",

    tagline: "STK · pneuservis · geometrie kol",

    emoji: "🔧",

    category: "sluzby",

    address: "Průmyslová 3, Jesenice",

    phone: "+420 234 666 777",

    hours: "Po–Pá 8:00–17:00",

    mapPos: { x: 41, y: 57 },

    locationId: "domov",

    accountType: "podnik",

    distance: "880 m",

    provozovnaType: "autoservis",

  },

  {

    id: "sp-klicove",

    name: "Výroba klíčů — náměstí",

    tagline: "Klíče · razítka · kování",

    emoji: "🔑",

    category: "sluzby",

    address: "Náměstí 6, Lhotka u Prahy",

    phone: "+420 777 444 555",

    hours: "Po–Pá 9:00–17:00",

    mapPos: { x: 52, y: 43 },

    locationId: "domov",

    accountType: "podnik",

    distance: "370 m",

    provozovnaType: "klicove",

  },

  {

    id: "inst-komunitni",

    name: "Komunitní středisko Na Louce",

    tagline: "Klub seniorů · půjčovna nářadí · nástěnka",

    emoji: "📌",

    category: "instituce",

    address: "Na Louce 5, Lhotka u Prahy",

    phone: "+420 234 777 888",

    hours: "Po–Pá 9:00–18:00",

    mapPos: { x: 59, y: 48 },

    locationId: "domov",

    accountType: "instituce",

    distance: "410 m",

    extraInfo: "Veřejná nástěnka · kurzy pro seniory",

  },

  {

    id: "inst-zastavka",

    name: "Zastávka Na Louce",

    tagline: "Autobus 363 · spojení do Prahy",

    emoji: "🚏",

    category: "ostatni",

    address: "Na Louce 1, Lhotka u Prahy",

    hours: "Nonstop",

    mapPos: { x: 54, y: 51 },

    locationId: "domov",

    accountType: "instituce",

    distance: "320 m",

  },

  {

    id: "inst-info-tabule",

    name: "Informační tabule u pošty",

    tagline: "Oznámení obce · kulturní akce",

    emoji: "📋",

    category: "ostatni",

    address: "Náměstí 1, Jesenice",

    hours: "Nonstop",

    mapPos: { x: 48, y: 42 },

    locationId: "domov",

    accountType: "instituce",

    distance: "690 m",

  },

  {

    id: "sp-bankomat",

    name: "Bankomat ČS — náměstí",

    tagline: "Výběr hotovosti · vklad",

    emoji: "🏧",

    category: "sluzby",

    address: "Náměstí 4, Lhotka u Prahy",

    phone: "",

    hours: "Nonstop",

    mapPos: { x: 50, y: 44 },

    locationId: "domov",

    accountType: "podnik",

    distance: "360 m",

    provozovnaType: "bankomat",

  },

  {

    id: "sp-praha",

    name: "Bistro Václavák",

    tagline: "Polední menu · sleva pro kolegy z okolí",

    emoji: "🥗",

    category: "gastro",

    address: "Václavské nám. 12, Praha",

    phone: "+420 222 333 444",

    hours: "Po–Pá 11:00–15:00",

    mapPos: { x: 50, y: 48 },

    locationId: "prace",

    accountType: "podnik",

    distance: "180 m",

  },

  {

    id: "sp-sazava",

    name: "Hospoda U Mostu",

    tagline: "Grilování o víkendu · domácí limonáda",

    emoji: "🍺",

    category: "gastro",

    address: "Přední Lhota 7, 290 01 Přední Lhota",

    phone: "+420 333 444 555",

    hours: "Pá–Ne 12:00–22:00",

    mapPos: { x: 55, y: 50 },

    locationId: "chata",

    accountType: "podnik",

    distance: "500 m",

  },

  {
    id: "sp-action-piskova",
    name: "Action Písková Lhota",
    tagline: "Diskontní prodejna · OC Pískovka",
    emoji: "🛒",
    category: "obchody",
    address: "Poděbradská 267, 290 01 Písková Lhota",
    hours: "Po–Ne 9:00–20:00",
    lat: 50.1328,
    lng: 15.0965,
    mapPos: { x: 62, y: 48 },
    locationId: "chata",
    accountType: "podnik",
    distance: "1,2 km",
  },

  {
    id: "sp-autopneu-piskova",
    name: "Auto Pneu Písková Lhota",
    tagline: "Pneuservis · přezutí · opravy",
    emoji: "🔧",
    category: "sluzby",
    provozovnaType: "autoservis",
    address: "Písková Lhota, 290 01",
    hours: "Po–Pá 8:00–17:00",
    lat: 50.1315,
    lng: 15.094,
    mapPos: { x: 60, y: 52 },
    locationId: "chata",
    accountType: "podnik",
    distance: "1,4 km",
  },

  {
    id: "recy-plasty",
    name: "Kontejner — plasty",
    tagline: "Žlutý kontejner · tříděný odpad",
    emoji: "🟡",
    category: "verejny-prostor",
    wasteType: "plasty",
    address: "Lípová 6, Lhotka u Prahy",
    hours: "Nonstop",
    mapPos: { x: 41, y: 51 },
    locationId: "domov",
    accountType: "instituce",
    distance: "480 m",
  },
  {
    id: "recy-papir",
    name: "Kontejner — papír",
    tagline: "Modrý kontejner",
    emoji: "🔵",
    category: "verejny-prostor",
    wasteType: "papir",
    address: "Kapliční 8, Lhotka u Prahy",
    hours: "Nonstop",
    mapPos: { x: 37, y: 48 },
    locationId: "domov",
    accountType: "instituce",
    distance: "520 m",
  },
  {
    id: "recy-sklo",
    name: "Kontejner — sklo",
    tagline: "Zelený kontejner",
    emoji: "🟢",
    category: "verejny-prostor",
    wasteType: "sklo",
    address: "Na Louce 14, Lhotka u Prahy",
    hours: "Nonstop",
    mapPos: { x: 55, y: 55 },
    locationId: "domov",
    accountType: "instituce",
    distance: "590 m",
  },
  {
    id: "recy-textil",
    name: "Kontejner — textil",
    tagline: "Bílý kontejner · oděvy",
    emoji: "👕",
    category: "verejny-prostor",
    wasteType: "textil",
    address: "Náměstí 7, Lhotka u Prahy",
    hours: "Nonstop",
    mapPos: { x: 48, y: 43 },
    locationId: "domov",
    accountType: "instituce",
    distance: "400 m",
  },
  {
    id: "recy-elektro",
    name: "Sběrný dvůr — elektro",
    tagline: "Electro odpad · bílá technika",
    emoji: "⚡",
    category: "verejny-prostor",
    wasteType: "elektro",
    address: "Průmyslová 5, Jesenice",
    phone: "+420 234 888 999",
    hours: "Po–So 8:00–16:00",
    mapPos: { x: 44, y: 58 },
    locationId: "domov",
    accountType: "instituce",
    distance: "950 m",
  },
  {
    id: "recy-baterie",
    name: "Box na baterie",
    tagline: "V obchodě Coop · u vchodu",
    emoji: "🔋",
    category: "verejny-prostor",
    wasteType: "baterie",
    address: "Lípová 2, Lhotka u Prahy",
    hours: "Po–So 7:00–20:00",
    mapPos: { x: 42, y: 47 },
    locationId: "domov",
    accountType: "instituce",
    distance: "290 m",
  },

];



export function normalizeGuideCategoryId(categoryId) {
  if (categoryId === "vse") return "vse";
  if (GUIDE_GRID_CATEGORIES.some((c) => c.id === categoryId)) return categoryId;
  const legacy = {
    urady: "instituce",
    vybavenost: "verejny-prostor",
    odpad: "verejny-prostor",
    katalog: "gastro",
  };
  return legacy[categoryId] ?? "gastro";
}

export function institutionMatchesProvozovnaType(place, typeId) {
  if (!typeId) return true;
  if (place.category !== SLUZBY_CATEGORY_ID) return false;
  const placeType = normalizeProvozovnaTypeId(place.provozovnaType);
  const aliases = PROVOZOVNA_TYPE_ALIASES[typeId] ?? [typeId];
  return aliases.includes(placeType) || aliases.includes(place.provozovnaType);
}

export function institutionMatchesCategory(place, categoryId) {
  if (!categoryId || categoryId === "vse" || categoryId === REMESLICI_CATEGORY_ID) return true;
  const group = GUIDE_CATEGORY_GROUPS[categoryId];
  if (group) return group.includes(place.category);
  return place.category === categoryId;
}

export function isGuideMapCategory(categoryId) {
  return GUIDE_MAP_CATEGORY_IDS.includes(categoryId);
}

export function institutionMatchesSearch(place, query) {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase();
  const provozType = getProvozovnaType(place.provozovnaType);
  const amenityLabels = {
    "detske-hriste": "dětské hřiště houpačky pískoviště prolézačky",
    "sportovni-hriste": "sportovní hřiště tenis",
    "psi-hriste": "psí hřiště",
  };
  const haystack = [
    place.name,
    place.tagline,
    place.address,
    place.extraInfo,
    place.wasteType,
    place.amenityType,
    amenityLabels[place.amenityType],
    provozType?.label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (haystack.includes(q)) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.length > 1 && tokens.every((t) => haystack.includes(t));
}

export function institutionPinVariant(place) {
  const cat = place.category;
  if ((cat === "verejny-prostor" || cat === "vybavenost" || cat === "odpad") && place.wasteType) {
    return "waste";
  }
  if (cat === "verejny-prostor" || cat === "vybavenost" || cat === "odpad") return "sport";
  const byCategory = {
    gastro: "gastro",
    sluzby: "services",
    obchody: "shop",
    zdravi: "health",
    instituce: "public",
    urady: "public",
    ostatni: "leisure",
  };
  return byCategory[cat] ?? "institution";
}

export function institutionPinEmoji(place) {
  if ((place.category === "vybavenost" || place.category === "odpad") && place.emoji) return place.emoji;
  return place.emoji;
}

export const INSTITUTION_LEGEND = GUIDE_GRID_CATEGORIES.filter((c) => c.id !== REMESLICI_CATEGORY_ID).map(
  (c) => ({
    label: c.label,
    color: {
      gastro: "#F4A261",
      obchody: "#E9C46A",
      sluzby: "#E76F51",
      zdravi: "#06D6A0",
      instituce: "#4895EF",
      "verejny-prostor": "#2D6A4F",
      ostatni: "#ADB5BD",
    }[c.id],
  })
);
