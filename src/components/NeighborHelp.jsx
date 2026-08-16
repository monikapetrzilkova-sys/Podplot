import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import DoodleEmptyState from "./doodle/DoodleEmptyState.jsx";
import LiveFeedCard, { getNeighborSectionBadge } from "./LiveFeedCard.jsx";
import HelpFeedActions from "./HelpFeedActions.jsx";
import PillFilterRow from "./PillFilterRow.jsx";
import PrimaryAddButton from "./PrimaryAddButton.jsx";
import CompactSearchToggle from "./CompactSearchToggle.jsx";
import { formatAuthorName } from "../data/accountTypes.js";

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
    addNeighborHelpPost,
    offerHelpOnPost,
    hasOfferedHelp,
    getHelpOffers,
    pendingHelpFormOpen,
    setPendingHelpFormOpen,
  } = useApp();
  const [filterLocal, setFilterLocal] = useState("vse");
  const filter = filterProp ?? filterLocal;
  const setFilter = onFilterChange ?? setFilterLocal;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState("hledam");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  const createType = filter === "nabizim" ? "nabizim" : filter === "hledam" ? "hledam" : formType;
  const addLabel =
    filter === "vse" ? "Hledám/nabízím pomoc" : createType === "hledam" ? "Hledám pomoc" : "Nabízím pomoc";

  const searchActive = searchExpanded || Boolean(searchQuery.trim());

  const filtered = useMemo(() => {
    return (filter === "vse" ? neighborHelp : neighborHelp.filter((h) => h.type === filter))
      .filter((h) => matchesHelpSearch(h, searchQuery))
      .map((h) => ({ ...h, offerCount: getHelpOffers(h.id).length }))
      .sort((a, b) => b.offerCount - a.offerCount || Number(Boolean(b.mine)) - Number(Boolean(a.mine)));
  }, [neighborHelp, filter, searchQuery, getHelpOffers]);

  useEffect(() => {
    if (!pendingHelpFormOpen) return;
    if (filter === "hledam" || filter === "nabizim") setFormType(filter);
    setFormOpen(true);
    setPendingHelpFormOpen(false);
  }, [pendingHelpFormOpen, filter, setPendingHelpFormOpen]);

  const openForm = () => {
    if (filter === "hledam" || filter === "nabizim") setFormType(filter);
    setFormOpen((open) => !open);
  };

  const submitHelp = () => {
    if (!title.trim() || !body.trim()) return;
    addNeighborHelpPost({ type: createType, title, body });
    setTitle("");
    setBody("");
    setFormOpen(false);
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
          {formOpen && (
            <div className="rounded-xl p-3 border border-stone-200 bg-white space-y-2">
              {filter === "vse" && (
                <PillFilterRow
                  options={[
                    { id: "hledam", label: "Hledám" },
                    { id: "nabizim", label: "Nabízím" },
                  ]}
                  value={formType}
                  onChange={setFormType}
                />
              )}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Krátký název — např. Hlídání psa o víkendu"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Popis…"
                rows={2}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
              />
              <PrimaryAddButton label="Zveřejnit" onClick={submitHelp} withPlus={false} />
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
                preview={item.body}
              >
                <p className="pp-text-meta">
                  {item.mine ? "Vy" : formatAuthorName(item.author, item.accountType)}
                  {item.time ? ` · ${item.time}` : ""}
                </p>
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
              </LiveFeedCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
