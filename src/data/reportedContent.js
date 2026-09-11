/** Nahlášený obsah — skrytý pro aktuálního uživatele (client-side hide). */

const ID_PREFIX_RE = /^(post-|help-|event-|news-|group-|feed-|gallery-|hlaseni-)/;

export function expandReportedIds(...candidates) {
  const out = new Set();
  for (const raw of candidates) {
    if (raw == null || raw === "") continue;
    const id = String(raw);
    out.add(id);
    const stripped = id.replace(ID_PREFIX_RE, "");
    if (stripped && stripped !== id) out.add(stripped);
  }
  return [...out];
}

export function isReportedContent(reportedPosts, ...candidates) {
  if (!reportedPosts?.length) return false;
  const reported = new Set(reportedPosts.map(String));
  for (const id of expandReportedIds(...candidates)) {
    if (reported.has(id)) return true;
  }
  for (const rid of reported) {
    const stripped = String(rid).replace(ID_PREFIX_RE, "");
    for (const id of expandReportedIds(...candidates)) {
      if (id === stripped || stripped === id) return true;
    }
  }
  return false;
}

/** Id kandidáti z položky živého feedu / Sousedé. */
export function reportCandidatesFromFeedItem(item) {
  if (!item) return [];
  return [
    item.id,
    item.post?.id,
    item.helpId,
    item.help?.id,
    item.eventId,
    item.event?.id,
    item.newsId,
    item.newsItem?.id,
    item.activityId,
    item.fromSecurityReportId,
    item.post?.fromSecurityReportId,
  ];
}

const STORAGE_PREFIX = "podplot-reported-posts-v1-";

export function loadReportedPosts(userId) {
  if (!userId || typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function persistReportedPosts(userId, ids) {
  if (!userId || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(ids ?? []));
  } catch {
    /* quota */
  }
}
