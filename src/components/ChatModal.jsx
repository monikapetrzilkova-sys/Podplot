import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
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
      <div className="max-w-[85%]">
        <div
          className={`px-3 py-2 rounded-2xl text-sm ${
            mine
              ? "bg-[#3D7A68] text-white rounded-br-md"
              : "bg-stone-100 text-stone-800 rounded-bl-md"
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

function ThreadChip({ section, selected, onSelect }) {
  const count = section.messages.length;
  const kind = section.topic?.label || chatTopicKindLabel(section.topic?.kind);
  const title = section.topic?.title || formatTopicHeading(section.topic);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full text-left rounded-2xl border px-3.5 py-2.5 transition-colors ${
        selected
          ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
          : "border-stone-200 bg-white hover:border-emerald-200 hover:bg-stone-50"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${
                selected
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
          </div>
          <p className="text-sm font-semibold text-stone-900 mt-1 line-clamp-2 leading-snug">{title}</p>
          <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{topicPreviewText(section)}</p>
        </div>
        <div className="shrink-0 text-right">
          {topicLastTime(section) ? (
            <p className="text-[10px] text-stone-400">{topicLastTime(section)}</p>
          ) : null}
          <span className={`text-xs font-bold ${selected ? "text-emerald-700" : "text-stone-300"}`}>
            {selected ? "●" : "○"}
          </span>
        </div>
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
    receiveMessage,
    resolveChatParticipantService,
    openCraftsmanPublicProfile,
    setChatActiveTopic,
  } = useApp();
  const [text, setText] = useState("");
  const [didInitThread, setDidInitThread] = useState(false);
  const messages = participantId ? getChatMessages(participantId) : [];
  const listRef = useRef(null);
  const topic = normalizeChatTopic(activeTopic);
  const activeKey = topic ? topicSectionKey(topic) : null;

  const participantService = resolveChatParticipantService?.(participantId);
  const displayName = formatPersonName({ id: participantId, name: participantName });

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

  if (!open) return null;

  const selectThread = (section) => {
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
    window.setTimeout(() => {
      receiveMessage(participantId, participantName, "Díky za zprávu, brzy se ozvu!");
    }, 4000);
  };

  const threadMessages = openSection?.messages ?? [];
  const lastMineId = (() => {
    for (let i = threadMessages.length - 1; i >= 0; i -= 1) {
      if (threadMessages[i].sender === "me") return threadMessages[i].id;
    }
    return null;
  })();

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-white">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-200 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="pp-overlay-back-btn"
          aria-label="Zavřít"
          title="Zavřít"
        >
          ×
        </button>
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
            className="font-semibold text-[#1B4D3E] truncate text-left hover:underline underline-offset-2 min-w-0"
            title="Zobrazit profil a recenze"
          >
            {displayName}
          </button>
        ) : (
          <h2 className="font-semibold text-stone-900 truncate min-w-0">{displayName}</h2>
        )}
      </header>

      <div className="shrink-0 max-h-[40vh] overflow-y-auto px-3 pt-3 pb-2 border-b border-stone-100">
        <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400 mb-2">
          Témata · klepněte pro otevření vlákna
        </p>
        <div className="space-y-2">
          {sections.map((section) => (
            <ThreadChip
              key={section.key}
              section={section}
              selected={section.key === activeKey}
              onSelect={() => selectThread(section)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-[#FAFAFA]">
        {openSection ? (
          <>
            <div className="px-3 py-2 border-b border-stone-100 bg-white shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                Rozbalené vlákno
              </p>
              <p className="text-xs font-semibold text-stone-800 truncate">
                {formatTopicHeading(openSection.topic)}
              </p>
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {threadMessages.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-10 px-4 leading-relaxed">
                  Nové vlákno k tomuto tématu. Napište první zprávu níže.
                </p>
              ) : (
                threadMessages.map((m) => {
                  const mine = m.sender === "me";
                  const showReadLabel = mine && m.id === lastMineId && m.status === "read";
                  return (
                    <ChatBubble key={m.id} m={m} mine={mine} showReadLabel={showReadLabel} />
                  );
                })
              )}
            </div>
            <form
              onSubmit={submit}
              className="p-3 border-t border-stone-200 flex gap-2 shrink-0 bg-white"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  openSection.key === "general"
                    ? "Napište zprávu…"
                    : `Zpráva · ${openSection.topic?.title || openSection.topic?.label || "téma"}…`
                }
                className="flex-1 px-3 py-2.5 border border-stone-200 rounded-2xl text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#3D7A68] text-white rounded-2xl text-sm font-semibold"
              >
                Odeslat
              </button>
            </form>
          </>
        ) : (
          <p className="text-sm text-stone-400 text-center py-12 px-6">
            Vyberte téma výše — zobrazí se celá konverzace k němu.
          </p>
        )}
      </div>
    </div>
  );
}
