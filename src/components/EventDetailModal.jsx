import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import EventLocationMap from "./EventLocationMap.jsx";
import EventGallery from "./EventGallery.jsx";
import { Avatar } from "./RoleBadge.jsx";
import { MessageButton } from "./MessagesPage.jsx";
import PersonLabel from "./PersonLabel.jsx";
import { isEventPast, EVENT_REPORT_DELETE_THRESHOLD } from "../data/eventFormatting.js";
import { SKIP_REGISTRATION } from "../data/devConfig.js";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ReportMenu, { EVENT_REPORT_REASONS } from "./ReportMenu.jsx";
import { isSameAppUser } from "../data/listingSales.js";
import { displayCreatorLabel } from "../data/accountTypes.js";
import {
  DoodleCheckIcon,
  DoodleJoinIcon,
  DoodleChatIcon,
} from "./doodle/doodleIcons.jsx";

export default function EventDetailModal() {
  const {
    selectedEventId,
    closeEventDetail,
    events,
    isJoinedEvent,
    joinEvent,
    postEventChat,
    user,
    reportEvent,
    deleteOwnPost,
    eventReporterIds,
    openHostedActivityDetail,
  } = useApp();
  const [text, setText] = useState("");

  const ev = events.find((e) => e.id === selectedEventId);
  if (!ev) return null;

  const past = isEventPast(ev);
  const attendees = ev.attendees ?? [];
  const canChat = !past && (isJoinedEvent(ev.id) || ev.organizer === user?.name || ev.organizer === "Vy");
  const locationLabel = ev.address ?? ev.location;
  const isSelf = (a) => a.id === "me" || a.id === user?.id || a.name === user?.name;
  const isOwnEvent = ev.organizer === "Vy" || ev.organizer === user?.name;
  const reportCount = (eventReporterIds[ev.id] ?? []).length;
  const alreadyReported = (eventReporterIds[ev.id] ?? []).some((id) =>
    isSameAppUser(id, user?.id ?? "me")
  );
  // V demo lze nahlásit vícekrát (simulace 3 sousedů); v produkci jen jednou
  const canReportAgain = !alreadyReported || SKIP_REGISTRATION;

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    postEventChat(ev.id, text.trim());
    setText("");
  };

  return (
    <AppPanelPortal>
    <div className="pp-app-sheet-overlay">
    <div className="pp-app-sheet pp-app-sheet--full flex flex-col">
      <div className="relative shrink-0">
        {ev.photo ? (
          <div className="h-44 w-full bg-stone-100">
            <img src={ev.photo} alt="" className="w-full h-full object-cover pointer-events-none" />
          </div>
        ) : (
          <div className="h-24 w-full bg-gradient-to-br from-emerald-100 to-emerald-50 pointer-events-none" />
        )}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1">
          {isOwnEvent ? (
            <div className="rounded-full bg-white/95 shadow-md flex items-center">
              <ReportMenu
                compact
                label="Moje akce"
                deleteLabel="Smazat akci"
                onDelete={() => {
                  const result = deleteOwnPost(ev.id, { kind: "event" });
                  if (result?.ok) closeEventDetail();
                }}
              />
            </div>
          ) : (
            <div className="rounded-full bg-white/95 shadow-md flex items-center">
              {reportCount > 0 && (
                <span className="pl-2.5 pr-1 text-[10px] font-semibold text-stone-500 whitespace-nowrap">
                  {reportCount}/{EVENT_REPORT_DELETE_THRESHOLD}
                </span>
              )}
              {canReportAgain ? (
                <ReportMenu
                  compact
                  label="Nahlásit akci"
                  reasons={EVENT_REPORT_REASONS}
                  onReport={(reason) => reportEvent(ev.id, reason)}
                />
              ) : (
                <span className="block px-2.5 py-1.5 text-[10px] font-semibold text-stone-500">
                  Nahlášeno
                </span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={closeEventDetail}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/95 text-stone-600 shadow-md hover:bg-white hover:text-stone-900 text-xl leading-none cursor-pointer"
            aria-label="Zavřít detail akce"
          >
            ×
          </button>
        </div>
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8">
          <span className="inline-block text-[10px] font-bold uppercase text-white/90 bg-white/20 px-2 py-0.5 rounded-md mb-1">
            {past ? "Skončeno" : ev.categoryLabel}
          </span>
          <h2 className="font-bold text-white text-lg leading-snug">{ev.title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-stone-700 font-medium">{ev.date}</p>
        {ev.timeTbd && !past && (
          <p className="text-xs text-amber-700 mt-0.5">Organizátor doplní přesný čas později.</p>
        )}
        {past && <p className="text-xs text-stone-500 mt-0.5">Tato akce už proběhla.</p>}
        <p className="text-sm text-stone-600 mt-0.5">{locationLabel}</p>
        <p className="text-xs text-stone-400 mt-1">
          Organizátor:{" "}
          {displayCreatorLabel(ev.organizer, ev.accountType, {
            mine: isOwnEvent,
          })}
        </p>
        {ev.hostedActivityId ? (
          <button
            type="button"
            onClick={() => {
              const activityId = ev.hostedActivityId;
              closeEventDetail();
              openHostedActivityDetail?.(activityId);
            }}
            className="mt-2 text-xs font-semibold text-[#3D7A68]"
          >
            Součást kroužku ›
          </button>
        ) : null}

        {ev.description && (
          <p className="text-sm text-stone-700 leading-relaxed mt-4 whitespace-pre-wrap">{ev.description}</p>
        )}

        {ev.mapPos && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-stone-600 mb-2">Místo na mapě</p>
            <EventLocationMap mapPos={ev.mapPos} address={locationLabel} compact />
          </div>
        )}

        {!past && (
          <button
            type="button"
            onClick={() => joinEvent(ev.id)}
            className={`mt-4 w-full py-2.5 rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-2 ${
              isJoinedEvent(ev.id) ? "bg-emerald-100 text-emerald-800" : "bg-emerald-600 text-white"
            }`}
          >
            {isJoinedEvent(ev.id) ? (
              <>
                <DoodleCheckIcon className="w-4 h-4" />
                Jste přihlášeni
              </>
            ) : (
              <>
                <DoodleJoinIcon className="w-4 h-4" />
                Zúčastním se
              </>
            )}
          </button>
        )}

        <EventGallery event={ev} past={past} />

        {attendees.length > 0 && (
          <section className="mt-5">
            <h3 className="text-sm font-bold text-stone-800 mb-1">
              {past ? "Kdo se zúčastnil" : "Přihlášení sousedi"}
            </h3>
            <p className="text-xs text-stone-500 mb-3">
              {attendees.length} {attendees.length === 1 ? "osoba" : attendees.length < 5 ? "osoby" : "osob"}
            </p>
            <div className="space-y-2">
              {attendees.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 bg-stone-50 rounded-xl px-3 py-2">
                  <Avatar initials={a.initials} roleId="soused" size="sm" />
                  <span className="flex-1 text-sm text-stone-800 min-w-0 truncate">
                    <PersonLabel personId={a.id} name={a.name} />
                  </span>
                  {!isSelf(a) && (
                    <MessageButton participantId={a.id} participantName={a.name} className="shrink-0 text-[11px]" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {canChat && (
          <section className="mt-6">
            <h3 className="text-sm font-bold text-stone-800 mb-3 inline-flex items-center gap-1.5">
              <DoodleChatIcon className="w-4 h-4 text-[#3D7A68]" />
              Chat akce
            </h3>
            <div className="space-y-2 mb-3">
              {(ev.chat ?? []).map((m, i) => (
                <div key={i} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-stone-700">{m.sender}</p>
                  <p className="text-sm text-stone-600">{m.text}</p>
                  <p className="text-[10px] text-stone-400 mt-1">{m.time}</p>
                </div>
              ))}
            </div>
            <form onSubmit={submit} className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Rychlý vzkaz…"
                className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
                Odeslat
              </button>
            </form>
          </section>
        )}

        {past && (ev.chat ?? []).length > 0 && (
          <section className="mt-6">
            <h3 className="text-sm font-bold text-stone-800 mb-3 inline-flex items-center gap-1.5">
              <DoodleChatIcon className="w-4 h-4 text-[#3D7A68]" />
              Chat akce
            </h3>
            <div className="space-y-2">
              {(ev.chat ?? []).map((m, i) => (
                <div key={i} className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-stone-700">{m.sender}</p>
                  <p className="text-sm text-stone-600">{m.text}</p>
                  <p className="text-[10px] text-stone-400 mt-1">{m.time}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!past && !canChat && (
          <p className="mt-6 text-xs text-stone-400 text-center">Přihlaste se k účasti pro přístup do chatu.</p>
        )}
      </div>
    </div>
    </div>
    </AppPanelPortal>
  );
}
