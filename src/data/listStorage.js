/** Jednoduchý seznam v localStorage, klíčovaný podle uživatele. */

export function loadStoredList(keyPrefix, userId, { mapItem } = {}) {
  try {
    const raw = localStorage.getItem(`${keyPrefix}-${userId || "anon"}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item === "object" && item.id)
      .map((item) => {
        const createdAt =
          typeof item.createdAt === "number"
            ? item.createdAt
            : Date.parse(item.createdAt) || 0;
        const next = { ...item, createdAt };
        return mapItem ? mapItem(next) : next;
      });
  } catch {
    return [];
  }
}

export function persistStoredList(keyPrefix, userId, items, { limit = 120 } = {}) {
  try {
    if (!userId) return;
    const list = (Array.isArray(items) ? items : [])
      .filter((item) => item && item.id)
      .slice(0, limit);
    localStorage.setItem(`${keyPrefix}-${userId}`, JSON.stringify(list));
  } catch {
    /* quota / private mode */
  }
}
