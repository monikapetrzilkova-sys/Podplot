/** Klient pro Google Places proxy (server.mjs). */

/** Mapování Google Place types → kategorie Průvodce (vždy jedna z mapových kategorií). */
const GOOGLE_TYPE_TO_CATEGORY = {
  // Gastro
  cafe: "gastro",
  restaurant: "gastro",
  bar: "gastro",
  bakery: "gastro",
  meal_delivery: "gastro",
  meal_takeaway: "gastro",
  food: "gastro",
  night_club: "gastro",
  liquor_store: "gastro",
  // Obchody
  store: "obchody",
  supermarket: "obchody",
  grocery_or_supermarket: "obchody",
  shopping_mall: "obchody",
  department_store: "obchody",
  clothing_store: "obchody",
  convenience_store: "obchody",
  hardware_store: "obchody",
  home_goods_store: "obchody",
  electronics_store: "obchody",
  book_store: "obchody",
  pet_store: "obchody",
  florist: "obchody",
  furniture_store: "obchody",
  shoe_store: "obchody",
  bicycle_store: "obchody",
  jewelry_store: "obchody",
  home_improvement_store: "obchody",
  discount_store: "obchody",
  drugstore: "obchody",
  // Zdraví
  pharmacy: "zdravi",
  doctor: "zdravi",
  dentist: "zdravi",
  hospital: "zdravi",
  physiotherapist: "zdravi",
  veterinary_care: "zdravi",
  health: "zdravi",
  // Instituce
  school: "instituce",
  primary_school: "instituce",
  secondary_school: "instituce",
  university: "instituce",
  library: "instituce",
  local_government_office: "instituce",
  city_hall: "instituce",
  post_office: "instituce",
  police: "instituce",
  fire_station: "instituce",
  // Provozovny / služby
  bank: "sluzby",
  atm: "sluzby",
  car_repair: "sluzby",
  car_dealer: "sluzby",
  car_wash: "sluzby",
  gas_station: "sluzby",
  laundry: "sluzby",
  locksmith: "sluzby",
  moving_company: "sluzby",
  storage: "sluzby",
  insurance_agency: "sluzby",
  real_estate_agency: "sluzby",
  travel_agency: "sluzby",
  plumber: "sluzby",
  electrician: "sluzby",
  general_contractor: "sluzby",
  roofing_contractor: "sluzby",
  painter: "sluzby",
  gym: "sluzby",
  spa: "sluzby",
  beauty_salon: "sluzby",
  hair_care: "sluzby",
  // Veřejný prostor
  park: "verejny-prostor",
  playground: "verejny-prostor",
  campground: "verejny-prostor",
  stadium: "verejny-prostor",
  tourist_attraction: "verejny-prostor",
  museum: "verejny-prostor",
  church: "verejny-prostor",
  cemetery: "verejny-prostor",
  place_of_worship: "verejny-prostor",
  hindu_temple: "verejny-prostor",
  mosque: "verejny-prostor",
  synagogue: "verejny-prostor",
  lodging: "sluzby",
  rv_park: "verejny-prostor",
  zoo: "verejny-prostor",
  aquarium: "verejny-prostor",
  amusement_park: "verejny-prostor",
  movie_theater: "sluzby",
  bowling_alley: "sluzby",
  casino: "sluzby",
  accounting: "sluzby",
  lawyer: "sluzby",
};

/** Google type → podtyp Provozovny */
const GOOGLE_TYPE_TO_PROVOZOVNA = {
  car_repair: "autoservis",
  car_dealer: "autoservis",
  car_wash: "automycka",
  atm: "bankomat",
  bank: "bankomat",
  locksmith: "klicove",
};

const IGNORED_GOOGLE_TYPES = new Set([
  "point_of_interest",
  "establishment",
  "geocode",
  "political",
  "premise",
  "street_address",
  "route",
  "locality",
  "sublocality",
  "sublocality_level_1",
  "postal_code",
  "plus_code",
  "neighborhood",
]);

const GUIDE_CATEGORY_IDS = new Set([
  "gastro",
  "obchody",
  "sluzby",
  "zdravi",
  "instituce",
  "verejny-prostor",
  "ostatni",
]);

