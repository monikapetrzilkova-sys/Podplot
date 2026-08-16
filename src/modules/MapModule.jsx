import { useEffect, useMemo, useState } from "react";

import { useApp } from "../context/AppContext.jsx";

import MapComponent from "../components/module/MapComponent.jsx";
import MapFab from "../components/module/MapFab.jsx";
import ViewToggleFab from "../components/module/ViewToggleFab.jsx";
import ListView, { ListItemShell } from "../components/module/ListView.jsx";
import InstitutionDetailCard from "../components/InstitutionDetailCard.jsx";
import { PlaceIcon } from "../components/module/placeIcons.jsx";
import ReportMenu from "../components/ReportMenu.jsx";

import { MODULE_IDS } from "../data/moduleConfig.js";
import {
  REMESLICI_CATEGORY_ID,
  SLUZBY_CATEGORY_ID,
  getProvozovnaType,
  institutionMatchesCategory,
  institutionMatchesProvozovnaType,
  institutionMatchesSearch,
  isGuideMapCategory,
  normalizeGuideCategoryId,
} from "../data/institutionsMapData.js";
import { sortInstitutionsByPriority } from "../utils/thingsModule.js";
import { mergeInstitutionsWithGoogle, useGuideGooglePlaces } from "../hooks/useGuideGooglePlaces.js";
import { fetchPlaceDetails, mergeGooglePlaceDetails } from "../data/placesApi.js";
import MapInstitutionPreviewSheet from "../components/map/MapEntityPreviewSheet.jsx";

function PlaceListRow({ place, selected, onShowOnMap, onOpen }) {
  const meta = [
    place.tagline,
    place.category === SLUZBY_CATEGORY_ID && place.provozovnaType
      ? getProvozovnaType(place.provozovnaType)?.label
      : null,
    place.distance,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <ListItemShell id={place.id} selected={selected} onShowOnMap={onShowOnMap}>
      <div className="flex items-start gap-2 py-0.5">
        <button
          type="button"
          onClick={() => onOpen(place)}
          className="flex-1 min-w-0 text-left flex items-start gap-2 rounded-lg -m-1 p-1 hover:bg-[#F1F6F5] active:bg-[#E8F0ED]"
        >
          <PlaceIcon place={place} className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="pp-text-title line-clamp-1 leading-snug">{place.name}</p>
            {meta && <p className="pp-text-meta line-clamp-1 mt-0.5 leading-snug">{meta}</p>}
          </div>
        </button>
        <ReportMenu compact onReport={() => {}} />
      </div>
    </ListItemShell>
  );
}

