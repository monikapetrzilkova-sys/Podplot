import { reportPinAccentColor } from "../../utils/reportPinUtils.js";
import { ReportPinIcon } from "./reportPinIcons.jsx";

/** Ikona kategorie hlášení pro seznam — stejná jako na mapě. */
export default function ReportListIcon({ report, className = "w-10 h-10" }) {
  const urgent = Boolean(report?.urgent);

  return (
    <div
      className={`${className} rounded-xl flex items-center justify-center shrink-0 ${
        urgent ? "pp-alert text-white" : "border border-emerald-100"
      }`}
      style={
        urgent
          ? undefined
          : { background: `${reportPinAccentColor(report)}18`, color: reportPinAccentColor(report) }
      }
    >
      <ReportPinIcon report={report} className="w-4 h-4" />
    </div>
  );
}
