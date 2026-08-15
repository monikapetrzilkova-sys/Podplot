/** Plovoucí akční tlačítko */

import { IconNavPlus } from "../communityNavIcons.jsx";

export default function MonochromeFab({ onClick, label = "Přidat", className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`pp-fab absolute bottom-3 right-3 z-20 flex items-center justify-center w-10 h-10 rounded-full active:scale-95 transition-transform ${className}`}
    >
      <IconNavPlus className="w-4 h-4" />
    </button>
  );
}
