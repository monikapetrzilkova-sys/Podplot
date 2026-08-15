/** Plovoucí akční tlačítko na mapě — sjednocený styl s menu „+“ */

import { IconNavPlus } from "../communityNavIcons.jsx";

export default function MapFab({ onClick, label = "Označit místo", className = "" }) {
  return (
    <div className={`pp-map-add-fab ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="pp-map-add-fab-btn"
      >
        <IconNavPlus className="w-4 h-4" />
      </button>
    </div>
  );
}
