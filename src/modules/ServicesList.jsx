import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import ListView from "../components/module/ListView.jsx";
import LiveFeedCard from "../components/LiveFeedCard.jsx";
import ServiceReviewList from "../components/entity/ServiceReviewList.jsx";
import GuideSubFilterRow from "../components/GuideSubFilterRow.jsx";
import { MODULE_IDS } from "../data/moduleConfig.js";
import {
  HOME_SERVICE_SUB_FILTERS,
  getHomeServiceSubFilter,
  serviceMatchesHomeGroup,
  serviceMatchesSearch,
} from "../data/serviceCategories.js";
import { getServiceReachLabel } from "../utils/serviceReach.js";
import { canWriteServiceReview } from "../data/serviceReviews.js";
import { MessageButton } from "../components/MessagesPage.jsx";
import ReportUserButton from "../components/ReportUserButton.jsx";
import { DoodleCapacityFullIcon } from "../components/doodle/doodleIcons.jsx";

const CAPACITY_FULL_TITLE = "Nepřijímá zakázky · plná kapacita";

function serviceBadge(svc) {
  const raw = svc.profession ?? svc.subcategoryLabel ?? svc.categoryLabel ?? "Služba";
  return String(raw).toUpperCase().slice(0, 12);
}

function ServiceDetailPanel({ svc, user }) {
  const shortName = (svc.name ?? "").split("—")[0].trim();
  const reach = getServiceReachLabel(svc);

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <MessageButton participantId={svc.id} participantName={shortName} primary />
        </div>
        <ReportUserButton targetId={svc.id} targetName={svc.name} compact />
      </div>

      {svc.phone && (
        <p className="text-stone-600">
          <a href={`tel:${svc.phone}`} className="text-emerald-700 font-semibold">
            {svc.phone}
          </a>
        </p>
      )}

      {svc.defaultAddress ?? svc.address ? (
        <p className="text-stone-600">
          {svc.defaultAddress ?? svc.address}
          {svc.defaultAddress && svc.defaultAddress !== svc.address && (
            <span className="text-stone-400"> · výchozí poloha poskytovatele</span>
          )}
        </p>
      ) : null}

      {reach && (
        <p className="text-stone-600">
          {reach.type === "local" ? "📍" : "🚗"} {reach.label}
          {" · "}
          Dojezd {svc.actionRadius ?? 15} km
        </p>
      )}

      {svc.serviceDescription && (
        <p className="text-stone-600 leading-relaxed">{svc.serviceDescription}</p>
      )}

      <div>
        <p className="font-bold text-stone-500 uppercase text-[10px] mb-1.5">Recenze</p>
        <ServiceReviewList serviceId={svc.id} showComposer={canWriteServiceReview(user, svc)} compact />
      </div>
    </div>
  );
}

function ServiceListRow({ svc, expanded, onToggle, user }) {
  const shortName = (svc.name ?? "").split("—")[0].trim();
  const profession = svc.profession ?? svc.subcategoryLabel;
  const reach = getServiceReachLabel(svc);
  const previewParts = [
    profession && profession !== shortName ? profession : null,
    svc.kapacitaPlna ? "Nepřijímá zakázky" : "Volná kapacita",
    reach?.label ?? null,
    svc.isVerified ? "Ověřeno" : null,
    svc.isPremium ? "Boost" : null,
  ].filter(Boolean);

  return (
    <LiveFeedCard
      itemId={`catalog-${svc.id}`}
      domId={`module-item-${svc.id}`}
      badge={serviceBadge(svc)}
      badgeClassName={svc.isPremium ? "pp-badge--tip" : ""}
      title={shortName}
      preview={previewParts.join(" · ")}
      priceLabel={svc.rating ? `★ ${svc.rating}` : null}
      statusIcon={
        svc.kapacitaPlna ? <DoodleCapacityFullIcon className="w-4 h-4" /> : null
      }
      statusTitle={svc.kapacitaPlna ? CAPACITY_FULL_TITLE : null}
      expanded={expanded}
      onToggle={onToggle}
    >
      <ServiceDetailPanel svc={svc} user={user} />
    </LiveFeedCard>
  );
}

/** Služby u vás doma — seznam s podkategoriemi a dojezdem */
export default function ServicesList({
  searchQuery = "",
  homeSubCategory = null,
  onHomeSubChange,
}) {
  const {
    user,
    servicesCatalogReachable,
    moduleSelection,
    selectModuleItem,
    clearModuleSelection,
  } = useApp();

  const moduleId = MODULE_IDS.SERVICES;

  const servicesForModule = useMemo(
    () =>
      servicesCatalogReachable.filter(
        (s) => serviceMatchesHomeGroup(s, homeSubCategory) && serviceMatchesSearch(s, searchQuery)
      ),
    [servicesCatalogReachable, homeSubCategory, searchQuery]
  );

  const selectedId = moduleSelection?.module === moduleId ? moduleSelection.id : null;

  const emptyMessage = homeSubCategory
    ? `V kategorii „${getHomeServiceSubFilter(homeSubCategory)?.label ?? ""}“ zatím nic není.`
    : "Ve vašem okolí zatím nejsou žádné služby.";

  const toggleService = (svc) => {
    if (selectedId === svc.id) clearModuleSelection();
    else selectModuleItem(moduleId, svc.id);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-1.5">
      {onHomeSubChange && (
        <GuideSubFilterRow
          group="home-services"
          options={HOME_SERVICE_SUB_FILTERS}
          value={homeSubCategory}
          onChange={onHomeSubChange}
          ariaLabel="Podkategorie služeb u vás doma"
          className="shrink-0"
        />
      )}

      <ListView
        className="flex-1 min-h-0 overflow-y-auto space-y-1.5"
        items={servicesForModule}
        emptyMessage={emptyMessage}
        renderItem={(svc) => (
          <ServiceListRow
            key={svc.id}
            svc={svc}
            expanded={selectedId === svc.id}
            onToggle={() => toggleService(svc)}
            user={user}
          />
        )}
      />
    </div>
  );
}
