/** Navigace napříč pull-to-refresh / reload ve stejné záložce prohlížeče */

const NAV_SESSION_KEY = "podplot-nav-v1";

export function loadNavSession() {
  try {
    const raw = sessionStorage.getItem(NAV_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveNavSession(partial) {
  try {
    const prev = loadNavSession() || {};
    sessionStorage.setItem(NAV_SESSION_KEY, JSON.stringify({ ...prev, ...partial }));
  } catch {
    /* private mode / quota */
  }
}

const KNOWN_TABS = new Set([
  "home",
  "map",
  "neighbors",
  "catalog",
  "calendar",
  "messages",
  "reports",
  "crisis",
  "office",
  "ads",
  "reviews",
]);

export function loadSavedActiveTab(fallback = "home") {
  const tab = loadNavSession()?.activeTab;
  return typeof tab === "string" && KNOWN_TABS.has(tab) ? tab : fallback;
}
