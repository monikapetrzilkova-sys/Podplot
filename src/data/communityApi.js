/**
 * Sdílená komunita přes Supabase — profily + příspěvky.
 * Bez nakonfigurovaného klienta tiše no-op (appka zůstane na mocku).
 */

import { ensureSupabase } from "../lib/supabaseClient.js";
import { municipalitiesMatch } from "./geoFilter.js";
import { initialsFromName, normalizePhotoList } from "../utils/listingPhotos.js";

function inferCategoryIdFromType(type) {
  const t = String(type ?? "").toLowerCase();
  if (t.includes("půjčovna") || t === "pujcovna") return "pujcovna";
  if (t.includes("daruji")) return "daruji";
  if (t.includes("prodám") || t.includes("prodam")) return "prodam";
  if (t.includes("sháním") || t.includes("shanim")) return "shanim";
  return null;
}

function rowToFeedPost(row, currentUserId) {
  const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
  const type = row.type ?? "Příspěvek";
  const categoryId =
    payload.categoryId ?? inferCategoryIdFromType(type) ?? null;
  const base = {
    id: row.id,
    role: payload.role ?? null,
    accountType: row.account_type ?? payload.accountType ?? null,
    author: row.author_name,
    authorId: row.author_id,
    initials: row.author_initials || initialsFromName(row.author_name),
    title: row.title,
    body: row.body ?? "",
    meta: row.meta ?? "",
    type,
    feedType: row.feed_type ?? "komunita",
    feedSubtype: row.feed_subtype ?? (categoryId ? "veci" : null),
    mine: Boolean(currentUserId && row.author_id === currentUserId),
    isVerified: Boolean(payload.isVerified),
    locationId: row.location_id ?? null,
    municipality: row.municipality ?? null,
    mapPos: row.map_pos ?? null,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    createdAt: row.created_at ? Date.parse(row.created_at) || Date.now() : Date.now(),
    updatedAt: payload.updatedAt
      ? Number(payload.updatedAt) || Date.parse(payload.updatedAt) || null
      : null,
    fromSecurityReportId: payload.fromSecurityReportId ?? null,
    reportCategoryId: payload.reportCategoryId ?? null,
    expiresAt: payload.expiresAt ?? null,
    untilResolved: payload.untilResolved ?? null,
    status: payload.status ?? null,
    validUntil: payload.validUntil ?? null,
    urgent: Boolean(payload.urgent),
    urgentScope: payload.urgentScope ?? null,
    categoryId,
    marketCategory: payload.marketCategory ?? null,
    lendingCategory: payload.lendingCategory ?? null,
    itemType: payload.itemType ?? null,
    itemTypeLabel: payload.itemTypeLabel ?? null,
    listingPrice: payload.listingPrice ?? null,
    listingPriceUnit: payload.listingPriceUnit ?? null,
    listingQuantity: payload.listingQuantity ?? null,
    listingPaymentMethod: payload.listingPaymentMethod ?? null,
    groupId: payload.groupId ?? null,
    groupIds: Array.isArray(payload.groupIds)
      ? payload.groupIds.filter(Boolean)
      : payload.groupId
        ? [payload.groupId]
        : [],
    groupName: payload.groupName ?? null,
    sharedRemote: true,
    isGroupProposal: Boolean(payload.groupProposal),
    isGroupProposalVote: Boolean(payload.groupProposalVote),
    proposalId: payload.proposalId ?? null,
    purpose: payload.purpose ?? null,
    clubCategory: payload.clubCategory ?? null,
    proposalRequired: payload.required ?? null,
    proposalVotes: payload.votes ?? null,
    ...payload.extra,
  };
  if (payload.boardPost === true) base.boardPost = true;
  else if (payload.boardPost === false) base.boardPost = false;
  if (Array.isArray(payload.groupIds) && payload.groupIds.length) {
    base.groupIds = payload.groupIds.filter(Boolean);
  } else if (base.groupId && !Array.isArray(base.groupIds)) {
    base.groupIds = [base.groupId];
  }
  if (payload.groupName) base.groupName = payload.groupName;
  // Fotky vždy z řádku DB (ne z payload.extra) a jako čisté URL řetězce
  base.photos = normalizePhotoList(row.photos ?? base.photos);
  if (!base.initials || base.initials === "??") {
    base.initials = initialsFromName(base.author);
  }
  return base;
}

