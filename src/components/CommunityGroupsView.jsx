import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getGroupPosts } from "../data/groups.js";
import { getMyMemberGroups } from "../data/locations.js";
import { CLUB_CATEGORIES } from "../data/clubCategories.js";
import { buildGroupHierarchy, countPendingProposalsForCategory } from "../utils/groupHierarchy.js";
import LiveFeedCard, { getNeighborSectionBadge } from "./LiveFeedCard.jsx";
import { extractListingPrice } from "./CompactListingRow.jsx";
import FeedCard from "./FeedCard.jsx";
import GroupFilterBar from "./GroupFilterBar.jsx";
import GroupProposalCard from "./GroupProposalCard.jsx";
import GroupProposalsSection from "./GroupProposalsSection.jsx";
import PrimaryAddButton from "./PrimaryAddButton.jsx";
import PhotoUpload from "./PhotoUpload.jsx";
import DoodleEmptyState from "./doodle/DoodleEmptyState.jsx";
import { ClubCategoryIcon, GroupNavIcon } from "./communityNavIcons.jsx";
import { displayCreatorLabel } from "../data/accountTypes.js";

function normalize(text) {
  return (text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesQuery(query, ...parts) {
  if (!query) return true;
  const hay = normalize(parts.filter(Boolean).join(" "));
  return hay.includes(query);
}

function GroupPostRow({ post, groupName, expanded, onToggle }) {
  const resolvedGroupName = groupName ?? post.groupName;
  const sectionBadge = getNeighborSectionBadge("skupiny");

  return (
    <LiveFeedCard
      itemId={`group-post-${post.id}`}
      badge={sectionBadge.label}
      badgeClassName={sectionBadge.className}
      title={post.title}
      authorLabel={displayCreatorLabel(post.author, post.accountType, { mine: post.mine })}
      preview={post.body || resolvedGroupName}
      editedItem={post}
      priceLabel={extractListingPrice(post)}
      expanded={expanded}
      onToggle={onToggle}
    >
      <FeedCard post={{ ...post, groupName: resolvedGroupName }} detailsOnly />
    </LiveFeedCard>
  );
}

function GroupPostsList({ posts, groupName }) {
  const [expandedId, setExpandedId] = useState(null);
  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-1.5">
      {posts.map((post) => (
        <GroupPostRow
          key={post.id}
          post={post}
          groupName={groupName}
          expanded={expandedId === post.id}
          onToggle={() => toggle(post.id)}
        />
      ))}
    </div>
  );
}

function GroupPostComposer({ groupId }) {
  const { addGroupBoardPost } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState([]);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setPhotos([]);
    setFormOpen(false);
  };

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    addGroupBoardPost({ groupId, title, body, photos });
    resetForm();
  };

  return (
    <div className="space-y-2">
      <PrimaryAddButton
        label="Přidat příspěvek"
        onClick={() => setFormOpen((open) => !open)}
      />
      {formOpen && (
        <div className="rounded-xl p-3 border border-stone-200 bg-white space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Krátký název — např. Tip na víkendovou akci"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Popis…"
            rows={2}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
          />
          <PhotoUpload
            photos={photos}
            onChange={setPhotos}
            maxPhotos={4}
            label="Fotky"
            hint="Přidejte foto k příspěvku — sousedi lépe pochopí kontext."
          />
          <PrimaryAddButton label="Zveřejnit" onClick={submit} withPlus={false} />
        </div>
      )}
    </div>
  );
}

function SubgroupRow({ group, postCount, onOpen, memberBadge = false }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(group.id)}
      className="pp-subgroup-row w-full text-left flex items-center gap-2.5 py-2 pl-3 pr-2"
    >
      <GroupNavIcon id={group.id} className="w-4 h-4 shrink-0 text-[#3D7A68]" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#1a1a1a] truncate font-medium">{group.name}</p>
        <p className="text-[10px] text-[#6b7280] truncate">
          {group.members} členů · {postCount} příspěvků
          {memberBadge ? " · člen" : ""}
        </p>
      </div>
      <span className="text-[#9CA3AF] text-[10px] shrink-0">›</span>
    </button>
  );
}

