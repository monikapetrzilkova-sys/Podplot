import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Avatar } from "./RoleBadge.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import {
  groupMessagesByTopic,
  formatTopicHeading,
  topicToMessageMeta,
  normalizeChatTopic,
  topicSectionKey,
  topicPreviewText,
  topicLastTime,
  chatTopicKindLabel,
} from "../data/chatTopics.js";

/** Messenger-style fajfky: odesláno / doručeno / přečteno */
function MessageTicks({ status = "sent" }) {
  const read = status === "read";
  const delivered = status === "delivered" || read;
  const color = read ? "#93c5a8" : "rgba(255,255,255,0.65)";

  return (
    <span
      className="inline-flex items-center ml-1 align-middle"
      title={read ? "Přečteno" : delivered ? "Doručeno" : "Odesláno"}
      aria-label={read ? "Přečteno" : delivered ? "Doručeno" : "Odesláno"}
    >
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden>
        <path
          d="M1.2 5.8L3.6 8.2 8.8 2.2"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {delivered && (
          <path
            d="M5.2 5.8L7.6 8.2 12.8 2.2"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  );
}

function ChatBubble({ m, mine, showReadLabel }) {
  const { openCraftsmanPublicProfile, ownedService, user } = useApp();
  const isInterest = m.meta?.kind === "interest";

  const openProfileFromInterest = (meta) => {
    openCraftsmanPublicProfile({
      serviceId: meta?.serviceId ?? ownedService?.id,
      userId: meta?.craftsmanUserId ?? user?.id,
      name: meta?.craftsmanName,
    });
  };

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[88%]">
        <div
          className={`px-3 py-2 rounded-2xl text-sm ${
            mine
              ? "bg-[#3D7A68] text-white rounded-br-md"
              : "bg-white text-stone-800 rounded-bl-md border border-stone-200"
          }`}
        >
          {m.text}
          {isInterest && (
            <div className={`mt-2 pt-2 border-t ${mine ? "border-white/25" : "border-stone-200"}`}>
              <button
                type="button"
                onClick={() => openProfileFromInterest(m.meta)}
                className={`text-[11px] font-semibold underline underline-offset-2 ${
                  mine ? "text-white/95" : "text-[#3D7A68]"
                }`}
              >
                {mine
                  ? "Náhled mého profilu (jak ho vidí klient)"
                  : `Profil · ${m.meta.craftsmanName ?? "řemeslník"} · recenze`}
              </button>
            </div>
          )}
          <span className={`flex items-center mt-0.5 ${mine ? "justify-end" : "justify-start"}`}>
            <span className={`text-[10px] ${mine ? "opacity-70" : "text-stone-400"}`}>{m.time}</span>
            {mine && <MessageTicks status={m.status ?? "sent"} />}
          </span>
        </div>
        {showReadLabel && (
          <p className="text-[10px] text-stone-400 text-right mt-0.5 pr-0.5">Přečteno</p>
        )}
      </div>
    </div>
  );
}

function ThreadHeader({ section, expanded, onToggle }) {
  const count = section.messages.length;
  const kind = section.topic?.label || chatTopicKindLabel(section.topic?.kind);
  const title = section.topic?.title || formatTopicHeading(section.topic);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={`w-full text-left px-3.5 py-3 flex items-start gap-2.5 transition-colors ${
        expanded ? "bg-emerald-50" : "bg-white hover:bg-stone-50"
      }`}
    >
      <span
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
          expanded
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-stone-300 text-stone-400"
        }`}
        aria-hidden
      >
        {expanded ? "−" : "+"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${
              expanded
                ? "text-emerald-900 bg-emerald-100 border-emerald-200"
                : "text-stone-600 bg-stone-50 border-stone-200"
            }`}
          >
            {kind}
          </span>
          {count > 0 ? (
            <span className="text-[10px] text-stone-400 tabular-nums">
              {count} {count === 1 ? "zpráva" : count < 5 ? "zprávy" : "zpráv"}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md">
              Nové vlákno
            </span>
          )}
          {topicLastTime(section) ? (
            <span className="text-[10px] text-stone-400 ml-auto">{topicLastTime(section)}</span>
          ) : null}
        </div>
        <p className="text-sm font-semibold text-stone-900 mt-1 line-clamp-2 leading-snug">{title}</p>
        {!expanded && (
          <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{topicPreviewText(section)}</p>
        )}
      </div>
    </button>
  );
}