/** Heuristiky podle názvu — Google často vrací jen establishment / POI. */
const NAME_CATEGORY_RULES = [
  {
    category: "sluzby",
    provozovnaType: "autoservis",
    patterns: [
      /\bpneu(servis)?\b/i,
      /\bpneumatik/i,
      /\bautoservis\b/i,
      /\bauto\s*servis\b/i,
      /\bstk\b/i,
      /\bgeometrie\s*kol\b/i,
      /\bpneuservis\b/i,
      /\bcar\s*service\b/i,
      /\btire\b/i,
      /\btyre\b/i,
    ],
  },
  {
    category: "sluzby",
    provozovnaType: "automycka",
    patterns: [/\bmyčka\b/i, /\bmycka\b/i, /\bcar\s*wash\b/i, /\bautomyčka\b/i, /\bautomycka\b/i],
  },
  {
    category: "sluzby",
    provozovnaType: "bankomat",
    patterns: [/\bbankomat\b/i, /\batm\b/i],
  },
  {
    category: "sluzby",
    provozovnaType: "klicove",
    patterns: [/\bklíč/i, /\bklic/i, /\blocksmith\b/i, /\bvýroba\s*klíč/i],
  },
  {
    category: "obchody",
    patterns: [
      /\baction\b/i,
      /\bpenny\b/i,
      /\blidl\b/i,
      /\balbert\b/i,
      /\bkaufland\b/i,
      /\btesco\b/i,
      /\bbilla\b/i,
      /\brossmann\b/i,
      /\bdm drogerie\b/i,
      /\bdrogerie\b/i,
      /\bcoop\b/i,
      /\bpotraviny\b/i,
      /\bobchod\b/i,
      /\bprodejna\b/i,
      /\bsamooobsluha\b/i,
      /\bsamoobsluha\b/i,
      /\bsupermarket\b/i,
      /\bhypermarket\b/i,
      /\bdiskont\b/i,
      /\borion\b/i,
      /\bthe\s*bike\b/i,
      /\bpepco\b/i,
      /\bcyclo\b/i,
      /\bcyklo\b/i,
    ],
  },
  {
    category: "gastro",
    patterns: [
      /\bhospoda\b/i,
      /\brestaurace\b/i,
      /\bkavárna\b/i,
      /\bkavarna\b/i,
      /\bpivnice\b/i,
      /\bbistro\b/i,
      /\bpizza\b/i,
      /\bpizzer/i,
      /\bkebab\b/i,
      /\bd[öo]ner\b/i,
      /\bgyros\b/i,
      /\bburger\b/i,
      /\bsushi\b/i,
      /\bpealo\b/i,
    ],
  },
  {
    category: "sluzby",
    patterns: [
      /\bgym\b/i,
      /\bfitness\b/i,
      /\bfitcentrum\b/i,
      /\bposilovna\b/i,
      /\badams\s*family\b/i,
      /\bkosmetik/i,
      /\bkadeř/i,
      /\bkader/i,
      /\bpedikúr/i,
      /\bmanikúr/i,
      /\bbarber\b/i,
      /\bsalon\b/i,
    ],
  },
  {
    category: "zdravi",
    patterns: [
      /\blékárna\b/i,
      /\blekarna\b/i,
      /\bdr\.?\s*max\b/i,
      /\bbenu\b/i,
      /\bordina/i,
      /\bordinace\b/i,
      /\bstomatolog/i,
      /\bzubn/i,
      /\bzubař/i,
      /\bzubar/i,
      /\bdent(al|ist|ální)?\b/i,
      /\bgynekolog/i,
      /\bortoped/i,
      /\bpraktick(ý|y)\s*lékař/i,
      /\bmudr\b/i,
      /\bmddr\b/i,
      /\blékařsk(ý|y)\s*dům\b/i,
      /\bpoliklinik/i,
      /\bmediclinic\b/i,
    ],
  },
  {
    // Google často nechá hřiště jen jako establishment — kategorie z názvu
    category: "verejny-prostor",
    patterns: [
      /\bhřišt/i,
      /\bhrist/i,
      /\bplayground\b/i,
      /\bdětsk[ée]\s*hři/i,
      /\bsportovišt/i,
      /\bkoupališt/i,
      /\bplovárn/i,
      /\bhřbitov\b/i,
      /\bhrbitov\b/i,
      /\bkostel\b/i,
      /\bkaple\b/i,
      /\bnaučn/i,
      /\brybn[ií]k\b/i,
    ],
  },
];

function matchNameRule(name = "") {
  const n = String(name).trim();
  if (!n) return null;
  for (const rule of NAME_CATEGORY_RULES) {
    if (rule.patterns.some((re) => re.test(n))) {
      return { category: rule.category, provozovnaType: rule.provozovnaType ?? null };
    }
  }
  return null;
}

