import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Avatar } from "./RoleBadge.jsx";
import { formatContactReasons, searchMessageContacts } from "../data/messageContacts.js";

export default function NewMessageComposer() {
  const {
    user,
    messageContactDirectory,
    suggestedMessageContacts,
    startChat,
    blockedUserIds,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const excludeIds = [...blockedUserIds, user?.id, "me"].filter(Boolean);
  const searchResults = searchMessageContacts(query, messageContactDirectory, {
    excludeIds,
    excludeName: user?.name,
  });

  const showSuggestions = open && !query.trim() && suggestedMessageContacts.length > 0;
  const showSearch = open && query.trim().length >= 1;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const reset = () => {
    setQuery("");
    setSelected(null);
    setDraft("");
    setOpen(false);
  };

  const pickContact = (contact) => {
    setSelected(contact);
    setQuery(contact.displayName ?? contact.name);
  };

  const submit = (e) => {
    e.preventDefault();
    const contact = selected ?? searchResults[0];
    if (!contact) return;
    startChat(contact.id, contact.name, draft.trim() || undefined);
    reset();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full mb-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
      >
        + Nová zpráva
      </button>
    );
  }

  return (
    <section className="mb-4 pp-card p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-stone-800">Nová zpráva</h3>
        <button type="button" onClick={reset} className="text-xs text-stone-500 hover:text-stone-700">
          Zrušit
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder="Hledat souseda nebo uživatele…"
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            autoComplete="off"
          />

          {showSuggestions && (
            <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 px-3 py-2 bg-stone-50 border-b border-stone-100">
                Doporučení podle vaší aktivity
              </p>
              <ul className="max-h-48 overflow-y-auto">
                {suggestedMessageContacts.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pickContact(c)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-emerald-50 transition-colors"
                    >
                      <Avatar initials={c.initials} roleId="soused" size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-900 truncate">{c.displayName ?? c.name}</p>
                        <p className="text-[11px] text-emerald-700 truncate">{formatContactReasons(c.reasons)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showSearch && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-lg">
              {searchResults.length === 0 ? (
                <p className="px-3 py-3 text-xs text-stone-500">Nikdo takto jmenovaný v okolí není.</p>
              ) : (
                <ul className="max-h-52 overflow-y-auto">
                  {searchResults.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => pickContact(c)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-stone-50"
                      >
                        <Avatar initials={c.initials} roleId="soused" size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-stone-900 truncate">{c.displayName ?? c.name}</p>
                          {c.sources?.[0] && (
                            <p className="text-[11px] text-stone-400 truncate">{c.sources[0]}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <Avatar initials={selected.initials} roleId="soused" size="sm" />
            <span className="text-sm font-medium text-emerald-900 flex-1 truncate">{selected.displayName ?? selected.name}</span>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              className="text-stone-400 hover:text-stone-600 text-sm"
              aria-label="Odebrat příjemce"
            >
              ×
            </button>
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="První zpráva (volitelné)…"
          rows={2}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />

        <button
          type="submit"
          disabled={!selected && searchResults.length === 0}
          className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
        >
          {draft.trim() ? "Odeslat zprávu" : "Otevřít konverzaci"}
        </button>
      </form>
    </section>
  );
}
