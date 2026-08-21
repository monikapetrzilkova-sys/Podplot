import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import DoodleEmptyState from "./doodle/DoodleEmptyState.jsx";
import LiveFeedCard, { getNeighborSectionBadge } from "./LiveFeedCard.jsx";
import HelpFeedActions from "./HelpFeedActions.jsx";
import PillFilterRow from "./PillFilterRow.jsx";
import PrimaryAddButton from "./PrimaryAddButton.jsx";
import CompactSearchToggle from "./CompactSearchToggle.jsx";
import { displayCreatorLabel } from "../data/accountTypes.js";

function matchesHelpSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, item.body, item.author, item.time]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q));
}

export default function NeighborHelp({
  showCreateForm = false,
  hideFilterRow = false,
  filter: filterProp,
  onFilterChange,
}) {
  const {
    neighborHelp,
    offerHelpOnPost,
    hasOfferedHelp,
    getHelpOffers,
    openCreateHelp,
  } = useApp();
  const [filterLocal, setFilterLocal] = useState("vse");
  const filter = filterProp ?? filterLocal;
  const setFilter = onFilterChange ?? setFilterLocal;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  const addLabel =
    filter === "hledam"
      ? "Hledám pomoc"
      : filter === "nabizim"
        ? "Nabízím pomoc"
        : "Hledám / nabízím pomoc";

  const searchActive = searchExpanded || Boolean(searchQuery.trim());

  const filtered = useMemo(() => {
    return (filter === "vse" ? neighborHelp : neighborHelp.filter((h) => h.type === filter))
      .filter((h) => matchesHelpSearch(h, searchQuery))
      .map((h) => ({ ...h, offerCount: getHelpOffers(h.id).length }))
      .sort((a, b) => b.offerCount - a.offerCount || Number(Boolean(b.mine)) - Number(Boolean(a.mine)));
  }, [neighborHelp, filter, searchQuery, getHelpOffers]);

  const openForm = () => {
    const preset = filter === "hledam" || filter === "nabizim" ? filter : null;
    openCreateHelp(preset);
  };

  return (
    <div className="space-y-2 px-1 py-1.5">
      <p className="pp-text-body px-2">
        <span className="font-semibold text-[#3D7A68] bg-[#E8F0ED] px-2 py-0.5 rounded-full mr-2 text-[10px]">
          Beta
        </span>
        Neformální pomoc mezi sousedy
      </p>

      {!hideFilterRow && (
        <PillFilterRow
          options={[
            { id: "vse", label: "Vše" },
            { id: "hledam", label: "Hledám" },
            { id: "nabizim", label: "Nabízím" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      )}

      {showCreateForm && (
        <>
          {searchActive ? (
            <CompactSearchToggle
              value={searchQuery}
              onChange={setSearchQuery}
              expanded
              onExpandedChange={setSearchExpanded}
              placeholder="Hledat ve výpomoci…"
              ariaLabel="Hledat ve výpomoci"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="flex-1 min-w-0">
                <PrimaryAddButton label={addLabel} onClick={openForm} />
              </div>
              <CompactSearchToggle
                value={searchQuery}
                onChange={setSearchQuery}
                expanded={false}
                onExpandedChange={setSearchExpanded}
                placeholder="Hledat ve výpomoci…"
                ariaLabel="Hledat ve výpomoci"
              />
            </div>
          )}
        </>
      )}

      {!showCreateForm && (
        <CompactSearchToggle
          value={searchQuery}
          onChange={setSearchQuery}
          expanded={searchActive}
          onExpandedChange={setSearchExpanded}
          placeholder="Hledat ve výpomoci…"
          ariaLabel="Hledat ve výpomoci"
        />
      )}

      {filtered.length === 0 ? (
        <DoodleEmptyState
          illustration="hands"
          message={
            searchQuery.trim()
              ? "Nic neodpovídá hledání."
              : "Zatím žádné příspěvky. Nabídněte pomoc sousedům!"
          }
        />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => {
            const sectionBadge = getNeighborSectionBadge("vypomoc", item.type);
            return (
              <LiveFeedCard
                key={item.id}
                itemId={`help-${item.id}`}
                badge={sectionBadge.label}
                badgeClassName={sectionBadge.className}
                title={item.title}
                authorLabel={displayCreatorLabel(item.author, item.accountType, {
                  mine: item.mine,
                })}
                preview={item.body}
              >
                {item.mine ? (
                  <p className="pp-text-body text-sm">{item.body}</p>
                ) : (
                  <HelpFeedActions
                    help={{
                      ...item,
                      helpId: item.id,
                      helpType: item.type,
                      offerCount: item.offerCount,
                    }}
                    onOfferHelp={offerHelpOnPost}
                    alreadyOffered={hasOfferedHelp(item.id)}
                  />
                )}
                {item.time ? <p className="pp-text-meta">{item.time}</p> : null}
              </LiveFeedCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
