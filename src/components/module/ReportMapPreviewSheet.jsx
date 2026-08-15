/** Spodní náhledová karta po klepnutí na špendlík hlášení */

import { getUrgentReachLabel } from "../../data/reportUrgency.js";
import {
  reportPinAccentColor,
  reportPinMeta,
  reportPinShortLabel,
} from "../../utils/reportPinUtils.js";
import { ReportPinIcon } from "./reportPinIcons.jsx";
import { getPromptStatusStyle } from "../../data/municipalityPrompts.js";
import { isTipReport, REPORT_TIP_ACCENT } from "../../data/reportCategories.js";

export default function ReportMapPreviewSheet({ report, onDetail, onClose }) {
  if (!report) return null;

  const urgentLabel = report.urgent ? getUrgentReachLabel(report) : null;
  const publicNote = (report.publicOfficeNotes ?? []).at(-1);
  const showOfficeStatus = report.officeStatus && report.officeStatus !== "new";
  const tip = isTipReport(report);
  const accent = tip ? REPORT_TIP_ACCENT : reportPinAccentColor(report);

  return (
    <div className="pp-map-preview-sheet" role="dialog" aria-label={`Náhled: ${report.type}`}>
      <div className="pp-map-preview-sheet-inner">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="pp-map-preview-sheet-icon"
            style={{ color: accent }}
            aria-hidden
          >
            <ReportPinIcon report={report} className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-sm font-bold leading-snug ${tip ? "" : "text-stone-900"}`}
                style={tip ? { color: accent } : undefined}
              >
                {reportPinShortLabel(report)}
              </p>
              {report.urgent && (
                <span className="text-[9px] font-bold uppercase text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">
                  Urgentní
                </span>
              )}
              {showOfficeStatus && (
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${getPromptStatusStyle(report.officeStatus)}`}
                >
                  {report.officeStatusLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2 leading-snug">{report.body}</p>
            {(report.placeLabel || report.distance) && (
              <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                <span aria-hidden>📍</span>
                {[report.placeLabel, report.distance].filter(Boolean).join(" · ")}
              </p>
            )}
            {publicNote && (
              <p className="text-[11px] text-[#1B4D3E] mt-1 line-clamp-2 leading-snug">
                <span className="font-semibold">Úřad:</span> {publicNote.text}
              </p>
            )}
            <p className="text-[10px] text-stone-400 mt-1">
              {[reportPinMeta(report), urgentLabel].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 text-lg leading-none"
            aria-label="Zavřít náhled"
          >
            ×
          </button>
        </div>
        <button
          type="button"
          onClick={onDetail}
          className="mt-2.5 w-full py-2 text-xs font-bold text-white rounded-xl"
          style={{ background: tip ? REPORT_TIP_ACCENT : "#1B4332" }}
        >
          Zobrazit detail
        </button>
      </div>
    </div>
  );
}
