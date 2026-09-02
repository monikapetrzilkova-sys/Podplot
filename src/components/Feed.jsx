import { useApp } from "../context/AppContext.jsx";
import { postMatchesFeedFilter } from "../data/feedNavigation.js";
import { postMatchesMarketFilters } from "../data/marketCategories.js";
import { sortPostsByTop } from "../data/pricing.js";
import CompactListingRow from "./CompactListingRow.jsx";
import DoodleEmptyState from "./doodle/DoodleEmptyState.jsx";

function sortWithPinnedFirst(posts) {
  return [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
}

export default function Feed({ atTop = false }) {
  const { userPostsForLocation, feedPostsForLocation, feedMainMode, feedSubFilter, zboziSearchQuery, zboziMarketCategory } = useApp();

  const allPosts = [...userPostsForLocation, ...feedPostsForLocation.filter((p) => p.feedType === "zbozi")];
  const filtered = allPosts
    .filter((p) => postMatchesFeedFilter(p, feedMainMode, feedSubFilter))
    .filter((p) => postMatchesMarketFilters(p, zboziSearchQuery, zboziMarketCategory));
  const communityPosts = sortPostsByTop(sortWithPinnedFirst(filtered));

  return (
    <div className={`px-4 ${atTop ? "pt-2 pb-4" : "py-3"}`}>
      {communityPosts.length === 0 ? (
        <DoodleEmptyState
          illustration="box"
          message={
            zboziSearchQuery.trim()
              ? "Pro toto hledání nic nenalezeno — zkus jiné slovo nebo kategorii."
              : "V této kategorii zatím nic není. Přidejte vlastní nabídku."
          }
          className="bg-white rounded-xl border border-stone-100"
        />
      ) : (
        <div className="space-y-1.5">
          {communityPosts.map((p) => (
            <CompactListingRow key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
