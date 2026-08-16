/**
 * Sdílený backend pro lokální server.mjs i Vercel serverless API.
 */
export function getGoogleMapsApiKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    ""
  ).trim();
}

function mockNearbyPlaces(lat, lng) {
  const baseLat = Number(lat) || 49.966;
  const baseLng = Number(lng) || 14.512;
  // Přední Lhota / Písková Lhota (chata)
  const nearChata = Math.abs(baseLat - 50.135) < 0.05 && Math.abs(baseLng - 15.09) < 0.08;
  if (nearChata) {
    return [
      {
        placeId: "mock-google-action",
        name: "Action",
        types: ["point_of_interest", "establishment"],
        lat: 50.1328,
        lng: 15.0965,
        address: "Poděbradská 267, Písková Lhota",
        vicinity: "Písková Lhota",
        rating: 4.3,
        userRatingsTotal: 210,
        openingHours: "Po–Ne 9:00–20:00",
        source: "mock",
      },
      {
        placeId: "mock-google-autopneu",
        name: "Auto Pneu",
        types: ["store", "point_of_interest", "establishment"],
        lat: 50.1315,
        lng: 15.094,
        address: "Písková Lhota",
        vicinity: "Písková Lhota",
        rating: 4.1,
        userRatingsTotal: 38,
        openingHours: "Po–Pá 8:00–17:00",
        source: "mock",
      },
      {
        placeId: "mock-google-hospoda",
        name: "Hospoda U Mostu",
        types: ["restaurant", "bar"],
        lat: 50.1352,
        lng: 15.0895,
        address: "Přední Lhota 7",
        vicinity: "Přední Lhota",
        rating: 4.5,
        userRatingsTotal: 62,
        openingHours: "Pá–Ne 12:00–22:00",
        source: "mock",
      },
    ];
  }
  // Jesenice (domov) — reálné řetězce v okolí
  const nearJesenice = Math.abs(baseLat - 49.966) < 0.04 && Math.abs(baseLng - 14.512) < 0.06;
  if (nearJesenice) {
    return [
      {
        placeId: "mock-google-albert",
        name: "Albert",
        types: ["supermarket", "grocery_or_supermarket", "store"],
        lat: 49.96632,
        lng: 14.51789,
        address: "Budějovická 371, Jesenice",
        vicinity: "Jesenice",
        rating: 4.2,
        userRatingsTotal: 890,
        openingHours: "Po–Ne 7:00–22:00",
        source: "mock",
      },
      {
        placeId: "mock-google-penny",
        name: "Penny Market",
        types: ["supermarket", "grocery_or_supermarket", "store"],
        lat: 49.96757,
        lng: 14.51245,
        address: "Zbraslavská 68, Jesenice",
        vicinity: "Jesenice",
        rating: 4.1,
        userRatingsTotal: 620,
        openingHours: "Po–Ne 7:00–21:00",
        source: "mock",
      },
      {
        placeId: "mock-google-lidl",
        name: "Lidl",
        types: ["supermarket", "grocery_or_supermarket", "store"],
        lat: 49.96558,
        lng: 14.51737,
        address: "Budějovická 1143, Jesenice",
        vicinity: "Jesenice",
        rating: 4.3,
        userRatingsTotal: 1100,
        openingHours: "Po–So 7:00–22:00 · Ne 8:00–22:00",
        source: "mock",
      },
      {
        placeId: "mock-google-kavarna",
        name: "Kavárna Na Plotě",
        types: ["cafe"],
        lat: baseLat + 0.004,
        lng: baseLng + 0.002,
        address: "Jesenice",
        vicinity: "Jesenice",
        rating: 4.6,
        userRatingsTotal: 84,
        openingHours: "Po–Pá 7:00–18:00 · So 8:00–12:00",
        source: "mock",
      },
      {
        placeId: "mock-google-autoservis",
        name: "Autoservis Plot",
        types: ["car_repair"],
        lat: baseLat - 0.005,
        lng: baseLng - 0.003,
        address: "Jesenice",
        vicinity: "Jesenice",
        rating: 4.4,
        userRatingsTotal: 27,
        openingHours: null,
        source: "mock",
      },
      {
        placeId: "mock-google-lekarna",
        name: "Lékárna Jesenice",
        types: ["pharmacy"],
        lat: baseLat + 0.002,
        lng: baseLng + 0.007,
        address: "Jesenice",
        vicinity: "Jesenice",
        rating: 4.5,
        userRatingsTotal: 56,
        openingHours: null,
        source: "mock",
      },
      {
        placeId: "mock-google-adams-gym",
        name: "Adams Family Gym",
        types: ["gym", "health", "point_of_interest"],
        lat: 49.9681,
        lng: 14.5142,
        address: "Jesenice",
        vicinity: "Jesenice",
        rating: 4.7,
        userRatingsTotal: 96,
        openingHours: "Po–Pá 6:00–22:00",
        source: "mock",
      },
      {
        placeId: "mock-google-don-pealo",
        name: "Don Pealo",
        types: ["meal_takeaway", "restaurant", "food"],
        lat: 49.9672,
        lng: 14.5158,
        address: "Jesenice",
        vicinity: "Jesenice",
        rating: 4.4,
        userRatingsTotal: 128,
        openingHours: "Po–Ne 10:00–22:00",
        source: "mock",
      },
      {
        placeId: "mock-google-kebab",
        name: "Kebab & Pizza",
        types: ["meal_takeaway", "restaurant"],
        lat: 49.9659,
        lng: 14.5135,
        address: "Jesenice",
        vicinity: "Jesenice",
        rating: 4.2,
        userRatingsTotal: 74,
        openingHours: "Po–Ne 11:00–23:00",
        source: "mock",
      },
    ];
  }
  const offsets = [
    { dLat: 0.004, dLng: 0.002, name: "Kavárna Na Plotě", types: ["cafe"], rating: 4.6, total: 84 },
    { dLat: -0.003, dLng: 0.005, name: "Potraviny U Jesenice", types: ["grocery_or_supermarket"], rating: 4.2, total: 41 },
    { dLat: 0.006, dLng: -0.004, name: "Dětské hřiště Jesenice", types: ["playground"], rating: 4.8, total: 12 },
    { dLat: -0.005, dLng: -0.003, name: "Autoservis Plot", types: ["car_repair"], rating: 4.4, total: 27 },
    { dLat: 0.002, dLng: 0.007, name: "Lékárna Jesenice", types: ["pharmacy"], rating: 4.5, total: 56 },
    { dLat: 0.001, dLng: -0.006, name: "Památný kámen", types: ["point_of_interest", "establishment"], rating: 4.0, total: 3 },
  ];
  return offsets.map((o, i) => ({
    placeId: `mock-google-${i + 1}`,
    name: o.name,
    types: o.types,
    lat: baseLat + o.dLat,
    lng: baseLng + o.dLng,
    address: `${o.name}, Jesenice`,
    vicinity: "Jesenice",
    rating: o.rating,
    userRatingsTotal: o.total,
    openingHours: i === 0 ? "Po–Pá 7:00–18:00 · So 8:00–12:00" : null,
    source: "mock",
  }));
}

