import { useApp } from "../context/AppContext.jsx";
import { IconAlert } from "../data/icons.jsx";
import { URGENT_SCOPE } from "../data/reportUrgency.js";
import AppPanelPortal from "./AppPanelPortal.jsx";

export default function SosOverlay() {
  const { sosAlert, dismissSos, activeLocationId } = useApp();

  if (!sosAlert) return null;
  if (sosAlert.locationId && sosAlert.locationId !== activeLocationId) return null;

  const isMunicipalityWide = sosAlert.urgentScope === URGENT_SCOPE.MUNICIPALITY;

  return (
    <AppPanelPortal>
    <div className="pp-app-sheet-overlay">
    <div className="pp-app-sheet pp-app-sheet--full flex flex-col items-center justify-center p-6 text-white pp-alert">
      <IconAlert className="w-12 h-12 mb-4" style={{ strokeWidth: 1.5 }} />
      <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-90">
        {isMunicipalityWide ? "Varování pro celou obec · SOS" : "Krizové varování · okolí místa · SOS"}
      </p>

      <h2 className="text-2xl font-bold text-center mb-3">{sosAlert.title}</h2>

      <p className="text-center opacity-90 mb-6 max-w-sm">{sosAlert.body}</p>

      <p className="text-sm opacity-80 mb-8">{sosAlert.location}</p>

      <button

        type="button"

        onClick={dismissSos}

        className="px-8 py-3 pp-btn bg-white font-bold"

        style={{ color: "#A85858" }}

      >

        Rozumím — zavřít

      </button>

    </div>
    </div>
    </AppPanelPortal>
  );
}

