import { useApp } from "../context/AppContext.jsx";
import { getRecentGroupPosts, getGroup, groupPostsLocation } from "../data/groups.js";
import FeedCard from "./FeedCard.jsx";
import { GroupNavIcon, GROUP_ICON_CLASS } from "./communityNavIcons.jsx";

export default function GroupPostsStrip() {
  const {
    userGroupPosts,
    communityGroups,
    joinedGroupIds,
    activeLocationId,
    activeLocation,
    switchFeedMainMode,
    selectFeedSubFilter,
  } = useApp();
  const posts = getRecentGroupPosts(
    userGroupPosts,
    4,
    joinedGroupIds,
    groupPostsLocation(activeLocationId, activeLocation)
  );

  if (posts.length === 0) return null;

  const openGroupOnHome = (groupId) => {
    switchFeedMainMode("skupiny");
    selectFeedSubFilter(groupId);
    document.getElementById("app-main-scroll")?.scrollTo({ top: 0 });
  };

  return (
    <section className="bg-white border-b border-stone-200 py-4 shrink-0">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-sm font-semibold text-stone-800">Z mých skupin</h2>
        <button
          type="button"
          onClick={() => {
            switchFeedMainMode("skupiny");
            selectFeedSubFilter("vse");
          }}
          className="text-xs font-semibold text-[#4D8B7A]"
        >
          Všechny skupiny
        </button>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
        {posts.map((post) => {
          const group = getGroup(post.groupId) ?? communityGroups.find((g) => g.id === post.groupId);
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => openGroupOnHome(post.groupId)}
              className="shrink-0 w-[260px] text-left"
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <GroupNavIcon id={group?.id} className={`w-3.5 h-3.5 ${GROUP_ICON_CLASS}`} />
                <span className="text-[11px] font-semibold text-black">{group?.name}</span>
              </div>
              <FeedCard post={post} compact />
            </button>
          );
        })}
      </div>
    </section>
  );
}
