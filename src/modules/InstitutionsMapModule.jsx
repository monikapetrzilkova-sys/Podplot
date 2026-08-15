import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import ReportsMap from "../components/ReportsMap.jsx";
import InstitutionDetailCard from "../components/InstitutionDetailCard.jsx";
import {
  INSTITUTION_MAP_CATEGORIES,
  institutionMatchesCategory,
} from "../data/institutionsMapData.js";
import CategoryGrid from "../components/module/CategoryGrid.jsx";

export default function InstitutionsMapModule() {
  const {
    user,
    activeLocation,
    institutionsForMap,
    institutionMapCategory,
    setInstitutionMapCategory,
  } = useApp();

  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  const filtered = useMemo(
    () => institutionsForMap.filter((p) => institutionMatchesCategory(p, institutionMapCategory)),
    [institutionsForMap, institutionMapCategory]
  );

  const selectedPlace = filtered.find((p) => p.id === selectedPlaceId) ?? null;

  return (
    <div className="px-4 py-3">
      <header className="mb-3">
        <h2 className="text-lg font-bold text-stone-900">Instituce a podniky</h2>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          Veřejná místa ve vaší lokalitě — obchody, provozovny služeb a instituce.
        </p>
      </header>

      <CategoryGrid
        categories={INSTITUTION_MAP_CATEGORIES}
        activeId={institutionMapCategory}
        onSelect={setInstitutionMapCategory}
        className="mb-3"
      />

      <ReportsMap
        mapMode="institutions"
        institutions={filtered}
        onInstitutionPinClick={(place) => setSelectedPlaceId(place.id)}
        selectedInstitutionId={selectedPlaceId}
        large
        legendCollapsible
        userAddress={activeLocation?.address ?? user?.address ?? ""}
        userGeo={user?.geo ?? null}
        areaLabel={activeLocation?.shortLabel}
        homeLabel={activeLocation?.label ?? "Domov"}
        totalCount={filtered.length}
      />

      {selectedPlace && (
        <InstitutionDetailCard place={selectedPlace} onClose={() => setSelectedPlaceId(null)} />
      )}
    </div>
  );
}
