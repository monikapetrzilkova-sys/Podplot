import { useUiPref } from "../hooks/useUiPref.js";
import { UI_KEYS } from "../data/uiPreferences.js";
import GroupProposalCard from "./GroupProposalCard.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function GroupProposalsSection({
  proposals,
  dismissedProposals = [],
  onVote,
  onDismiss,
  onRestore,
  onEdit,
  compactTitle = false,
  hint = "Sousedé můžou podpořit vznik nové skupiny. Nezajímavé návrhy skryjte křížkem.",
}) {
  const { user, openEditGroupProposal } = useApp();
  const [minimized, , toggleMinimized] = useUiPref(UI_KEYS.GROUP_PROPOSALS_MINIMIZED, true);
  const [showDismissed, setShowDismissed] = useUiPref(UI_KEYS.GROUP_PROPOSALS_ARCHIVE_OPEN, false);

  const isMine = (p) => {
    if (user?.id && (p.proposerId === user.id || p.proposer_id === user.id)) return true;
    if (user?.name && p.proposer && String(p.proposer).trim() === String(user.name).trim()) return true;
    return false;
  };

  /** Bez aktivních návrhů se vstup vůbec nezobrazí — archiv skrytých je jen uvnitř rozbalení. */
  if (!proposals?.length) return null;

  const count = proposals.length;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={toggleMinimized}
        aria-expanded={false}
        className="pp-group-proposals-chip"
      >
        <span className="pp-group-proposals-chip__dot" aria-hidden />
        <span className="pp-group-proposals-chip__label">Návrhy na nové skupiny</span>
        <span className="pp-group-proposals-chip__count" aria-label={`${count} návrhů`}>
          {count > 9 ? "9+" : count}
        </span>
      </button>
    );
  }

  const titleClass = compactTitle
    ? "text-[12px] font-semibold text-[#1B4D3E]"
    : "text-sm font-bold text-stone-900";

  return (
    <section className="pp-group-proposals-panel">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <button
          type="button"
          onClick={toggleMinimized}
          className="pp-group-proposals-chip pp-group-proposals-chip--open"
          aria-expanded={true}
        >
          <span className="pp-group-proposals-chip__dot" aria-hidden />
          <span className="pp-group-proposals-chip__label">Návrhy na nové skupiny</span>
          <span className="pp-group-proposals-chip__count">{count > 9 ? "9+" : count}</span>
        </button>
        <button
          type="button"
          onClick={toggleMinimized}
          className="shrink-0 text-[10px] font-medium text-[#6b7280] hover:text-[#1B4D3E] px-1.5 py-1 rounded-md hover:bg-white"
          title="Sbalit sekci návrhů"
        >
          Sbalit
        </button>
      </div>

      <p className={`${titleClass} sr-only`}>Návrhy na nové skupiny</p>
      <p className="text-[11px] text-[#6b7280] mb-2.5">{hint}</p>
      <div className="space-y-2">
        {proposals.map((p) => (
          <GroupProposalCard
            key={p.id}
            proposal={p}
            onVote={onVote}
            onDismiss={onDismiss}
            onEdit={onEdit ?? openEditGroupProposal}
            mine={isMine(p)}
          />
        ))}
      </div>

      {dismissedProposals.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowDismissed(!showDismissed)}
            className="text-[11px] font-medium text-[#8A9590] hover:text-[#6b7280]"
          >
            {showDismissed
              ? "Skrýt archiv návrhů"
              : `Archiv skrytých návrhů (${dismissedProposals.length})`}
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
