import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import SecurityReports from "./SecurityReports.jsx";
import MapModule from "../modules/MapModule.jsx";
import MapGrid from "./MapGrid.jsx";
import MapGuideToolbar from "./map/MapGuideToolbar.jsx";
import MapReportsToolbar from "./map/MapReportsToolbar.jsx";

export default function MapPage({ lockedSection = null, officeOverview = false }) {
  const {
    mapFocus,
    clearMapFocus,
    setLocalGuideCategory,
    clearModuleSelection,
    mapRootKey,
    pendingMapReportsCategory,
    clearPendingMapReportsCategory,
  } = useApp();

  const [section, setSection] = useState(lockedSection ?? "reports");
  const [provozovnaType, setProvozovnaType] = useState(null);
  const [reportsCategoryFilter, setReportsCategoryFilter] = useState("all");

  useEffect(() => {
    if (lockedSection) return;
    setSection("reports");
    setProvozovnaType(null);
    setReportsCategoryFilter("all");
    setLocalGuideCategory("vse");
    clearModuleSelection();
  }, [mapRootKey, lockedSection, setLocalGuideCategory, clearModuleSelection]);

  useEffect(() => {
    if (lockedSection) {
      setSection(lockedSection);
      return;
    }
    if (mapFocus === "reports") {
      setSection("reports");
      clearMapFocus();
    } else if (mapFocus === "places") {
      setSection("places");
      setLocalGuideCategory("vse");
      setProvozovnaType(null);
      clearMapFocus();
    }
  }, [mapFocus, clearMapFocus, setLocalGuideCategory, lockedSection]);

  useEffect(() => {
    if (pendingMapReportsCategory == null) return;
    setReportsCategoryFilter(pendingMapReportsCategory);
    clearPendingMapReportsCategory();
  }, [pendingMapReportsCategory, clearPendingMapReportsCategory]);

  const handleSelect = (id) => {
    if (lockedSection) return;
    if (id === "places" && id !== section) {
      setLocalGuideCategory("vse");
      setProvozovnaType(null);
      clearModuleSelection();
    }
    setSection((prev) => (prev === id ? prev : id));
  };

  const activeSection = lockedSection ?? section;

  return (
    <div className="pp-map-screen pp-page--doodle flex flex-col flex-1 min-h-0 overflow-hidden bg-abstract-organic has-deco">
      {!lockedSection && (
        <div className="px-3 pt-2 pb-1 shrink-0 pp-map-main-nav">
          <MapGrid activeId={activeSection} onSelect={handleSelect} prominent />
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-2 pb-2">
        {officeOverview && (
          <p className="px-1 pb-1.5 text-[11px] text-stone-500 shrink-0">
            Přehled dění v obci — ztráty, výpadky, závady a výzvy. Akce najdete v Agendě.
          </p>
        )}
        <div className="pp-map-toolbar shrink-0">
          {activeSection === "places" ? (
            <MapGuideToolbar
              provozovnaType={provozovnaType}
              onProvozovnaTypeChange={setProvozovnaType}
            />
          ) : (
            <MapReportsToolbar
              activeCategory={reportsCategoryFilter}
              onCategoryChange={setReportsCategoryFilter}
            />
          )}
        </div>

        <div className="pp-map-content flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeSection === "reports" ? (
            <SecurityReports
              key={`reports-${mapRootKey}`}
              reportsCategoryFilter={reportsCategoryFilter}
            />
          ) : (
            <MapModule key={`places-${mapRootKey}`} provozovnaType={provozovnaType} />
          )}
        </div>
      </div>
    </div>
  );
}
