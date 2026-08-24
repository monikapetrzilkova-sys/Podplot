import { useApp } from "../context/AppContext.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";

/** Po odeslání hlášení — kam se propsalo + CTA na mapu */
export default function ReportSubmitSuccessSheet() {
  const {
    reportSubmitSuccess,
    dismissReportSubmitSuccess,
    viewReportFromSubmitSuccess,
  } = useApp();

  if (!reportSubmitSuccess) return null;

  const { alsoAsPrompt, isTip } = reportSubmitSuccess;
  const noun = isTip ? "Tip" : "Hlášení";

  const places = [
    { id: "map", label: "Mapa", hint: "špendlík v okruhu" },
    { id: "feed", label: "Živé dění", hint: "nahoře ve feedu" },
    alsoAsPrompt
      ? { id: "office", label: "Úřad", hint: "jako podnět" }
      : null,
  ].filter(Boolean);

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={() => dismissReportSubmitSuccess(true)} />
        </div>
        <div
          className="pp-app-sheet flex flex-col overflow-hidden max-h-[70vh]"
          role="dialog"
          aria-label={`${noun} odesláno`}
        >
          <div className="px-5 pt-5 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#3D7A68] mb-1">
              Hotovo
            </p>
            <h2 className="text-lg font-bold text-stone-900 leading-snug">
              {noun} je venku u sousedů
            </h2>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
              Propsalo se sem:
            </p>
            <ul className="mt-3 space-y-2">
              {places.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-[#C5DDD4] bg-[#F7FAF9] px-3.5 py-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#3D7A68] shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-stone-900">{p.label}</span>
                    <span className="block text-[11px] text-stone-500">{p.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-2 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={() => viewReportFromSubmitSuccess?.()}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white bg-[#3D7A68] hover:bg-[#346859]"
            >
              Zobrazit na mapě
            </button>
            <button
              type="button"
              onClick={() => dismissReportSubmitSuccess(true)}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold text-[#3D7A68] hover:bg-[#F1F6F5]"
            >
              Zpět na Domů
            </button>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
