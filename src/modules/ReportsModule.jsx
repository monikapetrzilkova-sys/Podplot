import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import MapComponent from "../components/module/MapComponent.jsx";
import ViewToggleFab from "../components/module/ViewToggleFab.jsx";
import MapAddMenuFab from "../components/module/MapAddMenuFab.jsx";
import ListView, { ListItemShell } from "../components/module/ListView.jsx";
import MapRadiusOverlay from "../components/map/MapRadiusOverlay.jsx";
import ReportDetailModal from "../components/ReportDetailModal.jsx";
import { MODULE_IDS } from "../data/moduleConfig.js";
import {
  MIN_REPORTS_MAP_RADIUS_KM,
  MAX_REPORTS_MAP_RADIUS_KM,
} from "../data/mapRadiusSettings.js";
import { filterReportsForMapView } from "../data/geoFilter.js";
import { hasReportMapPosition } from "../utils/reportPinUtils.js";
import ReportListIcon from "../components/module/ReportListIcon.jsx";
import { getUrgentReachLabel } from "../data/reportUrgency.js";
import { getPromptStatusStyle } from "../data/municipalityPrompts.js";
import { isTipReport, REPORT_TIP_ACCENT } from "../data/reportCategories.js";
import { reportPinAccentColor } from "../utils/reportPinUtils.js";
import EditedBadge from "../components/EditedBadge.jsx";
import { displayCreatorLabel } from "../data/accountTypes.js";

