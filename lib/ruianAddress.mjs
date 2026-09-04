/** České adresy z RÚIAN (ČÚZK GeocodeSOE) — ulice a čísla popisná v obci. */

const RUIAN_SUGGEST =
  "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/MapServer/exts/GeocodeSOE/findAddressCandidates";
const UA = "Podplot/1.0 (https://podplot.vercel.app)";

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

async function fetchCandidates(singleLine) {
  const url = new URL(RUIAN_SUGGEST);
  url.searchParams.set("SingleLine", singleLine);
  url.searchParams.set("maxLocations", "20");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("f", "json");
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("RÚIAN search failed");
  const data = await res.json();
  return Array.isArray(data?.candidates) ? data.candidates : [];
}

export async function searchRuianAddresses({ street = "", houseNumber = "", city = "", psc = "", center = null } = {}) {
  const queries = buildRuianQueryStrings({ street, houseNumber, city, psc });
  if (!queries.length) return { source: "ruian", items: [] };

  const seen = new Set();
  const items = [];
  const batches = await Promise.all(
    queries.map(async (q) => {
      try {
        return { q, candidates: await fetchCandidates(q) };
      } catch {
        return { q, candidates: [] };
      }
    })
  );
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

  const filtered = items.filter((item) => {
    const itemPsc = String(item.psc ?? "").replace(/\D/g, "");
    if (pscDigits.length === 5 && itemPsc && itemPsc !== pscDigits) return false;
    if (cityName && item.city) {
      const itemCity = ruianCityQueryName(item.city).toLocaleLowerCase("cs");
      if (item.kind === "street" && itemCity && itemCity !== cityName && !itemCity.includes(cityName) && !cityName.includes(itemCity)) {
        return false;
      }
    }
    if (center && item.lat != null && item.lon != null) {
      const km = haversineKm(center, { lat: item.lat, lng: item.lon });
      if (km != null && km > 12) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "street" ? -1 : 1;
    const as = a.street.localeCompare(b.street, "cs");
    if (as !== 0) return as;
    return String(a.houseNumber).localeCompare(String(b.houseNumber), "cs", { numeric: true });
  });

  return { source: "ruian", items: filtered.slice(0, 12) };
}
