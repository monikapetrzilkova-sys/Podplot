import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { buildGlobalSearchResults } from "../utils/globalSearch.js";
import { SECURITY_REPORTS } from "../data/mockData.js";
import { filterSecurityReportsByLocation } from "../data/geoFilter.js";
import { filterActiveReports } from "../data/reportExpiry.js";
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
} from "./doodle/doodleIcons.jsx";

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

function ResultRow({ badge, title, subtitle, meta, icon, onClick }) {
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

/** Celkové výsledky z horního vyhledávání — místa, hlášení, inzeráty… */
export default function GlobalSearchResults() {
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    institutionsSorted,
    extraReports,
    reportedReports,
    userPostsForLocation,
    feedPostsForLocation,
    neighborHelp,
    areaNews,
    servicesCatalogReachable,
    activeLocation,
    activeLocationId,
    setActiveTab,
    setMapFocus,
    selectMainTab,
    showModuleItemOnMap,
    openCraftsmanPublicProfile,
  } = useApp();

  const [detailPlace, setDetailPlace] = useState(null);
  const [detailReport, setDetailReport] = useState(null);
  const [detailListing, setDetailListing] = useState(null);

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
      }),
    [q, institutionsSorted, reports, listings, neighborHelp, areaNews, servicesCatalogReachable]
  );

  if (!q) return null;

  const openPlace = (place) => setDetailPlace(place);

  const openReport = (report) => {
    if (report.mapPos) {
      setDetailReport(report);
      return;
    }
    setActiveTab("map");
    setMapFocus("reports");
    showModuleItemOnMap?.(MODULE_IDS.REPORTS, report.id);
  };

  const openListing = (post) => setDetailListing(post);

  const goToMapPlaces = () => {
    setActiveTab("map");
    setMapFocus("places");
  };

  return (
    <div className="pp-page flex flex-col min-h-full px-4 pt-3 pb-8 gap-4 bg-[#FAFAFA]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-stone-900">Výsledky hledání</h2>
          <p className="text-xs text-stone-500 mt-0.5 truncate">
            „{q}“ · {results.total} {results.total === 1 ? "výsledek" : "výsledků"} v okolí
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGlobalSearchQuery("")}
          className="text-xs font-semibold text-[#3D7A68] px-3 py-1.5 rounded-lg border border-[#C5DDD4] bg-white shrink-0"
        >
          Zrušit
        </button>
      </div>

      {results.total === 0 ? (
        <p className="pp-card px-4 py-6 text-sm text-stone-500 text-center leading-relaxed">
          Nic jsme v okolí nenašli. Zkuste jiné slovo — např. hřiště, jahody, výpadek.
        </p>
      ) : (
        <>
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
                title={report.type}
                subtitle={report.body}
                meta={[report.distance, report.time].filter(Boolean).join(" · ")}
                icon={<ReportPinIcon report={report} className="w-4 h-4" />}
                onClick={() => openReport(report)}
              />
            ))}
          </ResultSection>

          <ResultSection title="Inzeráty a nabídky" count={results.listings.length}>
            {results.listings.map((post) => (
              <ResultRow
                key={post.id}
                badge={post.type || post.feedSubtype || "Inzerát"}
                title={post.title}
                subtitle={post.body}
                meta={post.meta}
                icon={<DoodlePackageIcon className="w-4 h-4" />}
                onClick={() => openListing(post)}
              />
            ))}
          </ResultSection>

          <ResultSection title="Výpomoc" count={results.help.length}>
            {results.help.map((item) => (
              <ResultRow
                key={item.id}
                badge="Výpomoc"
                title={item.title}
                subtitle={item.body}
                meta={item.distance}
                icon={<DoodleHelpIcon className="w-4 h-4" />}
                onClick={() => {
                  selectMainTab?.("neighbors");
                  setGlobalSearchQuery("");
                }}
              />
            ))}
          </ResultSection>

          <ResultSection title="Aktuality" count={results.news.length}>
            {results.news.map((item) => (
              <ResultRow
                key={item.id}
                badge={item.type === "crisis" ? "Varování" : "Aktualita"}
                title={item.title}
                subtitle={item.body}
                meta={item.time}
                icon={<DoodleMegaphoneIcon className="w-4 h-4" />}
                onClick={() => {
                  selectMainTab?.("home");
                  setGlobalSearchQuery("");
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
        </>
      )}

      {detailPlace && (
        <InstitutionDetailCard place={detailPlace} onClose={() => setDetailPlace(null)} />
      )}

      {detailReport && (
        <ReportMapPopup report={detailReport} onClose={() => setDetailReport(null)} />
      )}

      {detailListing && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Zavřít"
            onClick={() => setDetailListing(null)}
          />
          <article className="relative z-10 w-full max-w-[390px] bg-white rounded-2xl p-4 shadow-xl space-y-2">
            <p className="text-[10px] font-bold uppercase text-[#3D7A68]">
              {detailListing.type || "Inzerát"}
            </p>
            <h3 className="text-base font-bold text-stone-900">{detailListing.title}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{detailListing.body}</p>
            <p className="text-[11px] text-stone-400">
              {detailListing.author}
              {detailListing.meta ? ` · ${detailListing.meta}` : ""}
            </p>
            <button
              type="button"
              onClick={() => setDetailListing(null)}
              className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold bg-[#3D7A68] text-white"
            >
              Zavřít
            </button>
          </article>
        </div>
      )}
    </div>
  );
}
