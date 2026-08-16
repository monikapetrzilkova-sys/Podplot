import { useMemo, useState } from "react";
import { CS_LOCALE, parseDateInput } from "../data/czechDateTime.js";
import { displayCreatorLabel } from "../data/accountTypes.js";

const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Pondělí = 0 … Neděle = 6 */
function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function buildMonthCells(monthDate) {
  const first = startOfMonth(monthDate);
  const startOffset = mondayIndex(first);
  const cells = [];
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);

  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function eventDay(event) {
  return parseDateInput(event.startsAt);
}

/**
 * @param {object[]} events
 * @param {(event: object) => boolean} [isAttending] — akce, na které jdu / pořadatel
 * @param {(id: string) => boolean} [isJoined]
 * @param {"all"|"mine"} [attendanceMode] — u „all“ rozliší barvy; u „mine“ jen „jdu“
 */
export default function EventsCalendarMonth({
  events = [],
  onOpenEvent,
  onJoin,
  isJoined,
  isAttending,
  attendanceMode = "all",
  className = "",
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const cells = useMemo(() => buildMonthCells(cursor), [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const event of events) {
      const d = eventDay(event);
      if (!d) continue;
      const key = dayKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    }
    for (const list of map.values()) {
      list.sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)));
    }
    return map;
  }, [events]);

  const attends = (event) => {
    if (typeof isAttending === "function") return Boolean(isAttending(event));
    if (typeof isJoined === "function") return Boolean(isJoined(event.id));
    return false;
  };

  const monthLabel = cursor.toLocaleDateString(CS_LOCALE, { month: "long", year: "numeric" });
  const selectedKey = dayKey(selectedDay);
  const dayEvents = eventsByDay.get(selectedKey) ?? [];
  const today = new Date();
  const distinguishOthers = attendanceMode === "all";

  return (
    <div className={`pp-events-calendar flex flex-col min-h-0 ${className}`.trim()}>
      <div className="pp-events-calendar-nav shrink-0">
        <button
          type="button"
          className="pp-events-calendar-nav-btn"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          aria-label="Předchozí měsíc"
        >
          ‹
        </button>
        <p className="pp-events-calendar-month">{monthLabel}</p>
        <button
          type="button"
          className="pp-events-calendar-nav-btn"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          aria-label="Další měsíc"
        >
          ›
        </button>
      </div>

      {distinguishOthers && (
        <div className="pp-events-calendar-legend shrink-0" aria-hidden>
          <span className="pp-events-calendar-legend-item">
            <i className="pp-events-calendar-legend-swatch pp-events-calendar-legend-swatch--other" />
            Akce v okolí
          </span>
          <span className="pp-events-calendar-legend-item">
            <i className="pp-events-calendar-legend-swatch pp-events-calendar-legend-swatch--attending" />
            Jdu na akci
          </span>
        </div>
      )}

      <div className="pp-events-calendar-weekdays shrink-0" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="pp-events-calendar-grid shrink-0" role="grid" aria-label="Kalendář akcí">
        {cells.map((day) => {
          const key = dayKey(day);
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayEvts = eventsByDay.get(key) ?? [];
          const count = dayEvts.length;
          const hasAttending = dayEvts.some((e) => attends(e));
          const hasOtherOnly = count > 0 && !hasAttending;
          const selected = sameDay(day, selectedDay);
          const isToday = sameDay(day, today);

          let eventTone = "";
          if (hasAttending) eventTone = "pp-events-calendar-cell--attending";
          else if (hasOtherOnly && distinguishOthers) eventTone = "pp-events-calendar-cell--other";
          else if (count > 0) eventTone = "pp-events-calendar-cell--attending";

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              onClick={() => {
                setSelectedDay(day);
                if (!inMonth) setCursor(startOfMonth(day));
              }}
              className={[
                "pp-events-calendar-cell",
                inMonth ? "" : "pp-events-calendar-cell--muted",
                eventTone,
                selected ? "pp-events-calendar-cell--selected" : "",
                isToday ? "pp-events-calendar-cell--today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`${day.toLocaleDateString(CS_LOCALE)}${
                count
                  ? `, ${count} akcí${hasAttending ? ", včetně akcí, na které jdete" : ""}`
                  : ""
              }`}
              aria-selected={selected}
            >
              <span className="pp-events-calendar-daynum">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="pp-events-calendar-daylist flex-1 min-h-0 overflow-y-auto">
        <p className="pp-events-calendar-daylist-title">
          {selectedDay.toLocaleDateString(CS_LOCALE, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        {dayEvents.length === 0 ? (
          <p className="pp-text-meta text-stone-500 px-0.5">V tento den zatím žádná akce v okruhu.</p>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((event) => {
              const joined = isJoined?.(event.id);
              return (
                <li key={event.id} className="pp-card p-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEvent?.(event.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="pp-text-title line-clamp-1 leading-snug">{event.title}</p>
                    <p className="pp-text-meta line-clamp-1 mt-0.5 leading-snug">
                      {[
                        displayCreatorLabel(event.organizer, event.accountType, {
                          mine: event.organizer === "Vy",
                        }),
                        event.date,
                        event.address ?? event.location,
                        event.categoryLabel,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </button>
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
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
