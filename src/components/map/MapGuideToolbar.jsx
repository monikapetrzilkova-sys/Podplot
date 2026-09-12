import { useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import CompactGuideGrid from "../module/CompactGuideGrid.jsx";
import GuideSubFilterRow from "../GuideSubFilterRow.jsx";
import {
  MAP_GUIDE_FILTER_CATEGORIES,
  REMESLICI_CATEGORY_ID,
  SLUZBY_CATEGORY_ID,
  PROVOZOVNY_TYPE_FILTERS,
  normalizeGuideCategoryId,
} from "../../data/institutionsMapData.js";

/** Kategorie průvodce — stejná struktura toolbaru jako u Hlášení (lupa je u dlaždice Průvodce) */
export default function MapGuideToolbar({ provozovnaType, onProvozovnaTypeChange }) {
  const {
    localGuideCategory,
    setLocalGuideCategory,
    clearModuleSelection,
    isAdminMode,
    pendingPlaceSuggestions,
  } = useApp();

  useEffect(() => {
    if (localGuideCategory === REMESLICI_CATEGORY_ID) {
      setLocalGuideCategory("gastro");
    }
  }, [localGuideCategory, setLocalGuideCategory]);

  const activeCategory = normalizeGuideCategoryId(localGuideCategory);
  const isProvozovny = activeCategory === SLUZBY_CATEGORY_ID;

  const handleCategorySelect = (id) => {
    setLocalGuideCategory(id);
    onProvozovnaTypeChange(null);
    clearModuleSelection();
  };

  return (
    <div className="pp-map-toolbar-inner">
      <div className="pp-map-toolbar-grid">
        <CompactGuideGrid
          categories={MAP_GUIDE_FILTER_CATEGORIES}
          activeId={activeCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      <div className="pp-map-toolbar-subfilter">
        {isProvozovny ? (
          <GuideSubFilterRow
            group="provozovny"
            options={PROVOZOVNY_TYPE_FILTERS}
            value={provozovnaType}
            onChange={onProvozovnaTypeChange}
            ariaLabel="Typ provozovny"
            iconOnly
          />
        ) : null}
      </div>
      {isAdminMode && pendingPlaceSuggestions.length > 0 ? (
        <p className="pp-map-toolbar-admin text-[10px] font-semibold text-amber-800">
          Admin: {pendingPlaceSuggestions.length} návrh(ů)
        </p>
      ) : null}
    </div>
  );
}
