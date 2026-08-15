/**
 * Našeptávání adres pro celou ČR — OpenStreetMap přes server Podplot.
 */

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
