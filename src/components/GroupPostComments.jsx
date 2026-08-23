import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Avatar } from "./RoleBadge.jsx";
import { formatCommentTime } from "../data/groupPostComments.js";
import { displayCreatorLabel } from "../data/accountTypes.js";

/**
 * Veřejná diskuse u příspěvku ve skupině (vidí všichni členové).
 * Soukromá zpráva autorovi zůstává přes MessageButton vedle.
 */
export default function GroupPostComments({ postId }) {
  const { getGroupPostComments, addGroupPostComment, user } = useApp();
  const comments = getGroupPostComments(postId);
  const [text, setText] = useState("");

  const submit = (e) => {
    e?.preventDefault?.();
    if (!text.trim()) return;
    addGroupPostComment(postId, text);
    setText("");
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
          Zatím bez komentářů — zeptejte se sousedů přímo tady. Soukromou zprávu autorovi najdete výše.
        </p>
      ) : (
        <ul className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <Avatar
                initials={c.authorInitials || "??"}
                name={c.authorName}
                roleId="soused"
                size="sm"
              />
              <div className="min-w-0 flex-1 rounded-xl bg-[#F7FAF8] border border-[#E3EEE9] px-2.5 py-1.5">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-stone-800 truncate">
                    {displayCreatorLabel(c.authorName, c.accountType, { mine: c.mine })}
                  </span>
                  <span className="text-[10px] text-stone-400 shrink-0">
                    {formatCommentTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-[12px] text-stone-700 leading-snug mt-0.5 whitespace-pre-wrap">
                  {c.text}
                </p>
              </div>
            </li>
          ))}
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
