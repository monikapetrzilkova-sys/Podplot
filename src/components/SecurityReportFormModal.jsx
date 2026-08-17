import { createPortal } from "react-dom";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import PhotoUpload from "./PhotoUpload.jsx";
import ReportsMapModule from "../modules/ReportsMapModule.jsx";
import ReportCategoryGrid from "./module/ReportCategoryGrid.jsx";
import AutoGrowTextarea from "./module/AutoGrowTextarea.jsx";
import { MAP_CENTER } from "../data/mapRadiusSettings.js";
import { posToDistanceLabel } from "../data/mapData.js";
import { REPORT_EXPIRY_DISCLAIMER } from "../data/reportExpiry.js";
import {
  URGENCY_REACH_COPY,
  URGENT_LOCAL_RADIUS_M,
  URGENT_SCOPE,
  canSetMunicipalityUrgent,
} from "../data/reportUrgency.js";
import { IconMapPin } from "../data/icons.jsx";
import CzechDateTimeFields from "./CzechDateTimeFields.jsx";
import { REPORTS_TIP_CATEGORY_ID, LOSS_KIND_OPTIONS } from "../data/reportCategories.js";

export default function SecurityReportFormModal({
  mode,
  onClose,
  onSubmitReport,
  onSubmitPrompt,
  visibleReports,
  reportsMapRadiusKm,
  draftPin,
  onPickPin,
  onUseCurrentLocation,
  pinError,
  reportCategoryId,
  setReportCategoryId,
  lossKind = "",
  setLossKind,
  categoryError,
  reportTypeDetail,
  setReportTypeDetail,
  reportBody,
  setReportBody,
  reportPhotos,
  setReportPhotos,
  reportValidUntil,
  setReportValidUntil,
  validUntilError,
  alsoAsPrompt,
  setAlsoAsPrompt,
  isUrgent,
  setIsUrgent,
  urgentScope,
  setUrgentScope,
  isInstitution,
  isAdminMode,
  promptTitle,
  setPromptTitle,
  promptBody,
  setPromptBody,
  selectedCall,
}) {
  if (!mode) return null;

  const isReport = mode === "report";
  const isTip = reportCategoryId === REPORTS_TIP_CATEGORY_ID;
  const title = isReport
    ? isTip
      ? "Nový tip pro sousedy"
      : "Nové hlášení na mapu"
    : "Podnět úřadu";
  const subtitle = isReport
    ? isTip
      ? draftPin
        ? "Tip se uloží mezi hlášení na mapě — místo můžete ještě upravit."
        : "Tip zadáte jako hlášení: kategorie Tip, místo na mapě a krátký popis."
      : draftPin
        ? "Místo jste vybrali na mapě — v případě potřeby ho upravte a doplňte detaily."
        : "Vyberte kategorii, označte místo a popište situaci."
    : draftPin
      ? "Místo jste vybrali na mapě — v případě potřeby ho upravte a doplňte podnět."
      : "Označte místo (volitelné) a popište podnět pro obecní úřad.";

  const modal = (
    <div className="pp-security-form-overlay pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto">
        <ModalDoodleBackdrop onClose={onClose} />
      </div>

      <div
        className="pp-security-form-modal pointer-events-auto"
        role="dialog"
        aria-label={title}
      >
        <div className="pp-security-form-modal-header">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-stone-900 leading-snug">{title}</h2>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none"
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>

          <div className="pp-security-form-modal-map">
            <ReportsMapModule
              reports={[]}
              pickMode
              draftPin={draftPin}
              onPickPin={onPickPin}
              compact
              large={false}
              hideLegend
              hideStats
              singleReportMode
              draftPinOnly
              showHomePin={false}
              focusDraftPin
            />
          </div>

          <form
          id={isReport ? "map-report-form" : "municipality-prompt-form"}
          onSubmit={isReport ? onSubmitReport : onSubmitPrompt}
          className="pp-security-form-modal-form"
        >
          <div className="pp-security-form-modal-body">
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <IconMapPin className="w-3.5 h-3.5 shrink-0" />
                Moje aktuální poloha
              </button>
              {draftPin && (
                <span className="inline-flex items-center px-2.5 py-2 text-xs font-medium text-teal-700 bg-teal-50 rounded-xl border border-teal-100">
                  {draftPin.lat != null && draftPin.lng != null
                    ? "Poloha: GPS souřadnice — na mapě výše můžete špendlík ještě posunout"
                    : draftPin.x === MAP_CENTER.x && draftPin.y === MAP_CENTER.y
                      ? "Poloha: u vás — na mapě výše můžete špendlík ještě posunout"
                      : `${posToDistanceLabel(
                          draftPin.x,
                          draftPin.y,
                          undefined,
                          undefined,
                          reportsMapRadiusKm
                        )} · mapu výše můžete upravit`}
                </span>
              )}
            </div>

            {isReport ? (
              <>
                <p className="text-xs text-stone-500 shrink-0">
                  {isUrgent && urgentScope === URGENT_SCOPE.MUNICIPALITY
                    ? "Pro varování celé obce není nutné přesné místo — špendlík je volitelný."
                    : "Klepněte na mapu nebo použijte tlačítko pro vaši polohu."}
                </p>
                {pinError && <p className="text-xs text-red-600 shrink-0">{pinError}</p>}
                {categoryError && <p className="text-xs text-red-600 shrink-0">{categoryError}</p>}

                <ReportCategoryGrid
                  activeId={reportCategoryId}
                  onSelect={setReportCategoryId}
                />

                {reportCategoryId === "loss" && (
                  <div>
                    <p className="text-xs font-semibold text-stone-600 mb-1.5">
                      Je to ztráta, nebo nález? *
                    </p>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Ztráta nebo nález">
                      {LOSS_KIND_OPTIONS.map((opt) => {
                        const active = lossKind === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setLossKind?.(opt.id)}
                            aria-pressed={active}
                            className={`text-left px-3 py-2.5 rounded-xl border transition-colors ${
                              active
                                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                                : "bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                            }`}
                          >
                            <span className="block text-sm font-bold">{opt.label}</span>
                            <span
                              className={`block text-[11px] mt-0.5 leading-snug ${
                                active ? "text-white/85" : "text-stone-500"
                              }`}
                            >
                              {opt.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={reportTypeDetail}
                  onChange={(e) => setReportTypeDetail(e.target.value)}
                  placeholder={
                    isTip
                      ? "Upřesnění (volitelné, např. Bio obchod, dětské hřiště…)"
                      : reportCategoryId === "loss"
                        ? lossKind === "found"
                          ? "Upřesnění (volitelné, např. klíče u lavičky…)"
                          : lossKind === "lost"
                            ? "Upřesnění (volitelné, např. černá peněženka…)"
                            : "Upřesnění (volitelné)"
                        : "Upřesnění typu (volitelné, např. výpadek proudu…)"
                  }
                  className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm"
                />
                <AutoGrowTextarea
                  value={reportBody}
                  onChange={(e) => setReportBody(e.target.value)}
                  placeholder={
                    isTip
                      ? "Co by měli sousedé vědět? Např. nový obchod, praktické místo…"
                      : "Popis situace…"
                  }
                  minRows={3}
                  className="pp-form-textarea-grow w-full min-w-0 px-3 py-2.5 border border-stone-200 rounded-xl text-base resize-none leading-relaxed"
                  required
                />
                <PhotoUpload photos={reportPhotos} onChange={setReportPhotos} />
                <div>
                  <p className="block text-sm font-semibold text-stone-800 mb-1">
                    Platné do <span className="font-normal text-stone-500">(volitelné)</span>
                  </p>
                  <CzechDateTimeFields
                    id="report-valid-until-modal"
                    value={reportValidUntil}
                    onChange={setReportValidUntil}
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">{REPORT_EXPIRY_DISCLAIMER}</p>
                  {validUntilError && <p className="text-xs text-red-600 mt-1">{validUntilError}</p>}
                </div>
                {!isInstitution && !isTip && (
                  <label className="flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={alsoAsPrompt}
                      onChange={(e) => setAlsoAsPrompt(e.target.checked)}
                      className="rounded accent-emerald-600 mt-0.5"
                    />
                    <span>
                      Poslat také úřadu jako podnět
                      <span className="block text-xs text-emerald-700/80 mt-0.5">
                        Úřad uvidí podnět ve své evidenci a může ho označit jako vyřešený.
                      </span>
                    </span>
                  </label>
                )}
                {(isAdminMode || isInstitution) && !isTip && (
                  <div className="space-y-2 text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => {
                          setIsUrgent(e.target.checked);
                          if (!e.target.checked) setUrgentScope(URGENT_SCOPE.LOCAL);
                        }}
                        className="rounded accent-red-600"
                      />
                      Krizové hlášení (SOS)
                    </label>
                    {isUrgent && (
                      <fieldset className="space-y-2 pt-1 border-t border-red-200/80">
                        <legend className="text-xs font-semibold text-red-800 mb-1">Rozsah varování</legend>
                        <label className="flex items-start gap-2 text-xs">
                          <input
                            type="radio"
                            name="urgent-scope-modal"
                            checked={urgentScope === URGENT_SCOPE.LOCAL}
                            onChange={() => setUrgentScope(URGENT_SCOPE.LOCAL)}
                            className="mt-0.5 accent-red-600"
                          />
                          <span>
                            <strong>Konkrétní místo</strong> — sousedi do cca {URGENT_LOCAL_RADIUS_M} m od špendlíku
                          </span>
                        </label>
                        {canSetMunicipalityUrgent({ isInstitution, isAdminMode }) && (
                          <label className="flex items-start gap-2 text-xs">
                            <input
                              type="radio"
                              name="urgent-scope-modal"
                              checked={urgentScope === URGENT_SCOPE.MUNICIPALITY}
                              onChange={() => setUrgentScope(URGENT_SCOPE.MUNICIPALITY)}
                              className="mt-0.5 accent-red-600"
                            />
                            <span>
                              <strong>Celá obec</strong> —{" "}
                              {URGENCY_REACH_COPY.municipality.replace(/^Celá obec — /, "")}
                            </span>
                          </label>
                        )}
                      </fieldset>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {selectedCall ? (
                  <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-xl shrink-0">
                    Reagujete na výzvu: <strong>{selectedCall.title}</strong>
                  </p>
                ) : null}
                <p className="text-xs text-stone-500 shrink-0">
                  Klepněte na mapu nebo použijte tlačítko pro vaši polohu. Není povinné, ale úřadu to pomůže.
                </p>
                <input
                  type="text"
                  value={promptTitle}
                  onChange={(e) => setPromptTitle(e.target.value)}
                  placeholder="Nadpis podnětu (např. Výmol, Osvětlení…)"
                  className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm"
                  required
                />
                <textarea
                  value={promptBody}
                  onChange={(e) => setPromptBody(e.target.value)}
                  placeholder="Popis podnětu — co by obec měla řešit…"
                  rows={4}
                  className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
                  required
                />
              </>
            )}
          </div>

          <div className="pp-security-form-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold border border-stone-200 rounded-xl"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl ${
                isReport ? "pp-btn-warning" : ""
              }`}
              style={isReport ? undefined : { background: "#1B4332" }}
            >
              {isReport ? "Odeslat" : "Odeslat podnět"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const host = document.getElementById("app-modal-root") ?? document.getElementById("app-panel-root");
  if (host) return createPortal(modal, host);
  return modal;
}
