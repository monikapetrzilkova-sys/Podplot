import { useMemo, useState } from "react";

import { useApp } from "../context/AppContext.jsx";

import MapComponent from "../components/module/MapComponent.jsx";

import MapFab from "../components/module/MapFab.jsx";

import ViewToggleFab from "../components/module/ViewToggleFab.jsx";

import CompactGuideGrid from "../components/module/CompactGuideGrid.jsx";

import ListView, { ListItemShell } from "../components/module/ListView.jsx";

import InstitutionDetailCard from "../components/InstitutionDetailCard.jsx";

import GuideSubFilterRow from "../components/GuideSubFilterRow.jsx";

import ServicesList from "./ServicesList.jsx";

import { MODULE_IDS } from "../data/moduleConfig.js";

import {

  GUIDE_GRID_CATEGORIES,

  REMESLICI_CATEGORY_ID,

  SLUZBY_CATEGORY_ID,

  PROVOZOVNY_TYPE_FILTERS,

  getProvozovnaType,

  institutionMatchesCategory,

  institutionMatchesProvozovnaType,

  institutionMatchesSearch,

  isGuideMapCategory,

  normalizeGuideCategoryId,

} from "../data/institutionsMapData.js";

import { sortInstitutionsByPriority } from "../utils/thingsModule.js";
import { PlaceIcon } from "../components/module/placeIcons.jsx";
import CompactSearchToggle from "../components/CompactSearchToggle.jsx";



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

      <button type="button" onClick={() => onOpen(place)} className="w-full text-left flex items-start gap-2 py-0.5">

        <PlaceIcon place={place} className="w-5 h-5 shrink-0 mt-0.5" />

        <div className="min-w-0 flex-1">

          <p className="pp-text-title line-clamp-1 leading-snug">{place.name}</p>

          {meta && <p className="pp-text-meta line-clamp-1 mt-0.5 leading-snug">{meta}</p>}

        </div>

      </button>

    </ListItemShell>

  );

}



/** Sjednocený modul Průvodce — katalog míst + služby u vás doma */

export default function GuideModule() {

  const {

    user,

    activeLocation,

    institutionsSorted,

    pendingPlaceSuggestions,

    localGuideCategory,

    setLocalGuideCategory,

    localGuideSearchQuery,

    setLocalGuideSearchQuery,

    moduleViewModes,

    setModuleViewMode,

    moduleSelection,

    selectModuleItem,

    showModuleItemOnMap,

    clearModuleSelection,

    isAdminMode,

    openPlaceSuggestion,

  } = useApp();



  const [detailPlace, setDetailPlace] = useState(null);

  const [provozovnaType, setProvozovnaType] = useState(null);

  const [homeServiceSub, setHomeServiceSub] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);



  const moduleId = MODULE_IDS.LOCAL_GUIDE;

  const viewMode = moduleViewModes[moduleId] ?? "map";

  const activeCategory = normalizeGuideCategoryId(localGuideCategory);

  const isHomeServices = activeCategory === REMESLICI_CATEGORY_ID;

  const isProvozovny = activeCategory === SLUZBY_CATEGORY_ID;

  const showMap = isGuideMapCategory(activeCategory);



  const filtered = useMemo(

    () =>

      sortInstitutionsByPriority([

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

      ]),

    [

      institutionsSorted,

      pendingPlaceSuggestions,

      activeCategory,

      localGuideSearchQuery,

      isProvozovny,

      provozovnaType,

    ]

  );



  const selectedId = moduleSelection?.module === moduleId ? moduleSelection.id : null;

  const selectedPlace = filtered.find((p) => p.id === selectedId) ?? null;



  const toggleView = () => setModuleViewMode(moduleId, viewMode === "map" ? "list" : "map");



  const handleCategorySelect = (id) => {

    setLocalGuideCategory(id);

    setProvozovnaType(null);

    setHomeServiceSub(null);

    clearModuleSelection();

  };



  const emptyMapMessage =

    isProvozovny && provozovnaType

      ? `V typu „${getProvozovnaType(provozovnaType)?.label ?? ""}“ nic nenalezeno.`

      : "Nic nenalezeno.";



  return (

    <>

      <div className="pp-guide-page flex flex-col flex-1 min-h-0 px-2 py-1 gap-1.5">

        {(searchExpanded || Boolean(localGuideSearchQuery?.trim())) && (
          <CompactSearchToggle
            value={localGuideSearchQuery}
            onChange={setLocalGuideSearchQuery}
            expanded={searchExpanded || Boolean(localGuideSearchQuery?.trim())}
            onExpandedChange={setSearchExpanded}
            placeholder="Hledat v obci…"
            ariaLabel="Hledat v průvodci"
          />
        )}

        <div className="flex items-start gap-1 min-w-0 shrink-0">
          <div className="flex-1 min-w-0">
            <CompactGuideGrid
              categories={GUIDE_GRID_CATEGORIES}
              activeId={activeCategory}
              onSelect={handleCategorySelect}
            />
          </div>
          {!(searchExpanded || Boolean(localGuideSearchQuery?.trim())) && (
            <CompactSearchToggle
              value={localGuideSearchQuery}
              onChange={setLocalGuideSearchQuery}
              expanded={false}
              onExpandedChange={setSearchExpanded}
              placeholder="Hledat v obci…"
              ariaLabel="Hledat v průvodci"
              className="mt-1"
            />
          )}
        </div>

        {isProvozovny && (

          <GuideSubFilterRow

            group="provozovny"

            options={PROVOZOVNY_TYPE_FILTERS}

            value={provozovnaType}

            onChange={setProvozovnaType}

            ariaLabel="Typ provozovny"

            className="shrink-0 pb-0.5"

          />

        )}



        {isAdminMode && pendingPlaceSuggestions.length > 0 && (

          <p className="text-[10px] font-semibold text-amber-800 shrink-0">

            Admin: {pendingPlaceSuggestions.length} návrh(ů)

          </p>

        )}



        {isHomeServices ? (

          <ServicesList searchQuery={localGuideSearchQuery} homeSubCategory={homeServiceSub} onHomeSubChange={setHomeServiceSub} />

        ) : showMap ? (

          <div className="relative flex-1 min-h-[60vh] flex flex-col">

            {viewMode === "map" ? (

              <MapComponent

                mapMode="institutions"

                institutions={filtered}

                onInstitutionPinClick={(place) => selectModuleItem(moduleId, place.id)}

                selectedInstitutionId={selectedId}

                userAddress={activeLocation?.address ?? user?.address ?? ""}

                userGeo={user?.geo ?? null}

                areaLabel={activeLocation?.shortLabel}

                homeLabel={activeLocation?.label ?? "Domov"}

                totalCount={filtered.length}

                large

                className="flex-1 min-h-0 mb-0 [&_.pp-map-container]:!h-full [&_.pp-map-container]:min-h-[60vh]"

                institutionPopup={

                  selectedPlace

                    ? {

                        place: selectedPlace,

                        onDetail: () => setDetailPlace(selectedPlace),

                        onClose: clearModuleSelection,

                      }

                    : null

                }

              />

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

            <ViewToggleFab viewMode={viewMode} onToggle={toggleView} />

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

