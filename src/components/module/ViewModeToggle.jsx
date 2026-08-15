const DEFAULT_MODES = [
  { id: "map", label: "Mapa" },
  { id: "list", label: "Seznam" },
];

export default function ViewModeToggle({ value, onChange, modes = DEFAULT_MODES, className = "" }) {
  return (
    <div
      className={`pp-view-mode-toggle flex rounded-xl border border-stone-200 p-0.5 bg-stone-50/80 ${className}`.trim()}
      role="tablist"
      aria-label="Způsob zobrazení"
    >
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          aria-selected={value === mode.id}
          onClick={() => onChange(mode.id)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-colors whitespace-nowrap ${
            value === mode.id ? "bg-white text-[#1B4332] shadow-sm" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
