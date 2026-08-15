/** Dva hlavní světy — Komunita a Průvodce */

export const APP_WORLDS = [
  { id: "komunita", label: "Komunita", shortLabel: "Komunita", icon: "komunita" },
  { id: "pruvodce", label: "Průvodce", shortLabel: "Průvodce", icon: "pruvodce" },
];

export const KOMUNITA_SUBFILTERS = [
  { id: "veci", label: "Věci", icon: "veci" },
  { id: "vypomoc", label: "Výpomoc", icon: "vypomoc" },
  { id: "skupiny", label: "Skupiny", icon: "skupiny" },
];

/** @deprecated alias */
export const SOUSEDE_SUBFILTERS = KOMUNITA_SUBFILTERS;

/** Průvodce — bez pod-záložek, obsah řídí mřížka kategorií */
export const PRUVODCE_SUBFILTERS = [];

export function getSkupinySubfilters(_activeGroups = []) {
  return [
    { id: "vse", label: "Všechny skupiny", shortLabel: "Všechny" },
    { id: "moje", label: "Moje skupiny", shortLabel: "Moje" },
  ];
}

export function getDefaultWorldSubfilter(worldId) {
  const w = normalizeWorldId(worldId);
  if (w === "pruvodce") return "pruvodce";
  if (w === "komunita") return "veci";
  return "veci";
}

export const FEED_MAIN_MODES = APP_WORLDS;

export function getSubfilters(mainMode, activeGroups = []) {
  const w = normalizeWorldId(mainMode);
  if (w === "pruvodce" || mainMode === "sluzby") return PRUVODCE_SUBFILTERS;
  if (mainMode === "skupiny") return getSkupinySubfilters(activeGroups);
  return KOMUNITA_SUBFILTERS;
}

export function getDefaultSubfilter(mainMode) {
  return getDefaultWorldSubfilter(mainMode);
}

export function normalizeWorldId(id) {
  if (id === "komunita" || id === "sousede" || id === "zbozi" || id === "skupiny") return "komunita";
  if (id === "pruvodce" || id === "sluzby") return "pruvodce";
  return id;
}

export function normalizeSubFilter(worldId, subFilter) {
  const w = normalizeWorldId(worldId);
  if (w === "komunita") {
    if (subFilter === "vse" || subFilter === "prodam" || subFilter === "daruji") return "veci";
    if (subFilter === "mapa-mist") return "veci";
    if (subFilter === "vypomoc") return "vypomoc";
    return subFilter;
  }
  if (w === "pruvodce") {
    if (subFilter === "mapa-mist" || subFilter === "odpad" || subFilter === "katalog") return "pruvodce";
    if (subFilter === "remeslnici") return "pruvodce";
    return subFilter;
  }
  return subFilter;
}
