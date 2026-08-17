/** Plovoucí akční tlačítko na mapě — s popiskem */

import { IconNavPlus } from "../communityNavIcons.jsx";

export default function MapFab({ onClick, label = "Přidat místo", className = "" }) {
  return (
    <div className={`pp-map-add-fab ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="pp-map-add-fab-btn pp-map-add-fab-btn--labeled"
      >
        <IconNavPlus className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </button>
    </div>
  );
}
