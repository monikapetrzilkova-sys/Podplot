import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { UI_KEYS } from "../data/uiPreferences.js";
import { useUiPref } from "../hooks/useUiPref.js";
import { isReportActive, isReportResolved } from "../data/reportExpiry.js";

const REMIND_AFTER_DAYS = 3;

/** Připomenutí otevřených hlášení „do vyřešení“ starších než X dní */
export default function OpenReportsReminder() {
  const { userReports, extraReports, openReportOnMapFromHome, resolveSecurityReport, openProfile } =
    useApp();
  const [dismissedIds, setDismissedIds] = useUiPref(UI_KEYS.OPEN_REPORT_REMINDER_DISMISSED, []);

  const stale = useMemo(() => {
    const now = Date.now();
    const all = [...(userReports ?? []), ...(extraReports ?? [])];
    const seen = new Set();
    return all.filter((r) => {
      if (!r?.id || seen.has(r.id)) return false;
      seen.add(r.id);
      if (!r.mine || !r.untilResolved) return false;
      if (isReportResolved(r) || !isReportActive(r, now)) return false;
      if ((dismissedIds ?? []).includes(r.id)) return false;
      const created = Date.parse(r.createdAt || "");
      if (!Number.isFinite(created)) return false;
      const days = (now - created) / (1000 * 60 * 60 * 24);
      return days >= REMIND_AFTER_DAYS;
    });
  }, [userReports, extraReports, dismissedIds]);

  if (stale.length === 0) return null;

  const first = stale[0];
  const more = stale.length - 1;

  return (
    <section className="mx-4 mt-2 mb-1" aria-label="Připomenutí otevřených hlášení">
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80">
              Stále otevřené
            </p>
            <p className="text-sm font-semibold text-stone-900 mt-0.5 leading-snug">
              {first.type || "Hlášení"}
              {more > 0 ? ` (+${more} další)` : ""}
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
              Už {REMIND_AFTER_DAYS}+ dní čeká na vyřešení. Je to stále aktuální?
            </p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => openReportOnMapFromHome?.(first.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#3D7A68] hover:bg-[#346859]"
              >
                Zobrazit
              </button>
              <button
                type="button"
                onClick={() => {
                  resolveSecurityReport?.(first.id);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1B4D3E] bg-white border border-[#C5DDD4] hover:bg-[#F7FAF9]"
              >
                Vyřešeno
              </button>
              <button
                type="button"
                onClick={() => openProfile?.()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-white/60"
              >
                Moje hlášení
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setDismissedIds([
                ...new Set([...(dismissedIds ?? []), ...stale.map((r) => r.id)]),
              ])
            }
            className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-white/80 text-lg leading-none shrink-0"
            aria-label="Skrýt připomenutí"
          >
            ×
          </button>
        </div>
      </div>
    </section>
  );
}
