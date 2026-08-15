/** Plovoucí karta po výběru špendlíku — tlačítko Detail přepne do seznamu */

export default function MapSelectionCard({ title, subtitle, onDetail, onClose }) {
  if (!title) return null;

  return (
    <div className="pp-card p-3 mt-2 flex items-start justify-between gap-3 shadow-md border border-emerald-200/60">
      <div className="min-w-0">
        <p className="text-sm font-bold text-stone-900 truncate">{title}</p>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onDetail}
          className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
          style={{ background: "#1B4332" }}
        >
          Detail
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1.5 text-xs text-stone-400 hover:text-stone-600"
            aria-label="Zavřít"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
