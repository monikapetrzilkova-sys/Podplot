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
  const { ready, enabled } = useGoogleMapsReady();
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

  if (enabled && ready) {
    return (
      <PodPlotGoogleMap
        {...props}
        mapCenter={mapCenter}
        referenceRadiusKm={referenceRadiusKm}
      />
    );
  }

  return <ReportsMap large legendCollapsible {...props} />;
}
