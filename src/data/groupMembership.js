/** Členství ve skupinách — nic se nepřiřazuje automaticky při registraci. */

const storageKey = (userId) => `podplot-joined-groups-v1-${userId || "anon"}`;

export function loadJoinedGroupIds(userId) {
  if (!userId || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw == null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string" && id) : [];
  } catch {
    return [];
  }
}

export function persistJoinedGroupIds(userId, ids) {
  if (!userId || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...(ids ?? [])]));
  } catch {
    /* quota / private mode */
  }
}

export function normalizeJoinedGroupIds(ids) {
  return [...new Set((ids ?? []).filter((id) => typeof id === "string" && id))];
}
