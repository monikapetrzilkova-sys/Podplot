import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { displayCreatorLabel } from "../data/accountTypes.js";
import {
  activityVenueLabel,
  isOwnHostedActivity,
  upcomingEventsForActivity,
} from "../data/hostedActivities.js";
import { isEventPast, minEventDateValue } from "../data/eventFormatting.js";
import { isValidCzechTime, combineDateAndTime } from "../data/czechDateTime.js";
import CzechTimeInput from "./CzechTimeInput.jsx";
import EventLocationMap from "./EventLocationMap.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { DoodleCheckIcon, DoodleJoinIcon } from "./doodle/doodleIcons.jsx";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";

const EMPTY_SLOT = () => ({ eventDate: "", eventTime: "16:00", timeTbd: false });

export default function HostedActivityDetailModal() {
  const {
    selectedHostedActivityId,
    closeHostedActivityDetail,
    hostedActivities,
    events,
    user,
    openEventDetail,
    joinEvent,
    isJoinedEvent,
    publishHostedActivityDates,
    deleteHostedActivity,
  } = useApp();

  const [adding, setAdding] = useState(false);
  const [slots, setSlots] = useState([EMPTY_SLOT()]);
  const [formError, setFormError] = useState("");

  const activity = (hostedActivities ?? []).find((a) => a.id === selectedHostedActivityId);
  if (!activity) return null;

  const own = isOwnHostedActivity(activity, user);
  const venue = activityVenueLabel(activity);
  const upcoming = upcomingEventsForActivity(events, activity.id);
  const past = (events ?? [])
    .filter((e) => e.hostedActivityId === activity.id && isEventPast(e))
    .sort((a, b) => (b.dateSort ?? 0) - (a.dateSort ?? 0));

  const submitDates = (e) => {
    e.preventDefault();
    const filled = slots.filter((s) => s.eventDate);
    if (filled.length === 0) {
      setFormError("Přidejte alespoň jedno datum.");
      return;
    }
    for (const slot of filled) {
      if (!slot.timeTbd && !isValidCzechTime(slot.eventTime)) {
        setFormError("Zadej čas ve formátu 24 hodin (např. 16:00).");
        return;
      }
      const startsAt = combineDateAndTime(slot.eventDate, slot.eventTime, slot.timeTbd);
      if (startsAt && !slot.timeTbd && new Date(startsAt).getTime() < Date.now()) {
        setFormError("Termíny musí být v budoucnosti.");
        return;
      }
    }
    const ok = publishHostedActivityDates(activity.id, filled);
    if (!ok) return;
    setAdding(false);
    setSlots([EMPTY_SLOT()]);
    setFormError("");
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="pp-app-sheet pp-app-sheet--full flex flex-col">
          <div className="relative shrink-0">
            {activity.photo ? (
              <div className="h-36 w-full bg-stone-100">
                <img src={activity.photo} alt="" className="w-full h-full object-cover pointer-events-none" />
              </div>
            ) : (
              <div className="h-20 w-full bg-gradient-to-br from-emerald-100 to-emerald-50 pointer-events-none" />
            )}
            <button
              type="button"
              onClick={closeHostedActivityDetail}
              className="absolute top-3 right-3 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 text-stone-600 shadow-md text-xl leading-none"
              aria-label="Zavřít kroužek"
            >
              ×
            </button>
            <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8">
              <span className="inline-block text-[10px] font-bold uppercase text-white/90 bg-white/20 px-2 py-0.5 rounded-md mb-1">
                Kroužek / lekce
              </span>
              <h2 className="font-bold text-white text-lg leading-snug flex items-center gap-2 flex-wrap">
                {activity.title}
                {isSampleContent(activity) ? (
                  <SampleBadge className="bg-white/90 text-stone-600 border-white/40" />
                ) : null}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-sm text-stone-700 font-medium">{venue}</p>
              <p className="text-xs text-stone-400 mt-1">
                Vede{" "}
                {displayCreatorLabel(activity.hostName, activity.accountType, { mine: own })}
                {activity.ageRange ? ` · ${activity.ageRange}` : ""}
              </p>
            </div>

            {activity.description ? (
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
            ) : null}

            {activity.mapPos && (
              <div>
                <p className="text-xs font-semibold text-stone-600 mb-2">Místo na mapě</p>
                <EventLocationMap mapPos={activity.mapPos} address={venue} compact />
              </div>
            )}

            <section>
              <h3 className="text-sm font-bold text-stone-800 mb-2">Rozvrh</h3>
              {upcoming.length === 0 ? (
                <p className="text-xs text-stone-500">Zatím žádné vypsané termíny.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2"
                    >
                      <button type="button" onClick={() => {
                        closeHostedActivityDetail();
                        openEventDetail(ev.id);
                      }} className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-stone-800">{ev.date}</p>
                        <p className="text-[11px] text-stone-500">{ev.participants ?? 0} přihlášených</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => joinEvent(ev.id)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 ${
                          isJoinedEvent(ev.id) ? "bg-emerald-100 text-emerald-800" : "bg-emerald-600 text-white"
                        }`}
                      >
                        {isJoinedEvent(ev.id) ? (
                          <>
                            <DoodleCheckIcon className="w-3 h-3" />
                            Jdu
                          </>
                        ) : (
                          <>
                            <DoodleJoinIcon className="w-3 h-3" />
                            Jdu
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {own && (
              <div>
                {!adding ? (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="w-full py-2.5 rounded-2xl text-sm font-semibold bg-emerald-600 text-white"
                  >
                    Vypsat termíny
                  </button>
                ) : (
                  <form onSubmit={submitDates} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
                    <p className="text-xs font-semibold text-emerald-900">Nové termíny</p>
                    {formError && <p className="text-xs text-red-600">{formError}</p>}
                    {slots.map((slot, index) => (
                      <div key={index} className="pp-datetime-fields">
                        <div className="pp-datetime-fields__item">
                          <input
                            type="date"
                            lang="cs-CZ"
                            min={minEventDateValue()}
                            value={slot.eventDate}
                            onChange={(e) =>
                              setSlots((prev) =>
                                prev.map((s, i) => (i === index ? { ...s, eventDate: e.target.value } : s))
                              )
                            }
                            className="pp-datetime-fields__control"
                            required
                          />
                        </div>
                        <div className="pp-datetime-fields__item">
                          <CzechTimeInput
                            value={slot.eventTime}
                            onChange={(eventTime) =>
                              setSlots((prev) =>
                                prev.map((s, i) => (i === index ? { ...s, eventTime, timeTbd: false } : s))
                              )
                            }
                            disabled={slot.timeTbd}
                            className="pp-datetime-fields__control"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSlots((prev) => [...prev, EMPTY_SLOT()])}
                      className="text-[11px] font-semibold text-[#3D7A68]"
                    >
                      + Další datum
                    </button>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(false);
                          setFormError("");
                        }}
                        className="flex-1 py-2 text-xs font-semibold border rounded-xl bg-white"
                      >
                        Zrušit
                      </button>
                      <button type="submit" className="flex-1 py-2 text-xs font-semibold text-white rounded-xl bg-emerald-600">
                        Zveřejnit termíny
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {past.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-stone-800 mb-2">Proběhlo</h3>
                <div className="space-y-1.5">
                  {past.slice(0, 6).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        closeHostedActivityDetail();
                        openEventDetail(ev.id);
                      }}
                      className="w-full text-left text-xs text-stone-500 py-1.5 border-b border-stone-100"
                    >
                      {ev.date}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {own && (
              <button
                type="button"
                onClick={() => {
                  const result = deleteHostedActivity(activity.id);
                  if (result?.ok) closeHostedActivityDetail();
                }}
                className="w-full py-2 text-xs font-semibold text-red-700"
              >
                Zrušit kroužek
              </button>
            )}
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