export async function upsertRemoteProfile(user) {
  if (!user?.id || !user?.name) return false;
  const sb = await ensureSupabase();
  if (!sb) return false;
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email ?? null,
    address: user.address ?? null,
    account_type: user.accountType ?? null,
    initials: user.initials ?? null,
    municipality: user.geo?.city ?? user.location ?? null,
    updated_at: new Date().toISOString(),
  };
  // volitelný sloupec — pokud v DB ještě není, zkusíme bez něj
  if (user.profilePhoto) {
    payload.profile_photo = user.profilePhoto;
  }
  let { error } = await sb.from("profiles").upsert(payload, { onConflict: "id" });
  if (error && String(error.message || "").includes("profile_photo")) {
    delete payload.profile_photo;
    ({ error } = await sb.from("profiles").upsert(payload, { onConflict: "id" }));
  }
  if (error) {
    console.warn("[supabase] upsert profile", error.message);
    return false;
  }
  return true;
}

export async function fetchRemoteProfile(id) {
  if (!id) return null;
  const sb = await ensureSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.warn("[supabase] fetch profile", error.message);
    return null;
  }
  return data ?? null;
}

/** Profil → položka sítě důvěry / sousedů */
export function profileRowToNeighbor(row, { confirmationCount = 0, isNew = false } = {}) {
  if (!row?.id || !row?.name) return null;
  const createdAt = row.created_at ? Date.parse(row.created_at) || Date.now() : Date.now();
  const joinedRecently = Date.now() - createdAt < 1000 * 60 * 60 * 24 * 14;
  return {
    id: row.id,
    name: row.name,
    initials: row.initials || "??",
    email: row.email ?? null,
    profilePhoto: row.profile_photo || null,
    confirmations: confirmationCount,
    geolocVerified: true,
    location: "ve vaší lokalitě",
    distance: "ve vaší lokalitě",
    municipality: row.municipality ?? null,
    accountType: row.account_type ?? "soused",
    allowPublicAreaLabel: false,
    publicAreaLabel: "",
    fromRemote: true,
    isNew: Boolean(isNew || joinedRecently),
    joinedAt: createdAt,
  };
}

/** Sousedi (účty typu soused) ve stejné obci */
export async function fetchRemoteNeighbors({
  municipality = null,
  excludeId = null,
  excludeEmail = null,
  excludeName = null,
} = {}) {
  const sb = await ensureSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.warn("[supabase] fetch profiles", error.message);
    return [];
  }

  const excludeEmailNorm = excludeEmail ? String(excludeEmail).trim().toLowerCase() : "";
  const excludeNameNorm = excludeName
    ? String(excludeName)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
    : "";

  return (data ?? [])
    .filter((row) => {
      if (!row?.id) return false;
      if (excludeId && String(row.id) === String(excludeId)) return false;
      if (excludeEmailNorm && String(row.email ?? "").trim().toLowerCase() === excludeEmailNorm) {
        return false;
      }
      if (excludeNameNorm) {
        const rowName = String(row.name ?? "")
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, " ");
        if (rowName && rowName === excludeNameNorm) return false;
      }
      const type = String(row.account_type ?? "soused").toLowerCase();
      if (type && type !== "soused") return false;
      if (municipality && !municipalitiesMatch(row.municipality, municipality)) return false;
      return true;
    })
    .map((row) => profileRowToNeighbor(row))
    .filter(Boolean);
}

/** Realtime nový profil — vrať unsubscribe */
export async function subscribeRemoteProfiles(onInsert) {
  const sb = await ensureSupabase();
  if (!sb || typeof onInsert !== "function") return () => {};

  const channel = sb
    .channel("podplot-profiles")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "profiles" },
      (payload) => {
        if (payload?.new) onInsert(payload.new);
      }
    )
    .subscribe();

  return () => {
    sb.removeChannel(channel);
  };
}

