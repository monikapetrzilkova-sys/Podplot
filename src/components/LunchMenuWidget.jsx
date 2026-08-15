import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

/**
 * Kompaktní widget poledního menu na Domů —
 * viditelný jen když má soused zapnutá upozornění na polední menu.
 */
export default function LunchMenuWidget() {
  const {
    lunchMenusForLocation,
    lunchSubscriptions,
    toggleLunchSubscription,
    notificationPrefs,
    user,
  } = useApp();

  const [open, setOpen] = useState(false);

  const alertsOn = Boolean(
    notificationPrefs?.lunchMenuAlerts ?? user?.notificationPrefs?.lunchMenuAlerts
  );

  if (!alertsOn) return null;
  if (lunchMenusForLocation.length === 0) return null;

  const count = lunchMenusForLocation.length;
  const topMenu = lunchMenusForLocation[0];

  return (
    <section className="px-3 pt-2 shrink-0">
      <div className="rounded-2xl border border-[#C5DDD4] bg-white overflow-hidden shadow-[0_1px_6px_rgba(27,77,62,0.06)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#F7FAF9] transition-colors"
          aria-expanded={open}
        >
          <span className="text-lg leading-none shrink-0" aria-hidden>
            {topMenu.emoji || "🍽️"}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-stone-800 leading-snug">
              Polední menu v okolí
            </span>
            <span className="block text-[11px] text-stone-500 truncate">
              {open
                ? `${count} ${count === 1 ? "podnik" : count < 5 ? "podniky" : "podniků"}`
                : `${topMenu.businessName} · ${topMenu.priceRange}`}
            </span>
          </span>
          <span className="text-[10px] text-stone-400 font-bold shrink-0" aria-hidden>
            {open ? "▲" : "▼"}
          </span>
        </button>

        {open ? (
          <div className="border-t border-stone-100 px-3 py-2.5 space-y-2.5">
            {lunchMenusForLocation.map((m) => {
              const subscribed = lunchSubscriptions.includes(m.businessId);
              return (
                <article
                  key={m.id}
                  className={`rounded-xl border p-2.5 ${
                    m.isTop
                      ? "border-emerald-300 bg-emerald-50/40"
                      : "border-stone-100 bg-stone-50/80"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none" aria-hidden>
                      {m.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-bold text-stone-900">{m.businessName}</h3>
                        {m.isTop ? (
                          <span className="text-[9px] font-bold uppercase text-emerald-700">
                            Top
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{m.menuText}</p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        {m.priceRange} · cca {m.distanceKm} km
                      </p>
                      <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subscribed}
                          onChange={() => toggleLunchSubscription(m.businessId, m.businessName)}
                          className="rounded border-stone-300 accent-emerald-600"
                        />
                        <span className="text-[10px] text-stone-600">Odebírat</span>
                      </label>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