function mapGoogleNearbyResult(p) {
  return {
    placeId: p.place_id,
    name: p.name,
    types: p.types ?? [],
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    address: p.vicinity,
    vicinity: p.vicinity,
    rating: p.rating ?? null,
    userRatingsTotal: p.user_ratings_total ?? 0,
    openingHours:
      p.opening_hours?.open_now != null
        ? p.opening_hours.open_now
          ? "Právě otevřeno"
          : "Zavřeno"
        : null,
    source: "google",
  };
}

async function googleNearbyPage(lat, lng, radius, { type = "", keyword = "", pageToken = null } = {}) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("key", getGoogleMapsApiKey());
  url.searchParams.set("language", "cs");
  if (pageToken) {
    url.searchParams.set("pagetoken", pageToken);
  } else {
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(radius));
    if (type) url.searchParams.set("type", type);
    if (keyword) url.searchParams.set("keyword", keyword);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Places nearby failed");
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS" && data.status !== "INVALID_REQUEST") {
    throw new Error(data.error_message || data.status);
  }
  return {
    places: (data.results ?? []).map(mapGoogleNearbyResult),
    nextPageToken: data.next_page_token ?? null,
  };
}

/** Až 3 stránky (≈60 míst) — Google vyžaduje pauzu před pagetoken. */
async function googleNearbyPaginated(lat, lng, radius, { type = "", keyword = "", maxPages = 1 } = {}) {
  const pages = Math.min(3, Math.max(1, maxPages));
  const out = [];
  let token = null;
  for (let i = 0; i < pages; i++) {
    if (i > 0) {
      if (!token) break;
      await sleep(2100);
    }
    let page;
    try {
      page = await googleNearbyPage(lat, lng, radius, { type, keyword, pageToken: token });
    } catch (err) {
      if (i > 0 && /INVALID_REQUEST/i.test(err.message)) {
        await sleep(1500);
        page = await googleNearbyPage(lat, lng, radius, { type, keyword, pageToken: token });
      } else {
        throw err;
      }
    }
    out.push(...page.places);
    token = page.nextPageToken;
    if (!token) break;
  }
  return out;
}

