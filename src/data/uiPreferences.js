/** Perzistentní UI stavy — minimalizace, rozbalení, skrytí sekcí */

export const UI_STORAGE_KEY = "podplot-ui-prefs";

export const UI_KEYS = {
  GROUP_PROPOSALS_MINIMIZED: "sections.groupProposals.minimized",
  GROUP_PROPOSALS_ARCHIVE_OPEN: "sections.groupProposals.archiveOpen",
  SECURITY_DISMISSED_CALLS_ARCHIVE: "sections.security.dismissedCallsArchive",
  EVENTS_PAST_ARCHIVE_OPEN: "sections.events.pastArchiveOpen",
  CRISIS_ALERT_EXPANDED: "sections.crisisAlert.expanded",
  WELCOME_CARD_DISMISSED: "sections.welcomeCard.dismissed",
  DISMISSED_PROMPT_CALLS: "dismissed.promptCalls",
  DISMISSED_GROUP_PROPOSALS: "dismissed.groupProposals",
};

export function accordionKey(scope, id) {
  return `accordion.${scope}.${id}`;
}

export function proposalDetailsKey(id) {
  return `details.groupProposal.${id}`;
}

export function loadUiPreferences() {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function persistUiPreferences(prefs) {
  try {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private mode */
  }
}

export function readPref(prefs, key, defaultValue) {
  return prefs[key] !== undefined ? prefs[key] : defaultValue;
}
