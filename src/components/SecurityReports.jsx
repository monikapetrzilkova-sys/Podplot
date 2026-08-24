import { useState, useEffect, useMemo } from "react";
import { SECURITY_REPORTS } from "../data/mockData.js";
import ReportsModule from "../modules/ReportsModule.jsx";
import SecurityReportFormModal from "./SecurityReportFormModal.jsx";
import { useApp } from "../context/AppContext.jsx";
import { filterSecurityReportsByLocation } from "../data/geoFilter.js";
import { filterActiveReports, defaultValidityModeForCategory, REPORT_VALIDITY_MODE } from "../data/reportExpiry.js";
import { reportFromFeedPost } from "../utils/reportPinUtils.js";
import { mergeReportsById } from "../data/reportsStorage.js";
import { MODULE_IDS } from "../data/moduleConfig.js";
import {
  getReportCategory,
  getLossKindOption,
  reportMatchesMapCategoryFilter,
  REPORTS_CALLS_FILTER_ID,
  REPORT_CALLS_ACCENT,
} from "../data/reportCategories.js";
import { MAP_CENTER } from "../data/mapRadiusSettings.js";
import { requestUserGeolocation } from "../data/mapData.js";
import { buildMapPickResult } from "../utils/geoCoordinates.js";
import MapPickConfirmBar from "./map/MapPickConfirmBar.jsx";
import { URGENT_SCOPE } from "../data/reportUrgency.js";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";

