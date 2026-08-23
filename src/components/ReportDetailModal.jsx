import { useState } from "react";
import { formatAuthorName, getAccountType } from "../data/accountTypes.js";
import RoleBadge, { Avatar } from "./RoleBadge.jsx";
import ReportMenu from "./ReportMenu.jsx";
import { PostPhotos } from "./PhotoUpload.jsx";
import ReportListIcon from "./module/ReportListIcon.jsx";
import { formatReportExpiryLabel, isReportActive, isReportResolved } from "../data/reportExpiry.js";
import { getUrgentReachLabel } from "../data/reportUrgency.js";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { getPromptStatusStyle } from "../data/municipalityPrompts.js";
import { isTipReport, REPORT_TIP_ACCENT } from "../data/reportCategories.js";
import { hasReportMapPosition, reportPinAccentColor } from "../utils/reportPinUtils.js";
import EditedBadge from "./EditedBadge.jsx";
import ContentEditModal from "./ContentEditModal.jsx";
import { useApp } from "../context/AppContext.jsx";
import MapComponent from "./module/MapComponent.jsx";

export default function ReportDetailModal({ report, onClose, onReport }) {
  const { updateSecurityReport, resolveSecurityReport, activeLocation, user } = useApp();
  const [editOpen, setEditOpen] = useState(false);

  if (!report) return null;

  const acc = report.accountType ? getAccountType(report.accountType) : null;
  const authorLabel = formatAuthorName(report.author, report.accountType);
  const publicNotes = report.publicOfficeNotes ?? [];
  const showOfficeStatus = report.officeStatus && report.officeStatus !== "new";
  const tip = isTipReport(report);
  const titleColor = tip ? REPORT_TIP_ACCENT : reportPinAccentColor(report);
  const showMap = hasReportMapPosition(report);
  const canResolve = Boolean(report.mine) && isReportActive(report) && !isReportResolved(report);

  return (
    <AppPanelPortal>
    <div className="pp-app-sheet-overlay">
      <div className="absolute inset-0 pointer-events-auto">
        <ModalDoodleBackdrop onClose={onClose} />
      </div>

      <div
        className="pp-app-sheet flex flex-col overflow-hidden"
        role="dialog"
        aria-label={`Detail ${tip ? "tipu" : "hlášení"}: ${report.type}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 shrink-0">
          <h2 className="text-base font-bold text-stone-900">
            {tip ? "Detail tipu" : "Detail hlášení"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none"
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>

        {showMap && (
          <div className="pp-report-detail-map shrink-0 border-b border-stone-100">
            <MapComponent
              mapMode="reports"
              reports={[report]}
              selectedReportId={report.id}
              singleReportMode
              showHomePin={false}
              hideLegend
              hideStats
              hidePickHint
              userAddress={activeLocation?.address ?? user?.address ?? ""}
              userGeo={user?.geo ?? null}
              areaLabel={activeLocation?.shortLabel}
              homeLabel={activeLocation?.label ?? "Domov"}
              className="h-full w-full"
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <ReportListIcon report={report} className="w-12 h-12" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold" style={{ color: titleColor }}>
                    {report.type}
                  </h3>
                  <EditedBadge item={report} />
                  {report.urgent && (
                    <>
                      <span className="pp-badge-pill pp-badge-warning">Urgentní</span>
                      {getUrgentReachLabel(report) && (
                        <span className="pp-badge-pill pp-badge-warning opacity-90 text-[10px]">
                          {getUrgentReachLabel(report)}
                        </span>
                      )}
                    </>
                  )}
                  {showOfficeStatus && (
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${getPromptStatusStyle(report.officeStatus)}`}
                    >
                      {report.officeStatusLabel}
                    </span>
                  )}
                </div>
                {!report.mine && onReport && (
                  <ReportMenu compact onReport={onReport} />
                )}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{report.body}</p>
              {report.mine && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="text-xs font-semibold text-[#3D7A68] border border-[#C5DDD4] bg-white px-3 py-1.5 rounded-xl hover:bg-[#F1F6F5]"
                  >
                    Upravit
                  </button>
                  {canResolve ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (resolveSecurityReport?.(report.id)) onClose?.();
                      }}
                      className="text-xs font-semibold text-white bg-[#1B4D3E] border border-[#1B4D3E] px-3 py-1.5 rounded-xl hover:bg-[#163f33]"
                    >
                      Označit jako vyřešené
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <PostPhotos photos={report.photos} />

          {publicNotes.length > 0 && (
            <section className="mt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Vyjádření úřadu
              </h4>
              {publicNotes.map((n) => (
                <article
                  key={n.id}
                  className="rounded-xl border border-[#C5DDD4] bg-[#F7FAF9] px-3 py-2.5"
                >
                  <p className="text-sm text-stone-800 leading-relaxed">{n.text}</p>
                  <p className="text-[10px] text-stone-400 mt-1">
                    {n.authorName}
                    {n.time ? ` · ${n.time}` : ""}
                  </p>
                </article>
              ))}
            </section>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
            <Avatar initials={report.authorInitials ?? "?"} roleId={report.role} size="sm" />
            <div className="min-w-0">
              <p className="font-medium text-stone-700 truncate">{authorLabel}</p>
              <p className="truncate">
                {[report.distance, report.time, formatReportExpiryLabel(report)].filter(Boolean).join(" · ")}
              </p>
            </div>
            {acc && <RoleBadge roleId={acc.role} />}
          </div>
        </div>
      </div>

      <ContentEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={tip ? "Upravit tip" : "Upravit hlášení"}
        titleLabel="Typ / nadpis"
        bodyLabel="Popis"
        initialTitle={report.type}
        initialBody={report.body}
        onSave={({ title, body }) => updateSecurityReport(report.id, { type: title, body })}
      />
    </div>
    </AppPanelPortal>
  );
}
