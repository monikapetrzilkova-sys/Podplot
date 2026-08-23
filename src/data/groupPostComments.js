/** Komentáře u příspěvků na nástěnce skupiny — viditelné všem členům. */

export const SEED_GROUP_POST_COMMENTS = [
  {
    id: "gpc1",
    postId: "gp1",
    authorId: "user-katka",
    authorName: "Katka M.",
    authorInitials: "KM",
    text: "U nás je fajn hřiště u školky — ráno bývá klid.",
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: "gpc2",
    postId: "gp1",
    authorId: "user-petra",
    authorName: "Petra S.",
    authorInitials: "PS",
    text: "Přidejte se i na společné odpolední procházky — píšeme to tady ve skupině.",
    createdAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: "gpc3",
    postId: "gp2",
    authorId: "user-lucie",
    authorName: "Lucie H.",
    authorInitials: "LH",
    text: "Díky! Můžeme se domluvit na středu?",
    createdAt: Date.now() - 1000 * 60 * 25,
  },
];

export function formatCommentTime(createdAt) {
  const t = Number(createdAt);
  if (!Number.isFinite(t)) return "";
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return "právě teď";
  if (mins < 60) return `před ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `před ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "včera" : `před ${days} dny`;
}

export function commentsForPost(comments, postId) {
  return (comments ?? [])
    .filter((c) => c.postId === postId)
    .sort((a, b) => Number(a.createdAt) - Number(b.createdAt));
}

export function commentCountLabel(count) {
  if (!count) return null;
  if (count === 1) return "1 komentář";
  if (count < 5) return `${count} komentáře`;
  return `${count} komentářů`;
}