/**
 * Obecné sady pro celou ČR — žádné lokální hardcoded názvy.
 * Při výběru kategorie se tahá hlouběji (více stránek + české klíčové dotazy u středu mapy).
 */
const GUIDE_CATEGORY_FETCH = {
  vse: {
    types: [
      "pharmacy",
      "dentist",
      "doctor",
      "restaurant",
      "meal_takeaway",
      "cafe",
      "supermarket",
      "grocery_or_supermarket",
      "clothing_store",
      "bicycle_store",
      "home_goods_store",
      "drugstore",
      "gym",
      "hair_care",
      "car_repair",
      "gas_station",
      "park",
      "school",
      "post_office",
    ],
    textQueries: [],
    pages: 1,
  },
  zdravi: {
    types: ["dentist", "doctor", "pharmacy", "physiotherapist", "veterinary_care", "hospital"],
    // Obecné české dotazy u GPS středu — fungují v Brně, Ostravě i Jesenici
    textQueries: ["zubní ordinace", "stomatologie", "lékárna", "praktický lékař", "lékařský dům", "gynekologie"],
    pages: 2,
    deepTypes: ["dentist", "doctor"], // u těchto ještě 3. stránka (méně prominentní ordinace)
  },
  gastro: {
    types: ["restaurant", "meal_takeaway", "cafe", "bar", "bakery"],
    textQueries: ["restaurace", "sushi", "pizza", "kebab", "bistro", "kavárna"],
    pages: 2,
    deepTypes: ["restaurant", "meal_takeaway"],
  },
  obchody: {
    types: [
      "supermarket",
      "grocery_or_supermarket",
      "clothing_store",
      "shoe_store",
      "bicycle_store",
      "home_goods_store",
      "furniture_store",
      "electronics_store",
      "drugstore",
      "hardware_store",
      "store",
    ],
    textQueries: ["obchod s potravinami", "drogerie", "oblečení"],
    pages: 2,
    deepTypes: [],
  },
  sluzby: {
    types: ["gym", "hair_care", "beauty_salon", "car_repair", "car_wash", "gas_station", "locksmith", "atm", "bank", "laundry"],
    textQueries: ["autoservis", "kadeřnictví", "fitness"],
    pages: 2,
    deepTypes: [],
  },
  instituce: {
    types: ["school", "post_office", "local_government_office", "police", "fire_station", "library", "city_hall"],
    textQueries: ["obecní úřad", "pošta", "základní škola"],
    pages: 2,
    deepTypes: [],
  },
  "verejny-prostor": {
    // Pozor: Nearby type=playground u Google Legacy vrací nesmysly (obchody…) — nepoužívat
    types: ["park", "stadium", "tourist_attraction", "church", "cemetery", "campground"],
    keywords: ["dětské hřiště", "hřiště"],
    textQueries: ["dětské hřiště", "veřejný park", "hřbitov"],
    pages: 2,
    deepTypes: [],
    onlyPublicSpace: true,
  },
};

const NEARBY_CACHE = new Map();
const NEARBY_CACHE_TTL_MS = 5 * 60 * 1000;
const NEARBY_CACHE_VERSION = 7;

const SKIP_NEARBY_TYPES = new Set([
  "locality",
  "political",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "country",
  "route",
  "postal_code",
  "plus_code",
]);

/** Názvy bez užitečného Google type (typicky jen establishment) — např. „Dětské hřiště - Platanová“. */
const GUIDE_NAME_HINT_RE =
  /hřišt|hrist|dětsk[ée]\s*hři|playground|park\b|hřbitov|hrbitov|kostel|kaple|naučn|stezka|rybník|rybnik|vodopád|vodopad|\bles\b|louka|zahrad|sportovišt|koupališt|plovárn/i;

const PUBLIC_SPACE_TYPES = new Set([
  "park",
  "playground",
  "stadium",
  "tourist_attraction",
  "church",
  "cemetery",
  "campground",
  "rv_park",
  "place_of_worship",
]);

