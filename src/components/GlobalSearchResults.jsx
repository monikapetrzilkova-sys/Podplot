import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { buildGlobalSearchResults } from "../utils/globalSearch.js";
import { SECURITY_REPORTS } from "../data/mockData.js";
import { filterSecurityReportsByLocation } from "../data/geoFilter.js";
import { filterActiveReports } from "../data/reportExpiry.js";
import { getGroupPosts, getGroup, groupPostsLocation } from "../data/groups.js";
import { PlaceIcon } from "./module/placeIcons.jsx";
import { ReportPinIcon } from "./module/reportPinIcons.jsx";
import InstitutionDetailCard from "./InstitutionDetailCard.jsx";
import ReportMapPopup from "./ReportMapPopup.jsx";
import { MODULE_IDS } from "../data/moduleConfig.js";
import {
  DoodleCraftIcon,
  DoodleHelpIcon,
  DoodleMegaphoneIcon,
  DoodlePackageIcon,
  DoodleCalendarIcon,
  DoodleFamilyIcon,
  DoodleGroupsIcon,
} from "./doodle/doodleIcons.jsx";
import { displayCreatorLabel } from "../data/accountTypes.js";
import { isSelfNeighborCandidate, isCurrentUserRef } from "../data/listingSales.js";
import FeedCard from "./FeedCard.jsx";
import HelpFeedActions from "./HelpFeedActions.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import LiveFeedCard, { getNeighborSectionBadge } from "./LiveFeedCard.jsx";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";

