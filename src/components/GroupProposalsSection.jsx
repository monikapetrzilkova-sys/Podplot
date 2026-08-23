import { useUiPref } from "../hooks/useUiPref.js";
import { UI_KEYS } from "../data/uiPreferences.js";
import GroupProposalCard from "./GroupProposalCard.jsx";
import { useApp } from "../context/AppContext.jsx";

/**
 * @param {"full"|"chip"|"panel"} [slot]
 *   chip — jen badge do toolbaru
 *   panel — rozbalené hlasování (pod toolbarem)
 *   full — chip i panel v jednom bloku (Domů / legacy)
 */
export default function GroupProposalsSection({
  proposals,
  dismissedProposals = [],
  onVote,
  onDismiss,
  onRestore,
  onEdit,
  compactTitle = false,
  hint = "Sousedé můžou podpořit vznik nové skupiny. Nezajímavé návrhy skryjte křížkem.",
  slot = "full",
  chipLabel = "Návrhy na nové skupiny",
}) {
  const { user, openEditGroupProposal } = useApp();
  const [minimized, , toggleMinimized] = useUiPref(UI_KEYS.GROUP_PROPOSALS_MINIMIZED, true);
  const [showDismissed, setShowDismissed] = useUiPref(UI_KEYS.GROUP_PROPOSALS_ARCHIVE_OPEN, false);

  const isMine = (p) => {
    if (user?.id && (p.proposerId === user.id || p.proposer_id === user.id)) return true;
    if (user?.name && p.proposer && String(p.proposer).trim() === String(user.name).trim()) return true;
    return false;
  };

  if (!proposals?.length) return null;

  const count = proposals.length;
  const countText = count > 9 ? "9+" : String(count);

  const chip = (
    <button
      type="button"
      onClick={toggleMinimized}
      aria-expanded={!minimized}
      className={`pp-group-proposals-chip ${minimized ? "" : "pp-group-proposals-chip--open"}`.trim()}
    >
      <span className="pp-group-proposals-chip__dot" aria-hidden />
      <span className="pp-group-proposals-chip__label">{chipLabel}</span>
      <span className="pp-group-proposals-chip__count" aria-label={`${count} návrhů`}>
        {countText}
      </span>
    </button>
  );

  if (slot === "chip") return chip;
  if (slot === "panel" && minimized) return null;

  const titleClass = compactTitle
    ? "text-[12px] font-semibold text-[#1B4D3E]"
    : "text-sm font-bold text-stone-900";

  const panel = (
    <section className="pp-group-proposals-panel">
      {slot === "full" ? (
        <div className="flex items-start justify-between gap-2 mb-1.5">
          {chip}
          <button
            type="button"
            onClick={toggleMinimized}
            className="shrink-0 text-[10px] font-medium text-[#6b7280] hover:text-[#1B4D3E] px-1.5 py-1 rounded-md hover:bg-white"
            title="Sbalit sekci návrhů"
          >
            Sbalit
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className={titleClass}>Návrhy na nové skupiny</h3>
          <button
            type="button"
            onClick={toggleMinimized}
            className="shrink-0 text-[10px] font-medium text-[#6b7280] hover:text-[#1B4D3E] px-1.5 py-1 rounded-md hover:bg-white"
            title="Sbalit sekci návrhů"
          >
            Sbalit
          </button>
        </div>
      )}

      {slot === "full" && minimized ? null : (
        <>
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
                    <article
                      key={p.id}
                      className="pp-card p-3 max-w-md flex items-center justify-between gap-3"
                    >
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
        </>
      )}
    </section>
  );

  if (slot === "panel") return panel;
  if (minimized) return chip;
  return panel;
}