function isPublicSpacePlace(p) {
  const types = p.types ?? [];
  if (types.some((t) => PUBLIC_SPACE_TYPES.has(t))) return true;
  return GUIDE_NAME_HINT_RE.test(p.name ?? "");
}

function isUsefulGuidePlace(p) {
  if (!(p.placeId && p.name && p.lat != null && p.lng != null)) return false;
  // Hřiště/parky často nemají typ playground — jen establishment
  if (GUIDE_NAME_HINT_RE.test(p.name)) return true;
  const types = p.types ?? [];
  if (types.some((t) => SKIP_NEARBY_TYPES.has(t)) && !types.some((t) => !SKIP_NEARBY_TYPES.has(t) && t !== "point_of_interest" && t !== "establishment")) {
    return false;
  }
  if (types.every((t) => SKIP_NEARBY_TYPES.has(t) || t === "point_of_interest" || t === "establishment")) {
    return false;
  }
  return true;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Vzdálenost v metrech (haversine) — Text Search má jen bias, ne tvrdý radius. */
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function withinRadius(place, lat, lng, radiusM) {
  if (place.lat == null || place.lng == null) return false;
  return distanceMeters(Number(lat), Number(lng), place.lat, place.lng) <= radiusM;
}

async function googlePlacesNearby(lat, lng, radius, { type = "", category = "vse" } = {}) {
  if (!getGoogleMapsApiKey()) {
    return { places: mockNearbyPlaces(lat, lng), source: "mock" };
  }

  if (type) {
    const places = (await googleNearbyPaginated(lat, lng, radius, { type, maxPages: 2 })).filter(isUsefulGuidePlace);
    return { places, source: "google", category, count: places.length };
  }

  const cat = GUIDE_CATEGORY_FETCH[category] ? category : "vse";
  const pack = GUIDE_CATEGORY_FETCH[cat];
  const cacheKey = `v${NEARBY_CACHE_VERSION}:${cat}:${Number(lat).toFixed(3)},${Number(lng).toFixed(3)},${radius}`;
  const cached = NEARBY_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < NEARBY_CACHE_TTL_MS) {
    return { places: cached.places, source: "google-cache", category: cat, count: cached.places.length };
  }

  const byId = new Map();
  const addBatch = (batch) => {
    for (const p of batch) {
      if (p.placeId && !byId.has(p.placeId) && isUsefulGuidePlace(p)) {
        byId.set(p.placeId, p);
      }
    }
  };

  const deep = new Set(pack.deepTypes ?? []);
  for (const t of pack.types) {
    const pages = deep.has(t) ? Math.max(pack.pages, 3) : pack.pages;
    try {
      addBatch(await googleNearbyPaginated(lat, lng, radius, { type: t, maxPages: pages }));
    } catch (err) {
      console.warn(`[places] nearby type=${t} failed:`, err.message);
    }
    await sleep(200);
  }

  // Keyword Nearby — důležité u hřišť, která Google neoznačí typem playground
  for (const kw of pack.keywords ?? []) {
    try {
      addBatch(await googleNearbyPaginated(lat, lng, radius, { keyword: kw, maxPages: Math.min(pack.pages, 2) }));
    } catch (err) {
      console.warn(`[places] nearby keyword="${kw}" failed:`, err.message);
    }
    await sleep(200);
  }

  // České klíčové dotazy kolem GPS — fungují v celé ČR; tvrdé oříznutí na radius
  const textRadius = Math.max(Number(radius) || 3500, 3500);
  for (const q of pack.textQueries) {
    try {
      const { places: found } = await googlePlacesTextSearch(q, lat, lng, textRadius);
      addBatch(found.filter((p) => withinRadius(p, lat, lng, textRadius)));
    } catch (err) {
      console.warn(`[places] text search "${q}" failed:`, err.message);
    }
    await sleep(200);
  }

  let places = [...byId.values()];
  if (pack.onlyPublicSpace) {
    places = places.filter(isPublicSpacePlace);
  }
  NEARBY_CACHE.set(cacheKey, { at: Date.now(), places });
  return { places, source: "google", category: cat, count: places.length };
}

