/**
 * Sdílené přímé zprávy přes Supabase (MVP).
 */

import { ensureSupabase } from "../lib/supabaseClient.js";

export function conversationIdFor(userA, userB) {
  const a = String(userA || "").trim();
  const b = String(userB || "").trim();
  if (!a || !b) return null;
  return [a, b].sort().join("__");
}

function formatMsgTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** Moje lokace u konverzace — z první odeslané zprávy s myLocationId. */
export function locationIdFromChatMessages(messages = []) {
  for (const m of messages) {
    if (m?.sender !== "me") continue;
    const id = m.meta?.myLocationId || m.meta?.locationId;
    if (id) return id;
  }
  return null;
}

/** Řádky DB → pole chatů jako v appce. */
export function rowsToChats(rows, currentUserId) {
  if (!currentUserId || !Array.isArray(rows)) return [];
  const byPeer = new Map();

  const sorted = [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (const row of sorted) {
    const iAmSender = row.sender_id === currentUserId;
    const peerId = iAmSender ? row.recipient_id : row.sender_id;
    if (!peerId || peerId === currentUserId) continue;
    const peerName = iAmSender
      ? row.recipient_name || "Soused"
      : row.sender_name || "Soused";
    const time = formatMsgTime(row.created_at);
    const rowMeta = row.meta && typeof row.meta === "object" ? row.meta : null;
    const msg = {
      id: row.id,
      sender: iAmSender ? "me" : "them",
      text: row.body ?? "",
      time,
      status: iAmSender ? (row.read_at ? "read" : "delivered") : undefined,
      createdAt: row.created_at,
      ...(rowMeta ? { meta: rowMeta } : null),
    };

    let chat = byPeer.get(peerId);
    if (!chat) {
      chat = {
        chatId: `chat-${peerId}`,
        participantId: peerId,
        participantName: peerName,
        lastMessage: msg.text,
        lastTime: time,
        unread: 0,
        messages: [],
        sharedRemote: true,
        locationId: null,
      };
      byPeer.set(peerId, chat);
    } else if (!iAmSender && row.sender_name) {
      chat.participantName = row.sender_name;
    }

    chat.messages.push(msg);
    chat.lastMessage = msg.text;
    chat.lastTime = time;
    if (!iAmSender && !row.read_at) {
      chat.unread = (chat.unread ?? 0) + 1;
    }
    if (!chat.locationId && iAmSender) {
      const fromMeta = rowMeta?.myLocationId || rowMeta?.locationId;
      if (fromMeta) chat.locationId = fromMeta;
    }
  }

  return [...byPeer.values()]
    .map((chat) => ({
      ...chat,
      locationId: chat.locationId || locationIdFromChatMessages(chat.messages),
    }))
    .sort((a, b) => {
      const ta = a.messages[a.messages.length - 1]?.createdAt ?? "";
      const tb = b.messages[b.messages.length - 1]?.createdAt ?? "";
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
}

export async function fetchRemoteMessages(currentUserId) {
  if (!currentUserId) return [];
  const sb = await ensureSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("direct_messages")
    .select("*")
    .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) {
    console.warn("[supabase] fetch messages", error.message);
    return [];
  }
  return data ?? [];
}

export async function publishRemoteMessage({
  id,
  senderId,
  senderName,
  recipientId,
  recipientName,
  text,
  meta = null,
}) {
  if (!senderId || !recipientId || !text?.trim()) return false;
  const sb = await ensureSupabase();
  if (!sb) return false;
  const conversationId = conversationIdFor(senderId, recipientId);
  if (!conversationId) return false;

  const { error } = await sb.from("direct_messages").upsert(
    {
      id: id || `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      sender_name: senderName || "Soused",
      recipient_id: recipientId,
      recipient_name: recipientName || "Soused",
      body: text.trim(),
      meta: meta && typeof meta === "object" ? meta : {},
    },
    { onConflict: "id" }
  );
  if (error) {
    console.warn("[supabase] publish message", error.message);
    return false;
  }
  return true;
}

export async function markRemoteMessagesRead(currentUserId, peerId) {
  if (!currentUserId || !peerId) return;
  const sb = await ensureSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("direct_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", currentUserId)
    .eq("sender_id", peerId)
    .is("read_at", null);
  if (error) console.warn("[supabase] mark read", error.message);
}

/** Realtime nové zprávy pro aktuálního uživatele. */
export async function subscribeRemoteMessages(currentUserId, onRow) {
  if (!currentUserId || typeof onRow !== "function") return () => {};
  const sb = await ensureSupabase();
  if (!sb) return () => {};

  const channel = sb
    .channel(`dm-${currentUserId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "direct_messages" },
      (payload) => {
        const row = payload.new;
        if (!row) return;
        if (row.sender_id !== currentUserId && row.recipient_id !== currentUserId) return;
        onRow(row);
      }
    )
    .subscribe();

  return () => {
    try {
      sb.removeChannel(channel);
    } catch {
      /* ignore */
    }
  };
}