/** Mapa fyzických objektů — provozovny, instituce, veřejný prostor */
export default function MapModule({ provozovnaType = null }) {
  const {
    user,
    activeLocation,
    institutionsSorted,
    pendingPlaceSuggestions,
    localGuideCategory,
    setLocalGuideCategory,
    localGuideSearchQuery,
    moduleViewModes,
    setModuleViewMode,
    moduleSelection,
    selectModuleItem,
    showModuleItemOnMap,
    clearModuleSelection,
    openPlaceSuggestion,
  } = useApp();

  const [detailPlace, setDetailPlace] = useState(null);
  const [previewPlace, setPreviewPlace] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (localGuideCategory === REMESLICI_CATEGORY_ID) {
      setLocalGuideCategory("gastro");
    }
  }, [localGuideCategory, setLocalGuideCategory]);

  const moduleId = MODULE_IDS.LOCAL_GUIDE;
  const viewMode = moduleViewModes[moduleId] ?? "map";
  const activeCategory = normalizeGuideCategoryId(localGuideCategory);
  const isProvozovny = activeCategory === SLUZBY_CATEGORY_ID;
  const showMap = isGuideMapCategory(activeCategory);

  const { googlePlaces, source } = useGuideGooglePlaces(
    activeCategory,
    activeLocation,
    localGuideSearchQuery
  );

  const filtered = useMemo(
    () => {
      const local = sortInstitutionsByPriority([
        ...institutionsSorted.filter(
          (p) =>
            institutionMatchesCategory(p, activeCategory) &&
            institutionMatchesProvozovnaType(p, isProvozovny ? provozovnaType : null) &&
            institutionMatchesSearch(p, localGuideSearchQuery)
        ),
        ...pendingPlaceSuggestions.filter(
          (p) =>
            institutionMatchesCategory(p, activeCategory) &&
            institutionMatchesProvozovnaType(p, isProvozovny ? provozovnaType : null) &&
            institutionMatchesSearch(p, localGuideSearchQuery)
        ),
      ]);
      return mergeInstitutionsWithGoogle(local, googlePlaces);
    },
    [
      institutionsSorted,
      pendingPlaceSuggestions,
      googlePlaces,
      activeCategory,
      localGuideSearchQuery,
      isProvozovny,
      provozovnaType,
    ]
  );

  const selectedId = moduleSelection?.module === moduleId ? moduleSelection.id : null;
  const selectedPlace = filtered.find((p) => p.id === selectedId) ?? null;
  const sheetPlace = previewPlace ?? selectedPlace;

  const handleInstitutionPinClick = async (place) => {
    if (selectedId === place.id && detailPlace?.id === place.id) {
      clearModuleSelection();
      setPreviewPlace(null);
      setDetailPlace(null);
      return;
    }

    selectModuleItem(moduleId, place.id);
    setPreviewPlace(place);
    setDetailPlace(place);
    setPreviewLoading(Boolean(place.isGooglePlace && place.googlePlaceId));

    if (place.isGooglePlace && place.googlePlaceId) {
      try {
        const details = await fetchPlaceDetails(place.googlePlaceId);
        if (details && !details.error) {
          const merged = mergeGooglePlaceDetails(place, details);
          setPreviewPlace(merged);
          setDetailPlace(merged);
        }
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedId) setPreviewPlace(null);
  }, [selectedId]);

  const emptyMapMessage =
    isProvozovny && provozovnaType
      ? `V typu „${getProvozovnaType(provozovnaType)?.label ?? ""}“ nic nenalezeno.`
      : "Nic nenalezeno.";

  return (
    <>
      <div className="pp-map-module-root flex flex-col flex-1 min-h-0 overflow-hidden">
        {showMap ? (
          <div className="pp-map-module-viewport relative flex flex-col flex-1 min-h-0 overflow-hidden">
            {(source === "mock" || source === "mock-fallback") && (
              <p className="shrink-0 mx-0.5 mb-1 px-2 py-1.5 text-[10px] leading-snug rounded-lg border border-amber-200 bg-amber-50 text-amber-900">
                Lokálně běží ukázková místa — do <code className="font-mono">app/.env</code> doplňte{" "}
                <code className="font-mono">GOOGLE_MAPS_SERVER_API_KEY</code> (klíč bez HTTP referrer) a
                restartujte SPUSTIT.bat.
              </p>
            )}
            {viewMode === "map" ? (
              <>
                <MapComponent
                  mapMode="institutions"
                  institutions={filtered}
                  onInstitutionPinClick={handleInstitutionPinClick}
                  selectedInstitutionId={selectedId}
                  userAddress={activeLocation?.address ?? user?.address ?? ""}
                  userGeo={user?.geo ?? null}
                  areaLabel={activeLocation?.shortLabel}
                  homeLabel={activeLocation?.label ?? "Domov"}
                  totalCount={filtered.length}
                  fluid
                  hideStats
                  hideLegend
                  className="flex flex-col flex-1 min-h-0 mb-0"
                />
                {sheetPlace && !detailPlace && (
                  <MapInstitutionPreviewSheet
                    place={sheetPlace}
                    loading={previewLoading}
                    onDetail={() => setDetailPlace(sheetPlace)}
                    onClose={() => {
                      clearModuleSelection();
                      setPreviewPlace(null);
                    }}
                  />
                )}
              </>
            ) : (
              <ListView
                className="flex-1 min-h-0 overflow-y-auto"
                items={filtered}
                emptyMessage={emptyMapMessage}
                renderItem={(place) => (
                  <PlaceListRow
                    key={place.id}
                    place={place}
                    selected={selectedId === place.id}
                    onOpen={setDetailPlace}
                    onShowOnMap={() => showModuleItemOnMap(moduleId, place.id)}
                  />
                )}
              />
            )}
            <ViewToggleFab
              viewMode={viewMode}
              onToggle={() => setModuleViewMode(moduleId, viewMode === "map" ? "list" : "map")}
            />
            <MapFab onClick={openPlaceSuggestion} label="Označit místo" />
          </div>
        ) : null}
      </div>

      {detailPlace && (
        <InstitutionDetailCard place={detailPlace} onClose={() => setDetailPlace(null)} />
      )}
    </>
  );
}
