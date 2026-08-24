import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Avatar } from "./RoleBadge.jsx";
import { formatContactReasons, searchMessageContacts } from "../data/messageContacts.js";

/**
 * Adresář v lokalitě → zpráva.
 * Bez přátelství, follow a počítání známostí.
 */
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
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold hover:bg-[#346859] transition-colors"
        >
          Napsat sousedovi
        </button>
        <p className="mt-1.5 text-[10px] text-stone-500 leading-snug text-center">
          Hledání podle jména v okolí · jen zpráva, bez přátelství
        </p>
      </div>
    );
  }

  return (
    <section className="mb-4 pp-card p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-stone-800">Napsat sousedovi</h3>
          <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
            Najděte člověka z okolí podle jména a napište mu. Není to žádost o přátelství.
          </p>
        </div>
        <button type="button" onClick={reset} className="text-xs text-stone-500 hover:text-stone-700 shrink-0">
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
            placeholder="Hledat podle jména v okolí…"
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/25"
            autoComplete="off"
            aria-label="Hledat souseda podle jména"
          />

          {showSuggestions && (
            <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 px-3 py-2 bg-stone-50 border-b border-stone-100">
                Nedávný kontakt z okolí
              </p>
              <ul className="max-h-48 overflow-y-auto">
                {suggestedMessageContacts.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pickContact(c)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#F1F6F5] transition-colors"
                    >
                      <Avatar initials={c.initials} roleId="soused" size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {c.displayName ?? c.name}
                        </p>
                        <p className="text-[11px] text-[#3D7A68] truncate">
                          {formatContactReasons(c.reasons) || "Z okolí"}
                        </p>
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
                <p className="px-3 py-3 text-xs text-stone-500">
                  V okolí nikdo s tímto jménem není (nebo ještě není v Podplotu).
                </p>
              ) : (
                <ul className="max-h-52 overflow-y-auto">
                  {searchResults.map((c) => {
                    const fromNeighbors = (c.sources ?? []).some((s) => /soused/i.test(String(s)));
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => pickContact(c)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-stone-50"
                        >
                          <Avatar initials={c.initials} roleId="soused" size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-stone-900 truncate">
                              {c.displayName ?? c.name}
                            </p>
                            <p className="text-[11px] text-stone-400 truncate">
                              {fromNeighbors
                                ? "Soused v lokalitě"
                                : c.sources?.[0] || "Z okolí"}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex items-center gap-2 bg-[#E8F3EF] border border-[#C5DDD4] rounded-xl px-3 py-2">
            <Avatar initials={selected.initials} roleId="soused" size="sm" />
            <span className="text-sm font-medium text-[#1B4D3E] flex-1 truncate">
              {selected.displayName ?? selected.name}
            </span>
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
          placeholder="Např. Ahoj, bydlíme ve stejné ulici…"
          rows={2}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/25"
        />

        <button
          type="submit"
          disabled={!selected && searchResults.length === 0}
          className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#346859]"
        >
          {draft.trim() ? "Odeslat zprávu" : "Otevřít konverzaci"}
        </button>
      </form>
    </section>
  );
}
