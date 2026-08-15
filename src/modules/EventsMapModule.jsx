import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import ReportsMap from "../components/ReportsMap.jsx";
import MapRadiusControl from "../components/map/MapRadiusControl.jsx";
import {
  MIN_EVENTS_MAP_RADIUS_KM,
  MAX_EVENTS_MAP_RADIUS_KM,
} from "../data/mapRadiusSettings.js";
import { filterEventsForMapView } from "../data/geoFilter.js";

export default function EventsMapModule({ showRadiusControl = true, large = true }) {
  const {
    user,
    activeLocation,
    upcomingEvents,
    eventsMapRadiusKm,
    setEventsMapRadiusKm,
    openEventDetail,
  } = useApp();

  const eventsForMap = useMemo(
    () => filterEventsForMapView(upcomingEvents, eventsMapRadiusKm),
    [upcomingEvents, eventsMapRadiusKm]
  );

  return (
    <div>
      {showRadiusControl && (
        <MapRadiusControl
          id="events-map-radius-module"
          label="Okruh akcí"
          hint="Trhy, slavnosti a komunitní události"
          value={eventsMapRadiusKm}
          min={MIN_EVENTS_MAP_RADIUS_KM}
          max={MAX_EVENTS_MAP_RADIUS_KM}
          step={1}
          onChange={setEventsMapRadiusKm}
        />
      )}
      <ReportsMap
        mapMode="events"
        radiusKm={eventsMapRadiusKm}
        events={eventsForMap}
        onEventPinClick={(ev) => openEventDetail(ev.id)}
        large={large}
        legendCollapsible
        userAddress={activeLocation?.address ?? user?.address ?? ""}
        userGeo={user?.geo ?? null}
        areaLabel={activeLocation?.shortLabel}
        homeLabel={activeLocation?.label ?? "Domov"}
        totalCount={eventsForMap.length}
      />
    </div>
  );
}
