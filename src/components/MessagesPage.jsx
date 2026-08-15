import { useApp } from "../context/AppContext.jsx";
import NewMessageComposer from "./NewMessageComposer.jsx";
import { Avatar } from "./RoleBadge.jsx";
import PersonLabel from "./PersonLabel.jsx";

export default function MessagesPage({ embedded = false }) {
  const { chats, openChat, blockedUserIds } = useApp();

  const visible = chats.filter((c) => !blockedUserIds.includes(c.participantId));

  return (
    <div className="px-4 py-4 pb-8">
      {!embedded && <h2 className="text-lg font-bold text-stone-900 mb-4">💬 Zprávy</h2>}

      <NewMessageComposer />

      {visible.length === 0 ? (
        <p className="text-sm text-stone-500 bg-stone-50 rounded-2xl p-4">
          Zatím žádné konverzace. Vyhledejte souseda výše nebo napište z inzerátu či akce.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 mb-1">Konverzace</p>
          {visible.map((chat) => {
            const unread = chat.unread ?? 0;
            return (
              <button
                key={chat.chatId}
                type="button"
                onClick={() => openChat(chat.participantId, chat.participantName)}
                className={`w-full text-left bg-white border rounded-2xl p-4 hover:border-emerald-300 transition-colors ${
                  unread > 0 ? "border-emerald-300 bg-emerald-50/30" : "border-stone-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={chat.participantName
                      .split(/\s+/)
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                    roleId="soused"
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`truncate ${unread > 0 ? "font-bold text-stone-900" : "font-semibold text-stone-900"}`}>
                        <PersonLabel personId={chat.participantId} name={chat.participantName} />
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {unread > 0 && (
                          <span
                            className="min-w-[1.125rem] h-[1.125rem] px-1 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                            style={{ background: "#3D7A68" }}
                          >
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400">{chat.lastTime}</span>
                      </div>
                    </div>
                    <p className={`text-sm truncate ${unread > 0 ? "text-stone-700 font-medium" : "text-stone-500"}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MessageButton({
  participantId,
  participantName,
  className = "",
  compact = false,
  primary = false,
}) {
  const { startChat } = useApp();

  const base = primary
    ? "w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#3D7A68] rounded-xl border border-[#3D7A68] hover:bg-[#346859] shadow-sm"
    : `font-semibold text-[#1B4D3E] bg-[#F1F6F5] rounded-xl border border-[#C5DDD4] hover:bg-[#E8F3EF] whitespace-nowrap shrink-0 ${
        compact ? "text-[11px] px-2 py-1.5" : "text-xs px-3 py-1.5"
      }`;

  return (
    <button
      type="button"
      onClick={() => startChat(participantId, participantName)}
      className={`${base} ${className}`.trim()}
    >
      {primary || !compact ? "Napsat zprávu" : "Zpráva"}
    </button>
  );
}

