import { formatMapRadiusKm } from "../../data/mapRadiusSettings.js";

/** Posuvník okruhu — v mapě (overlay) nebo nad seznamem */
export default function MapRadiusOverlay({
  id,
  label = "Okruh",
  value,
  min,
  max,
  step = 0.1,
  onChange,
  className = "",
}) {
  return (
    <div
      className={`pp-map-radius-control ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <label htmlFor={id} className="pp-text-meta font-semibold text-stone-700">
          {label}
        </label>
        <span className="pp-text-meta font-bold text-[#3D7A68]">{formatMapRadiusKm(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#3D7A68] h-1"
        aria-label={`${label} ${formatMapRadiusKm(value)}`}
      />
    </div>
  );
}
