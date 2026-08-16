import { municipalitiesMatch } from "../data/geoFilter.js";

/** Návrhy skupin — localStorage + rozpoznání v remote posts */

export const GROUP_PROPOSAL_FEED_SUBTYPE = "group-proposal";
export const GROUP_PROPOSAL_VOTE_FEED_SUBTYPE = "group-proposal-vote";

const STORAGE_KEY = "podplot-group-proposals-v1";
const USER_GROUPS_STORAGE_KEY = "podplot-user-groups-v1";

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
        updatedAt: p.updatedAt ?? p.createdAt ?? Date.now(),
      }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore quota */
  }
}

function proposalContentTs(p) {
  return Number(p?.updatedAt ?? p?.createdAt ?? 0) || 0;
}

export function mergeProposalLists(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const p of list ?? []) {
      if (!p?.id || !p?.name || p.active) continue;
      const prev = byId.get(p.id);
      if (!prev) {
        byId.set(p.id, { ...p, active: false });
        continue;
      }
      const prevTs = proposalContentTs(prev);
      const nextTs = proposalContentTs(p);
      const newer = nextTs >= prevTs ? p : prev;
      const older = newer === p ? prev : p;
      byId.set(p.id, {
        ...older,
        ...newer,
        voted: Boolean(prev.voted || p.voted),
        votes: Math.max(Number(prev.votes) || 0, Number(p.votes) || 0),
        status: newer.status ?? older.status ?? "v-priprave",
        createdAt:
          Math.min(
            Number(prev.createdAt) || Number.POSITIVE_INFINITY,
            Number(p.createdAt) || Number.POSITIVE_INFINITY
          ) || newer.createdAt,
        updatedAt: Math.max(prevTs, nextTs) || newer.updatedAt,
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
      updatedAt: post.updatedAt ?? post.createdAt ?? Date.now(),
      sharedRemote: true,
    };
  });
}

/**
 * Hlasy podpory u mých návrhů (bez mého vlastního hlasu).
 * @returns {{ id, proposalId, proposalName, voterId, voterName, voterInitials, createdAt }[]}
 */
export function extractSupportsForMyProposals(posts, myUserId, myProposals = []) {
  if (!myUserId) return [];
  const myId = String(myUserId);
  const nameById = new Map();
  const myProposalIds = new Set();

  for (const p of myProposals ?? []) {
    if (!p?.id) continue;
    if (String(p.proposerId ?? p.proposer_id ?? "") !== myId) continue;
    myProposalIds.add(p.id);
    nameById.set(p.id, p.name || "Skupina");
  }

  for (const post of posts ?? []) {
    if (!isGroupProposalPost(post)) continue;
    if (String(post.authorId ?? "") !== myId) continue;
    myProposalIds.add(post.id);
    nameById.set(post.id, post.title || nameById.get(post.id) || "Skupina");
  }

  const byKey = new Map();
  for (const v of posts ?? []) {
    if (!isGroupProposalVotePost(v)) continue;
    const pid = v.proposalId;
    const voterId = v.authorId;
    if (!pid || !voterId || !myProposalIds.has(pid)) continue;
    if (String(voterId) === myId) continue;
    const key = `${pid}:${voterId}`;
    byKey.set(key, {
      id: key,
      proposalId: pid,
      proposalName: nameById.get(pid) || "Skupina",
      voterId: String(voterId),
      voterName: v.author || "Soused",
      voterInitials: v.initials || null,
      createdAt: v.createdAt ?? Date.now(),
    });
  }

  return [...byKey.values()].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Návrhy jen pro aktivní obec — bez obce se nezobrazí (musí mít municipality při založení). */
export function filterProposalsForMunicipality(proposals, municipality) {
  if (!municipality) return [];
  return (proposals ?? []).filter(
    (p) => p?.municipality && municipalitiesMatch(p.municipality, municipality)
  );
}

export function loadStoredUserGroups() {
  try {
    const raw = localStorage.getItem(USER_GROUPS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((g) => g?.id && g?.name && g?.municipality);
  } catch {
    return [];
  }
}

export function persistUserGroups(list) {
  try {
    const slim = (list ?? [])
      .filter((g) => g?.id && g?.name && g?.municipality)
      .map((g) => ({
        id: g.id,
        name: g.name,
        emoji: g.emoji ?? "👥",
        members: g.members ?? 1,
        clubCategory: g.clubCategory ?? null,
        description: g.description ?? "",
        municipality: g.municipality,
        locationId: g.locationId ?? null,
        fromProposal: true,
        proposalId: g.proposalId ?? null,
        createdAt: g.createdAt ?? Date.now(),
      }));
    localStorage.setItem(USER_GROUPS_STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

export function filterUserGroupsForMunicipality(groups, municipality) {
  if (!municipality) return [];
  return (groups ?? []).filter(
    (g) => g?.municipality && municipalitiesMatch(g.municipality, municipality)
  );
}

export function mergeCommunityGroups(baseGroups, userGroups) {
  const byId = new Map();
  for (const g of [...(baseGroups ?? []), ...(userGroups ?? [])]) {
    if (!g?.id || !g?.name) continue;
    byId.set(g.id, { ...byId.get(g.id), ...g });
  }
  return [...byId.values()];
}
