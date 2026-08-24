/** Trvale smazaný obsah — přežije refresh i když remote ještě drží řádek. */

function storageKey(userId) {
  return `podplot-deleted-content-v1-${userId || "anon"}`;
}

export function loadDeletedContent(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { postIds: [], reportIds: [] };
    const parsed = JSON.parse(raw);
    return {
      postIds: Array.isArray(parsed?.postIds) ? parsed.postIds.filter(Boolean).map(String) : [],
      reportIds: Array.isArray(parsed?.reportIds)
        ? parsed.reportIds.filter(Boolean).map(String)
        : [],
    };
  } catch {
    return { postIds: [], reportIds: [] };
  }
}

export function persistDeletedContent(userId, content) {
  try {
    if (!userId) return;
    const next = {
      postIds: [...new Set((content?.postIds ?? []).map(String))].slice(0, 400),
      reportIds: [...new Set((content?.reportIds ?? []).map(String))].slice(0, 400),
    };
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function emptyDeletedContent() {
  return { postIds: [], reportIds: [] };
}

/** Id související s jedním příspěvkem / hlášením */
export function collectDeletionIds({
  post = null,
  report = null,
  reportId = null,
  postId = null,
} = {}) {
  const postIds = new Set();
  const reportIds = new Set();

  if (postId) postIds.add(String(postId));
  if (post?.id) postIds.add(String(post.id));

  const rid =
    reportId ||
    report?.id ||
    post?.fromSecurityReportId ||
    (post?.id && String(post.id).startsWith("feed-") ? String(post.id).slice(5) : null);

  if (rid) {
    reportIds.add(String(rid));
    postIds.add(`feed-${rid}`);
    postIds.add(String(rid));
  }

  return {
    postIds: [...postIds],
    reportIds: [...reportIds],
  };
}

export function mergeDeletedContent(base, extra) {
  return {
    postIds: [...new Set([...(base?.postIds ?? []), ...(extra?.postIds ?? [])].map(String))],
    reportIds: [...new Set([...(base?.reportIds ?? []), ...(extra?.reportIds ?? [])].map(String))],
  };
}

export function removeDeletedContentIds(base, { postIds = [], reportIds = [] } = {}) {
  const dropPosts = new Set(postIds.map(String));
  const dropReports = new Set(reportIds.map(String));
  return {
    postIds: (base?.postIds ?? []).filter((id) => !dropPosts.has(String(id))),
    reportIds: (base?.reportIds ?? []).filter((id) => !dropReports.has(String(id))),
  };
}

export function isDeletedPost(post, deleted) {
  if (!post?.id || !deleted) return false;
  const postIds = new Set((deleted.postIds ?? []).map(String));
  const reportIds = new Set((deleted.reportIds ?? []).map(String));
  if (postIds.has(String(post.id))) return true;
  const rid =
    post.fromSecurityReportId ||
    (String(post.id).startsWith("feed-") ? String(post.id).slice(5) : null);
  if (rid && (reportIds.has(String(rid)) || postIds.has(`feed-${rid}`))) return true;
  return false;
}

export function isDeletedReport(report, deleted) {
  if (!report?.id || !deleted) return false;
  const reportIds = new Set((deleted.reportIds ?? []).map(String));
  const postIds = new Set((deleted.postIds ?? []).map(String));
  const id = String(report.id);
  return reportIds.has(id) || postIds.has(id) || postIds.has(`feed-${id}`);
}
