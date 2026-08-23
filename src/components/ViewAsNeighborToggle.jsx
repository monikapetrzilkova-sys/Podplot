import { ENABLE_DEV_ROLE_SWITCH } from "../data/devConfig.js";
import { useApp } from "../context/AppContext.jsx";
import { APP_ROLES } from "../data/userRoles.js";

/**
 * Úřad a soused nejsou jeden účet — přepínání view-as v produkci není.
 * Služba/podnik: Moje profily. Dev mode: volitelný přepínač pro QA.
 */
export default function ViewAsNeighborToggle({ className = "" }) {
  const { viewAsNeighbor, toggleViewAsNeighbor, appUserRole } = useApp();

  if (!ENABLE_DEV_ROLE_SWITCH) return null;
  if (appUserRole === APP_ROLES.NEIGHBOR) return null;

  const workLabel =
    appUserRole === APP_ROLES.OFFICE
      ? "Přepnout na účet úřadu"
      : "Přepnout na pracovní profil";

  const toNeighbor = !viewAsNeighbor;

  return (
    <div className={className}>
      <p className="text-[10px] text-amber-800/80 mb-1">Developer · view as</p>
      <button
        type="button"
        onClick={toggleViewAsNeighbor}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-colors ${
          toNeighbor
            ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-sm"
            : "bg-white text-[#1B4D3E] border-[#C5DDD4] hover:bg-[#F1F6F5]"
        }`}
      >
        {viewAsNeighbor ? workLabel : "Přepnout na sousedský profil"}
      </button>
    </div>
  );
}
