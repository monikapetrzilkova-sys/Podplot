import ReportsMapModule from "../modules/ReportsMapModule.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";

export default function ReportMapPopup({ report, onClose }) {
  if (!report?.mapPos) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <ModalDoodleBackdrop onClose={onClose} />

      <div className="relative z-10 w-full max-w-[390px] bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200">
          <div className="min-w-0">
            <p className="text-sm font-bold text-stone-900 truncate">{report.type}</p>
            <p className="text-[11px] text-stone-500 truncate">{report.distance}</p>
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