async function googlePlaceDetails(placeId) {
  if (placeId.startsWith("mock-google-")) {
    const mock = mockNearbyPlaces(49.966, 14.512).find((p) => p.placeId === placeId);
    return mock
      ? {
          ...mock,
          phone: "+420 123 456 789",
          website: null,
          reviews: [
            { author: "Google uživatel", rating: 5, text: "Skvělé místo v okolí.", time: "2025-06-01" },
          ],
          weekdayText: ["Po–Pá: 7:00–18:00", "So: 8:00–12:00", "Ne: zavřeno"],
        }
      : null;
  }
  if (!getGoogleMapsApiKey()) return null;
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "place_id,name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,reviews,geometry,types,website");
  url.searchParams.set("key", getGoogleMapsApiKey());
  url.searchParams.set("language", "cs");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Place details failed");
  const data = await res.json();
  const p = data.result;
  if (!p) return null;
  return {
    placeId: p.place_id,
    name: p.name,
    types: p.types ?? [],
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    address: p.formatted_address,
    phone: p.formatted_phone_number ?? null,
    website: p.website ?? null,
    rating: p.rating ?? null,
    userRatingsTotal: p.user_ratings_total ?? 0,
    reviews: (p.reviews ?? []).slice(0, 3).map((r) => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description,
    })),
    weekdayText: p.opening_hours?.weekday_text ?? [],
    openingHours: p.opening_hours?.weekday_text?.join(" · ") ?? null,
    source: "google",
  };
}

async function googlePlacesTextSearch(query, lat, lng, radiusM = 5000) {
  if (!getGoogleMapsApiKey()) {
    const q = query.toLowerCase();
    return {
      places: mockNearbyPlaces(lat, lng).filter((p) => p.name.toLowerCase().includes(q)),
      source: "mock",
    };
  }
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", getGoogleMapsApiKey());
  url.searchParams.set("language", "cs");
  url.searchParams.set("region", "cz");
  if (lat && lng) {
    url.searchParams.set("location", `${lat},${lng}`);
    // Google Text Search: location+radius = bias (max 50 km), ne hard filter
    url.searchParams.set("radius", String(Math.min(Math.max(Number(radiusM) || 5000, 1000), 50000)));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Places search failed");
  const data = await res.json();
  const places = (data.results ?? []).map((p) => ({
    placeId: p.place_id,
    name: p.name,
    types: p.types ?? [],
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    address: p.formatted_address ?? p.vicinity,
    rating: p.rating ?? null,
    userRatingsTotal: p.user_ratings_total ?? 0,
    source: "google",
  }));
  return { places, source: "google" };
}

async function proxyAddressSearch(query) {
  const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=cs`;
  try {
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      const cz = (data.features || []).filter((f) => f.properties?.countrycode === "CZ");
      if (cz.length > 0) return { source: "photon", features: cz };
    }
  } catch {
    /* fallback */
  }

  const nomUrl = new URL("https://nominatim.openstreetmap.org/search");
  nomUrl.searchParams.set("q", query);
  nomUrl.searchParams.set("countrycodes", "cz");
  nomUrl.searchParams.set("format", "json");
  nomUrl.searchParams.set("addressdetails", "1");
  nomUrl.searchParams.set("limit", "8");
  nomUrl.searchParams.set("accept-language", "cs");

  const nomRes = await fetch(nomUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Podplot/1.0 (https://podplot.vercel.app)",
    },
  });
  if (!nomRes.ok) throw new Error("Address API failed");
  const items = await nomRes.json();
  return { source: "nominatim", items: Array.isArray(items) ? items : [] };
}

async function lookupPscCity(psc) {
  const nomUrl = new URL("https://nominatim.openstreetmap.org/search");
  nomUrl.searchParams.set("postalcode", psc);
  nomUrl.searchParams.set("country", "cz");
  nomUrl.searchParams.set("format", "json");
  nomUrl.searchParams.set("addressdetails", "1");
  nomUrl.searchParams.set("limit", "1");
  nomUrl.searchParams.set("accept-language", "cs");

  const nomRes = await fetch(nomUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Podplot/1.0 (https://podplot.vercel.app)",
    },
  });
  if (!nomRes.ok) throw new Error("PSC lookup failed");
  const items = await nomRes.json();
  const item = items?.[0];
  if (!item) return null;

  const a = item.address || {};
  const city =
    a.city || a.town || a.village || a.municipality || a.county || item.display_name?.split(",")[0]?.trim();
  const formatted = psc.length === 5 ? `${psc.slice(0, 3)} ${psc.slice(3)}` : psc;
  return { city, psc: formatted };
}

export {
  mockNearbyPlaces,
  googlePlacesNearby,
  googlePlaceDetails,
  googlePlacesTextSearch,
  proxyAddressSearch,
  lookupPscCity,
};
