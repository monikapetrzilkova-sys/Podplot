/** Lokální záloha příspěvků na nástěnce skupiny (přežije refresh). */

function storageKey(userId) {
  return `podplot-group-posts-v1-${userId || "anon"}`;
}

export function loadGroupBoardPosts(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p && typeof p === "object" && p.id);
  } catch {
    return [];
  }
}

export function persistGroupBoardPosts(userId, posts) {
  try {
    if (!userId) return;
    const list = (Array.isArray(posts) ? posts : [])
      .filter((p) => p && p.id)
      .slice(0, 120);
    localStorage.setItem(storageKey(userId), JSON.stringify(list));
  } catch {
    /* quota / private mode */
  }
}
