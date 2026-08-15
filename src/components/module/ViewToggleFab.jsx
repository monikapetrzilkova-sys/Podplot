/** Přepínač Mapa ↔ Seznam — plovoucí tlačítko vpravo nahoře (barva brand záhlaví) */

export default function ViewToggleFab({ viewMode, onToggle, className = "" }) {
  const label = viewMode === "map" ? "Seznam" : "Mapa";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Přepnout na ${label.toLowerCase()}`}
      className={`pp-view-toggle-fab absolute top-2 right-2 z-20 ${className}`.trim()}
    >
      {label}
    </button>
  );
}
