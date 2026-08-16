/** Návrhy skupin — localStorage + rozpoznání v remote posts */

export const GROUP_PROPOSAL_FEED_SUBTYPE = "group-proposal";
export const GROUP_PROPOSAL_VOTE_FEED_SUBTYPE = "group-proposal-vote";

const STORAGE_KEY = "podplot-group-proposals-v1";

export function isGroupProposalPost(post) {
  if (!post) return false;
  return (
    post.feedSubtype === GROUP_PROPOSAL_FEED_SUBTYPE ||
    post.type === "Návrh skupiny" ||
    Boolean(post.isGroupProposal)
  );
}

export function isGroupProposalVotePost(post) {
  if (!post) return false;
  return (
    post.feedSubtype === GROUP_PROPOSAL_VOTE_FEED_SUBTYPE ||
    post.type === "Podpora skupiny" ||
    Boolean(post.isGroupProposalVote)
  );
}

export function loadStoredGroupProposals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => p?.id && p?.name && !p.active);
  } catch {
    return [];
  }
}

export function persistGroupProposals(list) {
  try {
    const slim = (list ?? [])
      .filter((p) => p?.id && p?.name && !p.active)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        purpose: p.purpose ?? "",
        clubCategory: p.clubCategory ?? p.categoryId ?? null,
        categoryId: p.categoryId ?? p.clubCategory ?? null,
        tag: p.tag ?? null,
        votes: p.votes ?? 1,
        required: p.required ?? 5,
        voted: Boolean(p.voted),
        active: false,
        proposer: p.proposer ?? null,
        proposerId: p.proposerId ?? null,
        municipality: p.municipality ?? null,
        status: p.status ?? "v-priprave",
        createdAt: p.createdAt ?? Date.now(),
      }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore quota */
  }
}

export function mergeProposalLists(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const p of list ?? []) {
      if (!p?.id || !p?.name || p.active) continue;
      const prev = byId.get(p.id);
      byId.set(p.id, {
        ...prev,
        ...p,
        voted: Boolean(prev?.voted || p.voted),
        votes: Math.max(Number(prev?.votes) || 0, Number(p.votes) || 0),
        status: p.status ?? prev?.status ?? "v-priprave",
        active: false,
      });
    }
  }
  return [...byId.values()].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Sestaví návrhy z remote posts (návrh + hlasy podpory). */
export function proposalsFromRemotePosts(posts, currentUserId = null) {
  const list = posts ?? [];
  const proposalPosts = list.filter(isGroupProposalPost);
  const votePosts = list.filter(isGroupProposalVotePost);

  const votersByProposal = new Map();
  for (const v of votePosts) {
    const pid = v.proposalId ?? null;
    if (!pid) continue;
    if (!votersByProposal.has(pid)) votersByProposal.set(pid, new Set());
    if (v.authorId) votersByProposal.get(pid).add(String(v.authorId));
  }

  return proposalPosts.map((post) => {
    const voters = votersByProposal.get(post.id) ?? new Set();
    if (post.authorId) voters.add(String(post.authorId));
    const votes = Math.max(Number(post.proposalVotes) || 1, voters.size || 1);
    const voted =
      Boolean(currentUserId && voters.has(String(currentUserId))) ||
      Boolean(currentUserId && post.authorId === currentUserId);
    return {
      id: post.id,
      name: post.title,
      description: post.body ?? "",
      purpose: post.purpose ?? "",
      clubCategory: post.clubCategory ?? post.categoryId ?? null,
      categoryId: post.clubCategory ?? post.categoryId ?? null,
      tag: post.meta || post.tag || "Skupiny",
      votes,
      required: Number(post.proposalRequired) || 5,
      voted,
      active: false,
      proposer: post.author ?? "Soused",
      proposerId: post.authorId ?? null,
      municipality: post.municipality ?? null,
      status: "v-priprave",
      createdAt: post.createdAt ?? Date.now(),
      sharedRemote: true,
    };
  });
}
