/**
 * Našeptávání adres pro celou ČR — OpenStreetMap přes server Podplot.
 */

import { municipalitiesMatch } from "./geoFilter.js";

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
    city,
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
    city,
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

export async function fetchAddressSuggestions(query) {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];

  const res = await fetch(`/api/address-search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("Address search failed");
  const data = await res.json();

  if (data.source === "photon" && data.features?.length) {
    return dedupeItems(data.features.map(mapPhotonFeature).filter(Boolean)).slice(0, 8);
  }
  if (data.items?.length) {
    return dedupeItems(data.items.map(mapNominatimItem).filter(Boolean)).slice(0, 8);
  }
  return [];
}

function pickBestGeocodeHit(results, preferredCity = null) {
  const withCoords = (results ?? []).filter((r) => r?.lat != null && (r?.lon != null || r?.lng != null));
  if (!withCoords.length) return null;
  const city = String(preferredCity ?? "").trim();
  if (city) {
    const match = withCoords.find((r) => {
      if (r.city && municipalitiesMatch(r.city, city)) return true;
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

  const search = (query) => {
    lastQuery = query;
    clearTimeout(timer);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      onResults([]);
      onLoading(false);
      return;
    }

    onLoading(true);
    onError(null);

    timer = setTimeout(async () => {
      const id = ++requestId;
      const q = query;
      try {
        const results = await fetchAddressSuggestions(q);
        if (id !== requestId || q !== lastQuery) return;
        onResults(results);
        onError(null);
      } catch {
        if (id !== requestId) return;
        onResults([]);
        onError("Adresy se nepodařilo načíst. Zkontrolujte internet nebo adresu doplňte ručně.");
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
  "Našeptávání adres pro celou Českou republiku — začněte psát ulici a obec (min. 3 znaky).";

export { MIN_QUERY_LENGTH, DEBOUNCE_MS };
