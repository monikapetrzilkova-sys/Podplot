import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "../lib/supabaseClient.js";

/**
 * Live Presence kolegů v administraci instituce.
 * Preferuje Supabase Realtime Presence; fallback = BroadcastChannel + heartbeat v localStorage.
 *
 * @param {{
 *   institutionId: string | null | undefined,
 *   userId: string | null | undefined,
 *   displayName: string,
 *   editingRecordKey?: string | null,
 *   enabled?: boolean,
 * }} opts
 */
export function useInstitutionPresence({
  institutionId,
  userId,
  displayName,
  editingRecordKey = null,
  enabled = true,
}) {
  const [peers, setPeers] = useState([]);

  const roomKey = institutionId ? `institution:${institutionId}` : null;

  useEffect(() => {
    if (!enabled || !roomKey || !userId) {
      setPeers([]);
      return undefined;
    }

    const self = {
      userId,
      displayName: displayName || "Kolega",
      editingRecordKey: editingRecordKey || null,
      at: Date.now(),
    };

    const sb = getSupabase();
    if (sb) {
      const channel = sb.channel(roomKey, {
        config: { presence: { key: userId } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const list = [];
          Object.values(state).forEach((arr) => {
            (arr || []).forEach((p) => {
              if (p.userId && p.userId !== userId) list.push(p);
            });
          });
          setPeers(list);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track(self);
          }
        });

      const heartbeat = window.setInterval(() => {
        channel.track({ ...self, editingRecordKey: editingRecordKey || null, at: Date.now() });
      }, 12000);

      return () => {
        window.clearInterval(heartbeat);
        sb.removeChannel(channel);
      };
    }

    // —— Lokální fallback (stejný prohlížeč / taby) ——
    const storageKey = `pp-presence:${roomKey}`;
    const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(storageKey) : null;

    const readPeers = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const now = Date.now();
        const list = Object.values(raw).filter(
          (p) => p?.userId && p.userId !== userId && now - (p.at ?? 0) < 25000
        );
        setPeers(list);
        return raw;
      } catch {
        setPeers([]);
        return {};
      }
    };

    const writeSelf = () => {
      const map = readPeers();
      map[userId] = {
        ...self,
        editingRecordKey: editingRecordKey || null,
        at: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(map));
      bc?.postMessage({ type: "presence", map });
      readPeers();
    };

    writeSelf();
    const iv = window.setInterval(writeSelf, 8000);
    const onStorage = (e) => {
      if (e.key === storageKey) readPeers();
    };
    window.addEventListener("storage", onStorage);
    bc?.addEventListener("message", () => readPeers());

    return () => {
      window.clearInterval(iv);
      window.removeEventListener("storage", onStorage);
      try {
        const map = JSON.parse(localStorage.getItem(storageKey) || "{}");
        delete map[userId];
        localStorage.setItem(storageKey, JSON.stringify(map));
        bc?.postMessage({ type: "leave" });
      } catch {
        /* ignore */
      }
      bc?.close();
    };
  }, [enabled, roomKey, userId, displayName, editingRecordKey]);

  const conflictPeers = useMemo(() => {
    if (!editingRecordKey) return [];
    return peers.filter((p) => p.editingRecordKey && p.editingRecordKey === editingRecordKey);
  }, [peers, editingRecordKey]);

  return { peers, conflictPeers, hasConflict: conflictPeers.length > 0 };
}
