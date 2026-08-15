/** Kompaktní mřížka kategorií hlášení — stejný styl jako Průvodce */

import { ReportPinIcon } from "./reportPinIcons.jsx";
import {
  getReportCategory,
  REPORT_TIP_ACCENT,
  REPORT_CALLS_ACCENT,
} from "../../data/reportCategories.js";

function ReportFilterIcon({ id, className = "w-[18px] h-[18px]" }) {
  if (id === "all") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (id === "vyzvy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M5.5 10.5v3c0 .8.7 1.5 1.5 1.5h1.2l6.8 3.2V6.8L8.2 10H7c-.8 0-1.5.7-1.5 1.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M16.5 9.2c1 .8 1.5 1.8 1.5 2.8s-.5 2-1.5 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 16.5v1.2c0 1.1-.7 2-1.8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  const cat = getReportCategory(id);
  return (
    <ReportPinIcon
      report={{ type: cat.typeLabel, body: "", reportCategoryId: cat.id }}
      className={className}
    />
  );
}

function isTipCat(cat) {
  return cat.isTip || cat.id === "tip" || cat.filterId === "tip";
}

function isCallsCat(cat) {
  return cat.isCalls || cat.id === "vyzvy" || cat.filterId === "vyzvy";
}

function tileTone(cat, active) {
  if (isTipCat(cat)) {
    return {
      icon: active ? "text-[#5A7A1E]" : "text-[#8FAE3E]",
      label: active ? "text-[#5A7A1E]" : "text-[#8FAE3E]",
      activeRing: REPORT_TIP_ACCENT,
    };
  }
  if (isCallsCat(cat)) {
    return {
      icon: active ? "text-[#0F766E]" : "text-[#14B8A6]",
      label: active ? "text-[#0F766E]" : "text-[#0F766E]",
      activeRing: REPORT_CALLS_ACCENT,
    };
  }
  return {
    icon: active ? "text-[#1B4D3E]" : "text-[#4D8B7A]",
    label: active ? "text-[#1B4D3E]" : "text-[#4D8B7A]",
    activeRing: null,
  };
}

export default function CompactReportsGrid({
  categories,
  activeId,
  onSelect,
  className = "",
  badgeById = {},
}) {
  return (
    <div
      className={`pp-guide-grid grid grid-cols-4 grid-rows-2 gap-x-0 gap-y-1 ${className}`}
      role="group"
      aria-label="Kategorie hlášení"
    >
      {categories.map((cat) => {
        const active = activeId === cat.id;
        const badge = badgeById[cat.id];
        const tone = tileTone(cat, active);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={active}
            className={`pp-guide-grid-tile pp-pressable relative flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-colors min-h-[48px] ${
              active ? "pp-guide-tile--active" : "text-[#1B4D3E] hover:bg-white/80"
            }`}
            style={
              active && tone.activeRing
                ? { boxShadow: `inset 0 0 0 1.5px ${tone.activeRing}` }
                : undefined
            }
          >
            {badge > 0 && (
              <span
                className="absolute top-0.5 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center leading-none"
                style={{ background: isCallsCat(cat) ? REPORT_CALLS_ACCENT : "#3D7A68" }}
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
            <span className={tone.icon}>
              <ReportFilterIcon id={cat.filterId ?? cat.id} />
            </span>
            <span
              className={`pp-guide-grid-label w-full text-[10px] font-semibold leading-tight text-center ${tone.label}`}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
