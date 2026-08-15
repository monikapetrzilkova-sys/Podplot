import { useApp } from "../../context/AppContext.jsx";
import { MAP_REPORT_FILTER_CATEGORIES } from "../../data/reportCategories.js";
import CompactReportsGrid from "../module/CompactReportsGrid.jsx";

/** Kategorie hlášení — stejná struktura toolbaru jako u Průvodce */
export default function MapReportsToolbar({ activeCategory, onCategoryChange }) {
  const { clearModuleSelection, promptCalls, dismissedPromptCallIds } = useApp();

  const activeCallsCount = promptCalls.filter(
    (c) => c.active !== false && !dismissedPromptCallIds.includes(c.id)
  ).length;

  const handleCategorySelect = (id) => {
    onCategoryChange(id);
    clearModuleSelection();
  };

  return (
    <div className="pp-map-toolbar-inner pp-map-toolbar-inner--reports">
      <div className="pp-map-toolbar-grid">
        <CompactReportsGrid
          categories={MAP_REPORT_FILTER_CATEGORIES}
          activeId={activeCategory}
          onSelect={handleCategorySelect}
          badgeById={{ vyzvy: activeCallsCount }}
        />
      </div>
    </div>
  );
}
