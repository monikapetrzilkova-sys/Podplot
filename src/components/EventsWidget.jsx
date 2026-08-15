import { useApp } from "../context/AppContext.jsx";

export default function EventsWidget() {
  const { upcomingEvents, joinEvent, isJoinedEvent, setActiveTab, openEventDetail } = useApp();
  const events = upcomingEvents.slice(0, 3);

  if (events.length === 0) return null;

  return (
    <section className="mx-4 mb-3 bg-white border border-stone-200 rounded-2xl p-4 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-stone-900">📅 Nadcházející akce</h2>
        <button type="button" onClick={() => setActiveTab("calendar")} className="text-xs font-semibold text-emerald-600">
          Vše
        </button>
      </div>
      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="border border-stone-100 rounded-xl p-3">
            <button type="button" onClick={() => openEventDetail(ev.id)} className="text-left w-full">
              <p className="text-sm font-semibold text-stone-900">{ev.title}</p>
              <p className="text-xs text-stone-500 mt-0.5">{ev.date} · {ev.location}</p>
            </button>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-stone-500">{ev.participants} účastníků</span>
              <button
                type="button"
                onClick={() => joinEvent(ev.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${
                  isJoinedEvent(ev.id)
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {isJoinedEvent(ev.id) ? "✓ Jdu" : "⭐ Zúčastním se"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
