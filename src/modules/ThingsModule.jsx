import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import ListView from "../components/module/ListView.jsx";
import PillFilterRow from "../components/PillFilterRow.jsx";
import LendingSubFilterRow from "../components/LendingSubFilterRow.jsx";
import { extractListingPrice } from "../components/CompactListingRow.jsx";
import FeedCard from "../components/FeedCard.jsx";
import LiveFeedCard, { getListingBadge } from "../components/LiveFeedCard.jsx";
import LendingBookingModal from "../components/LendingBookingModal.jsx";
import LendingOwnerStatus from "../components/LendingOwnerStatus.jsx";
import { MessageButton } from "../components/MessagesPage.jsx";
import ReportUserButton from "../components/ReportUserButton.jsx";
import { MODULE_IDS } from "../data/moduleConfig.js";
import { VECI_TYPE_FILTERS, thingCategoryId } from "../utils/thingsModule.js";
import { getPujcovnaSubFilter } from "../data/lendingCategories.js";
import { lendingDisplayTitle } from "../data/lendingItemTypes.js";
import { IconNavSearch } from "../components/communityNavIcons.jsx";
import PrimaryAddButton from "../components/PrimaryAddButton.jsx";
import { formatAuthorName, displayCreatorLabel } from "../data/accountTypes.js";
import { topicFromLending, topicFromPost } from "../data/chatTopics.js";

function addListingLabel(categoryId) {
  if (categoryId === "daruji") return "Přidat darování";
  if (categoryId === "prodam") return "Přidat prodej";
  if (categoryId === "shanim") return "Přidat poptávku";
  if (categoryId === "pujcovna") return "Přidat věc k půjčení";
  return "Přidat inzerát";
}

function formatReservationDates(r) {
  if (!r.startDate) return null;
  const fmt = (key) => {
    const [y, m, d] = key.split("-");
    return `${Number(d)}.${Number(m)}.${y}`;
  };
  if (!r.endDate || r.endDate === r.startDate) return fmt(r.startDate);
  return `${fmt(r.startDate)} – ${fmt(r.endDate)}`;
}

function ThingLendingDetail({ item, onReserve }) {
  const onVacation = Boolean(item.onVacation);
  return (
    <div className="space-y-1.5 pp-thing-detail">
      <p className="pp-text-body">{item.description ?? item.subtitle}</p>
      <p className="pp-text-meta">{formatAuthorName(item.author, item.accountType)}</p>
      <LendingOwnerStatus
        onVacation={onVacation}
        availabilityMessage={item.availabilityMessage}
      />
      <div className="flex gap-2 flex-wrap pt-0.5">
        {!item.mine && (
          <button
            type="button"
            disabled={onVacation}
            onClick={() => onReserve(item)}
            className="text-[11px] font-bold text-white bg-[#1B4D3E] px-2.5 py-1 rounded-lg disabled:opacity-40"
          >
            {onVacation ? "Teď nedostupné" : `Rezervovat · od ${item.credits} Kč/den`}
          </button>
        )}
        <MessageButton
          participantId={item.authorId ?? item.id}
          participantName={item.author}
          topic={topicFromLending(item) || topicFromPost(item)}
          compact
        />
        <ReportUserButton targetId={item.authorId ?? item.id} targetName={item.author} compact />
      </div>
    </div>
  );
}

function ThingListRow({ item, expanded, onToggle }) {
  const { listingSaleOrders } = useApp();
  const reserved =
    item.saleStatus === "held" ||
    Boolean(listingSaleOrders?.some((o) => o.listingId === item.id && o.status === "held"));
  const price = reserved ? null : extractListingPrice(item);
  const statusLabel = reserved ? "V rezervaci" : item.onVacation ? "Dovolená" : null;
  const title =
    item.thingKind === "lending" || thingCategoryId(item) === "pujcovna"
      ? lendingDisplayTitle(item)
      : item.label;
  const badgeInfo = getListingBadge(item.type ?? thingCategoryId(item));
  const creator = displayCreatorLabel(item.author, item.accountType, { mine: item.mine });
  const preview = item.description ?? item.subtitle ?? item.body ?? null;

  return (
    <LiveFeedCard
      itemId={`thing-${item.id}`}
      domId={`module-item-${item.id}`}
      badge={badgeInfo.label}
      badgeClassName={badgeInfo.className}
      title={title}
      authorLabel={creator}
      preview={preview}
      editedItem={item}
      priceLabel={price}
      statusLabel={statusLabel}
      expanded={expanded}
      onToggle={onToggle}
    >
      {item.thingKind === "lending" || thingCategoryId(item) === "pujcovna" ? (
        <ThingLendingDetail item={item} onReserve={item.onReserve} />
      ) : (
        <FeedCard post={item} detailsOnly />
      )}
    </LiveFeedCard>
  );
}

