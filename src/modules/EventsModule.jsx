import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import MapComponent from "../components/module/MapComponent.jsx";
import ViewModeToggle from "../components/module/ViewModeToggle.jsx";
import ListView, { ListItemShell } from "../components/module/ListView.jsx";
import MapRadiusSettingsChip from "../components/map/MapRadiusSettingsChip.jsx";
import { MapEventPreviewSheet } from "../components/map/MapEntityPreviewSheet.jsx";
import EventsCalendarMonth from "../components/EventsCalendarMonth.jsx";
import { MODULE_IDS, EVENTS_VIEW_MODES } from "../data/moduleConfig.js";
import {
  MIN_EVENTS_MAP_RADIUS_KM,
  MAX_EVENTS_MAP_RADIUS_KM,
} from "../data/mapRadiusSettings.js";
import { filterEventsForMapView } from "../data/geoFilter.js";
import ReportMenu, { EVENT_REPORT_REASONS } from "../components/ReportMenu.jsx";
import CompactSearchToggle from "../components/CompactSearchToggle.jsx";
import { displayCreatorLabel } from "../data/accountTypes.js";

function matchesEventSearch(event, query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return true;
  return [event.title, event.address, event.location, event.organizer, event.categoryLabel, event.date]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q));
}

function EventListRow({ event, selected, onShowOnMap, onOpen, onJoin, joined, onReport, canReport }) {
  const creator = displayCreatorLabel(event.organizer, event.accountType, {
    mine: event.organizer === "Vy",
  });
  const meta = [creator, event.date, event.address ?? event.location, event.categoryLabel, `${event.participants ?? 0} účastníků`]
    .filter(Boolean)
    .join(" · ");

  return (
    <ListItemShell
      id={event.id}
      selected={selected}
      onShowOnMap={event.mapPos ? onShowOnMap : undefined}
    >
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onOpen(event.id)} className="flex-1 min-w-0 text-left">
          <p className="pp-text-title line-clamp-1 leading-snug">{event.title}</p>
          <p className="pp-text-meta line-clamp-1 mt-0.5 leading-snug">{meta}</p>
        </button>
        {canReport && onReport && (
          <ReportMenu
            compact
            label="Nahlásit akci"
            reasons={EVENT_REPORT_REASONS}
            onReport={(reason) => onReport(event.id, reason)}
          />
        )}
        {onJoin && (
          <button
            type="button"
            onClick={() => onJoin(event.id)}
            className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold ${
              joined ? "bg-emerald-100 text-emerald-800" : "bg-emerald-600 text-white"
            }`}
          >
            {joined ? "✓ Jdu" : "Jdu"}
          </button>
        )}
      </div>
    </ListItemShell>
  );
}

export default function EventsModule({
  listEvents,
  compact = false,
  embedded = false,
  onCreateEvent,
  hideTopFilters = false,
  searchQuery = "",
}) {
  const {
    user,
    activeLocation,
    upcomingEvents,
    eventsMapRadiusKm,
    setEventsMapRadiusKm,
    moduleViewModes,
    setModuleViewMode,
    moduleSelection,
    selectModuleItem,
    openModuleItemDetail,
    showModuleItemOnMap,
    clearModuleSelection,
    openEventDetail,
    isJoinedEvent,
    joinEvent,
    sendEventOutreach,
    reportEvent,
    testRoleId,
  } = useApp();

  const [outreachText, setOutreachText] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const canOutreach = testRoleId === "soused" || testRoleId === "urad";

  const effectiveSearch = searchQuery || localSearch;
  const searchActive = searchExpanded || Boolean(effectiveSearch.trim());
  const showLocalSearch = hideTopFilters && searchQuery === "";

  const moduleId = MODULE_IDS.EVENTS;
  const rawViewMode = moduleViewModes[moduleId];
  const viewMode = EVENTS_VIEW_MODES.some((m) => m.id === rawViewMode) ? rawViewMode : "list";
  const mapFillsViewport = compact && viewMode === "map";
  const listFillsViewport = compact && (viewMode === "list" || viewMode === "calendar");
  const fillsViewport = mapFillsViewport || listFillsViewport;

  const isMine = (event) => {
    if (isJoinedEvent(event.id) || event.organizer === "Vy" || event.organizer === user?.name) return true;
    return (event.attendees ?? []).some(
      (a) => a.id === "me" || a.id === user?.id || a.name === user?.name
    );
  };

  const baseUpcoming = listEvents ?? upcomingEvents;

  const sourceEvents = useMemo(() => {
    return baseUpcoming.filter((e) => matchesEventSearch(e, effectiveSearch));
  }, [baseUpcoming, effectiveSearch]);

  const eventsForMap = useMemo(
    () => filterEventsForMapView(sourceEvents, eventsMapRadiusKm),
    [sourceEvents, eventsMapRadiusKm]
  );

  const selectedId = moduleSelection?.module === moduleId ? moduleSelection.id : null;
  const selectedEvent = eventsForMap.find((e) => e.id === selectedId) ?? null;

  const radiusChip = (
    <MapRadiusSettingsChip
      id="events-map-radius"
      label="Aktuální okruh"
      value={eventsMapRadiusKm}
      min={MIN_EVENTS_MAP_RADIUS_KM}
      max={MAX_EVENTS_MAP_RADIUS_KM}
      step={1}
      onChange={setEventsMapRadiusKm}
    />
  );

  const viewToggle = (
    <ViewModeToggle
      value={viewMode}
      onChange={(mode) => setModuleViewMode(moduleId, mode)}
      modes={EVENTS_VIEW_MODES}
      className="pp-events-view-toggle"
    />
  );

  const outreachBlock =
    canOutreach && selectedEvent ? (
      <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2 shrink-0">
        <p className="text-xs font-bold text-blue-900">Oslovení · {selectedEvent.title}</p>
        <textarea
          value={outreachText}
          onChange={(e) => setOutreachText(e.target.value)}
          rows={2}
          placeholder="Hledáme partnery, catering…"
          className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm resize-none bg-white"
        />
        <button
          type="button"
          onClick={() => {
            sendEventOutreach({ eventTitle: selectedEvent.title, message: outreachText });
            setOutreachText("");
          }}
          className="w-full py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-xl"
        >
          Poslat nabídku spolupráce
        </button>
      </div>
    ) : null;

  const mapArea = (
    <div className="pp-map-module-viewport relative flex flex-col flex-1 min-h-0 overflow-hidden">
      {viewMode === "map" ? (
        <>
          <MapComponent
            mapMode="events"
            radiusKm={eventsMapRadiusKm}
            events={eventsForMap}
            onEventPinClick={(ev) => {
              if (selectedId === ev.id) clearModuleSelection();
              else selectModuleItem(moduleId, ev.id);
            }}
            selectedEventId={selectedId}
            userAddress={activeLocation?.address ?? user?.address ?? ""}
            userGeo={user?.geo ?? null}
            areaLabel={activeLocation?.shortLabel}
            homeLabel={activeLocation?.label ?? "Domov"}
            totalCount={eventsForMap.length}
            fluid
            hideStats
            hideLegend
            className="flex flex-col flex-1 min-h-0 mb-0"
          />
          {selectedEvent && (
            <MapEventPreviewSheet
              event={selectedEvent}
              onDetail={() => openModuleItemDetail(moduleId, selectedEvent.id)}
              onClose={clearModuleSelection}
            />
          )}
        </>
      ) : viewMode === "calendar" ? (
        <EventsCalendarMonth
          className="flex-1 min-h-0"
          events={eventsForMap}
          onOpenEvent={openEventDetail}
          onJoin={compact ? joinEvent : undefined}
          isJoined={isJoinedEvent}
          isAttending={isMine}
          attendanceMode="all"
        />
      ) : (
        <ListView
          className={`flex-1 min-h-0 overflow-y-auto ${fillsViewport ? "" : "max-h-72"}`}
          items={eventsForMap}
          emptyMessage="V tomto okruhu zatím žádné akce."
          renderItem={(event) => (
            <EventListRow
              key={event.id}
              event={event}
              selected={selectedId === event.id}
              onOpen={openEventDetail}
              onShowOnMap={() => showModuleItemOnMap(moduleId, event.id)}
              onJoin={compact ? joinEvent : undefined}
              joined={isJoinedEvent(event.id)}
              canReport={event.organizer !== "Vy" && event.organizer !== user?.name}
              onReport={reportEvent}
            />
          )}
        />
      )}
    </div>
  );

  const toolbar = (
    <div className="pp-events-toolbar tab-header-container shrink-0">
      {showLocalSearch && searchActive ? (
        <div className="w-full min-w-0">
          <CompactSearchToggle
            value={localSearch}
            onChange={setLocalSearch}
            expanded
            onExpandedChange={setSearchExpanded}
            placeholder="Hledat v akcích…"
            ariaLabel="Hledat v akcích"
          />
        </div>
      ) : (
        <>
          {radiusChip}
          {viewToggle}
          {hideTopFilters && onCreateEvent && (
            <button
              type="button"
              onClick={onCreateEvent}
              className="w-8 h-8 shrink-0 bg-[#3D7A68] text-white rounded-lg text-lg font-bold leading-none"
              aria-label="Nová událost"
            >
              +
            </button>
          )}
          {showLocalSearch ? (
            <CompactSearchToggle
              value={localSearch}
              onChange={setLocalSearch}
              expanded={false}
              onExpandedChange={setSearchExpanded}
              placeholder="Hledat v akcích…"
              ariaLabel="Hledat v akcích"
            />
          ) : null}
        </>
      )}
    </div>
  );

  const body = (
    <>
      {toolbar}
      {mapArea}
      {outreachBlock}
    </>
  );

  if (compact) {
    return (
      <div className="pp-map-module-root flex flex-col min-h-0 flex-1 overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{body}</div>
      </div>
    );
  }

  return <div className="mb-4">{body}</div>;
}