export default function SecurityReports({ reportsCategoryFilter = "all" }) {
  const {
    user,
    testRoleId,
    extraReports,
    userPosts,
    reportedReports,
    addSecurityReport,
    isAdminMode,
    promptCalls,
    dismissedPromptCallIds,
    dismissPromptCall,
    restorePromptCall,
    submitMunicipalityPrompt,
    createPromptCall,
    municipalityPrompts,
    activeLocation,
    activeLocationId,
    reportsMapRadiusKm,
    moduleViewModes,
    setModuleViewMode,
    clearModuleSelection,
    reportFormOpen,
    setReportFormOpen,
    pendingOfficeAction,
    clearPendingOfficeAction,
    activeTab,
    showToast,
  } = useApp();

  const reportsViewMode = moduleViewModes[MODULE_IDS.REPORTS];

  const isInstitution = testRoleId === "urad" || user?.accountType === "urad" || user?.accountType === "instituce";

  const [activeForm, setActiveForm] = useState(null);
  /** Výběr místa na mapě před otevřením formuláře */
  const [pendingForm, setPendingForm] = useState(null);
  const [reportCategoryId, setReportCategoryId] = useState("");
  /** u kategorie loss: "lost" | "found" | "" */
  const [lossKind, setLossKind] = useState("");
  const [reportTypeDetail, setReportTypeDetail] = useState("");
  const [reportBody, setReportBody] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [promptBody, setPromptBody] = useState("");
  const [promptCallId, setPromptCallId] = useState(null);
  const [callTitle, setCallTitle] = useState("");
  const [callBody, setCallBody] = useState("");
  const [callDeadline, setCallDeadline] = useState("");
  const [draftPin, setDraftPin] = useState(null);
  const [pinError, setPinError] = useState("");
  const [validUntilError, setValidUntilError] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgentScope, setUrgentScope] = useState(URGENT_SCOPE.LOCAL);
  const [alsoAsPrompt, setAlsoAsPrompt] = useState(false);
  const [reportPhotos, setReportPhotos] = useState([]);
  const [reportValidUntil, setReportValidUntil] = useState("");
  const [reportValidityMode, setReportValidityMode] = useState(REPORT_VALIDITY_MODE.TTL);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const allReportsRaw = useMemo(() => {
    const fromFeed = (userPosts ?? [])
      .filter(
        (p) =>
          p.fromSecurityReportId ||
          p.feedSubtype === "hlaseni" ||
          (String(p.type ?? "").toLowerCase().includes("hlášení") ||
            String(p.type ?? "").toLowerCase() === "tip")
      )
      .map((p) => reportFromFeedPost(p))
      .filter(Boolean);
    // extraReports (včetně localStorage) mají přednost před obnovou z feedu
    return mergeReportsById(SECURITY_REPORTS, fromFeed, extraReports);
  }, [extraReports, userPosts]);
  const allReportsActive = filterActiveReports(allReportsRaw, nowTick);
  const allReports = filterSecurityReportsByLocation(allReportsActive, activeLocationId, activeLocation);
  const showingCalls = reportsCategoryFilter === REPORTS_CALLS_FILTER_ID;
  // Výzvy ≠ hlášení (výpadky, závady…) — na mapě se při filtru Výzvy nic z reportů neukazuje
  const visibleReports = showingCalls
    ? []
    : allReports
        .filter((r) => !reportedReports.includes(r.id))
        .filter((r) => reportMatchesMapCategoryFilter(r, reportsCategoryFilter));
  const activeCalls = promptCalls.filter((c) => c.active);
  const pinnedCalls = activeCalls.filter((c) => !dismissedPromptCallIds.includes(c.id));
  const dismissedCalls = activeCalls.filter((c) => dismissedPromptCallIds.includes(c.id));
  const responsesForCall = (callId) =>
    municipalityPrompts.filter((p) => p.callId === callId);

  const resetForms = () => {
    setActiveForm(null);
    setReportCategoryId("");
    setLossKind("");
    setReportTypeDetail("");
    setReportBody("");
    setCategoryError("");
    setPromptTitle("");
    setPromptBody("");
    setPromptCallId(null);
    setCallTitle("");
    setCallBody("");
    setCallDeadline("");
    setDraftPin(null);
    setPinError("");
    setValidUntilError("");
    setIsUrgent(false);
    setUrgentScope(URGENT_SCOPE.LOCAL);
    setAlsoAsPrompt(false);
    setReportPhotos([]);
    setReportValidUntil("");
    setReportValidityMode(REPORT_VALIDITY_MODE.TTL);
    setPendingForm(null);
  };

  const startReportPick = () => {
    resetForms();
    setPendingForm({ type: "report" });
    setModuleViewMode(MODULE_IDS.REPORTS, "map");
  };

  const startPromptPick = (callId = null) => {
    resetForms();
    setPendingForm({ type: "prompt", callId: callId ?? null });
    if (callId) setPromptCallId(callId);
    setModuleViewMode(MODULE_IDS.REPORTS, "map");
  };

  const confirmMapPick = (pinOverride) => {
    if (!pendingForm) return;
    const isPin =
      pinOverride &&
      typeof pinOverride === "object" &&
      (pinOverride.x != null || pinOverride.lat != null);
    const pin = isPin ? pinOverride : draftPin;
    if (pendingForm.type === "report" && !pin) {
      setPinError("Nejdřív klepněte na mapu nebo zvolte svou polohu.");
      return;
    }
    if (isPin) setDraftPin(pinOverride);
    setActiveForm(pendingForm.type);
    if (pendingForm.callId) setPromptCallId(pendingForm.callId);
    setPendingForm(null);
    setPinError("");
  };

  const cancelMapPick = () => {
    setPendingForm(null);
    setDraftPin(null);
    setPinError("");
  };

  const openReportForm = () => {
    startReportPick();
  };

  useEffect(() => {
    if (!reportFormOpen) return;
    openReportForm();
    setReportFormOpen(false);
  }, [reportFormOpen, setReportFormOpen]);

  const openPromptForm = (callId = null) => {
    startPromptPick(callId);
  };

  const openCallForm = () => {
    resetForms();
    setActiveForm("call");
  };

  useEffect(() => {
    if (pendingOfficeAction !== "call") return;
    openCallForm();
    clearPendingOfficeAction?.();
  }, [pendingOfficeAction, clearPendingOfficeAction]);

  const useCurrentLocation = () => {
    const finish = (pin) => {
      if (pendingForm) {
        confirmMapPick(pin);
        return;
      }
      setDraftPin(pin);
      setPinError("");
    };

    if (!navigator.geolocation) {
      finish({ x: MAP_CENTER.x, y: MAP_CENTER.y });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center = {
          lat: activeLocation?.lat ?? 49.966,
          lng: activeLocation?.lng ?? 14.512,
        };
        finish(
          buildMapPickResult(pos.coords.latitude, pos.coords.longitude, center, reportsMapRadiusKm)
        );
      },
      async () => {
        await requestUserGeolocation();
        finish({ x: MAP_CENTER.x, y: MAP_CENTER.y });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const submitReport = (e) => {
    e.preventDefault();
    if (!reportCategoryId) {
      setCategoryError("Vyberte kategorii hlášení.");
      showToast("Vyberte kategorii hlášení.", "error");
      return;
    }
    if (reportCategoryId === "loss" && !lossKind) {
      setCategoryError("U ztráty / nálezu vyberte, jestli jde o ztrátu, nebo nález.");
      showToast("Vyberte ztrátu, nebo nález.", "error");
      return;
    }
    if (!reportBody.trim()) {
      showToast("Doplňte popis hlášení.", "error");
      return;
    }
    const municipalityWide = isUrgent && urgentScope === URGENT_SCOPE.MUNICIPALITY;
    if (!municipalityWide && !draftPin) {
      setPinError("Nejdřív klepněte na mapu nebo zvolte svou polohu.");
      showToast("Nejdřív označte místo na mapě nebo použijte aktuální polohu.", "error");
      return;
    }
    if (reportValidityMode === REPORT_VALIDITY_MODE.CUSTOM) {
      if (!reportValidUntil.trim()) {
        setValidUntilError("Zvolte termín platnosti.");
        showToast("Zvolte termín platnosti.", "error");
        return;
      }
      const until = new Date(reportValidUntil).getTime();
      if (Number.isNaN(until) || until <= Date.now()) {
        setValidUntilError("Termín platnosti musí být v budoucnosti.");
        showToast("Termín platnosti musí být v budoucnosti.", "error");
        return;
      }
    }
    setValidUntilError("");
    setPinError("");
    setCategoryError("");
    const category = getReportCategory(reportCategoryId);
    const lossOption = reportCategoryId === "loss" ? getLossKindOption(lossKind) : null;
    const baseType = lossOption?.typeLabel || category.typeLabel;
    const typeLabel = reportTypeDetail.trim()
      ? `${baseType} — ${reportTypeDetail.trim()}`
      : baseType;
    const untilResolved = reportValidityMode === REPORT_VALIDITY_MODE.UNTIL_RESOLVED;
    try {
      addSecurityReport({
        type: typeLabel,
        reportCategoryId,
        lossKind: reportCategoryId === "loss" ? lossKind : null,
        body: reportBody.trim(),
        mapPos: municipalityWide ? draftPin ?? { x: 50, y: 50 } : draftPin,
        urgent: isUrgent && (isAdminMode || isInstitution) && reportCategoryId !== "tip",
        urgentScope: isUrgent ? urgentScope : null,
        alsoAsPrompt: alsoAsPrompt && !isInstitution && reportCategoryId !== "tip",
        photos: Array.isArray(reportPhotos) ? reportPhotos : [],
        untilResolved,
        validUntil:
          reportValidityMode === REPORT_VALIDITY_MODE.CUSTOM ? reportValidUntil.trim() : null,
      });
      resetForms();
    } catch (err) {
      console.error(err);
      showToast("Hlášení se nepodařilo odeslat. Zkuste to znovu.", "error");
    }
  };

  const submitPrompt = (e) => {
    e.preventDefault();
    if (!promptTitle.trim() || !promptBody.trim()) return;
    submitMunicipalityPrompt({
      title: promptTitle.trim(),
      body: promptBody.trim(),
      mapPos: draftPin,
      callId: promptCallId,
    });
    resetForms();
  };

  const submitCall = (e) => {
    e.preventDefault();
    if (!callTitle.trim() || !callBody.trim()) return;
    createPromptCall({
      title: callTitle.trim(),
      body: callBody.trim(),
      deadline: callDeadline.trim(),
    });
    resetForms();
  };

  const pickMode = pendingForm !== null;
  const formOpen = activeForm === "report" || activeForm === "prompt";
  const selectedCall = promptCallId ? activeCalls.find((c) => c.id === promptCallId) : null;

  useEffect(() => {
    clearModuleSelection();
  }, [activeLocationId, clearModuleSelection]);

  // Úřad / Dění: při vstupu na záložku vždy nejdřív seznam (mapa po překliknutí)
  useEffect(() => {
    if (!isInstitution) return;
    if (activeTab !== "reports" && activeTab !== "home" && activeTab !== "map") return;
    setModuleViewMode(MODULE_IDS.REPORTS, "list");
  }, [isInstitution, activeTab, setModuleViewMode]);

  const addMenuActions =
    !formOpen && !pickMode && activeForm !== "call"
      ? [
          { id: "report", label: "Nové hlášení", onClick: startReportPick },
          ...(isInstitution
            ? [{ id: "call", label: "Nová výzva", onClick: openCallForm }]
            : [{ id: "prompt", label: "Podnět úřadu", onClick: () => startPromptPick() }]),
        ]
      : null;

  return (
    <div className="pp-map-module-root flex flex-col min-h-0 flex-1 h-full overflow-hidden">
      {showingCalls && (
        <div className="mb-2 shrink-0">
          <h2 className="text-base font-bold text-stone-900">Výzvy</h2>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {isInstitution
              ? "Výzvy občanům — vyjádření k projektu, společný úklid, sběr nápadů. Nejde o výpadky ani havárie."
              : "Úřad vás zve k vyjádření nebo společné akci. Výpadky a havárie najdete v ostatních kategoriích."}
          </p>
        </div>
      )}

      {activeForm === "call" && (
        <AppPanelPortal>
          <div className="pp-app-sheet-overlay">
            <div className="absolute inset-0 pointer-events-auto">
              <ModalDoodleBackdrop onClose={resetForms} />
            </div>
            <form
              onSubmit={submitCall}
              className="pp-app-sheet p-5 space-y-3"
              role="dialog"
              aria-label="Nová výzva občanům"
            >
              <h3 className="text-sm font-bold text-stone-900">Nová výzva občanům</h3>
              <p className="text-xs text-stone-500">
                Např. vyjádření k projektu, společný úklid hřiště, sběr nápadů. Sousedé ji najdou
                v kategorii Výzvy.
              </p>
              <input
                type="text"
                value={callTitle}
                onChange={(e) => setCallTitle(e.target.value)}
                placeholder="Např. Pojďme uklidit dětské hřiště…"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
                required
              />
              <textarea
                value={callBody}
                onChange={(e) => setCallBody(e.target.value)}
                placeholder="Co od občanů potřebujete — termín, místo, jak se zapojit…"
                rows={3}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none bg-white"
                required
              />
              <input
                type="text"
                value={callDeadline}
                onChange={(e) => setCallDeadline(e.target.value)}
                placeholder="Termín (volitelně, např. 30. 7. 2026)"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForms}
                  className="flex-1 py-2 border border-stone-200 rounded-xl text-sm font-semibold bg-white"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold"
                >
                  Zveřejnit výzvu
                </button>
              </div>
            </form>
          </div>
        </AppPanelPortal>
      )}

      <div className="pp-map-module-body flex-1 min-h-0 flex flex-col overflow-hidden">
        {showingCalls && !pickMode ? (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
            {isInstitution && (
              <button
                type="button"
                onClick={openCallForm}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#3D7A68] text-white"
              >
                + Nová výzva občanům
              </button>
            )}
            {pinnedCalls.length === 0 && dismissedCalls.length === 0 && (
              <p className="text-sm text-stone-500 bg-stone-50 rounded-xl p-4 border border-stone-100">
                {isInstitution
                  ? "Zatím žádná výzva. Vytvořte ji tlačítkem výše nebo přes +."
                  : "Zatím žádné výzvy od úřadu."}
              </p>
            )}
            {pinnedCalls.map((call) => {
              const responses = responsesForCall(call.id);
              return (
                <article
                  key={call.id}
                  className="rounded-xl p-3 relative border"
                  style={{
                    background: "#F0FDFA",
                    borderColor: "#99F6E4",
                  }}
                >
                  {!isInstitution && (
                    <button
                      type="button"
                      onClick={() => dismissPromptCall(call.id)}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-white/80 text-base leading-none"
                      aria-label="Skrýt výzvu"
                      title="Skrýt výzvu"
                    >
                      ×
                    </button>
                  )}
                  <p
                    className={`text-[10px] font-bold uppercase mb-0.5 ${
                      isInstitution ? "" : "pr-7"
                    }`}
                    style={{ color: REPORT_CALLS_ACCENT }}
                  >
                    {call.author}
                  </p>
                  <h4 className="text-sm font-bold text-stone-900 leading-snug">{call.title}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{call.body}</p>
                  {call.deadline && (
                    <p className="text-[11px] font-medium mt-1" style={{ color: REPORT_CALLS_ACCENT }}>
                      Termín: {call.deadline}
                    </p>
                  )}
                  {isInstitution ? (
                    <p className="text-[11px] text-stone-500 mt-2">
                      {responses.length === 0
                        ? "Zatím bez odpovědí občanů"
                        : `${responses.length} ${
                            responses.length === 1
                              ? "odpověď"
                              : responses.length < 5
                                ? "odpovědi"
                                : "odpovědí"
                          }`}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openPromptForm(call.id)}
                      className="mt-2 w-full py-2 text-white text-xs font-semibold rounded-xl hover:opacity-90"
                      style={{ background: REPORT_CALLS_ACCENT }}
                    >
                      Zapojit se / podat podnět
                    </button>
                  )}
                  {isInstitution && responses.length > 0 && (
                    <ul className="mt-2 space-y-1.5 border-t border-teal-200 pt-2">
                      {responses.slice(0, 3).map((r) => (
                        <li key={r.id} className="text-[11px] text-stone-600">
                          <span className="font-semibold text-stone-800">{r.authorName}:</span>{" "}
                          {r.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
            {!isInstitution && dismissedCalls.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 pt-1 px-0.5">
                  Skryté ({dismissedCalls.length})
                </p>
                {dismissedCalls.map((call) => (
                  <article
                    key={call.id}
                    className="bg-stone-50 border border-stone-200 rounded-xl p-3"
                  >
                    <p className="text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                      {call.author}
                    </p>
                    <h4 className="text-sm font-semibold text-stone-800 leading-snug">{call.title}</h4>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{call.body}</p>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => restorePromptCall(call.id)}
                        className="text-xs font-semibold text-[#3D7A68]"
                      >
                        Obnovit
                      </button>
                      <button
                        type="button"
                        onClick={() => openPromptForm(call.id)}
                        className="text-xs font-semibold text-stone-600"
                      >
                        Zapojit se
                      </button>
                    </div>
                  </article>
                ))}
              </>
            )}
          </div>
        ) : (
          <ReportsModule
            compact
            reports={visibleReports}
            pickMode={pickMode}
            draftPin={draftPin}
            addMenuActions={addMenuActions}
            pickModeBar={
              pickMode ? (
                <MapPickConfirmBar
                  mode={pendingForm?.type ?? "report"}
                  pinError={pinError}
                  onConfirm={() => confirmMapPick()}
                  onCancel={cancelMapPick}
                  onUseCurrentLocation={useCurrentLocation}
                />
              ) : null
            }
            onPickPin={(pos) => confirmMapPick(pos)}
          />
        )}
      </div>

      <SecurityReportFormModal
        mode={activeForm === "report" ? "report" : activeForm === "prompt" ? "prompt" : null}
        onClose={resetForms}
        onSubmitReport={submitReport}
        onSubmitPrompt={submitPrompt}
        visibleReports={visibleReports}
        reportsMapRadiusKm={reportsMapRadiusKm}
        draftPin={draftPin}
        onPickPin={(pos) => {
          setDraftPin(pos);
          setPinError("");
        }}
        onUseCurrentLocation={useCurrentLocation}
        pinError={pinError}
        reportCategoryId={reportCategoryId}
        setReportCategoryId={(id) => {
          setReportCategoryId(id);
          setCategoryError("");
          if (id !== "loss") setLossKind("");
          if (id === "tip") {
            setAlsoAsPrompt(false);
            setIsUrgent(false);
          }
          setReportValidityMode(defaultValidityModeForCategory(id));
          if (defaultValidityModeForCategory(id) !== REPORT_VALIDITY_MODE.CUSTOM) {
            setReportValidUntil("");
          }
        }}
        lossKind={lossKind}
        setLossKind={(kind) => {
          setLossKind(kind);
          setCategoryError("");
        }}
        categoryError={categoryError}
        reportTypeDetail={reportTypeDetail}
        setReportTypeDetail={setReportTypeDetail}
        reportBody={reportBody}
        setReportBody={setReportBody}
        reportPhotos={reportPhotos}
        setReportPhotos={setReportPhotos}
        reportValidUntil={reportValidUntil}
        setReportValidUntil={setReportValidUntil}
        reportValidityMode={reportValidityMode}
        setReportValidityMode={setReportValidityMode}
        validUntilError={validUntilError}
        alsoAsPrompt={alsoAsPrompt}
        setAlsoAsPrompt={setAlsoAsPrompt}
        isUrgent={isUrgent}
        setIsUrgent={setIsUrgent}
        urgentScope={urgentScope}
        setUrgentScope={setUrgentScope}
        isInstitution={isInstitution}
        isAdminMode={isAdminMode}
        promptTitle={promptTitle}
        setPromptTitle={setPromptTitle}
        promptBody={promptBody}
        setPromptBody={setPromptBody}
        selectedCall={selectedCall}
      />

    </div>
  );
}
