import { useState } from "react";
import { getGroupPosts } from "../data/groups.js";
import { useApp } from "../context/AppContext.jsx";
import CreateGroupModal from "./CreateGroupModal.jsx";
import GroupProposalsSection from "./GroupProposalsSection.jsx";

export default function Groups() {
  const {
    communityGroups,
    groupProposals,
    voteGroupProposal,
    dismissedGroupProposalIds,
    dismissGroupProposal,
    restoreGroupProposal,
    userGroupPosts,
    setActiveTab,
    switchFeedMainMode,
  } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const visibleProposals = groupProposals.filter((p) => !dismissedGroupProposalIds.includes(p.id));
  const dismissedProposals = groupProposals.filter((p) => dismissedGroupProposalIds.includes(p.id));

  return (
    <div className="px-4 py-4 pb-8">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-stone-900 mb-1">Zájmové skupiny</h2>
        <p className="text-sm text-stone-500">Navrhujte skupiny, hlasujte a prohlížejte nástěnky.</p>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full mb-4 py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-colors"
      >
        ➕ Založit skupinu
      </button>

      <button
        type="button"
        onClick={() => {
          switchFeedMainMode("skupiny");
          setActiveTab("home");
        }}
        className="w-full mb-6 py-3 border border-emerald-300 text-emerald-700 font-semibold rounded-2xl"
      >
        Otevřít skupiny na domovské stránce
      </button>

      <div className="mb-6">
        <GroupProposalsSection
          proposals={visibleProposals}
          dismissedProposals={dismissedProposals}
          onVote={voteGroupProposal}
          onDismiss={dismissGroupProposal}
          onRestore={restoreGroupProposal}
          compactTitle
        />
      </div>

      <section className="mb-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">Aktivní skupiny</h3>
        <div className="space-y-3">
          {communityGroups.map((g) => {
            const count = getGroupPosts(g.id, userGroupPosts).length;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  switchFeedMainMode("skupiny");
                  setActiveTab("home");
                }}
                className="w-full flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-4 text-left hover:border-emerald-400 transition-colors"
              >
                <span className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">
                  {g.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-stone-900">{g.name}</h3>
                  <p className="text-xs text-stone-500 truncate">{g.description}</p>
                  <p className="text-xs text-emerald-700 mt-1">{count} příspěvků</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <CreateGroupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
