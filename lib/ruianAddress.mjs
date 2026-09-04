/** České adresy z RÚIAN — ulice a kompletní čísla popisná z vrstev ČÚZK. */

const RUIAN_MAP = "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/MapServer";
const UA = "Podplot/1.0 (https://podplot.vercel.app)";
const LAYER_HOUSE = 1;
const LAYER_STREET = 4;
const LAYER_OBEC = 12;
const MAX_STREETS = 400;
const MAX_HOUSES = 800;
const PAGE = 1000;

const obecByPsc = new Map();
const streetKodCache = new Map();

export function ruianCityQueryName(city) {
  return String(city ?? "")
    .split(/[—–]/)[0]
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatPscDigits(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return digits;
}

export function stripDiacritics(value) {
  return String(value ?? "")
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function streetMatchesPrefix(street, prefix) {
  const p = stripDiacritics(prefix).trim();
  if (!p) return true;
  return stripDiacritics(street).startsWith(p);
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
  const st = String(street ?? "").trim();
  const hn = String(houseNumber ?? "").trim();
  const cityName = ruianCityQueryName(city);
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const queries = [];

  if (!st) return queries;

  if (hn) {
    if (cityName) queries.push(`${st} ${hn}, ${cityName}`);
    if (pscDigits.length === 5 && cityName) queries.push(`${st} ${hn}, ${pscDigits} ${cityName}`);
  } else {
    if (cityName) queries.push(`${st}, ${cityName}`);
    if (pscDigits.length === 5 && cityName) queries.push(`${st}, ${pscDigits} ${cityName}`);
    if (pscDigits.length === 5) queries.push(`${st}, ${pscDigits}`);
  }

  return [...new Set(queries.filter((q) => q.replace(/\s/g, "").length >= 2))];
}

export function formatHouseNumberFromRuian(attrs = {}) {
  const house = attrs.cislodomovni != null ? String(attrs.cislodomovni) : "";
  const ori = attrs.cisloorientacni != null ? String(attrs.cisloorientacni) : "";
  const letter = String(attrs.cisloorientacnipismeno ?? "").trim();
  if (house && ori) return `${house}/${ori}${letter}`;
  return house;
}

export function sqlString(value) {
  return String(value ?? "").replace(/'/g, "''");
}

const CZ_LETTER_VARIANTS = {
  a: "aá",
  c: "cč",
  d: "dď",
  e: "eéě",
  i: "ií",
  n: "nň",
  o: "oó",
  r: "rř",
  s: "sš",
  t: "tť",
  u: "uúů",
  y: "yý",
  z: "zž",
};

/** LIKE vzory pro prefix bez/s diakritikou — Pr → Pr% | Př%. */
export function likePrefixes(prefix) {
  const chars = [...stripDiacritics(prefix).trim()];
  if (!chars.length) return [];
  let combos = [""];
  for (const ch of chars) {
    const vars = CZ_LETTER_VARIANTS[ch] || ch;
    const next = [];
    for (const stem of combos) {
      for (const v of vars) next.push(stem + v);
    }
    combos = next;
    if (combos.length > 48) break;
  }
  const withCase = combos.flatMap((p) => {
    const lower = `${p}%`;
    const upper = `${p.charAt(0).toLocaleUpperCase("cs")}${p.slice(1)}%`;
    return [lower, upper];
  });
  return [...new Set(withCase)];
}

function fetchHeaders() {
  return typeof window === "undefined"
    ? { Accept: "application/json", "User-Agent": UA }
    : { Accept: "application/json" };
}

async function queryLayer(layer, params) {
  const url = new URL(`${RUIAN_MAP}/${layer}/query`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  url.searchParams.set("f", "json");
  const res = await fetch(url, {
    headers: fetchHeaders(),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error("RÚIAN layer query failed");
  const data = await res.json();
  if (data?.error) throw new Error(data.error.message || "RÚIAN layer error");
  return data;
}

async function queryFeatures(layer, params, limit) {
  const features = [];
  let offset = 0;
  while (features.length < limit) {
    const pageSize = Math.min(PAGE, limit - features.length);
    const data = await queryLayer(layer, {
      ...params,
      returnGeometry: params.returnGeometry ?? false,
      resultRecordCount: pageSize,
      resultOffset: offset,
    });
    const batch = data.features || [];
    features.push(...batch);
    if (!batch.length) break;
    if (batch.length < pageSize && !data.exceededTransferLimit) break;
    offset += batch.length;
  }
  return features;
}

async function resolveObecKod(city, psc) {
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  if (pscDigits.length === 5 && obecByPsc.has(pscDigits)) return obecByPsc.get(pscDigits);

  if (pscDigits.length === 5) {
    try {
      const house = await queryLayer(LAYER_HOUSE, {
        where: `psc=${Number(pscDigits)}`,
        outFields: "ulice",
        returnGeometry: false,
        resultRecordCount: 1,
      });
      const streetKod = house.features?.[0]?.attributes?.ulice;
      if (streetKod) {
        const street = await queryLayer(LAYER_STREET, {
          where: `kod=${Number(streetKod)}`,
          outFields: "obec",
          returnGeometry: false,
          resultRecordCount: 1,
        });
        const obec = street.features?.[0]?.attributes?.obec;
        if (obec) {
          obecByPsc.set(pscDigits, obec);
          return obec;
        }
      }
    } catch {
      /* name fallback */
    }
  }

  const cityName = ruianCityQueryName(city);
  if (!cityName) return null;
  const data = await queryLayer(LAYER_OBEC, {
    where: `nazev='${sqlString(cityName)}'`,
    outFields: "kod,nazev",
    returnGeometry: false,
    resultRecordCount: 8,
  });
  const kody = (data.features || []).map((f) => f.attributes?.kod).filter(Boolean);
  if (kody.length === 1) {
    if (pscDigits.length === 5) obecByPsc.set(pscDigits, kody[0]);
    return kody[0];
  }
  return kody[0] ?? null;
}

async function uniqueStreetKodyByPsc(pscDigits) {
  const stats = await queryLayer(LAYER_HOUSE, {
    where: `psc=${Number(pscDigits)}`,
    groupByFieldsForStatistics: "ulice",
    outStatistics: JSON.stringify([
      { statisticType: "count", onStatisticField: "ulice", outStatisticFieldName: "cnt" },
    ]),
    returnGeometry: false,
    resultRecordCount: 2000,
  });
  return [...new Set((stats.features || []).map((f) => f.attributes?.ulice).filter(Boolean))];
}

async function streetsByPsc(pscDigits, prefix) {
  const kody = await uniqueStreetKodyByPsc(pscDigits);
  if (!kody.length) return [];
  const streets = [];
  for (let i = 0; i < kody.length; i += 80) {
    const chunk = kody.slice(i, i + 80).join(",");
    const batch = await queryFeatures(LAYER_STREET, {
      where: `kod IN (${chunk})`,
      outFields: "kod,nazev,obec",
    }, 80);
    streets.push(...batch);
  }
  return streets.filter((f) => streetMatchesPrefix(f.attributes?.nazev, prefix));
}

async function streetsByObec(obecKod, prefix) {
  const likes = likePrefixes(prefix);
  const likeSql = likes.length
    ? likes.map((p) => `nazev LIKE '${sqlString(p)}'`).join(" OR ")
    : "1=1";
  const features = await queryFeatures(
    LAYER_STREET,
    {
      where: `obec=${Number(obecKod)} AND (${likeSql})`,
      outFields: "kod,nazev,obec",
    },
    MAX_STREETS
  );
  return features.filter((f) => streetMatchesPrefix(f.attributes?.nazev, prefix));
}

async function resolveStreetKod({ street, streetKod, obecKod, psc }) {
  const given = Number(streetKod);
  if (Number.isFinite(given) && given > 0) return given;
  const name = String(street ?? "").trim();
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const cacheKey = `${obecKod || ""}|${pscDigits}|${stripDiacritics(name)}`;
  if (streetKodCache.has(cacheKey)) return streetKodCache.get(cacheKey);
  if (!name) return null;

  let kod = null;
  if (obecKod) {
    const exact = await queryLayer(LAYER_STREET, {
      where: `obec=${Number(obecKod)} AND nazev='${sqlString(name)}'`,
      outFields: "kod,nazev",
      returnGeometry: false,
      resultRecordCount: 5,
    });
    kod = exact.features?.[0]?.attributes?.kod ?? null;
  }
  if (!kod && pscDigits.length === 5) {
    const streets = await streetsByPsc(pscDigits, name);
    const exact = streets.find((f) => stripDiacritics(f.attributes?.nazev) === stripDiacritics(name));
    kod = exact?.attributes?.kod ?? streets[0]?.attributes?.kod ?? null;
  }
  if (kod) streetKodCache.set(cacheKey, kod);
  return kod;
}

function mapStreetFeature(feature, city, psc) {
  const attrs = feature?.attributes || {};
  const name = String(attrs.nazev ?? "").trim();
  if (!name) return null;
  const cityName = ruianCityQueryName(city);
  return {
    id: `ruian-street-${attrs.kod}`,
    street: name,
    houseNumber: "",
    psc: formatPscDigits(psc),
    city: cityName,
    streetKod: attrs.kod,
    label: cityName ? `${name}, ${cityName}` : name,
    formatted: cityName ? `${name}, ${cityName}` : name,
    lat: null,
    lon: null,
    source: "ruian",
    kind: "street",
  };
}

function mapHouseFeature(feature, streetName, city) {
  const attrs = feature?.attributes || {};
  const houseNumber = formatHouseNumberFromRuian(attrs);
  if (!houseNumber) return null;
  const parsed = parseRuianAddressText(attrs.adresa);
  const psc = formatPscDigits(attrs.psc ?? parsed?.psc);
  const cityName = parsed?.city || ruianCityQueryName(city);
  const street = parsed?.street || streetName;
  const geom = feature.geometry || {};
  return {
    id: `ruian-house-${attrs.kod}`,
    street,
    houseNumber,
    psc,
    city: cityName,
    suburb: parsed?.suburb || "",
    streetKod: attrs.ulice,
    label: attrs.adresa || `${street} ${houseNumber}`,
    formatted: parsed?.houseNumber
      ? `${street} ${houseNumber}, ${psc} ${cityName}`.replace(/\s+/g, " ").trim()
      : attrs.adresa,
    lat: geom.y != null ? Number(geom.y) : null,
    lon: geom.x != null ? Number(geom.x) : null,
    source: "ruian",
    kind: "house",
  };
}

async function searchStreets({ street, city, psc }) {
  const prefix = String(street ?? "").trim();
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const cityName = ruianCityQueryName(city);
  let features = [];
  if (pscDigits.length === 5) {
    try {
      features = await streetsByPsc(pscDigits, prefix);
    } catch {
      features = [];
    }
  }
  if (!features.length) {
    const obecKod = await resolveObecKod(cityName, pscDigits);
    if (obecKod) features = await streetsByObec(obecKod, prefix);
  }
  const items = features
    .map((f) => mapStreetFeature(f, cityName, pscDigits))
    .filter(Boolean)
    .sort((a, b) => a.street.localeCompare(b.street, "cs"));
  return { source: "ruian", items: items.slice(0, MAX_STREETS) };
}

async function searchHouses({ street, streetKod, houseNumber, city, psc }) {
  const pscDigits = String(psc ?? "").replace(/\D/g, "");
  const cityName = ruianCityQueryName(city);
  const obecKod = await resolveObecKod(cityName, pscDigits);
  const kod = await resolveStreetKod({ street, streetKod, obecKod, psc: pscDigits });
  if (!kod) return { source: "ruian", items: [] };

  const features = await queryFeatures(
    LAYER_HOUSE,
    {
      where: `ulice=${Number(kod)}`,
      outFields: "kod,cislodomovni,cisloorientacni,cisloorientacnipismeno,psc,adresa,ulice",
      returnGeometry: true,
      outSR: 4326,
    },
    MAX_HOUSES
  );

  const hnPrefix = stripDiacritics(houseNumber).replace(/\s/g, "");
  const items = features
    .map((f) => mapHouseFeature(f, street, cityName))
    .filter(Boolean)
    .filter((item) => {
      if (hnPrefix && !stripDiacritics(item.houseNumber).startsWith(hnPrefix)) return false;
      return true;
    })
    .sort((a, b) => String(a.houseNumber).localeCompare(String(b.houseNumber), "cs", { numeric: true }));

  return { source: "ruian", items };
}

export async function searchRuianAddresses({
  street = "",
  houseNumber = "",
  city = "",
  psc = "",
  streetKod = null,
  mode = "streets",
} = {}) {
  const st = String(street ?? "").trim();
  if (!st) return { source: "ruian", items: [] };
  const wantHouses = mode === "houses" || Boolean(String(houseNumber ?? "").trim() && String(streetKod ?? "").trim());
  try {
    if (wantHouses) {
      return await searchHouses({ street: st, streetKod, houseNumber, city, psc });
    }
    return await searchStreets({ street: st, city, psc });
  } catch {
    return { source: "ruian", items: [] };
  }
}
