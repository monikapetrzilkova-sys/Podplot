import { useApp } from "../context/AppContext.jsx";
import { APP_ROLES } from "../data/userRoles.js";

export default function ViewAsNeighborToggle({ className = "" }) {
  const { viewAsNeighbor, toggleViewAsNeighbor, appUserRole } = useApp();

  if (appUserRole === APP_ROLES.NEIGHBOR) return null;

  const workLabel =
    appUserRole === APP_ROLES.OFFICE
      ? "Přepnout na účet úřadu"
      : "Přepnout na pracovní profil";

  return (
    <button
      type="button"
      onClick={toggleViewAsNeighbor}
      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-colors ${
        viewAsNeighbor
          ? "bg-[#3D7A68] text-white border-[#3D7A68]"
          : "bg-white text-stone-700 border-stone-200 hover:border-[#C5DDD4] hover:bg-[#F1F6F5]"
      } ${className}`}
    >
      {viewAsNeighbor ? workLabel : "Přepnout na sousedský profil"}
    </button>
  );
}
