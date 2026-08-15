/** Konfigurace čtyř hlavních modulů aplikace */

export const MODULE_IDS = {
  REPORTS: "reports",
  EVENTS: "events",
  LOCAL_GUIDE: "localGuide",
  INSTITUTIONS: "localGuide",
  THINGS: "things",
  SERVICES: "services",
};

export const APP_MODULES = [
  {
    id: MODULE_IDS.REPORTS,
    label: "Hlášení",
    shortLabel: "Hlášení",
    emoji: "🚨",
    description: "Urgentní podněty, ztráty a nálezy",
    tab: "security",
  },
  {
    id: MODULE_IDS.EVENTS,
    label: "Akce",
    shortLabel: "Akce",
    emoji: "📅",
    description: "Trhy, slavnosti a komunitní události",
    tab: "calendar",
  },
  {
    id: MODULE_IDS.LOCAL_GUIDE,
    label: "Místní průvodce",
    shortLabel: "Průvodce",
    emoji: "🗺️",
    description: "Katalog míst v okolí",
    homeModule: true,
  },
  {
    id: MODULE_IDS.THINGS,
    label: "Věci",
    shortLabel: "Věci",
    emoji: "📦",
    description: "Půjčovna, prodej, darování, shánění",
    homeModule: true,
  },
];

export const DEFAULT_MODULE_VIEW = "map";
export const DEFAULT_EVENTS_MODULE_VIEW = "list";

export const EVENTS_VIEW_MODES = [
  { id: "list", label: "Seznam" },
  { id: "map", label: "Mapa" },
  { id: "calendar", label: "Kalendář" },
];

export function getModuleConfig(moduleId) {
  return APP_MODULES.find((m) => m.id === moduleId);
}