export default function ChatModal({
  open,
  onClose,
  participantName,
  participantId,
  activeTopic = null,
}) {
  const {
    sendMessage,
    getChatMessages,
    formatPersonName,
    resolveChatParticipantService,
    openCraftsmanPublicProfile,
    setChatActiveTopic,
    getPersonPhoto,
  } = useApp();
  const [text, setText] = useState("");
  const [didInitThread, setDidInitThread] = useState(false);
  const messages = participantId ? getChatMessages(participantId) : [];
  const listRef = useRef(null);
  const openPanelRef = useRef(null);
  const topic = normalizeChatTopic(activeTopic);
  const activeKey = topic ? topicSectionKey(topic) : null;

  const participantService = resolveChatParticipantService?.(participantId);
  const displayName = formatPersonName({ id: participantId, name: participantName });
  const participantPhoto = getPersonPhoto?.(participantId);
  const participantInitials = (participantName || displayName || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sections = useMemo(
    () => groupMessagesByTopic(messages, { ensureTopic: topic }),
    [messages, topic]
  );

  const openSection = useMemo(
    () => (activeKey ? sections.find((s) => s.key === activeKey) : null) ?? null,
    [sections, activeKey]
  );

  useEffect(() => {
    if (!open) {
      setDidInitThread(false);
      return;
    }
    setDidInitThread(false);
  }, [open, participantId]);

  useEffect(() => {
    if (!open || didInitThread) return;
    if (topic) {
      setDidInitThread(true);
      return;
    }
    const withMsgs = sections.find((s) => s.messages.length > 0);
    const fallback = withMsgs || sections.find((s) => s.key === "general") || sections[0];
    if (fallback) {
      setChatActiveTopic?.(fallback.topic);
    }
    setDidInitThread(true);
  }, [open, didInitThread, topic, sections, setChatActiveTopic]);

  useEffect(() => {
    if (!open || !listRef.current || !openSection) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, openSection?.key, openSection?.messages?.length, messages[messages.length - 1]?.status]);

  useEffect(() => {
    if (!open || !openPanelRef.current) return;
    openPanelRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open, activeKey]);

  if (!open) return null;

  const selectThread = (section) => {
    if (section.key === activeKey) return;
    setChatActiveTopic?.(section.topic);
    setText("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || !participantId || !openSection) return;
    const outgoing = text.trim();
    const meta =
      openSection.key === "general" ? null : topicToMessageMeta(openSection.topic);
    sendMessage(participantId, participantName, outgoing, meta);
    setText("");
  };

  const threadMessages = openSection?.messages ?? [];
  const lastMineId = (() => {
    for (let i = threadMessages.length - 1; i >= 0; i -= 1) {
      if (threadMessages[i].sender === "me") return threadMessages[i].id;
    }
    return null;
  })();

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay pp-chat-overlay" role="dialog" aria-label={`Chat · ${displayName}`}>
        <div className="pp-app-sheet pp-app-sheet--full pp-chat-sheet flex flex-col">
          <header className="pp-chat-header">
            <button
              type="button"
              onClick={onClose}
              className="pp-overlay-back-btn"
              aria-label="Zpět na zprávy"
              title="Zpět"
            >
              ←
            </button>
            <Avatar
              initials={participantInitials || "??"}
              roleId="soused"
              size="sm"
              photo={participantPhoto}
            />
            {participantService ? (
              <button
                type="button"
                onClick={() =>
                  openCraftsmanPublicProfile({
                    serviceId: participantService.id,
                    userId: participantService.ownerUserId,
                    name: participantService.name,
                  })
                }
                className="font-semibold text-[#1B4D3E] truncate text-left hover:underline underline-offset-2 min-w-0 flex-1"
                title="Zobrazit profil a recenze"
              >
                {displayName}
              </button>
            ) : (
              <h2 className="font-semibold text-stone-900 truncate min-w-0 flex-1">{displayName}</h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="pp-chat-close-text"
              aria-label="Zavřít chat"
            >
              Zavřít
            </button>
          </header>

          <p className="shrink-0 px-3.5 py-2 text-[11px] text-stone-500 border-b border-stone-100 bg-stone-50">
            Všechna témata zůstávají nahoře — klepnutím rozbalíte jiné vlákno.
          </p>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {sections.map((section) => {
              const expanded = section.key === activeKey;
              return (
                <section
                  key={section.key}
                  ref={expanded ? openPanelRef : null}
                  className="border-b border-stone-200"
                >
                  <ThreadHeader
                    section={section}
                    expanded={expanded}
                    onToggle={() => selectThread(section)}
                  />
                  {expanded ? (
                    <div className="bg-[#F7F8F7] border-t border-emerald-100">
                      <div
                        ref={listRef}
                        className="max-h-[min(42vh,360px)] overflow-y-auto px-3 py-3 space-y-2.5"
                      >
                        {threadMessages.length === 0 ? (
                          <p className="text-sm text-stone-400 text-center py-6 px-3 leading-relaxed">
                            Nové vlákno. Napište první zprávu níže — ostatní témata zůstanou vidět.
                          </p>
                        ) : (
                          threadMessages.map((m) => {
                            const mine = m.sender === "me";
                            const showReadLabel =
                              mine && m.id === lastMineId && m.status === "read";
                            return (
                              <ChatBubble
                                key={m.id}
                                m={m}
                                mine={mine}
                                showReadLabel={showReadLabel}
                              />
                            );
                          })
                        )}
                      </div>
                      <form
                        onSubmit={submit}
                        className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-1 flex gap-2 bg-[#F7F8F7] sticky bottom-0"
                      >
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder={
                            section.key === "general"
                              ? "Napište zprávu…"
                              : `Zpráva · ${section.topic?.title || section.topic?.label || "téma"}…`
                          }
                          className="flex-1 px-3 py-2.5 border border-stone-200 rounded-2xl text-sm bg-white"
                          enterKeyHint="send"
                          autoComplete="off"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-[#3D7A68] text-white rounded-2xl text-sm font-semibold shrink-0"
                        >
                          Odeslat
                        </button>
                      </form>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
