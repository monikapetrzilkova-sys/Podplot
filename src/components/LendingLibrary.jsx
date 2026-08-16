import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { groupLendingItems, filterLendingGroups } from "../data/lendingCategories.js";
import { lendingDisplayTitle } from "../data/lendingItemTypes.js";
import { postMatchesMarketFilters } from "../data/marketCategories.js";
import { AddListingButton } from "./QuickNav.jsx";
import LendingBookingModal from "./LendingBookingModal.jsx";
import LendingOwnerStatus from "./LendingOwnerStatus.jsx";
import CompactAccordion from "./CompactAccordion.jsx";
import { accordionKey } from "../data/uiPreferences.js";
import { MessageButton } from "./MessagesPage.jsx";
import ReportUserButton from "./ReportUserButton.jsx";
import { formatAuthorName } from "../data/accountTypes.js";
import { topicFromLending } from "../data/chatTopics.js";

function formatReservationDates(r) {
  if (!r.startDate) return null;
  const fmt = (key) => {
    const [y, m, d] = key.split("-");
    return `${Number(d)}.${Number(m)}.${y}`;
  };
  if (!r.endDate || r.endDate === r.startDate) return fmt(r.startDate);
  return `${fmt(r.startDate)} – ${fmt(r.endDate)}`;
}

export default function LendingLibrary() {
  const { reservations, lendingItemsForLocation, zboziSearchQuery, zboziMarketCategory } = useApp();
  const [bookItem, setBookItem] = useState(null);

  const allGroups = useMemo(() => {
    const allItems = lendingItemsForLocation;
    return groupLendingItems(allItems);
  }, [lendingItemsForLocation]);

  const flatOffers = useMemo(() => {
    const groups = filterLendingGroups(allGroups, { category: "vse", query: zboziSearchQuery });
    return groups.flatMap((g) =>
      g.offers.map((offer) => ({
        ...offer,
        itemTypeLabel: g.itemTypeLabel,
      }))
    ).filter((item) =>
      postMatchesMarketFilters(
        {
          title: item.item,
          body: item.description,
          item: item.item,
          itemTypeLabel: item.itemTypeLabel,
          marketCategory: item.marketCategory,
          lendingCategory: item.lendingCategory,
          keywords: [item.itemTypeLabel, item.author],
        },
        zboziSearchQuery,
        zboziMarketCategory
      )
    );
  }, [allGroups, zboziSearchQuery, zboziMarketCategory]);

  return (
    <div className="pb-4">
      <p className="text-xs text-stone-500 mb-3 px-0">
        Půjčovna — klepněte na řádek pro detail a rezervaci.
      </p>

      <AddListingButton className="mb-3 w-full" category="pujcovna" label="Přidat věc k půjčení" />

      {reservations.length > 0 && (
        <div className="mb-3 p-3 bg-emerald-100 border border-emerald-200 rounded-xl text-xs space-y-2">
          <p className="font-bold text-emerald-800 mb-1">Vaše rezervace</p>
          {reservations.map((r) => (
            <div key={r.id + r.reservedAt} className="text-emerald-900">
              <p>
                ✓ {r.item} — {r.totalPaid ?? r.credits} Kč
                {formatReservationDates(r) ? ` · ${formatReservationDates(r)}` : ""}
              </p>
              <div className="mt-1">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {flatOffers.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-8 bg-white rounded-xl border border-stone-200">
          {zboziSearchQuery.trim() ? "Nic nenalezeno pro toto hledání." : "Zatím nic k půjčení."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {flatOffers.map((item) => {
            const inactive = Boolean(item.onVacation);
            return (
            <CompactAccordion
              key={item.id ?? item.item + item.author}
              prefKey={accordionKey("lending", item.id ?? `${item.item}-${item.author}`)}
              className={inactive ? "bg-stone-50 border-stone-200 opacity-80" : ""}
              summary={
                <div className="flex items-center gap-2 min-w-0 w-full text-sm">
                  <span
                    className={`font-semibold truncate flex-1 ${
                      inactive ? "text-stone-400" : "text-stone-900"
                    }`}
                  >
                    {lendingDisplayTitle(item)}
                  </span>
                  {item.distance && (
                    <span className="shrink-0 text-stone-400 text-[11px]">{item.distance}</span>
                  )}
                  <span
                    className={`shrink-0 font-bold text-xs tabular-nums ${
                      inactive ? "text-stone-400" : "text-emerald-700"
                    }`}
                  >
                    {item.credits != null ? `${item.credits} Kč/den` : ""}
                  </span>
                  {inactive && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase text-stone-400">
                      dovolená
                    </span>
                  )}
                </div>
              }
            >
              <div className={`space-y-2 text-sm ${inactive ? "text-stone-500" : ""}`}>
                {item.item &&
                  item.itemTypeLabel &&
                  item.item !== item.itemTypeLabel && (
                    <p className="text-xs text-stone-500">{item.item}</p>
                  )}
                <p className={inactive ? "text-stone-500" : "text-stone-600"}>{item.description}</p>
                <p className="text-xs text-stone-500">{formatAuthorName(item.author, item.accountType)}</p>
                <LendingOwnerStatus
                  onVacation={item.onVacation}
                  availabilityMessage={item.availabilityMessage}
                />
                <div className="flex gap-2 flex-wrap">
                  {!item.mine && (
                    <button
                      type="button"
                      disabled={item.onVacation}
                      onClick={() => setBookItem(item)}
                      className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-xl disabled:opacity-40"
                    >
                      {item.onVacation ? "Teď nedostupné" : `Rezervovat · od ${item.credits} Kč/den`}
                    </button>
                  )}
                  <MessageButton
                    participantId={item.authorId ?? item.id}
                    participantName={item.author}
                    topic={topicFromLending(item)}
                  />
                  <ReportUserButton targetId={item.authorId ?? item.id} targetName={item.author} compact />
                </div>
              </div>
            </CompactAccordion>
            );
          })}
        </div>
      )}

      <LendingBookingModal open={!!bookItem} item={bookItem} onClose={() => setBookItem(null)} />
    </div>
  );
}
