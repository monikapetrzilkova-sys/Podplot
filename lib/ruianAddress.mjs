/** České adresy z RÚIAN (ČÚZK GeocodeSOE) — ulice a čísla popisná v obci. */

const RUIAN_SUGGEST =
  "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/MapServer/exts/GeocodeSOE/findAddressCandidates";
const RUIAN_MAP = "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/MapServer";
const UA = "Podplot/1.0 (https://podplot.vercel.app)";
const obecCodeCache = new Map();
const streetListCache = new Map();
const houseListCache = new Map();

export function ruianCityQueryName(city) {
  return String(city ?? "")
    .split(/[—–]/)[0]
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** „Jesenice u Prahy“ → i „Jesenice“; „Kostelec u Křížků“ necháme (oficiální název). */
export function ruianCityQueryVariants(city) {
  const base = ruianCityQueryName(city);
  if (!base) return [];
  const variants = [base];
  const disambiguated = base.replace(/\s+u\s+(Prahy|Brna)$/iu, "").trim();
  if (disambiguated && disambiguated !== base) variants.push(disambiguated);
  return variants;
}

/** „Platanová 1568“ / „Budějovická 477/34“ → ulice + č.p.; „5. května“ zůstane ulicí. */
export function parseStreetAndHouseNumber(value) {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(.*?)(?:\s+)(\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?)?)$/u);
  if (!match || !match[1].trim()) return { street: raw, houseNumber: "" };
  return { street: match[1].trim(), houseNumber: match[2] };
}

export function formatPscDigits(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return digits;
}

/** Pražská 21, Osnice, 25242 Jesenice | Budějovická 477/34, Krč, 14000 Praha 4 | Pražská, Jesenice */
export function parseRuianAddressText(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;

  const withNumber = raw.match(
    /^(.+?)\s+(?:č\.?\s*ev\.?\s*)?(\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?)?),\s*(?:([^,]+),\s*)?(\d{5})\s+(.+)$/u
  );
  if (withNumber) {
    return {
      street: withNumber[1].trim(),
      houseNumber: withNumber[2].trim(),
      suburb: (withNumber[3] || "").trim(),
      psc: formatPscDigits(withNumber[4]),
      city: withNumber[5].trim(),
    };
  }

  const streetOnly = raw.match(/^(.+?),\s+(.+)$/u);
  if (streetOnly) {
    return {
      street: streetOnly[1].trim(),
      houseNumber: "",
      suburb: "",
      psc: "",
      city: streetOnly[2].trim(),
    };
  }

  return { street: raw, houseNumber: "", suburb: "", psc: "", city: "" };
}

export function buildRuianQueryStrings({ street = "", houseNumber = "", city = "", psc = "" } = {}) {
  const parsed = parseStreetAndHouseNumber(street);
  const st = parsed.street;
  const hn = String(houseNumber ?? "").trim() || parsed.houseNumber;
  const cityNames = ruianCityQueryVariants(city);
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const queries = [];

  if (!st) return queries;

  if (hn) {
    for (const cityName of cityNames) {
      queries.push(`${st} ${hn}, ${cityName}`);
      if (pscDigits.length === 5) queries.push(`${st} ${hn}, ${pscDigits} ${cityName}`);
    }
    if (pscDigits.length === 5) queries.push(`${st} ${hn}, ${pscDigits}`);
  } else {
    for (const cityName of cityNames) {
      queries.push(`${st}, ${cityName}`);
      if (pscDigits.length === 5) queries.push(`${st}, ${pscDigits} ${cityName}`);
    }
    if (pscDigits.length === 5) queries.push(`${st}, ${pscDigits}`);
  }

  return [...new Set(queries.filter((q) => q.replace(/\s/g, "").length >= 2))];
}

