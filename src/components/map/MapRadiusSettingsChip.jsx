import { useEffect, useId, useRef, useState } from "react";
import { formatMapRadiusKm } from "../../data/mapRadiusSettings.js";
import MapRadiusOverlay from "./MapRadiusOverlay.jsx";

function GearIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

/** Kompaktní „aktuální okruh“ + ikona nastavení → popup s posuvníkem */
export default function MapRadiusSettingsChip({
  id,
  label = "Aktuální okruh",
  value,
  min,
  max,
  step = 0.1,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const autoId = useId();
  const controlId = id ?? `map-radius-${autoId}`;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`pp-map-radius-chip-wrap ${className}`.trim()}>
      <button
        type="button"
        className="pp-map-radius-chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Nastavit okruh"
      >
        <span className="pp-map-radius-chip-text">
          <span className="pp-map-radius-chip-label">{label}</span>
          <span className="pp-map-radius-chip-value">{formatMapRadiusKm(value)}</span>
        </span>
        <span className="pp-map-radius-chip-gear" aria-hidden>
          <GearIcon />
        </span>
      </button>

      {open && (
        <div className="pp-map-radius-chip-popover" role="dialog" aria-label={`Nastavení: ${label}`}>
          <MapRadiusOverlay
            id={controlId}
            label={label}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