function ResultSection({ title, children, count }) {
  if (!count) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-stone-400 px-0.5">
        {title} · {count}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ResultRow({ badge, title, subtitle, meta, icon, onClick, sample = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full pp-card p-3 text-left flex items-start gap-2.5 hover:bg-[#F7FAF9] transition-colors"
    >
      <span className="w-9 h-9 rounded-xl bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#3D7A68]">{badge}</span>
          {sample ? <SampleBadge /> : null}
          {meta && <span className="text-[10px] text-stone-400">{meta}</span>}
        </span>
        <span className="block text-sm font-semibold text-stone-900 mt-0.5 leading-snug">{title}</span>
        {subtitle && (
          <span className="block text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{subtitle}</span>
        )}
      </span>
    </button>
  );
}

/** Celkové výsledky z horního vyhledávání — napříč aplikací */
export default function GlobalSearchResults() {
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    institutionsSorted,
    extraReports,
    reportedReports,
    userPostsForLocation,
    feedPostsForLocation,
    userGroupPosts,
    communityGroups,
    neighborHelp,
    areaNews,
    servicesCatalogReachable,
    upcomingEvents,
    pastEvents,
    locationHostedActivities,
    lendingItemsForLocation,
    neighbors,
    user,
    activeLocation,
    activeLocationId,
    setActiveTab,
    setMapFocus,
    selectMainTab,
    openReportOnMapFromHome,
    openCraftsmanPublicProfile,
    setLocalGuideSearchQuery,
    openEventDetail,
    openHostedActivityDetail,
    openGroup,
    openLendingFromHome,
    offerHelpOnPost,
    hasOfferedHelp,
    getHelpOffers,
    setPendingNeighborsSection,
    setPendingThingsItemId,
    selectModuleItem,
  } = useApp();

  const [detailPlace, setDetailPlace] = useState(null);
  const [detailReport, setDetailReport] = useState(null);
  const [detailListing, setDetailListing] = useState(null);
  const [detailHelp, setDetailHelp] = useState(null);

  const q = globalSearchQuery.trim();

  const reports = useMemo(() => {
    const raw = filterActiveReports([...extraReports, ...SECURITY_REPORTS], Date.now());
    return filterSecurityReportsByLocation(raw, activeLocationId, activeLocation).filter(
      (r) => !reportedReports.includes(r.id)
    );
  }, [extraReports, reportedReports, activeLocationId, activeLocation]);

  const listings = useMemo(
    () => [...userPostsForLocation, ...feedPostsForLocation],
    [userPostsForLocation, feedPostsForLocation]
  );

  const groupPosts = useMemo(() => {
    return (communityGroups ?? []).flatMap((g) =>
      getGroupPosts(g.id, userGroupPosts ?? [], groupPostsLocation(activeLocationId, activeLocation))
    );
  }, [communityGroups, userGroupPosts, activeLocationId, activeLocation]);

  const searchableNeighbors = useMemo(
    () =>
      (neighbors ?? []).filter(
        (n) => n?.id && !isSelfNeighborCandidate(n, user) && !isCurrentUserRef(n.id, user)
      ),
    [neighbors, user]
  );

  const events = useMemo(
    () => [...(upcomingEvents ?? []), ...(pastEvents ?? [])],
    [upcomingEvents, pastEvents]
  );

  const results = useMemo(
    () =>
      buildGlobalSearchResults({
        query: q,
        places: institutionsSorted ?? [],
        reports,
        listings,
        help: neighborHelp ?? [],
        news: areaNews ?? [],
        services: servicesCatalogReachable ?? [],
        events,
        hostedActivities: locationHostedActivities ?? [],
        groupPosts,
        lending: lendingItemsForLocation ?? [],
        groups: communityGroups,
        neighbors: searchableNeighbors,
      }),
    [
      q,
      institutionsSorted,
      reports,
      listings,
      neighborHelp,
      areaNews,
      servicesCatalogReachable,
      events,
      locationHostedActivities,
      groupPosts,
      lendingItemsForLocation,
      communityGroups,
      searchableNeighbors,
    ]
  );

  if (!q) return null;

  const clearSearch = () => setGlobalSearchQuery("");

  const openPlace = (place) => setDetailPlace(place);

  const openReport = (report) => {
    if (report?.id) {
      openReportOnMapFromHome?.(report.id, {
        category: report.reportCategoryId === "tip" ? "tip" : "all",
        snapshot: report,
      });
      clearSearch();
      return;
    }
    setActiveTab("map");
    setMapFocus("reports");
    clearSearch();
  };

  const openListing = (post) => setDetailListing(post);

  const goToMapPlaces = () => {
    setLocalGuideSearchQuery?.(q);
    clearSearch();
    setActiveTab("map");
    setMapFocus("places");
  };

  return (
    <div className="pp-page flex flex-col min-h-full px-4 pt-3 pb-8 gap-4 bg-[#FAFAFA]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-stone-900">Výsledky hledání</h2>
          <p className="text-xs text-stone-500 mt-0.5 truncate">
            „{q}“ · {results.total} {results.total === 1 ? "výsledek" : "výsledků"} napříč aplikací
          </p>
        </div>
        <button
          type="button"
          onClick={clearSearch}
          className="text-xs font-semibold text-[#3D7A68] px-3 py-1.5 rounded-lg border border-[#C5DDD4] bg-white shrink-0"
        >
          Zrušit
        </button>
      </div>

      {results.total === 0 ? (
        <p className="pp-card px-4 py-6 text-sm text-stone-500 text-center leading-relaxed">
          Nic jsme nenašli. Zkus jiné slovo — např. běh, oblečení, hřiště, jahody.
        </p>
      ) : (
        <>
          <ResultSection title="Kroužky a lekce" count={results.hostedActivities.length}>
            {results.hostedActivities.map((activity) => (
              <ResultRow
                key={activity.id}
                badge="Kroužek"
                sample={isSampleContent(activity)}
                title={activity.title}
                subtitle={activity.description || activity.placeName}
                meta={[activity.hostName, activity.placeName || activity.address].filter(Boolean).join(" · ")}
                icon={<DoodleFamilyIcon className="w-4 h-4" />}
                onClick={() => {
                  openHostedActivityDetail?.(activity.id);
                  clearSearch();
                }}
              />
            ))}
          </ResultSection>

          <ResultSection title="Akce" count={results.events.length}>
            {results.events.map((ev) => (
              <ResultRow
                key={ev.id}
                badge="Akce"
                sample={isSampleContent(ev)}
                title={ev.title}
                subtitle={ev.description || ev.location}
                meta={[ev.date, ev.categoryLabel].filter(Boolean).join(" · ")}
                icon={<DoodleCalendarIcon className="w-4 h-4" />}
                onClick={() => {
                  openEventDetail?.(ev.id);
                  clearSearch();
                }}
              />
            ))}
          </ResultSection>

          <ResultSection title="Příspěvky ve skupinách" count={results.groupPosts.length}>
            {results.groupPosts.map((post) => {
              const group = getGroup(post.groupId);
              return (
                <ResultRow
                  key={post.id}
                  badge={group?.name || "Skupina"}
                  sample={isSampleContent(post)}
                  title={post.title}
                  subtitle={post.body}
                  meta={post.type || post.meta}
                  icon={<DoodleGroupsIcon className="w-4 h-4" />}
                  onClick={() => {
                    openGroup?.(post.groupId);
                    clearSearch();
                  }}
                />
              );
            })}
          </ResultSection>

          <ResultSection title="Skupiny" count={results.groups.length}>
            {results.groups.map((group) => (
              <ResultRow
                key={group.id}
                badge="Skupina"
                title={group.name}
                subtitle={group.description}
                meta={`${group.members ?? "?"} členů`}
                icon={<DoodleGroupsIcon className="w-4 h-4" />}
                onClick={() => {
                  openGroup?.(group.id);
                  clearSearch();
                }}
              />
            ))}
          </ResultSection>

          <ResultSection title="Inzeráty a nabídky" count={results.listings.length}>
            {results.listings.map((post) => (
              <ResultRow
                key={post.id}
                badge={post.type || post.feedSubtype || "Inzerát"}
                sample={isSampleContent(post)}
                title={post.title}
                subtitle={post.body}
                meta={post.meta}
                icon={<DoodlePackageIcon className="w-4 h-4" />}
                onClick={() => openListing(post)}
              />
            ))}
          </ResultSection>

          <ResultSection title="Půjčovna" count={results.lending.length}>
            {results.lending.map((item) => (
              <ResultRow
                key={item.id}
                badge="Půjčovna"
                sample={isSampleContent(item)}
                title={item.title || item.name}
                subtitle={item.body}
                meta={item.meta || item.categoryLabel}
                icon={<DoodlePackageIcon className="w-4 h-4" />}
                onClick={() => {
                  openLendingFromHome?.(item.id);
                  clearSearch();
                }}
              />
            ))}
          </ResultSection>

          <ResultSection title="Místa na mapě" count={results.places.length}>
            {results.places.map((place) => (
              <ResultRow
                key={place.id}
                badge="Místo"
                title={place.name}
                subtitle={place.tagline || place.address}
                meta={place.distance}
                icon={<PlaceIcon place={place} className="w-4 h-4" />}
                onClick={() => openPlace(place)}
              />
            ))}
            {results.places.length > 0 && (
              <button
                type="button"
                onClick={goToMapPlaces}
                className="w-full text-[11px] font-semibold text-[#3D7A68] py-2"
              >
                Zobrazit místa na mapě ›
              </button>
            )}
          </ResultSection>

          <ResultSection title="Hlášení z okolí" count={results.reports.length}>
            {results.reports.map((report) => (
              <ResultRow
                key={report.id}
                badge="Hlášení"
                sample={isSampleContent(report)}
                title={report.type}
                subtitle={report.body}
                meta={[report.distance, report.time].filter(Boolean).join(" · ")}
                icon={<ReportPinIcon report={report} className="w-4 h-4" />}
                onClick={() => openReport(report)}
              />
            ))}
          </ResultSection>

          <ResultSection title="Výpomoc" count={results.help.length}>
            {results.help.map((item) => (
              <ResultRow
                key={item.id}
                badge="Výpomoc"
                sample={isSampleContent(item)}
                title={item.title}
                subtitle={item.body}
                meta={item.distance}
                icon={<DoodleHelpIcon className="w-4 h-4" />}
                onClick={() => setDetailHelp(item)}
              />
            ))}
          </ResultSection>

          <ResultSection title="Aktuality" count={results.news.length}>
            {results.news.map((item) => (
              <ResultRow
                key={item.id}
                badge={item.type === "crisis" ? "Varování" : "Aktualita"}
                sample={isSampleContent(item)}
                title={item.title}
                subtitle={item.body}
                meta={item.time}
                icon={<DoodleMegaphoneIcon className="w-4 h-4" />}
                onClick={() => {
                  selectMainTab?.("home");
                  clearSearch();
                }}
              />
            ))}
          </ResultSection>

          <ResultSection title="Služby" count={results.services.length}>
            {results.services.map((svc) => (
              <ResultRow
                key={svc.id}
                badge="Služba"
                title={svc.name}
                subtitle={svc.profession || svc.tagline}
                meta={svc.distanceKm != null ? `${svc.distanceKm} km` : null}
                icon={<DoodleCraftIcon className="w-4 h-4" />}
                onClick={() => {
                  openCraftsmanPublicProfile?.({ serviceId: svc.id });
                }}
              />
            ))}
          </ResultSection>

          <ResultSection title="Sousedé" count={results.neighbors.length}>
            {results.neighbors.map((n) => (
              <ResultRow
                key={n.id}
                badge="Soused"
                title={n.name}
                subtitle={n.municipality || n.location}
                meta={n.distance}
                icon={<DoodleGroupsIcon className="w-4 h-4" />}
                onClick={() => {
                  selectMainTab?.("neighbors");
                  clearSearch();
                }}
              />
            ))}
          </ResultSection>
        </>
      )}

      {detailPlace && (
        <InstitutionDetailCard place={detailPlace} onClose={() => setDetailPlace(null)} />
      )}

      {detailReport && (
        <ReportMapPopup report={detailReport} onClose={() => setDetailReport(null)} />
      )}

      {detailListing && (
        <AppPanelPortal>
          <div className="pp-app-sheet-overlay">
            <div className="absolute inset-0 pointer-events-auto">
              <ModalDoodleBackdrop onClose={() => setDetailListing(null)} />
            </div>
            <div className="pp-app-sheet flex flex-col overflow-hidden" role="dialog" aria-label="Detail inzerátu">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 shrink-0">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#3D7A68]">
                    {detailListing.type || detailListing.feedSubtype || "Inzerát"}
                  </p>
                  <h2 className="text-base font-bold text-stone-900 truncate flex items-center gap-2">
                    <span className="truncate">{detailListing.title}</span>
                    {isSampleContent(detailListing) ? <SampleBadge /> : null}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailListing(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none shrink-0"
                  aria-label="Zavřít"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-[11px] text-stone-400 mb-2">
                  {displayCreatorLabel(detailListing.author, detailListing.accountType, {
                    mine: detailListing.mine,
                  })}
                  {detailListing.meta ? ` · ${detailListing.meta}` : ""}
                </p>
                <FeedCard post={detailListing} detailsOnly />
                <button
                  type="button"
                  onClick={() => {
                    const post = detailListing;
                    setDetailListing(null);
                    clearSearch();
                    selectMainTab?.("neighbors");
                    setPendingNeighborsSection?.("veci");
                    setPendingThingsItemId?.(post.id);
                    selectModuleItem?.(MODULE_IDS.THINGS, post.id);
                  }}
                  className="mt-3 w-full py-2.5 text-sm font-semibold rounded-xl border border-[#C5DDD4] text-[#3D7A68]"
                >
                  Otevřít v sekci Věci
                </button>
              </div>
            </div>
          </div>
        </AppPanelPortal>
      )}

      {detailHelp && (
        <AppPanelPortal>
          <div className="pp-app-sheet-overlay">
            <div className="absolute inset-0 pointer-events-auto">
              <ModalDoodleBackdrop onClose={() => setDetailHelp(null)} />
            </div>
            <div className="pp-app-sheet flex flex-col overflow-hidden" role="dialog" aria-label="Detail výpomoci">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 shrink-0">
                <h2 className="text-base font-bold text-stone-900">Detail výpomoci</h2>
                <button
                  type="button"
                  onClick={() => setDetailHelp(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none"
                  aria-label="Zavřít"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {(() => {
                  const sectionBadge = getNeighborSectionBadge("vypomoc", detailHelp.type);
                  const offerCount = getHelpOffers?.(detailHelp.id)?.length ?? 0;
                  return (
                    <LiveFeedCard
                      itemId={`search-help-${detailHelp.id}`}
                      sample={isSampleContent(detailHelp)}
                      badge={sectionBadge.label}
                      badgeClassName={sectionBadge.className}
                      title={detailHelp.title}
                      authorLabel={displayCreatorLabel(detailHelp.author, detailHelp.accountType, {
                        mine: detailHelp.mine,
                      })}
                      preview={detailHelp.body}
                    >
                      {detailHelp.mine ? (
                        <p className="pp-text-body text-sm">{detailHelp.body}</p>
                      ) : (
                        <HelpFeedActions
                          help={{
                            ...detailHelp,
                            helpId: detailHelp.id,
                            helpType: detailHelp.type,
                            offerCount,
                          }}
                          onOfferHelp={offerHelpOnPost}
                          alreadyOffered={hasOfferedHelp?.(detailHelp.id)}
                        />
                      )}
                      {detailHelp.time ? <p className="pp-text-meta mt-2">{detailHelp.time}</p> : null}
                    </LiveFeedCard>
                  );
                })()}
              </div>
            </div>
          </div>
        </AppPanelPortal>
      )}
    </div>
  );
}
