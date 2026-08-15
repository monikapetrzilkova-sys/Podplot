/** Jednotné mapové API — Google Maps s fallbackem na simulovanou mapu */

import ReportsMap from "../ReportsMap.jsx";
import PodPlotGoogleMap from "../map/PodPlotGoogleMap.jsx";
import { useGoogleMapsReady } from "../../hooks/useGoogleMapsReady.js";
import { useApp } from "../../context/AppContext.jsx";
import {
  DEFAULT_EVENTS_MAP_RADIUS_KM,
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  DEFAULT_THINGS_MAP_RADIUS_KM,
} from "../../data/mapRadiusSettings.js";

export default function MapComponent(props) {
  const { ready, enabled, loading, error } = useGoogleMapsReady();
  const { activeLocation } = useApp();

  const mapCenter = {
    lat: activeLocation?.lat ?? 49.966,
    lng: activeLocation?.lng ?? 14.512,
  };

  const referenceRadiusKm =
    props.mapMode === "events"
      ? DEFAULT_EVENTS_MAP_RADIUS_KM
      : props.mapMode === "things"
        ? DEFAULT_THINGS_MAP_RADIUS_KM
        : props.mapMode === "institutions"
          ? activeLocation?.radiusKm ?? 7
          : DEFAULT_REPORTS_MAP_RADIUS_KM;

  const wrapClass = [
    props.fluid ? "pp-map-google-wrap flex flex-col flex-1 min-h-0 w-full" : "pp-map-google-wrap w-full",
    props.className ?? "",
  ]
    .join(" ")
    .trim();

  if (loading) {
    return (
      <div className={wrapClass}>
        <div
          className={`pp-map-container pp-map-container--google pp-map-container--loading relative w-full ${
            props.fluid ? "flex-1 min-h-[220px] h-full" : "h-72"
          }`}
        >
          <p className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 px-4 text-center">
            Načítám mapu…
          </p>
        </div>
      </div>
    );
  }

  if (enabled && ready) {
    return (
      <PodPlotGoogleMap
        {...props}
        mapCenter={mapCenter}
        referenceRadiusKm={referenceRadiusKm}
      />
    );
  }

  return (
    <>
      {error ? (
        <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-1 shrink-0">
          {error}
        </p>
      ) : null}
      <ReportsMap large legendCollapsible {...props} />
    </>
  );
}
