import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import GroupProposalsSection from "./GroupProposalsSection.jsx";

/** Domů — návrhy nových skupin k podpoře od sousedů */
export default function HomeGroupProposals() {
  const {
    groupProposals,
    voteGroupProposal,
    dismissedGroupProposalIds,
    dismissGroupProposal,
    restoreGroupProposal,
  } = useApp();

  const visibleProposals = useMemo(
    () =>
      (groupProposals ?? []).filter(
        (p) => !p.active && !(dismissedGroupProposalIds ?? []).includes(p.id)
      ),
    [groupProposals, dismissedGroupProposalIds]
  );

  const dismissedProposals = useMemo(
    () =>
      (groupProposals ?? []).filter((p) => (dismissedGroupProposalIds ?? []).includes(p.id)),
    [groupProposals, dismissedGroupProposalIds]
  );

  if (visibleProposals.length === 0 && dismissedProposals.length === 0) return null;

  return (
    <section className="px-4 pt-3 pb-1" aria-label="Návrhy na nové skupiny">
      <GroupProposalsSection
        proposals={visibleProposals}
        dismissedProposals={dismissedProposals}
        onVote={voteGroupProposal}
        onDismiss={dismissGroupProposal}
        onRestore={restoreGroupProposal}
        compactTitle
      />
    </section>
  );
}
