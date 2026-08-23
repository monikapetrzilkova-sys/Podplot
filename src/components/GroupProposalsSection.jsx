import { useUiPref } from "../hooks/useUiPref.js";
import { UI_KEYS } from "../data/uiPreferences.js";
import GroupProposalCard from "./GroupProposalCard.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function GroupProposalsSection({
  proposals,
  dismissedProposals,
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

  if (proposals.length === 0 && dismissedProposals.length === 0) return null;

  const countLabel =
    proposals.length > 0
      ? proposals.length === 1
        ? "1 návrh"
        : proposals.length < 5
          ? `${proposals.length} návrhy`
          : `${proposals.length} návrhů`
      : null;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={toggleMinimized}
        aria-expanded={false}
        className="pp-group-proposals-quiet w-full flex items-center justify-between gap-2 px-1 py-1.5 text-left rounded-lg hover:bg-[#F4F8F6] transition-colors"
      >
        <span className="text-[11px] text-[#8A9590] truncate">
          Návrhy na nové skupiny
          {countLabel ? <span className="text-[#6b7280]"> · {countLabel}</span> : null}
        </span>
        <span className="shrink-0 text-[10px] font-medium text-[#9CA3AF]">Zobrazit ›</span>
      </button>
    );
  }

  const titleClass = compactTitle
    ? "text-[11px] font-semibold text-[#6b7280]"
    : "text-sm font-bold text-stone-900";

  return (
    <section className="pp-group-proposals-panel rounded-xl border border-[#E8EEEB] bg-[#FAFCFB] p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className={titleClass}>Návrhy na nové skupiny</h3>
        <button
          type="button"
          onClick={toggleMinimized}
          className="shrink-0 text-[10px] font-medium text-[#9CA3AF] hover:text-[#6b7280] px-1.5 py-0.5 rounded-md hover:bg-white"
          aria-expanded={true}
          title="Sbalit sekci návrhů"
        >
          Sbalit
        </button>
      </div>

      {proposals.length > 0 && (
        <>
          <p className="text-[11px] text-[#8A9590] mb-2.5">{hint}</p>
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
        </>
      )}

      {dismissedProposals.length > 0 && (
        <div className={proposals.length > 0 ? "mt-3" : ""}>
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
