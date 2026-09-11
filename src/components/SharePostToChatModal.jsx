import { useMemo, useState } from "react";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import { Avatar } from "./RoleBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { isCurrentUserRef, isSelfNeighborCandidate } from "../data/listingSales.js";
import { topicFromPost, topicFromGroupPost } from "../data/chatTopics.js";
import { isGroupBoardDiscussionPost } from "../data/groups.js";

function buildShareMessage(post, note) {
  const title = String(post?.title || "Příspěvek z Podplotu").trim();
  const body = String(post?.body || "").replace(/\s+/g, " ").trim();
  const snippet = body.length > 140 ? `${body.slice(0, 140)}…` : body;
  const intro = String(note || "").trim() || "Hele, mrkni na tohle v Podplotu:";
  return [intro, title, snippet].filter(Boolean).join("\n");
}

/** Pošle příspěvek / inzerát vybranému sousedovi jako zprávu v Podplotu. */
export default function SharePostToChatModal({ post, open, onClose }) {
  const { user, chats, neighbors, startChat, showToast } = useApp();
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const recipients = useMemo(() => {
    const map = new Map();
    for (const chat of chats ?? []) {
      const id = chat?.participantId;
      if (!id || isCurrentUserRef(id, user)) continue;
      map.set(id, {
        id,
        name: chat.participantName || "Soused",
        source: "chat",
      });
    }
    for (const n of neighbors ?? []) {
      if (!n?.id || isSelfNeighborCandidate(n, user) || isCurrentUserRef(n.id, user)) continue;
      if (!map.has(n.id)) {
        map.set(n.id, {
          id: n.id,
          name: n.name || "Soused",
          source: "neighbor",
        });
      }
    }
    return [...map.values()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "cs", { sensitivity: "base" })
    );
  }, [chats, neighbors, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("cs");
    if (!q) return recipients;
    return recipients.filter((r) => String(r.name).toLocaleLowerCase("cs").includes(q));
  }, [recipients, query]);

  const selected = filtered.find((r) => r.id === selectedId) ?? recipients.find((r) => r.id === selectedId);

  if (!open || !post) return null;

  const send = () => {
    if (!selected) {
      showToast?.("Vyber, komu to chceš poslat.", "info");
      return;
    }
    const isGroup = isGroupBoardDiscussionPost(post);
    const topic = isGroup ? topicFromGroupPost(post) : topicFromPost(post);
    startChat(selected.id, selected.name, buildShareMessage(post, note), topic);
    showToast?.(`Odesláno ${selected.name}.`, "success");
    onClose?.();
    setQuery("");
    setNote("");
    setSelectedId(null);
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-app-sheet" role="dialog" aria-label="Poslat ve zprávě">
          <div className="pp-app-sheet-body p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-stone-900">Poslat ve zprávě</h2>
                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{post.title}</p>
              </div>
              <button type="button" onClick={onClose} className="text-stone-400 text-xl px-1" aria-label="Zavřít">
                ×
              </button>
            </div>

            <label className="block text-[11px] font-semibold text-stone-600 mb-1">Komu</label>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledej podle jména…"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />

            <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-100 divide-y divide-stone-100 mb-3">
              {filtered.length === 0 ? (
                <p className="text-xs text-stone-500 p-3">
                  Nikdo zatím není v seznamu. Až si s někým napíšeš nebo potvrdíš souseda, objeví se tady.
                </p>
              ) : (
                filtered.map((r) => {
                  const active = selectedId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left ${
                        active ? "bg-[#E8F3EF]" : "bg-white hover:bg-stone-50"
                      }`}
                    >
                      <Avatar initials={(r.name || "?").slice(0, 2)} name={r.name} roleId="soused" size="sm" />
                      <span className="text-sm font-semibold text-stone-800 truncate flex-1">{r.name}</span>
                      {active ? (
                        <span className="text-[10px] font-bold text-[#3D7A68]">Vybráno</span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Zpráva (volitelné)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Např. Tohle by se ti mohlo hodit…"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold border border-stone-200 rounded-xl"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={send}
                disabled={!selected}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#3D7A68] rounded-xl disabled:opacity-50"
              >
                Poslat
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
