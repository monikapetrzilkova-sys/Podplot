import { useUiPref } from "../hooks/useUiPref.js";
import { proposalDetailsKey } from "../data/uiPreferences.js";

export default function GroupProposalCard({ proposal, onVote, onDismiss }) {
  const detailsKey = proposalDetailsKey(proposal.id);
  const [expanded, setExpanded] = useUiPref(detailsKey, false);
  const pct = Math.min(100, (proposal.votes / proposal.required) * 100);
  const full = proposal.votes >= proposal.required;

  return (
    <article className="pp-card p-3 max-w-md relative">
      {onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(proposal.id)}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 text-lg leading-none"
          aria-label="Skrýt návrh"
          title="Nezajímá mě — skrýt návrh"
        >
          ×
        </button>
      )}
      <span className="inline-block text-[10px] font-bold uppercase text-[#1B4D3E] bg-[#E8F3EF] px-2 py-0.5 rounded-md">
        V přípravě
      </span>

      <p className="text-sm font-bold text-stone-900 mt-2 leading-snug pr-6">{proposal.name}</p>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden min-w-0">
          <div
            className="h-full bg-[#3D7A68] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-stone-600 shrink-0 tabular-nums">
          {proposal.votes}/{proposal.required}
        </span>
      </div>
      <p className="text-[10px] text-stone-400 mt-0.5">podpor od sousedů</p>

      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          disabled={proposal.voted || full}
          onClick={() => onVote(proposal.id)}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
            proposal.voted || full
              ? "bg-stone-100 text-stone-400 cursor-default"
              : "bg-[#3D7A68] text-white hover:bg-[#2F6354]"
          }`}
        >
          {proposal.voted ? "✓ Podpořeno" : "Podpořit vznik"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? "Skrýt" : "Další informace"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600 space-y-2">
          {proposal.tag && (
            <p>
              <span className="font-semibold text-stone-700">Kategorie:</span> {proposal.tag}
            </p>
          )}
          {proposal.description && <p>{proposal.description}</p>}
          {proposal.purpose && (
            <p>
              <span className="font-semibold text-stone-700">Účel:</span> {proposal.purpose}
            </p>
          )}
          {proposal.proposer && (
            <p className="text-[11px] text-stone-400">Navrhuje: {proposal.proposer}</p>
          )}
        </div>
      )}
    </article>
  );
}