function OfficeStatusBadge({ report }) {
  if (!report?.officeStatus || report.officeStatus === "new") return null;
  return (
    <span
      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getPromptStatusStyle(report.officeStatus)}`}
    >
      {report.officeStatusLabel ?? report.officeStatus}
    </span>
  );
}

function ReportListRow({ report, onOpen }) {
  const publicNote = (report.publicOfficeNotes ?? []).at(-1);
  const creator = displayCreatorLabel(report.author, report.accountType, { mine: report.mine });
  const meta = [
    creator,
    report.distance,
    report.time,
    report.urgent && getUrgentReachLabel(report) ? getUrgentReachLabel(report) : null,
    report.body,
  ]
    .filter(Boolean)
    .join(" · ");
  const titleColor = isTipReport(report) ? REPORT_TIP_ACCENT : reportPinAccentColor(report);

  return (
    <ListItemShell id={report.id}>
      <button type="button" onClick={() => onOpen(report)} className="w-full text-left">
        <div className="flex items-start gap-3">
          <ReportListIcon report={report} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="pp-text-title line-clamp-1 leading-snug"
                style={isTipReport(report) ? { color: titleColor } : undefined}
              >
                {report.type}
              </p>
              <EditedBadge item={report} />
              {report.urgent && (
                <span className="text-[9px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  Urgentní
                </span>
              )}
              <OfficeStatusBadge report={report} />
            </div>
            <p className="pp-text-meta line-clamp-1 mt-0.5 leading-snug">{meta}</p>
            {publicNote && (
              <p className="text-[11px] text-[#1B4D3E] mt-1 line-clamp-2 leading-snug">
                <span className="font-semibold">Úřad:</span> {publicNote.text}
              </p>
            )}
          </div>
        </div>
      </button>
    </ListItemShell>
  );
}

export default function ReportsModule({
  reports,
  pickMode = false,
  draftPin = null,
  onPickPin,
  compact = false,
  addMenuActions = null,
  pickModeBar = null,
}) {
  const {
    user,
    activeLocation,
    reportsMapRadiusKm,
    setReportsMapRadiusKm,
    moduleViewModes,
    setModuleViewMode,
    moduleSelection,
    selectModuleItem,
    clearModuleSelection,
    reportSecurityReport,
  } = useApp();

  const [detailReport, setDetailReport] = useState(null);

  const liveDetailReport = useMemo(() => {
    if (!detailReport) return null;
    return reports.find((r) => r.id === detailReport.id) ?? detailReport;
  }, [detailReport, reports]);

  const moduleId = MODULE_IDS.REPORTS;
  const viewMode = pickMode ? "map" : moduleViewModes[moduleId];
  const mapFillsViewport = compact && viewMode === "map";
  const listFillsViewport = compact && !pickMode && viewMode === "list";
  const fillsViewport = mapFillsViewport || listFillsViewport;

  const reportsInRadius = useMemo(
    () => filterReportsForMapView(reports, reportsMapRadiusKm, undefined, activeLocation),
    [reports, reportsMapRadiusKm, activeLocation]
  );

  const mapReports = useMemo(
    () => reportsInRadius.filter((r) => hasReportMapPosition(r)),
    [reportsInRadius]
  );

  const sortedReports = useMemo(
    () => [...reportsInRadius].sort((a, b) => Number(b.urgent) - Number(a.urgent)),
    [reportsInRadius]
  );

  const selectedId = moduleSelection?.module === moduleId ? moduleSelection.id : null;
  const urgentCount = reportsInRadius.filter((r) => r.urgent).length;

  const openReportDetail = (report) => {
    if (!report) return;
    selectModuleItem(moduleId, report.id);
    setDetailReport(report);
  };

  const closeReportDetail = () => {
    setDetailReport(null);
    clearModuleSelection();
  };

  const showAddMenu = !pickMode && addMenuActions?.length > 0;

  const radiusControl = !pickMode ? (
    <MapRadiusOverlay
      id="reports-map-radius"
      label="Okruh hlášení"
      value={reportsMapRadiusKm}
      min={MIN_REPORTS_MAP_RADIUS_KM}
      max={MAX_REPORTS_MAP_RADIUS_KM}
      step={0.1}
      onChange={setReportsMapRadiusKm}
    />
  ) : null;

  const mapArea = (
    <div className="pp-map-module-viewport relative flex flex-col flex-1 min-h-0 overflow-hidden">
      {viewMode === "map" ? (
        <>
          <MapComponent
            mapMode="reports"
            radiusKm={reportsMapRadiusKm}
            reports={mapReports}
            pickMode={pickMode}
            draftPin={draftPin}
            onPickPin={onPickPin}
            onReportPinClick={(r) => {
              if (selectedId === r.id && liveDetailReport?.id === r.id) {
                closeReportDetail();
              } else {
                openReportDetail(r);
              }
            }}
            selectedReportId={selectedId}
            userAddress={activeLocation?.address ?? user?.address ?? ""}
            userGeo={user?.geo ?? null}
            areaLabel={activeLocation?.shortLabel}
            homeLabel={activeLocation?.label ?? "Domov"}
            urgentCount={urgentCount}
            totalCount={reportsInRadius.length}
            hidePickHint={Boolean(pickModeBar)}
            hideLegend
            hideStats
            fluid
            className="flex flex-col flex-1 min-h-0 mb-0"
          />
          {radiusControl && viewMode === "map" && (
            <div className="pp-map-radius-overlay pp-map-radius-overlay--with-toggle pp-map-radius-overlay--compact">
              {radiusControl}
            </div>
          )}
          {pickMode && pickModeBar}
        </>
      ) : (
        <ListView
          className={`flex-1 min-h-0 overflow-y-auto ${showAddMenu ? "pp-map-list-with-fab" : ""} ${
            fillsViewport ? "" : "max-h-72"
          }`}
          items={sortedReports}
          emptyMessage="V této kategorii v okruhu zatím žádná hlášení."
          renderItem={(report) => (
            <ReportListRow
              key={report.id}
              report={report}
              onOpen={openReportDetail}
            />
          )}
        />
      )}

      {!pickMode && (
        <>
          <ViewToggleFab
            viewMode={viewMode}
            onToggle={() => setModuleViewMode(moduleId, viewMode === "map" ? "list" : "map")}
          />
          {showAddMenu && <MapAddMenuFab actions={addMenuActions} />}
        </>
      )}
    </div>
  );

  const body = (
    <>
      {mapArea}
      {!pickMode && viewMode === "list" && (
        <div className={`pp-map-radius-inline pp-map-radius-inline--compact shrink-0 ${fillsViewport ? "mt-1.5" : "mt-2"}`}>
          {radiusControl}
        </div>
      )}

      <ReportDetailModal
        report={liveDetailReport}
        onClose={closeReportDetail}
        onReport={(reason) => liveDetailReport && reportSecurityReport(liveDetailReport.id, reason)}
      />
    </>
  );

  if (compact) {
    return (
      <div className="pp-map-module-root flex flex-col min-h-0 flex-1 overflow-hidden">
        {body}
      </div>
    );
  }

  return <div className="px-4 py-3 flex flex-col gap-2">{body}</div>;
}