export default function ThingsModule({ hideCategoryFilters = false }) {
  const {
    thingsForModule,
    thingsCategory,
    setThingsCategory,
    thingsLendingSubCategory,
    setThingsLendingSubCategory,
    thingsSearchQuery,
    setThingsSearchQuery,
    moduleSelection,
    selectModuleItem,
    clearModuleSelection,
    reservations,
    confirmLendingReturn,
    pendingThingsItemId,
    setPendingThingsItemId,
    openCreate,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(Boolean(thingsSearchQuery));
  const [bookItem, setBookItem] = useState(null);

  useEffect(() => {
    if (!pendingThingsItemId) return;
    const timer = window.setTimeout(() => {
      document
        .getElementById(`module-item-${pendingThingsItemId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setPendingThingsItemId(null);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [pendingThingsItemId, thingsForModule, setPendingThingsItemId]);

  const moduleId = MODULE_IDS.THINGS;
  const selectedId = moduleSelection?.module === moduleId ? moduleSelection.id : null;

  const handleToggle = (item) => {
    if (selectedId === item.id) {
      clearModuleSelection();
    } else {
      selectModuleItem(moduleId, item.id);
    }
  };

  const handleCategoryChange = (cat) => {
    setThingsCategory(cat);
  };

  const itemCatLabel = thingsLendingSubCategory
    ? getPujcovnaSubFilter(thingsLendingSubCategory)?.label
    : null;

  const emptyMessage = itemCatLabel
    ? `V kategorii „${itemCatLabel}“ zatím nic není.`
    : thingsCategory === "pujcovna"
      ? "V tomto okruhu zatím nic k půjčení."
      : "V tomto filtru zatím nic není.";

  return (
    <div className="relative flex flex-col flex-1 min-h-0 px-3 py-1 gap-1.5">
      {!hideCategoryFilters && (
        <div className="shrink-0 flex items-center gap-1.5">
          <PillFilterRow
            options={VECI_TYPE_FILTERS}
            value={thingsCategory}
            onChange={handleCategoryChange}
            nowrap
            className="flex-1 min-w-0"
          />
          {searchOpen || thingsSearchQuery ? (
            <input
              type="search"
              autoFocus={searchOpen && !thingsSearchQuery}
              value={thingsSearchQuery}
              onChange={(e) => setThingsSearchQuery(e.target.value)}
              placeholder="Hledat…"
              className="flex-1 min-w-0 px-2.5 py-1 rounded-full text-xs bg-white text-[#1B4D3E] border border-[#1B4D3E] focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Hledat nabídku"
              className="shrink-0 p-1 text-[#1B4D3E]"
            >
              <IconNavSearch className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <LendingSubFilterRow
        value={thingsLendingSubCategory}
        onChange={setThingsLendingSubCategory}
        className="shrink-0 px-0.5 pb-0.5"
      />

      {hideCategoryFilters && (searchOpen || thingsSearchQuery) ? (
        <div className="shrink-0 flex items-center gap-1.5">
          <input
            type="search"
            autoFocus={searchOpen && !thingsSearchQuery}
            value={thingsSearchQuery}
            onChange={(e) => setThingsSearchQuery(e.target.value)}
            placeholder="Hledat v nabídkách…"
            className="flex-1 min-w-0 px-2.5 py-2 rounded-xl text-xs bg-white text-[#1B4D3E] border border-[#C5DDD4] focus:outline-none focus:border-[#1B4D3E]"
          />
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setThingsSearchQuery("");
            }}
            aria-label="Zavřít hledání"
            className="shrink-0 w-9 h-9 rounded-xl text-stone-500 hover:bg-stone-100 text-sm font-bold"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="shrink-0 flex items-center gap-1.5">
          <div className="flex-1 min-w-0">
            <PrimaryAddButton
              label={addListingLabel(thingsCategory)}
              onClick={() => openCreate(thingsCategory === "vse" ? null : thingsCategory)}
            />
          </div>
          {hideCategoryFilters && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Hledat nabídku"
              className="shrink-0 w-9 h-9 rounded-xl border border-[#C5DDD4] bg-white text-[#1B4D3E] hover:bg-[#F1F6F5] inline-flex items-center justify-center"
            >
              <IconNavSearch className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {thingsCategory === "pujcovna" && reservations.length > 0 && (
        <div className="shrink-0 px-2.5 py-2 pp-card mx-2 text-[11px]">
          <p className="font-bold text-stone-800 mb-1.5">Vaše rezervace</p>
          {reservations.map((r) => (
            <div key={r.id + r.reservedAt} className="py-1.5 border-b border-stone-100 last:border-0">
              <p className="text-stone-800 leading-snug">
                {r.item} — {r.totalPaid ?? r.credits} Kč
                {formatReservationDates(r) ? ` · ${formatReservationDates(r)}` : ""}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2 items-center">
                <MessageButton
                  participantId={r.ownerId ?? r.authorId ?? r.id}
                  participantName={r.author}
                  topic={{
                    kind: "lending",
                    refId: r.id,
                    title: r.item,
                    label: "Půjčovna",
                  }}
                />
                {r.returnedAt ? (
                  <p className="text-[#3D7A68] font-semibold">✓ Vrácení potvrzeno</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => confirmLendingReturn(`${r.id}${r.reservedAt}`)}
                    className="text-[10px] font-semibold text-[#3D7A68] underline"
                  >
                    Potvrdit vrácení
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto pb-14">
        <ListView
          className="space-y-1.5 pt-1"
          items={thingsForModule}
          emptyMessage={emptyMessage}
          renderItem={(item) => (
            <ThingListRow
              key={item.id}
              item={{ ...item, onReserve: setBookItem }}
              expanded={selectedId === item.id}
              onToggle={() => handleToggle(item)}
            />
          )}
        />
      </div>

      <LendingBookingModal open={!!bookItem} item={bookItem} onClose={() => setBookItem(null)} />
    </div>
  );
}
