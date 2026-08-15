import { formatMapRadiusKm } from "../../data/mapRadiusSettings.js";

export default function MapRadiusControl({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  onChange,
  id,
}) {
  return (
    <div className="pp-card p-3 mb-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <label htmlFor={id} className="text-xs font-semibold text-stone-700">
          {label}
        </label>
        <span className="text-xs font-bold text-emerald-800">{formatMapRadiusKm(value)}</span>
      </div>
      {hint && <p className="text-[11px] text-stone-400 mb-2">{hint}</p>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600"
      />
      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
        <span>{formatMapRadiusKm(min)}</span>
        <span>{formatMapRadiusKm(max)}</span>
      </div>
    </div>
  );
}
