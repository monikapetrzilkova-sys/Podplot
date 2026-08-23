import { useEffect } from "react";
import { useUiPref } from "../hooks/useUiPref.js";
import { proposalDetailsKey } from "../data/uiPreferences.js";
import { Avatar } from "./RoleBadge.jsx";
import PersonLabel from "./PersonLabel.jsx";
import { MessageButton } from "./MessagesPage.jsx";

export default function GroupProposalCard({
  proposal,
  onVote,
  onDismiss,
  onEdit,
  mine = false,
  supporters = [],
  onExpandSupporters = null,
}) {
  const detailsKey = proposalDetailsKey(proposal.id);
  const [expanded, setExpanded] = useUiPref(detailsKey, false);
  const pct = Math.min(100, (proposal.votes / proposal.required) * 100);
  const full = proposal.votes >= proposal.required;
  const supportList = Array.isArray(supporters) ? supporters : [];

  useEffect(() => {
    if (expanded && mine && supportList.length > 0) {
      onExpandSupporters?.(proposal.id);
    }
  }, [expanded, mine, supportList.length, proposal.id, onExpandSupporters]);

  return (
    <article className={`pp-card p-3 max-w-md relative ${mine ? "ring-1 ring-[#C5E0D6]" : ""}`}>
      {onDismiss && !mine && (
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
      <div className="flex items-center gap-1.5 flex-wrap pr-6">
        <span className="inline-block text-[10px] font-bold uppercase text-[#1B4D3E] bg-[#E8F3EF] px-2 py-0.5 rounded-md">
          V přípravě
        </span>
        {mine && (
          <span className="inline-block text-[10px] font-bold uppercase text-[#3D7A68] bg-white border border-[#C5E0D6] px-2 py-0.5 rounded-md">
            Váš návrh
          </span>
        )}
      </div>

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
      <p className="text-[10px] text-stone-400 mt-0.5">
        {mine
          ? full
            ? "Dostatek podpor — skupina se aktivuje"
            : `Ještě ${Math.max(0, proposal.required - proposal.votes)} podpor do aktivace`
          : "podpor od sousedů"}
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        {mine ? (
          <>
            <button
              type="button"
              onClick={() => onEdit?.(proposal.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#3D7A68] text-white hover:bg-[#2F6354] transition-colors"
            >
              Upravit návrh
            </button>
            <span className="shrink-0 py-2 px-2.5 rounded-xl text-[10px] font-semibold text-[#1B4D3E] bg-[#E8F3EF]">
              Čeká na sousedy
            </span>
          </>
        ) : (
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
        )}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 px-2.5 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? "Skrýt" : mine ? "Podpory a detail" : "Další informace"}
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
          {proposal.proposer && !mine && (
            <p className="text-[11px] text-stone-400">Navrhuje: {proposal.proposer}</p>
          )}

          {mine ? (
            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
                Kdo podpořil ({supportList.length})
              </p>
              {supportList.length === 0 ? (
                <p className="text-[11px] text-stone-500 leading-snug">
                  Zatím nikdo — až soused podpoří návrh, uvidíte ho tady.
                </p>
              ) : (
                <ul className="space-y-1">
                  {supportList.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-2 py-1.5 px-1.5 rounded-lg bg-[#F7FAF9]"
                    >
                      <Avatar initials={s.voterInitials || "??"} roleId="soused" size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-stone-800 truncate">
                          <PersonLabel personId={s.voterId} name={s.voterName} />
                        </p>
                      </div>
                      {s.voterId ? (
                        <MessageButton
                          participantId={s.voterId}
                          participantName={s.voterName}
                          compact
                          className="shrink-0"
                          topic={{
                            kind: "group_support",
                            refId: s.proposalId || proposal.id || s.id,
                            title: s.proposalName || proposal.name || "Návrh skupiny",
                            label: "Podpora návrhu",
                          }}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
