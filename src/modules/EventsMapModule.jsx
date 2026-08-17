import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import ReportsMap from "../components/ReportsMap.jsx";
import MapRadiusControl from "../components/map/MapRadiusControl.jsx";
import { MapEventPreviewSheet } from "../components/map/MapEntityPreviewSheet.jsx";
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

  const [selectedEventId, setSelectedEventId] = useState(null);

  const eventsForMap = useMemo(
    () => filterEventsForMapView(upcomingEvents, eventsMapRadiusKm, undefined, activeLocation),
    [upcomingEvents, eventsMapRadiusKm, activeLocation]
  );

  const selectedEvent = eventsForMap.find((e) => e.id === selectedEventId) ?? null;

  const handlePinClick = (ev) => {
    if (selectedEventId === ev.id) {
      setSelectedEventId(null);
      return;
    }
    setSelectedEventId(ev.id);
  };

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
      <div className="relative">
        <ReportsMap
          mapMode="events"
          radiusKm={eventsMapRadiusKm}
          events={eventsForMap}
          onEventPinClick={handlePinClick}
          selectedEventId={selectedEventId}
          large={large}
          legendCollapsible
          userAddress={activeLocation?.address ?? user?.address ?? ""}
          userGeo={user?.geo ?? null}
          areaLabel={activeLocation?.shortLabel}
          homeLabel={activeLocation?.label ?? "Domov"}
          totalCount={eventsForMap.length}
        />
        {selectedEvent && (
          <MapEventPreviewSheet
            event={selectedEvent}
            onDetail={() => {
              openEventDetail(selectedEvent.id);
              setSelectedEventId(null);
            }}
            onClose={() => setSelectedEventId(null)}
          />
        )}
      </div>
    </div>
  );
}
