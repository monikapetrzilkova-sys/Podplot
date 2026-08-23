import { useApp } from "../context/AppContext.jsx";
import { getGroup, getGroupPosts } from "../data/groups.js";
import { getCategoriesForGroup, postMatchesCategory, getCategory } from "../data/listingCategories.js";
import { sortPostsByTop } from "../data/pricing.js";
import FeedCard from "./FeedCard.jsx";
import { AddListingButton } from "./QuickNav.jsx";
import { GroupNavIcon, GROUP_ICON_CLASS } from "./communityNavIcons.jsx";
import SectionBackButton from "./SectionBackButton.jsx";

export default function GroupBoard() {
  const {
    activeGroupId,
    closeGroup,
    userGroupPosts,
    groupFilter,
    setGroupFilter,
    openCreate,
  } = useApp();

  const group = getGroup(activeGroupId);
  if (!group) return null;

  const allPosts = getGroupPosts(activeGroupId, userGroupPosts);
  const filtered = sortPostsByTop(
    groupFilter ? allPosts.filter((p) => postMatchesCategory(p, groupFilter)) : allPosts
  );
  const categories = getCategoriesForGroup(activeGroupId);
  const filterLabel = groupFilter ? getCategory(groupFilter, activeGroupId)?.label : null;

  return (
    <div className="bg-stone-100/80">
      <div className="bg-white border-b border-stone-200 px-4 pt-4 pb-3 shrink-0">
        <SectionBackButton onClick={closeGroup} label="Zpět na skupiny" className="mb-3" />
        <div className="flex items-center gap-3 mb-2">
          <span className="w-12 h-12 rounded-2xl bg-white border border-[#EEEEEE] flex items-center justify-center">
            <GroupNavIcon id={group.id} className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-stone-900">{group.name}</h1>
            <p className="text-xs text-stone-500">{group.members} členů · nástěnka skupiny</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 mb-3">{group.description}</p>
        <AddListingButton groupId={activeGroupId} label="Přidat příspěvek do skupiny" />
      </div>

      <nav className="flex gap-2 px-4 py-3 bg-white border-b border-stone-200 overflow-x-auto scrollbar-hide shrink-0">
        <button
          type="button"
          onClick={() => setGroupFilter(null)}
          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            !groupFilter ? "bg-[#1B4D3E] text-white border-[#1B4D3E]" : "border-[#1B4D3E]/20 text-[#1B4D3E]"
          }`}
        >
          Vše
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setGroupFilter((prev) => (prev === c.id ? null : c.id))}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              groupFilter === c.id
                ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                : "border-[#1B4D3E]/20 text-[#1B4D3E] hover:bg-[#A8D5C8]/30"
            }`}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 space-y-4">
        {groupFilter && (
          <p className="text-xs text-stone-500">
            Filtr: <strong>{filterLabel}</strong> · {filtered.length} příspěvků
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-stone-200">
            <p className="text-sm text-stone-600 mb-3">Na nástěnce zatím nic není.</p>
            <button
              type="button"
              onClick={() => openCreate(null, activeGroupId)}
              className="text-sm font-semibold text-[#4D8B7A] underline"
            >
              Přidat první příspěvek
            </button>
          </div>
        ) : (
          filtered.map((post) => <FeedCard key={post.id} post={{ ...post, groupName: group.name }} />)
        )}
      </div>
    </div>
  );
}