function stripDiacritics(value) {
  return String(value ?? "")
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function streetMatchesPrefix(street, prefix) {
  const p = stripDiacritics(prefix).trim();
  if (!p) return true;
  return stripDiacritics(street).startsWith(p);
}

function haversineKm(a, b) {
  if (a?.lat == null || b?.lat == null || a?.lng == null || b?.lng == null) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function mapCandidate(candidate, index) {
  const text = candidate?.address || candidate?.attributes?.Match_addr || "";
  const type = candidate?.attributes?.Type || "";
  if (type && type !== "Ulice" && type !== "AdresniMisto") return null;
  const parsed = parseRuianAddressText(text);
  if (!parsed?.street) return null;
  const loc = candidate?.location || {};
  const item = {
    id: `ruian-${type || "x"}-${index}-${text}`,
    street: parsed.street,
    houseNumber: parsed.houseNumber,
    psc: parsed.psc,
    city: parsed.city,
    suburb: parsed.suburb,
    label: text,
    formatted: parsed.houseNumber
      ? `${parsed.street} ${parsed.houseNumber}, ${parsed.psc} ${parsed.city}`.replace(/\s+/g, " ").trim()
      : `${parsed.street}, ${parsed.city}`,
    lat: loc.y != null ? Number(loc.y) : null,
    lon: loc.x != null ? Number(loc.x) : null,
    source: "ruian",
    kind: type === "AdresniMisto" ? "house" : "street",
  };
  return item;
}

async function fetchRuian(params) {
  const url = new URL(RUIAN_SUGGEST);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  const focused = Boolean(params.House) || /\s\d/.test(params.SingleLine || "");
  url.searchParams.set("maxLocations", focused ? "10" : "20");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("f", "json");
  const res = await fetch(url, {
    headers: typeof window === "undefined" ? { Accept: "application/json", "User-Agent": UA } : { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("RÚIAN search failed");
  const data = await res.json();
  return Array.isArray(data?.candidates) ? data.candidates : [];
}

async function fetchCandidates(singleLine) {
  return fetchRuian({ SingleLine: singleLine });
}

export function escapeRuianSql(value) {
  return String(value ?? "").replace(/'/g, "''");
}

async function queryRuianLayer(layerId, { where, outFields, returnGeometry = false, orderBy = "", resultRecordCount = 1000 } = {}) {
  const features = [];
  let offset = 0;
  for (let page = 0; page < 5; page += 1) {
    const url = new URL(`${RUIAN_MAP}/${layerId}/query`);
    url.searchParams.set("where", where);
    url.searchParams.set("outFields", outFields);
    url.searchParams.set("returnGeometry", returnGeometry ? "true" : "false");
    if (returnGeometry) url.searchParams.set("outSR", "4326");
    if (orderBy) url.searchParams.set("orderByFields", orderBy);
    url.searchParams.set("resultRecordCount", String(resultRecordCount));
    url.searchParams.set("resultOffset", String(offset));
    url.searchParams.set("f", "json");
    const res = await fetch(url, {
      headers: typeof window === "undefined" ? { Accept: "application/json", "User-Agent": UA } : { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("RÚIAN layer query failed");
    const data = await res.json();
    const batch = Array.isArray(data?.features) ? data.features : [];
    features.push(...batch);
    if (!data?.exceededTransferLimit || batch.length === 0) break;
    offset += batch.length;
  }
  return features;
}

async function resolveObecFromPsc(cityNames, pscDigits) {
  const like = cityNames.map((name) => `adresa LIKE '%${escapeRuianSql(name)}%'`).join(" OR ");
  const features = await queryRuianLayer(1, {
    where: `psc=${pscDigits}${like ? ` AND (${like})` : ""}`,
    outFields: "ulice",
    resultRecordCount: 1,
  });
  const uliceKod = features[0]?.attributes?.ulice;
  if (!uliceKod) return null;
  const streets = await queryRuianLayer(4, {
    where: `kod=${Number(uliceKod)}`,
    outFields: "obec",
    resultRecordCount: 1,
  });
  return streets[0]?.attributes?.obec ?? null;
}

async function findObecCodes(city, psc) {
  const names = ruianCityQueryVariants(city);
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const cacheKey = `${names.join("|").toLocaleLowerCase("cs")}|${pscDigits}`;
  if (obecCodeCache.has(cacheKey)) return obecCodeCache.get(cacheKey);
  const codes = new Set();
  await Promise.all(
    names.map(async (name) => {
      try {
        const features = await queryRuianLayer(12, {
          where: `nazev='${escapeRuianSql(name)}'`,
          outFields: "kod,nazev",
          resultRecordCount: 20,
        });
        features.forEach((f) => {
          if (f?.attributes?.kod) codes.add(f.attributes.kod);
        });
      } catch {
        /* obec se nepodařilo dohledat */
      }
    })
  );
  let list = [...codes];
  if (pscDigits.length === 5 && list.length !== 1) {
    try {
      const resolved = await resolveObecFromPsc(names, pscDigits);
      if (resolved && (!list.length || list.includes(resolved))) list = [resolved];
    } catch {
      /* PSČ obec nerozlišilo */
    }
  }
  obecCodeCache.set(cacheKey, list);
  return list;
}

function mapStreetFeature(feature) {
  const a = feature?.attributes || {};
  if (!a.nazev || !a.kod) return null;
  const city = String(a.ulice ?? "")
    .split(",")
    .slice(1)
    .join(",")
    .trim();
  return {
    kod: a.kod,
    nazev: a.nazev,
    obec: a.obec,
    city,
    label: a.ulice || a.nazev,
  };
}

async function loadStreetsForCity(city, psc) {
  const obce = await findObecCodes(city, psc);
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const cacheKey = `${obce.length ? obce.slice().sort().join(",") : `name:${city}`}|${pscDigits}`;
  if (streetListCache.has(cacheKey)) return streetListCache.get(cacheKey);

  let streets = [];
  try {
    if (obce.length) {
      const where = obce.map((kod) => `obec=${Number(kod)}`).join(" OR ");
      const features = await queryRuianLayer(4, {
        where,
        outFields: "kod,nazev,obec,ulice",
        resultRecordCount: 2000,
      });
      streets = features.map(mapStreetFeature).filter(Boolean);
    }
    if (!streets.length) {
      const names = ruianCityQueryVariants(city);
      const cityClause = names.map((name) => `ulice LIKE '%, ${escapeRuianSql(name)}'`).join(" OR ");
      const features = await queryRuianLayer(4, {
        where: cityClause || "1=0",
        outFields: "kod,nazev,obec,ulice",
        resultRecordCount: 2000,
      });
      streets = features.map(mapStreetFeature).filter(Boolean);
    }
  } catch {
    streets = [];
  }
  streetListCache.set(cacheKey, streets);
  return streets;
}

function mapHouseFeature(feature, streetName, cityHint) {
  const a = feature?.attributes || {};
  const parsed = parseRuianAddressText(a.adresa);
  const houseNumber = parsed?.houseNumber || String(a.cislodomovni ?? "");
  if (!houseNumber) return null;
  const street = parsed?.street || streetName;
  const city = parsed?.city || cityHint || "";
  const psc = parsed?.psc || formatPscDigits(a.psc);
  const loc = feature?.geometry || {};
  return {
    id: `ruian-am-${a.kod || `${street}-${houseNumber}`}`,
    street,
    houseNumber,
    psc,
    city,
    suburb: parsed?.suburb || "",
    label: a.adresa || `${street} ${houseNumber}`,
    formatted: `${street} ${houseNumber}, ${psc} ${city}`.replace(/\s+/g, " ").trim(),
    lat: loc.y != null ? Number(loc.y) : null,
    lon: loc.x != null ? Number(loc.x) : null,
    source: "ruian",
    kind: "house",
  };
}

async function loadHousesForStreet(streetKod, psc, streetName, cityHint) {
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const cacheKey = `${streetKod}:${pscDigits}`;
  if (houseListCache.has(cacheKey)) return houseListCache.get(cacheKey);
  let where = `ulice=${Number(streetKod)}`;
  if (pscDigits.length === 5) where += ` AND psc=${pscDigits}`;
  const features = await queryRuianLayer(1, {
    where,
    outFields: "adresa,cislodomovni,cisloorientacni,cisloorientacnipismeno,psc,kod",
    returnGeometry: true,
    orderBy: "cislodomovni",
    resultRecordCount: 1000,
  });
  const items = features.map((f) => mapHouseFeature(f, streetName, cityHint)).filter(Boolean);
  houseListCache.set(cacheKey, items);
  return items;
}

function streetItemFromMatch(street, psc) {
  return {
    id: `ruian-ulice-${street.kod}`,
    street: street.nazev,
    houseNumber: "",
    psc: formatPscDigits(psc),
    city: street.city,
    suburb: "",
    label: street.label,
    formatted: street.city ? `${street.nazev}, ${street.city}` : street.nazev,
    lat: null,
    lon: null,
    source: "ruian",
    kind: "street",
  };
}

function sortRuianItems(items) {
  return items.slice().sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "street" ? -1 : 1;
    const as = a.street.localeCompare(b.street, "cs");
    if (as !== 0) return as;
    return String(a.houseNumber).localeCompare(String(b.houseNumber), "cs", { numeric: true });
  });
}

async function searchRuianCatalog({ street, houseNumber, city, psc }) {
  const prefix = String(street ?? "").trim();
  if (!prefix || !String(city ?? "").trim()) return [];
  const streets = await loadStreetsForCity(city, psc);
  const matching = streets.filter((s) => streetMatchesPrefix(s.nazev, prefix));
  if (!matching.length) return [];

  const exact = matching.filter((s) => stripDiacritics(s.nazev) === stripDiacritics(prefix));
  const chosen = exact.length ? exact : matching.length === 1 ? matching : [];
  const hn = String(houseNumber ?? "").trim();

  if (!chosen.length) {
    return matching.slice(0, 20).map((s) => streetItemFromMatch(s, psc));
  }

  const houseLists = await Promise.all(
    chosen.slice(0, 3).map(async (s) => {
      try {
        return await loadHousesForStreet(s.kod, psc, s.nazev, s.city);
      } catch {
        return [];
      }
    })
  );
  const houses = houseLists.flat();
  if (hn) {
    const filtered = houses.filter((item) => {
      const c = String(item.houseNumber).toLocaleLowerCase("cs");
      const f = hn.toLocaleLowerCase("cs");
      return c === f || c.startsWith(f);
    });
    return filtered.length ? filtered : houses;
  }
  if (houses.length) return houses;
  return chosen.map((s) => streetItemFromMatch(s, psc));
}

async function searchRuianGeocode({ street: st, houseNumber: hn, city, psc, center }) {
  const queries = buildRuianQueryStrings({ street: st, houseNumber: hn, city, psc });
  if (!queries.length) return [];

  const seen = new Set();
  const items = [];
  const structured = hn
    ? ruianCityQueryVariants(city).map((cityName) => ({
        Street: st,
        House: hn,
        City: cityName,
        ZIP: String(psc ?? "").replace(/\D/g, ""),
      }))
    : [];
  const batches = await Promise.all([
    ...queries.map(async (q) => {
      try {
        return { q, candidates: await fetchCandidates(q) };
      } catch {
        return { q, candidates: [] };
      }
    }),
    ...structured.map(async (params) => {
      try {
        return { q: `structured:${params.Street} ${params.House}`, candidates: await fetchRuian(params) };
      } catch {
        return { q: "structured", candidates: [] };
      }
    }),
  ]);
  for (const { q, candidates } of batches) {
    candidates.forEach((candidate, index) => {
      const item = mapCandidate(candidate, `${q}-${index}`);
      if (!item) return;
      const key = item.formatted || item.label;
      if (seen.has(key)) return;
      seen.add(key);
      items.push(item);
    });
  }

  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const cityName = ruianCityQueryName(city).toLocaleLowerCase("cs");
  const prefix = st;
  const hnNorm = hn.toLocaleLowerCase("cs");

  const filtered = items.filter((item) => {
    if (!streetMatchesPrefix(item.street, prefix)) return false;
    const itemPsc = String(item.psc ?? "").replace(/\D/g, "");
    if (pscDigits.length === 5 && itemPsc && itemPsc !== pscDigits) return false;
    if (cityName && item.city) {
      const itemCity = ruianCityQueryName(item.city).toLocaleLowerCase("cs");
      if (item.kind === "street" && itemCity && itemCity !== cityName && !itemCity.includes(cityName) && !cityName.includes(itemCity)) {
        return false;
      }
    }
    if (!hn && center && item.lat != null && item.lon != null) {
      const km = haversineKm(center, { lat: item.lat, lng: item.lon });
      if (km != null && km > 12) return false;
    }
    return true;
  });

  const exact = hnNorm
    ? filtered.filter((item) => String(item.houseNumber).toLocaleLowerCase("cs") === hnNorm)
    : [];
  return exact.length ? exact : filtered;
}

export async function searchRuianAddresses({ street = "", houseNumber = "", city = "", psc = "", center = null } = {}) {
  const parsed = parseStreetAndHouseNumber(street);
  const st = parsed.street;
  const hn = String(houseNumber ?? "").trim() || parsed.houseNumber;
  if (!st) return { source: "ruian", items: [] };

  let catalogItems = [];
  try {
    catalogItems = await searchRuianCatalog({ street: st, houseNumber: hn, city, psc });
  } catch {
    catalogItems = [];
  }

  if (catalogItems.length) {
    return { source: "ruian", items: sortRuianItems(catalogItems).slice(0, 250) };
  }

  const ranked = sortRuianItems(await searchRuianGeocode({ street: st, houseNumber: hn, city, psc, center }));
  return { source: "ruian", items: ranked.slice(0, 12) };
}
