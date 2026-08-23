import { useApp } from "../context/AppContext.jsx";
import { APP_ROLES } from "../data/userRoles.js";

export default function ViewAsNeighborToggle({ className = "", prominent = false }) {
  const { viewAsNeighbor, toggleViewAsNeighbor, appUserRole } = useApp();

  if (appUserRole === APP_ROLES.NEIGHBOR) return null;

  const workLabel =
    appUserRole === APP_ROLES.OFFICE
      ? "Přepnout na účet úřadu"
      : "Přepnout na pracovní profil";

  const toNeighbor = !viewAsNeighbor;

  return (
    <div className={className}>
      {toNeighbor && prominent ? (
        <p className="text-[11px] text-stone-500 mb-1.5 leading-snug">
          Sousedský profil má feed, skupiny a peněženku jako doma — přepněte sem, až skončíte práci.
        </p>
      ) : null}
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
