import { useApp } from "../context/AppContext.jsx";
import EventsModule from "../modules/EventsModule.jsx";
import CompactAccordion from "./CompactAccordion.jsx";
import EventsKindFilter from "./EventsKindFilter.jsx";
import HostedActivityCard from "./HostedActivityCard.jsx";
import { UI_KEYS } from "../data/uiPreferences.js";
import { DoodleCalendarIcon, DoodleCameraIcon } from "./doodle/doodleIcons.jsx";

function formatAttendeePreview(attendees = [], formatPersonName) {
  if (attendees.length === 0) return "Bez přihlášených";
  const labels = attendees.slice(0, 2).map((a) => formatPersonName(a));
  const rest = attendees.length - labels.length;
  return rest > 0 ? `${labels.join(", ")} +${rest} další` : labels.join(", ");
}

function formatPastPhotoLabel(photoCount, unreadCount) {
  if (photoCount <= 0) return null;
  if (unreadCount > 0) {
    const unreadLabel =
      unreadCount === 1 ? "1 nová fotka" : unreadCount < 5 ? `${unreadCount} nové fotky` : `${unreadCount} nových fotek`;
    return `${unreadLabel} · ${photoCount} celkem`;
  }
  return `${photoCount} ${photoCount === 1 ? "fotka" : photoCount < 5 ? "fotky" : "fotek"}`;
}

function PastEventListItem({
  event,
  onOpen,
  hasUnreadGallery = false,
  unreadGalleryCount = 0,
  formatPersonName,
}) {
  const attendees = event.attendees ?? [];
  const photoCount = (event.galleryPhotos ?? []).length;
  const pastPhotoLabel = formatPastPhotoLabel(photoCount, unreadGalleryCount);

  return (
    <article className="pp-card p-2.5 flex items-center gap-2">
      <button type="button" onClick={() => onOpen(event.id)} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md text-stone-600 bg-stone-100">
            Skončeno
          </span>
          {hasUnreadGallery && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-[#3D7A68]" title="Nové fotky v galerii" />
          )}
          <h3 className="text-sm font-semibold text-stone-900 truncate leading-tight">{event.title}</h3>
        </div>
        <p className="text-[11px] text-stone-500 mt-0.5 truncate leading-snug">
          {event.date} · {event.address ?? event.location}
        </p>
        {pastPhotoLabel && (
          <p
            className={`text-[11px] mt-0.5 truncate leading-snug inline-flex items-center gap-1 ${
              unreadGalleryCount > 0 ? "font-semibold text-[#3D7A68]" : "text-emerald-700"
            }`}
          >
            <DoodleCameraIcon className="w-3.5 h-3.5 shrink-0" />
            {pastPhotoLabel}
          </p>
        )}
        <p className="text-[10px] text-stone-400 truncate">
          {attendees.length} účastníků · {formatAttendeePreview(attendees, formatPersonName)}
        </p>
      </button>
      {photoCount > 0 && (
        <div className="shrink-0 flex flex-col items-center gap-0.5 px-1 text-[#3D7A68]">
          <DoodleCameraIcon className="w-5 h-5" />
          <span className={`text-[10px] font-bold ${hasUnreadGallery ? "text-[#3D7A68]" : "text-stone-500"}`}>
            {photoCount}
          </span>
        </div>
      )}
    </article>
  );
}

