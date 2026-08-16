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
  const { error } = await sb.from("profiles").upsert(
    {
      id: user.id,
      name: user.name,
      email: user.email ?? null,
      address: user.address ?? null,
      account_type: user.accountType ?? null,
      initials: user.initials ?? null,
      municipality: user.geo?.city ?? user.location ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
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