/** Preferuj konkrétní typy před obecnými (health/food/store). */
const TYPE_PRIORITY = [
  "pharmacy",
  "dentist",
  "doctor",
  "physiotherapist",
  "veterinary_care",
  "hospital",
  "gym",
  "restaurant",
  "meal_takeaway",
  "meal_delivery",
  "cafe",
  "bar",
  "bakery",
  "supermarket",
  "grocery_or_supermarket",
  "bicycle_store",
  "clothing_store",
  "shoe_store",
  "home_goods_store",
  "drugstore",
  "hair_care",
  "beauty_salon",
  "car_repair",
  "car_wash",
  "gas_station",
  "atm",
  "bank",
  "school",
  "park",
  "playground",
];

export function googleTypesToCategory(types = [], name = "") {
  const byName = matchNameRule(name);
  // Název (lékárna, zubař, pizza…) má přednost — Google často vrací jen establishment
  if (byName?.category) {
    return byName.category;
  }

  if (Array.isArray(types) && types.length > 0) {
    for (const t of TYPE_PRIORITY) {
      if (types.includes(t) && GOOGLE_TYPE_TO_CATEGORY[t]) {
        return GOOGLE_TYPE_TO_CATEGORY[t];
      }
    }
    for (const t of types) {
      if (IGNORED_GOOGLE_TYPES.has(t)) continue;
      const mapped = GOOGLE_TYPE_TO_CATEGORY[t];
      if (mapped) return mapped;
    }
  }

  return "ostatni";
}

/** Podtyp Provozovny z Google typů + názvu. */
export function googleTypesToProvozovnaType(types = [], name = "") {
  if (Array.isArray(types)) {
    for (const t of types) {
      const mapped = GOOGLE_TYPE_TO_PROVOZOVNA[t];
      if (mapped) return mapped;
    }
  }
  const byName = matchNameRule(name);
  if (byName?.provozovnaType) return byName.provozovnaType;
  return "ostatni";
}

/** Ověří, že kategorie je platná pro Průvodce. */
export function normalizeGuidePlaceCategory(category) {
  return GUIDE_CATEGORY_IDS.has(category) ? category : "ostatni";
}

/** České popisky Google Place types (tagline pod názvem). */
const GOOGLE_TYPE_CS = {
  cafe: "Kavárna",
  restaurant: "Restaurace",
  bar: "Bar",
  bakery: "Pekařství",
  meal_delivery: "Rozvoz jídla",
  meal_takeaway: "Jídlo s sebou",
  food: "Občerstvení",
  night_club: "Noční klub",
  liquor_store: "Nápoje",
  store: "Obchod",
  supermarket: "Supermarket",
  grocery_or_supermarket: "Potraviny",
  shopping_mall: "Nákupní centrum",
  department_store: "Obchodní dům",
  clothing_store: "Oděvy",
  convenience_store: "Večerka",
  hardware_store: "Železářství",
  home_goods_store: "Bytové potřeby",
  electronics_store: "Elektro",
  book_store: "Knihkupectví",
  pet_store: "Chovatelské potřeby",
  florist: "Květinářství",
  furniture_store: "Nábytek",
  shoe_store: "Obuv",
  bicycle_store: "Cyklo",
  jewelry_store: "Klenotnictví",
  home_improvement_store: "Hobby market",
  discount_store: "Diskont",
  drugstore: "Drogerie",
  pharmacy: "Lékárna",
  doctor: "Lékař",
  dentist: "Zubař",
  hospital: "Nemocnice",
  physiotherapist: "Fyzioterapie",
  veterinary_care: "Veterina",
  health: "Zdraví",
  school: "Škola",
  primary_school: "Základní škola",
  secondary_school: "Střední škola",
  university: "Univerzita",
  library: "Knihovna",
  local_government_office: "Úřad",
  city_hall: "Městský úřad",
  post_office: "Pošta",
  police: "Policie",
  fire_station: "Hasiči",
  bank: "Banka",
  atm: "Bankomat",
  car_repair: "Autoservis",
  car_dealer: "Prodej vozidel",
  car_wash: "Automyčka",
  gas_station: "Čerpací stanice",
  laundry: "Prádelna",
  locksmith: "Klíčová služba",
  moving_company: "Stěhování",
  storage: "Skladování",
  insurance_agency: "Pojišťovna",
  real_estate_agency: "Realitní kancelář",
  travel_agency: "Cestovní kancelář",
  plumber: "Instalatér",
  electrician: "Elektrikář",
  general_contractor: "Stavební firma",
  roofing_contractor: "Pokrývač",
  painter: "Malíř",
  gym: "Fitness",
  spa: "Wellness",
  beauty_salon: "Kosmetika",
  hair_care: "Kadeřnictví",
  park: "Park",
  playground: "Hřiště",
  campground: "Kemp",
  stadium: "Stadion",
  tourist_attraction: "Zajímavé místo",
  museum: "Muzeum",
  church: "Kostel",
  cemetery: "Hřbitov",
  lodging: "Ubytování",
  rv_park: "Autokemp",
  finance: "Finance",
};