export default function CalendarPage({
  embedded = false,
  hideTopFilters = false,
  hideToolbar = false,
  searchQuery = "",
}) {
  const {
    pastEvents,
    openEventDetail,
    eventHasUnreadGallery,
    getEventUnreadGalleryCount,
    unreadCalendarGalleryCount,
    openUnreadGalleryPhotos,
    formatPersonName,
    user,
    setCreateEventOpen,
    isJoinedEvent,
    calendarFilter,
    setCalendarFilter,
    locationHostedActivities,
    events,
    openHostedActivityDetail,
  } = useApp();

  const isMine = (e) => {
    if (isJoinedEvent(e.id) || e.organizer === "Vy" || e.organizer === user?.name) return true;
    return (e.attendees ?? []).some(
      (a) => a.id === "me" || a.id === user?.id || a.name === user?.name
    );
  };

  const pastMine = pastEvents.filter(isMine);
  const pastMineUnreadCount = pastMine.reduce(
    (sum, ev) => sum + getEventUnreadGalleryCount(ev.id),
    0
  );
  const pastMinePhotoCount = pastMine.reduce((sum, ev) => sum + (ev.galleryPhotos ?? []).length, 0);

  const openCreate = () => setCreateEventOpen(true);

  return (
    <div
      className={
        embedded
          ? "pp-events-page flex flex-col flex-1 min-h-0 overflow-hidden px-2 pb-2"
          : "pp-page px-4 py-4 pb-8"
      }
    >
      {!embedded && (
        <div className="flex items-start justify-between gap-2 mb-3 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="pp-text-title text-lg inline-flex items-center gap-2">
              <DoodleCalendarIcon className="w-5 h-5 text-[#3D7A68]" />
              Kalendář
            </h2>
            {unreadCalendarGalleryCount > 0 && (
              <button
                type="button"
                onClick={openUnreadGalleryPhotos}
                className="text-[11px] font-semibold text-[#3D7A68] mt-1 text-left hover:underline"
              >
                {unreadCalendarGalleryCount}{" "}
                {unreadCalendarGalleryCount === 1 ? "nová fotka" : unreadCalendarGalleryCount < 5 ? "nové fotky" : "nových fotek"}{" "}
                z vašich akcí
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="w-9 h-9 bg-emerald-600 text-white rounded-full text-lg font-bold shrink-0"
            aria-label="Nová událost"
          >
            +
          </button>
        </div>
      )}

      {embedded && unreadCalendarGalleryCount > 0 ? (
        <button
          type="button"
          onClick={openUnreadGalleryPhotos}
          className="pp-text-meta font-semibold text-[#3D7A68] text-left hover:underline shrink-0 mb-1 px-0.5"
        >
          {unreadCalendarGalleryCount}{" "}
          {unreadCalendarGalleryCount === 1
            ? "nová fotka"
            : unreadCalendarGalleryCount < 5
              ? "nové fotky"
              : "nových fotek"}
        </button>
      ) : null}

      <EventsKindFilter value={calendarFilter} onChange={setCalendarFilter} />

      {calendarFilter === "krouzky" && (locationHostedActivities ?? []).length > 0 ? (
        <div className="shrink-0 space-y-1.5 mt-1.5 mb-1">
          {(locationHostedActivities ?? []).map((activity) => (
            <HostedActivityCard
              key={activity.id}
              activity={activity}
              events={events}
              user={user}
              onOpen={openHostedActivityDetail}
              compact
            />
          ))}
        </div>
      ) : null}

      <EventsModule
        compact
        embedded={embedded}
        unreadBadge={unreadCalendarGalleryCount}
        onCreateEvent={embedded ? openCreate : undefined}
        hideTopFilters={hideTopFilters}
        hideToolbar={hideToolbar}
        searchQuery={searchQuery}
      />

      {pastMine.length > 0 && (
        <section className={`shrink-0 ${embedded ? "mt-1.5 overflow-y-auto max-h-[28vh]" : "mt-5"}`}>
          <CompactAccordion
            prefKey={UI_KEYS.EVENTS_PAST_ARCHIVE_OPEN}
            summary={
              <div className="flex items-start gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-800">Archiv skončených akcí</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {pastMine.length} {pastMine.length === 1 ? "akce" : "akcí"}
                    {pastMinePhotoCount > 0 && ` · ${pastMinePhotoCount} fotek`}
                  </p>
                </div>
                {pastMineUnreadCount > 0 && (
                  <span
                    className="shrink-0 min-w-[1.125rem] h-[1.125rem] px-1 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    style={{ background: "#3D7A68" }}
                  >
                    {pastMineUnreadCount > 9 ? "9+" : pastMineUnreadCount}
                  </span>
                )}
              </div>
            }
          >
            <div className="space-y-2">
              {pastMine.map((ev) => (
                <PastEventListItem
                  key={ev.id}
                  event={ev}
                  onOpen={openEventDetail}
                  hasUnreadGallery={eventHasUnreadGallery(ev.id)}
                  unreadGalleryCount={getEventUnreadGalleryCount(ev.id)}
                  formatPersonName={formatPersonName}
                />
              ))}
            </div>
          </CompactAccordion>
        </section>
      )}
    </div>
  );
}
