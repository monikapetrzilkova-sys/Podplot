import { getReportLifecycleBadge } from "../data/reportExpiry.js";

const TONE_CLASS = {
  ok: "bg-emerald-50 text-emerald-800 border-emerald-200",
  active: "bg-[#E8F3EF] text-[#1B4D3E] border-[#C5DDD4]",
  muted: "bg-stone-100 text-stone-500 border-stone-200",
};

/** Stavový chip hlášení (Aktivní / Otevřené / Vyřešeno / Vypršelo) */
export default function ReportLifecycleChip({ report, className = "" }) {
  const badge = getReportLifecycleBadge(report);
  if (!badge || badge.id === "unknown") return null;
  const tone = TONE_CLASS[badge.tone] ?? TONE_CLASS.muted;
  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${tone} ${className}`}
    >
      {badge.label}
    </span>
  );
}