/** Potvrzení sousedství, která jsem dal/a */
export async function fetchMyNeighborConfirmations(confirmerId) {
  if (!confirmerId) return [];
  const sb = await ensureSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("neighbor_confirmations")
    .select("neighbor_id")
    .eq("confirmer_id", confirmerId);
  if (error) {
    // tabulka ještě nemusí existovat
    if (!String(error.message || "").includes("does not exist")) {
      console.warn("[supabase] fetch confirmations", error.message);
    }
    return [];
  }
  return (data ?? []).map((r) => r.neighbor_id).filter(Boolean);
}

/** Počty potvrzení pro sadu sousedů */
export async function fetchNeighborConfirmationCounts(neighborIds = []) {
  const ids = [...new Set(neighborIds.filter(Boolean))];
  if (!ids.length) return {};
  const sb = await ensureSupabase();
  if (!sb) return {};
  const { data, error } = await sb
    .from("neighbor_confirmations")
    .select("neighbor_id")
    .in("neighbor_id", ids);
  if (error) {
    if (!String(error.message || "").includes("does not exist")) {
      console.warn("[supabase] confirmation counts", error.message);
    }
    return {};
  }
  const counts = {};
  (data ?? []).forEach((row) => {
    const id = row.neighbor_id;
    counts[id] = (counts[id] ?? 0) + 1;
  });
  return counts;
}

export async function publishNeighborConfirmation(confirmerId, neighborId, confirmerMeta = null) {
  if (!confirmerId || !neighborId || confirmerId === neighborId) return false;

  // Lokální most pro testování na stejném zařízení / bez realtime
  try {
    const key = `podplot-trust-received-v1-${neighborId}`;
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(list) ? list : [];
    if (!arr.some((r) => r?.confirmerId === confirmerId)) {
      arr.unshift({
        confirmerId,
        name: confirmerMeta?.name || "Soused",
        initials: confirmerMeta?.initials || "??",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 100)));
    }
  } catch {
    /* ignore */
  }

  const sb = await ensureSupabase();
  if (!sb) return true; // lokální zápis stačí pro demo
  const { error } = await sb.from("neighbor_confirmations").upsert(
    {
      confirmer_id: confirmerId,
      neighbor_id: neighborId,
      created_at: new Date().toISOString(),
    },
    { onConflict: "confirmer_id,neighbor_id" }
  );
  if (error) {
    console.warn("[supabase] confirm neighbor", error.message);
    return false;
  }
  return true;
}

function loadLocalReceivedConfirmations(neighborId) {
  try {
    const raw = localStorage.getItem(`podplot-trust-received-v1-${neighborId}`);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((r) => r?.confirmerId)
      .map((r) => ({
        confirmerId: r.confirmerId,
        name: r.name || "Soused",
        initials: r.initials || "??",
        createdAt: r.createdAt || null,
      }));
  } catch {
    return [];
  }
}

