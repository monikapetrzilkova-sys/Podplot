import { useApp } from "../context/AppContext.jsx";
import { getSkupinySubfilters } from "../data/worldNavigation.js";
import { GroupNavIcon, IconNavPlus } from "./communityNavIcons.jsx";

export default function GroupFilterBar() {
  const { feedSubFilter, setFeedSubFilter, communityGroups, setCreateGroupModalOpen } = useApp();
  const items = getSkupinySubfilters(communityGroups);

  return (
    <div className="subfilter-scroll flex flex-nowrap gap-1 overflow-x-auto px-3 py-1.5 shrink-0">
      {items.map((sub) => {
        const active = feedSubFilter === sub.id || (sub.id === "vse" && feedSubFilter === "skupiny");
        const label = sub.shortLabel ?? sub.label;
        return (
          <button
            key={sub.id}
            type="button"
            onClick={() => setFeedSubFilter(sub.id === "vse" ? "skupiny" : sub.id)}
            aria-pressed={active}
            title={sub.label}
            className={`pp-chip flex items-center gap-1 shrink-0 px-2 py-0.5 text-[11px] ${
              active ? "pp-chip--active" : "pp-chip--inactive"
            }`}
          >
            <GroupNavIcon
              id={sub.id}
              className={`w-3 h-3 shrink-0 ${active ? "text-white" : "text-[#1B4D3E]"}`}
            />
            {label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setCreateGroupModalOpen(true)}
        aria-label="Navrhnout novou skupinu"
        title="Navrhnout novou skupinu"
        className="pp-groups-new-btn shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#1B4D3E] bg-[#E8F3EF] border border-[#C5E0D6] transition-colors duration-150 hover:bg-[#3D7A68] hover:border-[#3D7A68] hover:text-white active:bg-[#2F6354] active:border-[#2F6354] active:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64A08D]"
      >
        <IconNavPlus className="w-3 h-3 shrink-0" />
        Nová
      </button>
    </div>
  );
}