/** Seřadí moje skupiny: nejčastější / nejaktivnější pro mě první */
function sortGroupsByFrequency(groups, userGroupPosts) {
  return [...groups].sort((a, b) => {
    const postsA = getGroupPosts(a.id, userGroupPosts);
    const postsB = getGroupPosts(b.id, userGroupPosts);
    const myA = postsA.filter((p) => p.mine || p.authorId === "me").length;
    const myB = postsB.filter((p) => p.mine || p.authorId === "me").length;
    const latestA = postsA.reduce((max, p, i) => Math.max(max, p.createdAt || postsA.length - i), 0);
    const latestB = postsB.reduce((max, p, i) => Math.max(max, p.createdAt || postsB.length - i), 0);
    const scoreA = myA * 100 + postsA.length * 10 + latestA / 1e11;
    const scoreB = myB * 100 + postsB.length * 10 + latestB / 1e11;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.name || "").localeCompare(b.name || "", "cs");
  });
}

function MyGroupsRail({ groups, activeId, onSelect }) {
  return (
    <div
      className="pp-my-groups-rail pp-category-pills flex flex-nowrap gap-1.5 overflow-x-auto subfilter-scroll pb-0.5"
      role="tablist"
      aria-label="Moje skupiny"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeId === "vse"}
        onClick={() => onSelect("vse")}
        className={`pp-category-pill shrink-0 ${activeId === "vse" ? "pp-category-pill--active" : ""}`}
      >
        Vše
      </button>
      {groups.map((g) => {
        const active = activeId === g.id;
        return (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={g.name}
            onClick={() => onSelect(g.id)}
            className={`pp-category-pill pp-my-group-pill shrink-0 inline-flex items-center gap-1 ${
              active ? "pp-category-pill--active" : ""
            }`}
          >
            <GroupNavIcon
              id={g.id}
              className={`w-3.5 h-3.5 shrink-0 ${active ? "text-white" : "text-[#1B4D3E]"}`}
            />
            <span className="truncate max-w-[7.5rem]">{g.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function CategoryTrunk({
  category,
  groups,
  proposals,
  userGroupPosts,
  onOpen,
  myGroupIds,
  forceOpen,
  onVote,
  onDismiss,
}) {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const expanded = forceOpen || open;
  const pendingCount = proposals.length;
  const isMine = (p) => {
    if (user?.id && (p.proposerId === user.id || p.proposer_id === user.id)) return true;
    if (user?.name && p.proposer && String(p.proposer).trim() === String(user.name).trim()) {
      return true;
    }
    return false;
  };

  return (
    <article className={`pp-group-category-card ${expanded ? "pp-group-category-card--open" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expanded}
        className="pp-group-trunk-btn w-full flex items-center gap-3 px-3.5 py-3 text-left"
      >
        <span className="pp-group-trunk-icon shrink-0">
          <ClubCategoryIcon id={category.id} className="w-5 h-5 text-[#3D7A68]" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-[13px] font-semibold text-[#1B4D3E] truncate">{category.label}</p>
            {pendingCount > 0 && (
              <span
                className="pp-group-pending-dot"
                title={`${pendingCount} návrh${pendingCount === 1 ? "" : pendingCount < 5 ? "y" : "ů"} V přípravě`}
                aria-label={`${pendingCount} návrhů V přípravě`}
              >
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#6b7280] mt-0.5">
            {groups.length} {groups.length === 1 ? "podskupina" : groups.length < 5 ? "podskupiny" : "podskupin"}
            {pendingCount > 0 ? ` · ${pendingCount} v přípravě` : ""}
          </p>
        </div>
        <span
          className={`pp-group-trunk-chevron shrink-0 ${expanded ? "pp-group-trunk-chevron--open" : ""}`}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="pp-group-trunk-panel">
          {groups.length === 0 && proposals.length === 0 ? (
            <p className="px-3.5 py-3 text-[11px] text-[#9CA3AF]">Zatím žádné podskupiny v této kategorii.</p>
          ) : (
            <>
              {groups.map((g) => (
                <SubgroupRow
                  key={g.id}
                  group={g}
                  postCount={getGroupPosts(g.id, userGroupPosts).length}
                  onOpen={onOpen}
                  memberBadge={myGroupIds.has(g.id)}
                />
              ))}
              {proposals.length > 0 && (
                <div className="px-2.5 pt-2 pb-2.5 space-y-2 border-t border-[#EEF2F0]">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b7280]">
                    V přípravě — sousedské hlasování
                  </p>
                  {proposals.map((p) => (
                    <GroupProposalCard
                      key={p.id}
                      proposal={p}
                      onVote={onVote}
                      onDismiss={onDismiss}
                      mine={isMine(p)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}

function GroupsSearchField({ value, onChange, trailing = null }) {
  return (
    <div className="pp-groups-search flex items-center gap-2 px-3 pb-2 shrink-0">
      <label className="relative flex-1 min-w-0">
        <span className="sr-only">Hledat ve skupinách</span>
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hledat ve skupinách…"
          className="pp-groups-search-input w-full pl-8 pr-3 py-2 text-[12px] rounded-xl border border-[#D8E3DE] bg-white text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#64A08D] focus:ring-1 focus:ring-[#C5E0D6]"
        />
      </label>
      {trailing}
    </div>
  );
}

export default function CommunityGroupsView({ atTop = false, hideFilterBar = false }) {
  const {
    feedSubFilter,
    communityGroups,
    userGroupPosts,
    setFeedSubFilter,
    activeLocationId,
    setCreateGroupModalOpen,
    groupProposals,
    voteGroupProposal,
    dismissedGroupProposalIds,
    dismissGroupProposal,
    restoreGroupProposal,
  } = useApp();

  const [search, setSearch] = useState("");
  const [returnFilter, setReturnFilter] = useState("skupiny");
  const [myGroupFocus, setMyGroupFocus] = useState("vse");
  const query = normalize(search.trim());

  const myGroups = useMemo(
    () => getMyMemberGroups(communityGroups, activeLocationId),
    [communityGroups, activeLocationId]
  );
  const myGroupsRanked = useMemo(
    () => sortGroupsByFrequency(myGroups, userGroupPosts),
    [myGroups, userGroupPosts]
  );
  const myGroupIds = useMemo(() => new Set(myGroups.map((g) => g.id)), [myGroups]);
  const activeGroup = communityGroups.find((g) => g.id === feedSubFilter);
  const isOverview = feedSubFilter === "vse" || feedSubFilter === "skupiny";
  const isMyGroups = feedSubFilter === "moje";

  useEffect(() => {
    if (isOverview) setReturnFilter("skupiny");
    if (isMyGroups) setReturnFilter("moje");
  }, [isOverview, isMyGroups]);

  useEffect(() => {
    if (!isMyGroups) return;
    if (myGroupFocus !== "vse" && !myGroupIds.has(myGroupFocus)) {
      setMyGroupFocus("vse");
    }
  }, [isMyGroups, myGroupFocus, myGroupIds]);

  const sourceGroups = communityGroups;

  const visibleProposals = useMemo(
    () =>
      (groupProposals ?? []).filter(
        (p) => !p.active && !dismissedGroupProposalIds?.includes(p.id)
      ),
    [groupProposals, dismissedGroupProposalIds]
  );

  const dismissedProposals = useMemo(
    () =>
      (groupProposals ?? []).filter((p) => dismissedGroupProposalIds?.includes(p.id)),
    [groupProposals, dismissedGroupProposalIds]
  );

  const hierarchy = useMemo(() => {
    const base = buildGroupHierarchy(sourceGroups, { includeEmpty: true });
    if (!query) return base;

    return CLUB_CATEGORIES.map((cat) => {
      const bucket = base.find((b) => b.id === cat.id);
      const subgroups = (bucket?.subgroups ?? []).filter((g) =>
        matchesQuery(query, g.name, g.description)
      );
      return { ...cat, subgroups };
    }).filter((cat) => {
      const pending = countPendingProposalsForCategory(visibleProposals, cat.id);
      const pendingMatch = visibleProposals.some(
        (p) =>
          (p.clubCategory === cat.id || p.categoryId === cat.id) &&
          matchesQuery(query, p.name, p.description, p.purpose, p.tag)
      );
      return cat.subgroups.length > 0 || pendingMatch || (pending > 0 && matchesQuery(query, cat.label));
    });
  }, [sourceGroups, query, visibleProposals]);

  let body = null;

  if (activeGroup && !isOverview && !isMyGroups) {
    const posts = getGroupPosts(activeGroup.id, userGroupPosts);
    const isMember = myGroupIds.has(activeGroup.id);

    body = (
      <div className={`relative flex flex-col flex-1 min-h-0 px-3 ${atTop ? "pt-1" : "py-1"}`}>
        <div className="flex items-center gap-2 py-2 border-b border-[#E8EEEB] mb-1">
          <GroupNavIcon id={activeGroup.id} className="w-4 h-4 text-[#3D7A68]" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-[#1a1a1a] truncate">{activeGroup.name}</h2>
            <p className="text-[10px] text-[#6b7280]">
              {activeGroup.members} členů{isMember ? " · jste člen" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFeedSubFilter(returnFilter)}
            className="text-[10px] text-[#3D7A68] font-semibold hover:opacity-70 shrink-0"
          >
            ← Zpět
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pb-14 space-y-2">
          <GroupPostComposer groupId={activeGroup.id} />
          {posts.length === 0 ? (
            <DoodleEmptyState illustration="chat" message="Zatím žádné příspěvky v této skupině." />
          ) : (
            <GroupPostsList posts={posts} groupName={activeGroup.name} />
          )}
        </div>
      </div>
    );
  } else if (isMyGroups) {
    const railGroups = query
      ? myGroupsRanked.filter((g) => matchesQuery(query, g.name, g.description))
      : myGroupsRanked;

    const effectiveFocus =
      myGroupFocus !== "vse" && railGroups.some((g) => g.id === myGroupFocus)
        ? myGroupFocus
        : "vse";

    const feedPosts = myGroupsRanked
      .filter((g) => effectiveFocus === "vse" || g.id === effectiveFocus)
      .flatMap((g) =>
        getGroupPosts(g.id, userGroupPosts).map((p) => ({
          ...p,
          groupName: g.name,
          groupId: g.id,
        }))
      )
      .filter((p) =>
        !query || matchesQuery(query, p.title, p.body, p.groupName, p.author, p.name)
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const focusGroup =
      effectiveFocus !== "vse" ? myGroups.find((g) => g.id === effectiveFocus) : null;

    body = (
      <div className={`px-3 ${atTop ? "pt-1" : "py-1"} flex flex-col flex-1 min-h-0 gap-1.5 pb-14`}>
        {(visibleProposals.length > 0 || dismissedProposals.length > 0) && (
          <div className="shrink-0 pt-0.5">
            <GroupProposalsSection
              proposals={visibleProposals}
              dismissedProposals={dismissedProposals}
              onVote={voteGroupProposal}
              onDismiss={dismissGroupProposal}
              onRestore={restoreGroupProposal}
              compactTitle
              hint="Podpořte vznik nové skupiny. Nezajímavé návrhy skryjte křížkem."
            />
          </div>
        )}
        {myGroups.length === 0 ? (
          <DoodleEmptyState illustration="group" message="Zatím nejste členem žádné skupiny." />
        ) : (
          <>
            <div className="shrink-0 space-y-1.5">
              {railGroups.length === 0 ? (
                <p className="text-[11px] text-[#9CA3AF] py-1">Žádná z vašich skupin neodpovídá hledání.</p>
              ) : (
                <MyGroupsRail
                  groups={railGroups}
                  activeId={effectiveFocus}
                  onSelect={setMyGroupFocus}
                />
              )}
              {focusGroup && (
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <p className="text-[10px] text-[#6b7280] truncate">
                    {focusGroup.members} členů · nástěnka
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedSubFilter(focusGroup.id)}
                    className="shrink-0 text-[10px] font-semibold text-[#3D7A68] hover:opacity-70"
                  >
                    Celá nástěnka ›
                  </button>
                </div>
              )}
              {focusGroup && <GroupPostComposer groupId={focusGroup.id} />}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
              <h3 className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">
                Nejnovější příspěvky
              </h3>
              {feedPosts.length === 0 ? (
                <DoodleEmptyState
                  illustration="chat"
                  message={
                    focusGroup
                      ? "V této skupině zatím žádné příspěvky."
                      : "Ve vašich skupinách zatím žádné příspěvky."
                  }
                />
              ) : (
                <GroupPostsList posts={feedPosts.slice(0, 20)} />
              )}
            </div>
          </>
        )}
      </div>
    );
  } else {
    const catsToShow = query
      ? hierarchy
      : buildGroupHierarchy(sourceGroups, { includeEmpty: true });

    body = (
      <div className={`px-3 ${atTop ? "pt-1" : "py-1"} overflow-y-auto flex-1 min-h-0 space-y-2 pb-14`}>
        {(visibleProposals.length > 0 || dismissedProposals.length > 0) && (
          <div className="pt-1 pb-1">
            <GroupProposalsSection
              proposals={visibleProposals}
              dismissedProposals={dismissedProposals}
              onVote={voteGroupProposal}
              onDismiss={dismissGroupProposal}
              onRestore={restoreGroupProposal}
              compactTitle
              hint="Podpořte vznik nové skupiny. Nezajímavé návrhy skryjte křížkem."
            />
          </div>
        )}
        {catsToShow.map((cat) => {
          const catProposals = visibleProposals.filter(
            (p) =>
              (p.clubCategory === cat.id || p.categoryId === cat.id) &&
              matchesQuery(query, p.name, p.description, p.purpose, p.tag, cat.label)
          );
          return (
            <CategoryTrunk
              key={cat.id}
              category={cat}
              groups={cat.subgroups}
              proposals={catProposals}
              userGroupPosts={userGroupPosts}
              onOpen={setFeedSubFilter}
              myGroupIds={myGroupIds}
              forceOpen={Boolean(query)}
              onVote={voteGroupProposal}
              onDismiss={dismissGroupProposal}
            />
          );
        })}

        {query && catsToShow.length === 0 && (
          <DoodleEmptyState illustration="group" message="Žádná skupina neodpovídá hledání." />
        )}
      </div>
    );
  }

  const showSearch = isOverview || isMyGroups;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {!hideFilterBar && <GroupFilterBar />}
      {showSearch && (
        <GroupsSearchField
          value={search}
          onChange={setSearch}
          trailing={
            hideFilterBar ? (
              <button
                type="button"
                onClick={() => setCreateGroupModalOpen(true)}
                aria-label="Navrhnout novou skupinu"
                title="Navrhnout novou skupinu"
                className="pp-groups-new-btn shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-[#1B4D3E] bg-[#E8F3EF] border border-[#C5E0D6] transition-colors duration-150 hover:bg-[#3D7A68] hover:border-[#3D7A68] hover:text-white active:bg-[#2F6354] active:border-[#2F6354] active:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64A08D] focus-visible:ring-offset-1"
              >
                + Nová
              </button>
            ) : null
          }
        />
      )}
      {body}
    </div>
  );
}