/** Kdo potvrdil mě (jsem neighbor_id) */
export async function fetchReceivedNeighborConfirmations(neighborId) {
  if (!neighborId) return [];
  const local = loadLocalReceivedConfirmations(neighborId);
  const byId = new Map(local.map((r) => [r.confirmerId, r]));

  const sb = await ensureSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("neighbor_confirmations")
      .select("confirmer_id, created_at")
      .eq("neighbor_id", neighborId)
      .order("created_at", { ascending: false });
    if (error) {
      if (!String(error.message || "").includes("does not exist")) {
        console.warn("[supabase] received confirmations", error.message);
      }
    } else {
      const rows = data ?? [];
      const confirmerIds = rows.map((r) => r.confirmer_id).filter(Boolean);
      let profilesById = {};
      if (confirmerIds.length) {
        const { data: profiles } = await sb
          .from("profiles")
          .select("id, name, initials")
          .in("id", confirmerIds);
        (profiles ?? []).forEach((p) => {
          if (p?.id) profilesById[p.id] = p;
        });
      }
      rows.forEach((row) => {
        const id = row.confirmer_id;
        if (!id) return;
        const profile = profilesById[id];
        const prev = byId.get(id);
        byId.set(id, {
          confirmerId: id,
          name: profile?.name || prev?.name || "Soused",
          initials: profile?.initials || prev?.initials || "??",
          createdAt: row.created_at || prev?.createdAt || null,
        });
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tb - ta;
  });
}

/** Realtime: někdo potvrdil mě */
export async function subscribeReceivedNeighborConfirmations(neighborId, onInsert) {
  const sb = await ensureSupabase();
  if (!sb || !neighborId || typeof onInsert !== "function") return () => {};

  const channel = sb
    .channel(`podplot-trust-received-${neighborId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "neighbor_confirmations",
        filter: `neighbor_id=eq.${neighborId}`,
      },
      (payload) => {
        if (payload?.new) onInsert(payload.new);
      }
    )
    .subscribe();

  return () => {
    sb.removeChannel(channel);
  };
}

/** Mapuje řádek profiles (+ auth metadata) na objekt user v appce. */
export function profileToAppUser(row, authUser, fallback = {}) {
  const meta = authUser?.user_metadata && typeof authUser.user_metadata === "object"
    ? authUser.user_metadata
    : {};
  const name = row?.name || meta.name || fallback.name || "Soused";
  const email = row?.email || authUser?.email || fallback.email || "";
  const address = row?.address || meta.address || fallback.address || "";
  const accountType = row?.account_type || meta.account_type || fallback.accountType || "soused";
  const municipality =
    row?.municipality || meta.municipality || fallback.geo?.city || fallback.location || "Jesenice";
  const initials =
    row?.initials ||
    fallback.initials ||
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") ||
    "??";

  return {
    ...(fallback && typeof fallback === "object" ? fallback : {}),
    id: row?.id || authUser?.id || fallback.id,
    name,
    email,
    address,
    accountType,
    initials,
    location: municipality,
    geo: {
      ...(fallback.geo ?? {}),
      city: municipality,
      lat: fallback.geo?.lat ?? meta.lat ?? null,
      lng: fallback.geo?.lng ?? meta.lng ?? null,
    },
  };
}


export async function publishRemotePost(post, user) {
  if (!post?.id || !post?.title) return false;
  const sb = await ensureSupabase();
  if (!sb) return false;

  // Profil musí existovat kvůli FK
  if (user) await upsertRemoteProfile(user);

  const payload = {
    role: post.role ?? null,
    accountType: post.accountType ?? user?.accountType ?? null,
    isVerified: post.isVerified ?? user?.isVerified ?? false,
    fromSecurityReportId: post.fromSecurityReportId ?? null,
    reportCategoryId: post.reportCategoryId ?? null,
    expiresAt: post.expiresAt ?? null,
    untilResolved: post.untilResolved ?? null,
    status: post.status ?? null,
    validUntil: post.validUntil ?? null,
    urgent: Boolean(post.urgent),
    urgentScope: post.urgentScope ?? null,
    categoryId: post.categoryId ?? null,
    marketCategory: post.marketCategory ?? null,
    lendingCategory: post.lendingCategory ?? null,
    itemType: post.itemType ?? null,
    itemTypeLabel: post.itemTypeLabel ?? null,
    listingPrice: post.listingPrice ?? null,
    listingPriceUnit: post.listingPriceUnit ?? null,
    listingQuantity: post.listingQuantity ?? null,
    listingPaymentMethod: post.listingPaymentMethod ?? null,
    groupId: post.groupId ?? null,
    groupIds: Array.isArray(post.groupIds)
      ? post.groupIds.filter(Boolean)
      : post.groupId
        ? [post.groupId]
        : [],
    groupName: post.groupName ?? null,
    boardPost: post.boardPost === true ? true : post.boardPost === false ? false : undefined,
    interactionType: post.interactionType ?? null,
    placeLabel: post.placeLabel ?? null,
    groupProposal: Boolean(post.isGroupProposal),
    groupProposalVote: Boolean(post.isGroupProposalVote),
    proposalId: post.proposalId ?? null,
    purpose: post.purpose ?? null,
    clubCategory: post.clubCategory ?? null,
    required: post.proposalRequired ?? post.required ?? null,
    votes: post.proposalVotes ?? post.votes ?? null,
    updatedAt: post.updatedAt ?? null,
  };
  if (payload.boardPost === undefined) delete payload.boardPost;

  const row = {
    id: post.id,
    author_id: user?.id ?? post.authorId ?? null,
    author_name: post.author ?? user?.name ?? "Soused",
    author_initials: post.initials ?? user?.initials ?? null,
    account_type: post.accountType ?? user?.accountType ?? null,
    title: post.title,
    body: post.body ?? "",
    type: post.type ?? "Příspěvek",
    feed_type: post.feedType ?? "komunita",
    feed_subtype: post.feedSubtype ?? null,
    location_id: post.locationId ?? null,
    municipality: post.municipality ?? null,
    photos: normalizePhotoList(post.photos),
    map_pos: post.mapPos ?? null,
    lat: post.lat ?? post.mapPos?.lat ?? null,
    lng: post.lng ?? post.mapPos?.lng ?? null,
    meta: post.meta ?? null,
    payload,
    created_at: post.createdAt
      ? new Date(post.createdAt).toISOString()
      : new Date().toISOString(),
  };

  // Upsert potřebuje INSERT i UPDATE politiku. Bez UPDATE selže úprava existujícího řádku.
  const { error } = await sb.from("posts").upsert(row, { onConflict: "id" });
  if (!error) return true;

  const { error: updErr } = await sb.from("posts").update(row).eq("id", post.id);
  if (!updErr) return true;

  const { error: insErr } = await sb.from("posts").insert(row);
  if (!insErr) return true;

  console.warn(
    "[supabase] publish post",
    error?.message || updErr?.message || insErr?.message
  );
  return false;
}

/** Soft-delete / hard-delete vlastního příspěvku v Supabase. */
export async function deleteRemotePost(postId, userId = null) {
  if (!postId) return false;
  const sb = await ensureSupabase();
  if (!sb) return false;

  let query = sb.from("posts").delete().eq("id", postId);
  if (userId) query = query.eq("author_id", userId);

  const { error } = await query;
  if (!error) return true;

  // Fallback bez author filtru (RLS stejně omezí na vlastní)
  const { error: err2 } = await sb.from("posts").delete().eq("id", postId);
  if (!err2) return true;

  console.warn("[supabase] delete post", error?.message || err2?.message);
  return false;
}

export async function fetchRemotePosts({ municipality = null, limit = 80, currentUserId = null } = {}) {
  const sb = await ensureSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[supabase] fetch posts", error.message);
    return [];
  }

  let rows = data ?? [];
  if (municipality) {
    rows = rows.filter((r) => {
      const rm = r.municipality;
      // Starší příspěvky bez obce necháme projít — dofiltruje se podle aktivní lokality
      if (!rm) return true;
      return municipalitiesMatch(rm, municipality);
    });
  }
  return rows.map((row) => rowToFeedPost(row, currentUserId));
}

/** Realtime nové příspěvky — vrať unsubscribe. */
export async function subscribeRemotePosts(onInsert) {
  const sb = await ensureSupabase();
  if (!sb || typeof onInsert !== "function") return () => {};

  const channel = sb
    .channel("podplot-posts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "posts" },
      (payload) => {
        if (payload?.new) onInsert(payload.new);
      }
    )
    .subscribe();

  return () => {
    sb.removeChannel(channel);
  };
}

function rowToGroupProposal(row, { voted = false } = {}) {
  if (!row?.id || !row?.name) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    purpose: row.purpose ?? "",
    clubCategory: row.club_category ?? null,
    categoryId: row.club_category ?? null,
    tag: row.tag ?? "Skupiny",
    votes: Number(row.votes) || 0,
    required: Number(row.required) || 5,
    voted: Boolean(voted),
    active: Boolean(row.active),
    proposer: row.proposer_name ?? "Soused",
    proposerId: row.proposer_id ?? null,
    municipality: row.municipality ?? null,
    status: row.status ?? "v-priprave",
    createdAt: row.created_at ? Date.parse(row.created_at) || Date.now() : Date.now(),
    sharedRemote: true,
  };
}

/** Publikuj návrh skupiny do společné DB */
export async function publishRemoteGroupProposal(proposal, user) {
  if (!proposal?.id || !proposal?.name) return false;
  const sb = await ensureSupabase();
  if (!sb) return false;
  if (user) await upsertRemoteProfile(user);

  const { error } = await sb.from("group_proposals").upsert(
    {
      id: proposal.id,
      name: proposal.name,
      description: proposal.description ?? "",
      purpose: proposal.purpose ?? "",
      club_category: proposal.clubCategory ?? proposal.categoryId ?? null,
      tag: proposal.tag ?? null,
      votes: proposal.votes ?? 1,
      required: proposal.required ?? 5,
      proposer_id: user?.id ?? proposal.proposerId ?? null,
      proposer_name: proposal.proposer ?? user?.name ?? "Soused",
      municipality: proposal.municipality ?? user?.geo?.city ?? user?.location ?? null,
      status: proposal.status ?? "v-priprave",
      active: Boolean(proposal.active),
      created_at: proposal.createdAt
        ? new Date(proposal.createdAt).toISOString()
        : new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.warn("[supabase] publish group proposal", error.message);
    return false;
  }

  const voterId = user?.id;
  if (voterId) {
    const { error: voteErr } = await sb.from("group_proposal_votes").upsert(
      { proposal_id: proposal.id, voter_id: voterId },
      { onConflict: "proposal_id,voter_id" }
    );
    if (voteErr) console.warn("[supabase] proposal self-vote", voteErr.message);
  }
  return true;
}

export async function fetchRemoteGroupProposals({
  municipality = null,
  currentUserId = null,
} = {}) {
  const sb = await ensureSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("group_proposals")
    .select("*")
    .eq("active", false)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    console.warn("[supabase] fetch group proposals", error.message);
    return [];
  }

  let rows = data ?? [];
  if (municipality) {
    rows = rows.filter((r) => {
      if (!r.municipality) return true;
      return municipalitiesMatch(r.municipality, municipality);
    });
  }

  let myVotes = new Set();
  if (currentUserId && rows.length) {
    const { data: votes, error: votesErr } = await sb
      .from("group_proposal_votes")
      .select("proposal_id")
      .eq("voter_id", currentUserId)
      .in(
        "proposal_id",
        rows.map((r) => r.id)
      );
    if (votesErr) console.warn("[supabase] fetch proposal votes", votesErr.message);
    myVotes = new Set((votes ?? []).map((v) => v.proposal_id));
  }

  return rows
    .map((row) => rowToGroupProposal(row, { voted: myVotes.has(row.id) }))
    .filter(Boolean);
}

/** Podpora návrhu — zapíše hlas a zvýší počet (atomicky dle DB stavu). */
export async function voteRemoteGroupProposal(proposalId, user) {
  if (!proposalId || !user?.id) return null;
  const sb = await ensureSupabase();
  if (!sb) return null;

  const { error: voteErr } = await sb.from("group_proposal_votes").insert({
    proposal_id: proposalId,
    voter_id: user.id,
  });
  if (voteErr) {
    // už hlasoval
    if (String(voteErr.code) === "23505" || /duplicate|unique/i.test(voteErr.message || "")) {
      return { alreadyVoted: true };
    }
    console.warn("[supabase] vote group proposal", voteErr.message);
    return null;
  }

  const { data: row, error: getErr } = await sb
    .from("group_proposals")
    .select("*")
    .eq("id", proposalId)
    .maybeSingle();
  if (getErr || !row) {
    console.warn("[supabase] read proposal after vote", getErr?.message);
    return null;
  }

  const nextVotes = (Number(row.votes) || 0) + 1;
  const activated = nextVotes >= (Number(row.required) || 5);
  const { data: updated, error: updErr } = await sb
    .from("group_proposals")
    .update({
      votes: nextVotes,
      active: activated,
      status: activated ? "aktivni" : row.status,
    })
    .eq("id", proposalId)
    .select("*")
    .maybeSingle();

  if (updErr) {
    console.warn("[supabase] update proposal votes", updErr.message);
    return null;
  }

  return rowToGroupProposal(updated ?? { ...row, votes: nextVotes, active: activated }, {
    voted: true,
  });
}

/** Realtime nové / aktualizované návrhy skupin */
export async function subscribeRemoteGroupProposals(onChange) {
  const sb = await ensureSupabase();
  if (!sb || typeof onChange !== "function") return () => {};

  const channel = sb
    .channel("podplot-group-proposals")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "group_proposals" },
      (payload) => {
        if (payload?.new) onChange(payload.new, payload.eventType);
      }
    )
    .subscribe();

  return () => {
    sb.removeChannel(channel);
  };
}

export { rowToFeedPost, rowToGroupProposal };
