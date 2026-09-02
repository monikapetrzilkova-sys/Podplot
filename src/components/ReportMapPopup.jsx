import ReportsMapModule from "../modules/ReportsMapModule.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import { hasReportMapPosition } from "../utils/reportPinUtils.js";
import { displayCreatorLabel } from "../data/accountTypes.js";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";

export default function ReportMapPopup({ report, onClose }) {
  if (!hasReportMapPosition(report)) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <ModalDoodleBackdrop onClose={onClose} />

      <div className="relative z-10 w-full max-w-[390px] bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200">
          <div className="min-w-0">
            <p className="text-sm font-bold text-stone-900 truncate">{report.type}</p>
            {isSampleContent(report) ? <SampleBadge className="mt-1" /> : null}
            <p className="text-[11px] text-stone-500 truncate">
              {[
                displayCreatorLabel(report.author, report.accountType, { mine: report.mine }),
                report.distance,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none"
            aria-label="Zavřít mapu"
          >
            ×
          </button>
        </div>
        <div className="p-2">
          <ReportsMapModule
            reports={[report]}
            selectedReportId={report.id}
            singleReportMode
            showHomePin={false}
            compact
            hideLegend
            hideStats
          />
        </div>
      </div>
    </div>
  );
}
