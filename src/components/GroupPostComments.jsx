import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Avatar } from "./RoleBadge.jsx";
import { formatCommentTime } from "../data/groupPostComments.js";
import { displayCreatorLabel } from "../data/accountTypes.js";
import { isSameAppUser } from "../data/listingSales.js";
import { MessageButton } from "./MessagesPage.jsx";

/**
 * Veřejná diskuse u příspěvku ve skupině.
 * Klepnutím na souseda (avatar / jméno) nebo „Zpráva“ otevřete 1:1 chat.
 */
export default function GroupPostComments({ postId, postTitle = "", groupName = "" }) {
  const { getGroupPostComments, addGroupPostComment, user, startChat } = useApp();
  const comments = getGroupPostComments(postId);
  const [text, setText] = useState("");

  const submit = (e) => {
    e?.preventDefault?.();
    if (!text.trim()) return;
    addGroupPostComment(postId, text);
    setText("");
  };

  const isOwnComment = (c) =>
    Boolean(c.mine) || isSameAppUser(c.authorId, user?.id ?? "me");

  const messageTopic = {
    kind: "group",
    refId: postId,
    title: postTitle || "Příspěvek ve skupině",
    label: groupName ? `Skupina · ${groupName}` : "Skupina",
  };

  const openChatWith = (c) => {
    if (!c?.authorId || isOwnComment(c)) return;
    startChat(c.authorId, c.authorName, null, messageTopic);
  };

  return (
    <div className="pp-group-comments space-y-2 pt-1">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#3D7A68]">
        Diskuse ve skupině
        {comments.length > 0 ? (
          <span className="font-semibold normal-case tracking-normal text-stone-500 ml-1">
            · {comments.length}
          </span>
        ) : null}
      </p>

      {comments.length === 0 ? (
        <p className="text-[11px] text-stone-500 leading-snug">
          Zatím bez komentářů — zeptejte se sousedů přímo tady. Klepnutím na souseda mu pak můžete napsat i soukromě.
        </p>
      ) : (
        <ul className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
          {comments.map((c) => {
            const own = isOwnComment(c);
            const name = displayCreatorLabel(c.authorName, c.accountType, { mine: own });
            return (
              <li key={c.id} className="flex items-start gap-2">
                {own ? (
                  <Avatar
                    initials={c.authorInitials || "??"}
                    name={c.authorName}
                    roleId="soused"
                    size="sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => openChatWith(c)}
                    className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D7A68]/40"
                    aria-label={`Napsat zprávu sousedovi ${c.authorName}`}
                    title={`Napsat ${c.authorName}`}
                  >
                    <Avatar
                      initials={c.authorInitials || "??"}
                      name={c.authorName}
                      roleId="soused"
                      size="sm"
                    />
                  </button>
                )}
                <div className="min-w-0 flex-1 rounded-xl bg-[#F7FAF8] border border-[#E3EEE9] px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {own ? (
                      <span className="text-[11px] font-semibold text-stone-800 truncate">{name}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openChatWith(c)}
                        className="text-[11px] font-semibold text-[#1B4D3E] truncate hover:underline text-left min-w-0"
                        title={`Napsat ${c.authorName}`}
                      >
                        {name}
                      </button>
                    )}
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {formatCommentTime(c.createdAt)}
                    </span>
                    {!own ? (
                      <MessageButton
                        participantId={c.authorId}
                        participantName={c.authorName}
                        topic={messageTopic}
                        compact
                        label="Zpráva"
                        className="ml-auto"
                      />
                    ) : null}
                  </div>
                  <p className="text-[12px] text-stone-700 leading-snug mt-0.5 whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {user ? (
        <form onSubmit={submit} className="flex items-end gap-1.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Napsat komentář pro skupinu…"
            className="flex-1 min-w-0 px-2.5 py-2 rounded-xl text-xs border border-[#C5DDD4] bg-white text-stone-800 resize-none focus:outline-none focus:border-[#3D7A68]"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="shrink-0 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-white bg-[#3D7A68] disabled:opacity-40"
          >
            Poslat
          </button>
        </form>
      ) : null}
    </div>
  );
}
