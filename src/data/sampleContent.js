/** Ukázkový katalog (mock) — v UI vždy označený jako ukázka. */

const SAMPLE_IDS = new Set();

function rememberId(id) {
  if (id) SAMPLE_IDS.add(String(id));
}

export function markAsSample(items) {
  return (items ?? []).map((item) => {
    if (!item || typeof item !== "object") return item;
    rememberId(item.id);
    rememberId(item.chatId);
    rememberId(item.fromSecurityReportId);
    return { ...item, sample: true };
  });
}

export function isSampleContent(item) {
  if (!item || item.mine) return false;
  if (item.sample === true) return true;
  const raw = [
    item.id,
    item.chatId,
    item.fromSecurityReportId,
    item.eventId,
    item.helpId,
    item.newsId,
    item.post?.id,
    item.event?.id,
    item.help?.id,
    item.newsItem?.id,
  ]
    .filter(Boolean)
    .map(String);
  const stripped = raw.map((id) =>
    id.replace(/^(feed-|hlaseni-|event-|help-|news-|group-|post-|chat-)/, "")
  );
  return [...raw, ...stripped].some((id) => SAMPLE_IDS.has(id));
}
