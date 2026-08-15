import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchNearbyPlaces,
  googlePlaceToInstitution,
  normalizeGuidePlaceCategory,
} from "../data/placesApi.js";
import { institutionMatchesCategory } from "../data/institutionsMapData.js";
import { latLngToMapPos } from "../utils/geoCoordinates.js";
import { DEFAULT_REPORTS_MAP_RADIUS_KM } from "../data/mapRadiusSettings.js";

/** Doplní mapPos z GPS (simulovaná mapa); na Google mapě rozhoduje lat/lng. */
function withMapPos(place, activeLocation) {
  if (place.lat == null || place.lng == null || activeLocation?.lat == null) return place;
  return {
    ...place,
    mapPos: latLngToMapPos(
      place.lat,
      place.lng,
      { lat: activeLocation.lat, lng: activeLocation.lng },
      activeLocation.radiusKm ?? DEFAULT_REPORTS_MAP_RADIUS_KM
    ),
  };
}

/** Známé řetězce — sjednocení klíčů (KiK / Kik Jesenice u Prahy). */
const CHAIN_ALIASES = [
  { key: "kik", re: /\bkik\b/i },
  { key: "albert", re: /\balbert\b/i },
  { key: "lidl", re: /\blidl\b/i },
  { key: "penny", re: /\bpenny\b/i },
  { key: "billa", re: /\bbilla\b/i },
  { key: "orion", re: /\borion\b/i },
  { key: "pepco", re: /\bpepco\b/i },
  { key: "dm", re: /\bdm\b/i },
  { key: "tesco", re: /\btesco\b/i },
  { key: "action", re: /\baction\b/i },
];

