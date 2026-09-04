/**
 * Našeptávání adres pro celou ČR — OpenStreetMap přes server Podplot.
 */

import { officialMunicipalityMatch } from "./geoFilter.js";
import { refineLocalityFromPsc } from "./czechCityDistricts.js";
import { searchRuianAddresses, splitStreetAndHouseNumber } from "../../lib/ruianAddress.mjs";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 450;

function formatPsc(postcode) {
  if (!postcode) return "";
  const digits = String(postcode).replace(/\D/g, "");
  if (digits.length === 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return postcode;
}

function cityFromProps(p) {
  return p.city || p.town || p.village || p.municipality || p.county || p.state || "";
}

function streetFromProps(p) {
  return p.street || p.name || p.locality || "";
}

export function formatSuggestionAddress(item) {
  if (item.formatted) return item.formatted;
  const street = item.street || "";
  const num = item.houseNumber || "";
  const psc = formatPsc(item.psc);
  const city = item.city || "";
  if (street && num && psc && city) return `${street} ${num}, ${psc} ${city}`;
  if (street && psc && city) return `${street}, ${psc} ${city}`;
  if (item.label) return item.label;
  return "";
}

function mapPhotonFeature(f) {
  const p = f.properties || {};
  if (p.countrycode && p.countrycode !== "CZ") return null;
  const street = streetFromProps(p);
  const city = cityFromProps(p);
  const psc = formatPsc(p.postcode);
  const houseNumber = p.housenumber || "";
  const lat = f.geometry?.coordinates?.[1];
  const lon = f.geometry?.coordinates?.[0];

  const item = {
    id: `photon-${p.osm_id || lat}-${lon}`,
    street,
    houseNumber,
    psc,
    city: refineLocalityFromPsc(psc, city),
    label: [street, houseNumber, city].filter(Boolean).join(" ") + (psc ? ` · ${psc}` : ""),
    lat,
    lon,
    source: "photon",
  };
  item.formatted = formatSuggestionAddress(item);
  if (!item.formatted && !item.label) return null;
  return item;
}

function mapNominatimItem(item) {
  const a = item.address || {};
  const street = a.road || a.pedestrian || a.residential || a.footway || a.path || item.name || "";
  const city = a.city || a.town || a.village || a.municipality || a.suburb || "";
  const psc = formatPsc(a.postcode);
  const houseNumber = a.house_number || "";

  const mapped = {
    id: `nominatim-${item.place_id}`,
    street,
    houseNumber,
    psc,
    city: refineLocalityFromPsc(psc, city),
    label: item.display_name?.split(",").slice(0, 3).join(",").trim() || street,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    source: "nominatim",
  };
  mapped.formatted = formatSuggestionAddress(mapped);
  if (!mapped.street && !mapped.city) return null;
  return mapped;
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.formatted || item.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeHouseNumber(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("cs")
    .replace(/\s+/g, "");
}

/** 12 sedí na 12, 12a, 12/1; 12a jen na 12a; 12 nesedí na 120. */
export function houseNumberMatches(candidate, filter) {
  const c = normalizeHouseNumber(candidate);
  const f = normalizeHouseNumber(filter);
  if (!f) return true;
  if (!c) return false;
  if (c === f) return true;
  const fCore = f.match(/^(\d+)/)?.[1];
  const cCore = c.match(/^(\d+)/)?.[1];
  if (!fCore || cCore !== fCore) return false;
  if (f === fCore) return true;
  return c.startsWith(f);
}

export function buildAddressSearchQuery({ street = "", houseNumber = "", city = "", psc = "" } = {}) {
  return [street, houseNumber, psc, city]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canSearchAddress(parts = {}) {
  const pscOk = String(parts.psc ?? "").replace(/\D/g, "").length === 5;
  const cityOk = String(parts.city ?? "").trim().length >= 2;
  if (!pscOk && !cityOk) return false;
  const street = String(parts.street ?? "").trim();
  return street.length >= 1;
}

export function rankAddressSuggestions(items, houseNumber) {
  const list = items ?? [];
  const filter = normalizeHouseNumber(houseNumber);
  if (!filter) return list;
  const matched = [];
  const rest = [];
  for (const item of list) {
    if (houseNumberMatches(item.houseNumber, filter)) matched.push(item);
    else rest.push(item);
  }
  matched.sort((a, b) => {
    const ae = normalizeHouseNumber(a.houseNumber) === filter ? 0 : 1;
    const be = normalizeHouseNumber(b.houseNumber) === filter ? 0 : 1;
    return ae - be;
  });
  return matched.length ? matched : rest;
}

export function filterSuggestionsByLocality(items, { psc = "", city = "" } = {}) {
  const list = items ?? [];
  const digits = String(psc ?? "").replace(/\D/g, "");
  const cityTrim = String(city ?? "").split(/[—–]/)[0].trim();
  if (digits.length === 5) {
    const matched = list.filter((item) => {
      const itemPsc = String(item.psc ?? "").replace(/\D/g, "");
      if (itemPsc === digits) return true;
      if (!itemPsc && cityTrim.length >= 2) {
        if (item.city && officialMunicipalityMatch(item.city, cityTrim)) return true;
        const hay = `${item.formatted || ""} ${item.label || ""} ${item.city || ""}`.toLocaleLowerCase("cs");
        return hay.includes(cityTrim.toLocaleLowerCase("cs"));
      }
      return false;
    });
    if (matched.length) return matched;
  }
  if (cityTrim.length >= 2) {
    const needle = cityTrim.toLocaleLowerCase("cs");
    const matched = list.filter((item) => {
      if (item.city && officialMunicipalityMatch(item.city, cityTrim)) return true;
      const hay = `${item.formatted || ""} ${item.label || ""} ${item.city || ""}`.toLocaleLowerCase("cs");
      return hay.includes(needle);
    });
    if (matched.length) return matched;
  }
  return list;
}

export async function fetchAddressSuggestions(
  query,
  { houseNumber, psc, city, street, mode = "streets", streetKod = "" } = {}
) {
  const rawStreet = String(street ?? query ?? "").trim();
  const parsed = splitStreetAndHouseNumber(rawStreet);
  const streetQ = parsed.street || rawStreet;
  const cityQ = String(city ?? "").trim();
  const pscQ = String(psc ?? "").replace(/\D/g, "");
  const hnQ = String(houseNumber ?? "").trim() || parsed.houseNumber;
  const q = String(query ?? "").trim();
  const searchMode = mode === "houses" || parsed.houseNumber ? "houses" : "streets";

  const params = new URLSearchParams();
  if (streetQ && (pscQ.length === 5 || cityQ.length >= 2)) {
    params.set("street", streetQ);
    params.set("mode", searchMode);
    if (cityQ) params.set("city", cityQ);
    if (pscQ) params.set("psc", pscQ);
    if (hnQ) params.set("houseNumber", hnQ);
    if (streetKod) params.set("streetKod", String(streetKod));
  } else {
    if (q.length < MIN_QUERY_LENGTH) return [];
    params.set("q", q);
  }

  let items = [];
  try {
    const res = await fetch(`/api/address-search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.source === "ruian" && data.items?.length) {
        items = dedupeItems(data.items);
      } else if (data.source === "photon" && data.features?.length) {
        items = dedupeItems(data.features.map(mapPhotonFeature).filter(Boolean));
      } else if (data.items?.length) {
        items = dedupeItems(data.items.map(mapNominatimItem).filter(Boolean));
      }
    }
  } catch {
    items = [];
  }

  if (!items.length && streetQ && (pscQ.length === 5 || cityQ.length >= 2)) {
    try {
      const ruian = await searchRuianAddresses({
        street: streetQ,
        houseNumber: hnQ,
        city: cityQ,
        psc: pscQ,
        streetKod,
        mode: searchMode,
      });
      items = dedupeItems(ruian.items || []);
    } catch {
      items = [];
    }
  }

  if (searchMode === "houses") return dedupeItems(items);
  return filterSuggestionsByLocality(rankAddressSuggestions(items, houseNumber), { psc, city });
}

function pickBestGeocodeHit(results, preferredCity = null) {
  const withCoords = (results ?? []).filter((r) => r?.lat != null && (r?.lon != null || r?.lng != null));
  if (!withCoords.length) return null;
  const city = String(preferredCity ?? "").trim();
  if (city) {
    const match = withCoords.find((r) => {
      if (r.city && officialMunicipalityMatch(r.city, city)) return true;
      const label = `${r.formatted || ""} ${r.label || ""}`.toLowerCase();
      return label.includes(city.toLowerCase());
    });
    if (match) return match;
  }
  return withCoords[0];
}

/**
 * Geokóduje českou adresu / obec. Nikdy nevrací Jesenici „naslepo“.
 * @returns {{ lat: number, lng: number, city?: string } | null}
 */
export async function geocodeCzechAddress({
  street = "",
  houseNumber = "",
  psc = "",
  city = "",
  fullAddress = "",
} = {}) {
  const cityTrim = String(city || "").trim();
  const pscTrim = String(psc || "").replace(/\s/g, "");
  const queries = [
    String(fullAddress || "").trim(),
    `${street} ${houseNumber}, ${pscTrim} ${cityTrim}`.replace(/\s+/g, " ").trim(),
    `${street} ${houseNumber}, ${cityTrim}`.replace(/\s+/g, " ").trim(),
    `${pscTrim} ${cityTrim}`.trim(),
    cityTrim ? `${cityTrim}, Česko` : "",
    cityTrim,
  ].filter((q) => q && q.replace(/\s/g, "").length >= 3);

  const seen = new Set();
  for (const query of queries) {
    const key = query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const results = await fetchAddressSuggestions(query);
      const hit = pickBestGeocodeHit(results, cityTrim);
      if (hit?.lat == null) continue;
      const lng = hit.lon ?? hit.lng;
      if (lng == null) continue;
      return {
        lat: Number(hit.lat),
        lng: Number(lng),
        city: hit.city || cityTrim || null,
      };
    } catch {
      /* další dotaz */
    }
  }
  return null;
}

export function createAddressAutocomplete(onResults, onLoading, onError) {
  let timer = null;
  let lastQuery = "";
  let requestId = 0;

  const search = (streetOrQuery, context = {}) => {
    const parts = {
      street: streetOrQuery,
      houseNumber: context.houseNumber ?? "",
      city: context.city ?? "",
      psc: context.psc ?? "",
      mode: context.mode === "houses" ? "houses" : "streets",
      streetKod: context.streetKod ?? "",
    };
    const q = `${parts.mode}|${buildAddressSearchQuery(parts)}|${parts.streetKod}|${parts.houseNumber}`;
    lastQuery = q;
    clearTimeout(timer);

    if (!canSearchAddress(parts)) {
      onResults([]);
      onLoading(false);
      return;
    }

    onLoading(true);
    onError(null);

    timer = setTimeout(async () => {
      const id = ++requestId;
      const query = q;
      try {
        const results = await fetchAddressSuggestions(query, {
          street: parts.street,
          houseNumber: parts.houseNumber,
          psc: parts.psc,
          city: parts.city,
          mode: parts.mode,
          streetKod: parts.streetKod,
        });
        if (id !== requestId || query !== lastQuery) return;
        onResults(results);
        onError(null);
      } catch {
        if (id !== requestId) return;
        onResults([]);
        onError("Adresy se nepodařilo načíst. Zkontroluj internet nebo adresu doplň ručně.");
      } finally {
        if (id === requestId) onLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  const cancel = () => {
    clearTimeout(timer);
    requestId++;
    onLoading(false);
  };

  return { search, cancel };
}

export const ADDRESS_SEARCH_HINT =
  "Napiš název ulice, klidně i s číslem popisným. Po výběru ulice se nabídnou všechna čísla na ní.";

export { MIN_QUERY_LENGTH, DEBOUNCE_MS };
