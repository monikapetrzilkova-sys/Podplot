import { useUiPref } from "../hooks/useUiPref.js";
import { UI_KEYS } from "../data/uiPreferences.js";
import GroupProposalCard from "./GroupProposalCard.jsx";
import { DoodleListIcon } from "./doodle/doodleIcons.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function GroupProposalsSection({
  proposals,
  dismissedProposals,
  onVote,
  onDismiss,
  onRestore,
  compactTitle = false,
}) {
  const { user } = useApp();
  const [minimized, , toggleMinimized] = useUiPref(UI_KEYS.GROUP_PROPOSALS_MINIMIZED, false);
  const [showDismissed, setShowDismissed] = useUiPref(UI_KEYS.GROUP_PROPOSALS_ARCHIVE_OPEN, false);

  const isMine = (p) => {
    if (user?.id && (p.proposerId === user.id || p.proposer_id === user.id)) return true;
    if (user?.name && p.proposer && String(p.proposer).trim() === String(user.name).trim()) return true;
    return false;
  };

  if (proposals.length === 0 && dismissedProposals.length === 0) return null;

  const titleClass = compactTitle
    ? "text-[11px] font-bold uppercase tracking-widest text-stone-400"
    : "text-sm font-bold text-stone-900";

  if (minimized) {
    return (
      <section className="pp-card p-3">
        <button
          type="button"
          onClick={toggleMinimized}
          className="w-full flex items-center justify-between gap-3 text-left"
          aria-expanded={false}
        >
          <span className={`${titleClass} inline-flex items-center gap-1.5`}>
            <DoodleListIcon className="w-4 h-4 text-[#3D7A68]" />
            Návrhy na nové skupiny
            {proposals.length > 0 && (
              <span className="font-semibold text-stone-500 normal-case tracking-normal ml-1">
                ({proposals.length})
              </span>
            )}
          </span>
          <span className="shrink-0 text-xs font-semibold text-emerald-700">Rozbalit ▼</span>
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className={`${titleClass} inline-flex items-center gap-1.5`}>
          <DoodleListIcon className="w-4 h-4 text-[#3D7A68]" />
          Návrhy na nové skupiny
        </h3>
        <button
          type="button"
          onClick={toggleMinimized}
          className="shrink-0 text-xs font-semibold text-stone-500 hover:text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-100"
          aria-expanded={true}
          title="Minimalizovat sekci návrhů"
        >
          Minimalizovat ▲
        </button>
      </div>

      {proposals.length > 0 && (
        <>
          <p className="text-xs text-stone-500 mb-3">
            Ověření sousedé mohou podpořit vznik komunity přímo tady na Domů. Nezajímavé návrhy skryjte křížkem.
          </p>
          <div className="space-y-2">
            {proposals.map((p) => (
              <GroupProposalCard
                key={p.id}
                proposal={p}
                onVote={onVote}
                onDismiss={onDismiss}
                mine={isMine(p)}
              />
            ))}
          </div>
        </>
      )}

      {dismissedProposals.length > 0 && (
        <div className={proposals.length > 0 ? "mt-4" : ""}>
          <button
            type="button"
            onClick={() => setShowDismissed(!showDismissed)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-700"
          >
            {showDismissed ? "▲ Skrýt archiv návrhů" : `▼ Archiv skrytých návrhů (${dismissedProposals.length})`}
          </button>
          {showDismissed && (
            <div className="space-y-2 mt-2 opacity-80">
              {dismissedProposals.map((p) => (
                <article key={p.id} className="pp-card p-3 max-w-md flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-700 truncate">{p.name}</p>
                    <p className="text-[10px] text-stone-400">
                      {p.votes}/{p.required} podpor · skryto
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRestore(p.id)}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200"
                  >
                    Obnovit
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