function placeNameKey(name = "") {
  const raw = String(name).trim();
  for (const chain of CHAIN_ALIASES) {
    if (chain.re.test(raw)) return chain.key;
  }
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /\b(supermarket|hypermarket|market|prodejna|restaurant|restaurace|jesenice|u prahy|praha)\b/g,
      ""
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function namesMatch(a, b) {
  const ka = placeNameKey(a);
  const kb = placeNameKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  return ka.startsWith(kb) || kb.startsWith(ka) || ka.includes(kb) || kb.includes(ka);
}

function distanceMeters(a, b) {
  if (a?.lat == null || a?.lng == null || b?.lat == null || b?.lng == null) return Infinity;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function placeScore(p) {
  return (Number(p.googleReviewCount) || 0) * 10 + (p.googleRating != null ? 1 : 0) + (p.address ? 1 : 0);
}

/**
 * Sloučí duplicity stejného řetězce / názvu blízko sebe (např. KiK 2× u Nákupní/Cedrové).
 */
export function dedupeNearbyPlaces(places, { maxDistanceM = 180 } = {}) {
  const sorted = [...places].sort((a, b) => placeScore(b) - placeScore(a));
  const kept = [];
  for (const place of sorted) {
    const key = placeNameKey(place.name);
    const dup = kept.find((k) => {
      if (!namesMatch(k.name, place.name) && placeNameKey(k.name) !== key) return false;
      return distanceMeters(k, place) <= maxDistanceM;
    });
    if (!dup) kept.push(place);
  }
  return kept;
}

function mapPlacesPayload(data, activeLocation) {
  return dedupeNearbyPlaces(
    (data.places ?? []).map((p) => {
      const inst = googlePlaceToInstitution(p, activeLocation.id ?? "domov");
      return withMapPos(
        { ...inst, category: normalizeGuidePlaceCategory(inst.category) },
        activeLocation
      );
    })
  );
}

function mergePlaceLists(existing, incoming) {
  const byId = new Map(existing.map((p) => [p.id, p]));
  for (const p of incoming) {
    const prev = byId.get(p.id);
    if (!prev || placeScore(p) >= placeScore(prev)) byId.set(p.id, p);
  }
  return dedupeNearbyPlaces([...byId.values()]);
}

/**
 * Načítání Google Places pro libovolnou lokalitu v ČR:
 * 1) přehled (vše) kolem aktivní lokality
 * 2) při výběru kategorie hlubší fetch (více stránek + české klíčové dotazy)
 * Výsledky se akumulují — žádné hardcoded názvy konkrétních ulic/měst.
 */
export function useGuideGooglePlaces(activeCategory, activeLocation, searchQuery = "") {
  const [allPlaces, setAllPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const loadedCategoriesRef = useRef(new Set());
  const locationKeyRef = useRef("");

  const locationKey = activeLocation?.lat != null
    ? `${activeLocation.id}:${Number(activeLocation.lat).toFixed(3)},${Number(activeLocation.lng).toFixed(3)}`
    : "";

  // Nová lokalita → reset + základní přehled
  useEffect(() => {
    if (!activeLocation?.lat || !activeLocation?.lng) {
      setAllPlaces([]);
      setSource(null);
      loadedCategoriesRef.current = new Set();
      locationKeyRef.current = "";
      return;
    }

    if (locationKeyRef.current !== locationKey) {
      locationKeyRef.current = locationKey;
      loadedCategoriesRef.current = new Set();
      setAllPlaces([]);
    }

    let cancelled = false;
    setLoading(true);

    fetchNearbyPlaces({
      lat: activeLocation.lat,
      lng: activeLocation.lng,
      radiusM: 3500,
      category: "vse",
    })
      .then((data) => {
        if (cancelled) return;
        const items = mapPlacesPayload(data, activeLocation);
        setAllPlaces(items);
        setSource(data.source ?? null);
        loadedCategoriesRef.current.add("vse");
      })
      .catch(() => {
        if (!cancelled) {
          setAllPlaces([]);
          setSource("error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locationKey, activeLocation?.lat, activeLocation?.lng, activeLocation?.id, activeLocation?.radiusKm]);

  // Kategorie → hlubší načtení (dentist×3 stránky, „zubní ordinace“ atd.) platné kdekoli v ČR
  useEffect(() => {
    if (!activeLocation?.lat || !activeLocation?.lng) return;
    const cat = activeCategory && activeCategory !== "vse" && activeCategory !== "ostatni"
      ? activeCategory
      : null;
    if (!cat) return;
    if (loadedCategoriesRef.current.has(cat)) return;

    let cancelled = false;
    setLoading(true);

    fetchNearbyPlaces({
      lat: activeLocation.lat,
      lng: activeLocation.lng,
      radiusM: 3500,
      category: cat,
    })
      .then((data) => {
        if (cancelled) return;
        const items = mapPlacesPayload(data, activeLocation);
        setAllPlaces((prev) => mergePlaceLists(prev, items));
        setSource(data.source ?? null);
        loadedCategoriesRef.current.add(cat);
      })
      .catch(() => {
        /* ponech stávající data */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, locationKey, activeLocation?.lat, activeLocation?.lng, activeLocation?.id]);

  const googlePlaces = useMemo(() => {
    let items = allPlaces;

    if (activeCategory && activeCategory !== "vse") {
      items = items.filter((p) => institutionMatchesCategory(p, activeCategory));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.address ?? "").toLowerCase().includes(q)
      );
    }

    return items;
  }, [allPlaces, activeCategory, searchQuery]);

  return { googlePlaces, loading, source, allGooglePlaces: allPlaces };
}

/**
 * Google Places = zdroj pravdy pro pozici.
 * Lokální mocky bez GPS schováme, jen když už máme Google data (ať špendlík neplave mimo).
 */
export function mergeInstitutionsWithGoogle(localPlaces, googlePlaces, { preferGoogleGps = true } = {}) {
  const google = googlePlaces ?? [];
  const local = localPlaces ?? [];

  if (google.length === 0) return local;

  const usedLocal = new Set();
  const mergedFromGoogle = google.map((g) => {
    const match = local.find((l) => namesMatch(l.name, g.name));
    if (!match) return g;
    usedLocal.add(match.id);
    return {
      ...match,
      ...g,
      id: g.id,
      lat: g.lat ?? match.lat,
      lng: g.lng ?? match.lng,
      mapPos: g.lat != null && g.lng != null ? g.mapPos : match.mapPos,
      category: g.category ?? match.category,
      provozovnaType: g.provozovnaType ?? match.provozovnaType,
      claimStatus: match.claimStatus,
      claimedByUserId: match.claimedByUserId,
      isVerified: match.isVerified || g.isVerified,
      isSponsored: match.isSponsored,
      isTop: match.isTop,
      extraInfo: match.extraInfo,
      photos: match.photos,
      accountType: match.accountType ?? g.accountType,
      isGooglePlace: true,
      googlePlaceId: g.googlePlaceId,
    };
  });

  const localExtras = local.filter((l) => {
    if (usedLocal.has(l.id)) return false;
    if (preferGoogleGps && (l.lat == null || l.lng == null)) return false;
    if (google.some((g) => namesMatch(g.name, l.name))) return false;
    return true;
  });

  return dedupeNearbyPlaces([...mergedFromGoogle, ...localExtras]);
}
