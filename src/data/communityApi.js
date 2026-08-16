/**
 * Sdílená komunita přes Supabase — profily + příspěvky.
 * Bez nakonfigurovaného klienta tiše no-op (appka zůstane na mocku).
 */

import { ensureSupabase } from "../lib/supabaseClient.js";

function rowToFeedPost(row, currentUserId) {
  const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
  return {
    id: row.id,
    role: payload.role ?? null,
    accountType: row.account_type ?? payload.accountType ?? null,
    author: row.author_name,
    authorId: row.author_id,
    initials: row.author_initials ?? "??",
    title: row.title,
    body: row.body ?? "",
    meta: row.meta ?? "",
    type: row.type ?? "Příspěvek",
    feedType: row.feed_type ?? "komunita",
    feedSubtype: row.feed_subtype ?? null,
    mine: Boolean(currentUserId && row.author_id === currentUserId),
    photos: Array.isArray(row.photos) ? row.photos : [],
    isVerified: Boolean(payload.isVerified),
    locationId: row.location_id ?? null,
    municipality: row.municipality ?? null,
    mapPos: row.map_pos ?? null,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    createdAt: row.created_at ? Date.parse(row.created_at) || Date.now() : Date.now(),
    fromSecurityReportId: payload.fromSecurityReportId ?? null,
    reportCategoryId: payload.reportCategoryId ?? null,
    categoryId: payload.categoryId ?? null,
    marketCategory: payload.marketCategory ?? null,
    listingPrice: payload.listingPrice ?? null,
    groupId: payload.groupId ?? null,
    sharedRemote: true,
    ...payload.extra,
  };
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

function municipalityMatches(a, b) {
  const left = String(a ?? "").trim().toLowerCase();
  const right = String(b ?? "").trim().toLowerCase();
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
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
export async function fetchRemoteNeighbors({ municipality = null, excludeId = null, excludeEmail = null } = {}) {
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

  return (data ?? [])
    .filter((row) => {
      if (!row?.id) return false;
      if (excludeId && String(row.id) === String(excludeId)) return false;
      if (excludeEmailNorm && String(row.email ?? "").trim().toLowerCase() === excludeEmailNorm) {
        return false;
      }
      const type = String(row.account_type ?? "soused").toLowerCase();
      if (type && type !== "soused") return false;
      if (municipality && !municipalityMatches(row.municipality, municipality)) return false;
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
    categoryId: post.categoryId ?? null,
    marketCategory: post.marketCategory ?? null,
    listingPrice: post.listingPrice ?? null,
    groupId: post.groupId ?? null,
    interactionType: post.interactionType ?? null,
    placeLabel: post.placeLabel ?? null,
  };

  const { error } = await sb.from("posts").upsert(
    {
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
      photos: post.photos ?? [],
      map_pos: post.mapPos ?? null,
      lat: post.lat ?? post.mapPos?.lat ?? null,
      lng: post.lng ?? post.mapPos?.lng ?? null,
      meta: post.meta ?? null,
      payload,
      created_at: post.createdAt
        ? new Date(post.createdAt).toISOString()
        : new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.warn("[supabase] publish post", error.message);
    return false;
  }
  return true;
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
    const m = String(municipality).trim().toLowerCase();
    const filtered = rows.filter((r) => {
      const rm = String(r.municipality ?? "").trim().toLowerCase();
      return !rm || rm === m || rm.includes(m) || m.includes(rm);
    });
    if (filtered.length > 0) rows = filtered;
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

export { rowToFeedPost };
