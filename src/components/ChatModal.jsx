import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";

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

export default function ChatModal({ open, onClose, participantName, participantId }) {
  const {
    sendMessage,
    getChatMessages,
    formatPersonName,
    receiveMessage,
    resolveChatParticipantService,
    openCraftsmanPublicProfile,
    ownedService,
    user,
  } = useApp();
  const [text, setText] = useState("");
  const messages = participantId ? getChatMessages(participantId) : [];
  const listRef = useRef(null);

  const participantService = resolveChatParticipantService?.(participantId);
  const displayName = formatPersonName({ id: participantId, name: participantName });

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages.length, messages[messages.length - 1]?.status]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || !participantId) return;
    const outgoing = text.trim();
    sendMessage(participantId, participantName, outgoing);
    setText("");
    window.setTimeout(() => {
      receiveMessage(participantId, participantName, "Díky za zprávu, brzy se ozvu!");
    }, 4000);
  };

  const lastMineIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].sender === "me") return i;
    }
    return -1;
  })();

  const openProfileFromInterest = (meta) => {
    openCraftsmanPublicProfile({
      serviceId: meta?.serviceId ?? ownedService?.id,
      userId: meta?.craftsmanUserId ?? user?.id,
      name: meta?.craftsmanName,
    });
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-white">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-200 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="pp-overlay-back-btn"
          aria-label="Zpět na zprávy"
          title="Zpět"
        >
          ←
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

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => {
          const mine = m.sender === "me";
          const showReadLabel = mine && i === lastMineIdx && m.status === "read";
          const isInterest = m.meta?.kind === "interest";

          return (
            <div key={m.id ?? i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
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
                  <span
                    className={`flex items-center mt-0.5 ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className={`text-[10px] ${mine ? "opacity-70" : "text-stone-400"}`}>
                      {m.time}
                    </span>
                    {mine && <MessageTicks status={m.status ?? "sent"} />}
                  </span>
                </div>
                {showReadLabel && (
                  <p className="text-[10px] text-stone-400 text-right mt-0.5 pr-0.5">Přečteno</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="p-3 border-t border-stone-200 flex gap-2 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Napište zprávu…"
          className="flex-1 px-3 py-2.5 border border-stone-200 rounded-2xl text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#3D7A68] text-white rounded-2xl text-sm font-semibold"
        >
          Odeslat
        </button>
      </form>
    </div>
  );
}