const CATEGORY_TAGLINE_CS = {
  gastro: "Gastro",
  obchody: "Obchod",
  sluzby: "Provozovna",
  zdravi: "Zdraví",
  instituce: "Instituce",
  "verejny-prostor": "Veřejný prostor",
  ostatni: "Místo v okolí",
};

/** První použitelný Google typ → český popisek. */
export function googleTypesToCzechTagline(types = [], category = "ostatni") {
  if (Array.isArray(types)) {
    for (const t of types) {
      if (IGNORED_GOOGLE_TYPES.has(t)) continue;
      if (GOOGLE_TYPE_CS[t]) return GOOGLE_TYPE_CS[t];
    }
  }
  return CATEGORY_TAGLINE_CS[category] ?? "Místo v okolí";
}

export function formatGoogleHours(weekdayText = []) {
  if (!weekdayText.length) return null;
  return weekdayText.join(" · ");
}

export async function fetchNearbyPlaces({ lat, lng, radiusM = 1500, type = "", category = "vse" } = {}) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radiusM),
    category: category || "vse",
  });
  if (type) params.set("type", type);
  const res = await fetch(`/api/places/nearby?${params}`);
  if (!res.ok) return { places: [], source: "error" };
  return res.json();
}

export async function fetchPlaceDetails(placeId) {
  const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function searchPlaces({ query, lat, lng }) {
  const params = new URLSearchParams({ q: query });
  if (lat != null) params.set("lat", String(lat));
  if (lng != null) params.set("lng", String(lng));
  const res = await fetch(`/api/places/search?${params}`);
  if (!res.ok) return { places: [] };
  return res.json();
}

/** Normalizace odpovědi serveru na tvar instituce v Průvodci. */
export function googlePlaceToInstitution(place, locationId = "domov") {
  const name = place.name ?? "";
  const types = place.types ?? [];
  const byName = matchNameRule(name);

  let category = normalizeGuidePlaceCategory(googleTypesToCategory(types, name));
  // Název má přednost u jasných provozoven (pneuservis často přijde jako „store“)
  if (byName?.provozovnaType) {
    category = "sluzby";
  } else if (category === "ostatni" && byName) {
    category = byName.category;
  }

  const provozovnaType =
    category === "sluzby"
      ? byName?.provozovnaType || googleTypesToProvozovnaType(types, name)
      : undefined;

  const finalCategory = normalizeGuidePlaceCategory(category);

  return {
    id: `google-${place.placeId}`,
    googlePlaceId: place.placeId,
    isGooglePlace: true,
    name,
    tagline: googleTypesToCzechTagline(types, finalCategory),
    category: finalCategory,
    ...(finalCategory === "sluzby" ? { provozovnaType: provozovnaType ?? "ostatni" } : {}),
    address: place.address ?? place.vicinity ?? "",
    hours: place.openingHours ?? place.hours ?? null,
    weekdayText: place.weekdayText ?? [],
    phone: place.phone ?? null,
    email: place.email ?? null,
    website: place.website ?? null,
    lat: place.lat,
    lng: place.lng,
    mapPos: place.mapPos ?? null,
    locationId,
    distance: place.distance ?? null,
    googleRating: place.rating ?? null,
    googleReviewCount: place.userRatingsTotal ?? 0,
    googleReviews: place.reviews ?? [],
    claimStatus: "unclaimed",
    isVerified: false,
    accountType: "podnik",
  };
}

/** Sloučí stažený detail Places API do objektu místa. */
export function mergeGooglePlaceDetails(place, details) {
  if (!details || !place) return place;
  return {
    ...place,
    name: details.name ?? place.name,
    address: details.address ?? place.address,
    phone: details.phone ?? place.phone,
    email: details.email ?? place.email,
    website: details.website ?? place.website,
    hours: details.openingHours ?? details.hours ?? place.hours,
    weekdayText: details.weekdayText ?? place.weekdayText ?? [],
    googleRating: details.rating ?? place.googleRating,
    googleReviewCount: details.userRatingsTotal ?? place.googleReviewCount,
    googleReviews: details.reviews?.length ? details.reviews : place.googleReviews,
    lat: details.lat ?? place.lat,
    lng: details.lng ?? place.lng,
  };
}
