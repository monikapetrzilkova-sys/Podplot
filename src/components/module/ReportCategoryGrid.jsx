/** Mřížka kategorií hlášení s monochromatickými ikonami — nedávné nahoře */

import { useMemo } from "react";
import { REPORT_CATEGORIES, REPORT_TIP_ACCENT, getReportCategory } from "../../data/reportCategories.js";
import { ReportPinIcon } from "./reportPinIcons.jsx";
import { UI_KEYS } from "../../data/uiPreferences.js";
import { useUiPref } from "../../hooks/useUiPref.js";

export default function ReportCategoryGrid({ activeId, onSelect, className = "" }) {
  const [recentIds] = useUiPref(UI_KEYS.RECENT_REPORT_CATEGORIES, []);

  const ordered = useMemo(() => {
    const recent = (recentIds ?? [])
      .map((id) => getReportCategory(id) || REPORT_CATEGORIES.find((c) => c.id === id))
      .filter(Boolean);
    const recentSet = new Set(recent.map((c) => c.id));
    const rest = REPORT_CATEGORIES.filter((c) => !recentSet.has(c.id));
    // unikátní podle id
    const seen = new Set();
    return [...recent, ...rest].filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [recentIds]);

  return (
    <div className={className}>
      <p className="text-xs font-semibold text-stone-600 mb-1.5">Kategorie hlášení *</p>
      {recentIds?.length > 0 ? (
        <p className="text-[10px] text-stone-400 mb-1.5">Nedávno použité nahoře</p>
      ) : null}
      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Kategorie hlášení">
        {ordered.map((cat) => {
          const active = activeId === cat.id;
          const isTip = cat.id === "tip";
          const isRecent = (recentIds ?? []).includes(cat.id);
          const previewReport = { type: cat.typeLabel, body: "", reportCategoryId: cat.id };
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              aria-pressed={active}
              title={cat.label}
              className={`flex flex-col items-center justify-center gap-1 min-h-[4rem] px-1 py-1.5 rounded-xl border text-center transition-all relative ${
                active
                  ? isTip
                    ? "text-white border-[#6B8E23] shadow-sm"
                    : "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : isTip
                    ? "bg-[#F7FAEF] text-[#5A7A1E] border-[#D4E3A8] hover:border-[#8FAE3E]"
                    : "bg-white text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
              style={active && isTip ? { background: REPORT_TIP_ACCENT } : undefined}
            >
              {isRecent && !active ? (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#3D7A68]" aria-hidden />
              ) : null}
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                  active
                    ? "bg-white/15 text-white"
                    : isTip
                      ? "bg-[#E8F0C8] text-[#6B8E23]"
                      : "bg-emerald-50 text-emerald-800"
                }`}
              >
                <ReportPinIcon report={previewReport} className="w-4 h-4" />
              </span>
              <span className="text-[9px] font-semibold leading-tight line-clamp-2 px-0.5">
                {cat.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
