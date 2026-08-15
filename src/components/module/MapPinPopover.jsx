/** Pop-up u špendlíku přímo na mapě */

export default function MapPinPopover({
  x,
  y,
  emoji,
  iconNode,
  title,
  subtitle,
  meta,
  onDetail,
  onClose,
}) {
  if (!title || x == null || y == null) return null;

  return (
    <div
      className="absolute z-30 pointer-events-auto"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, 10px)",
      }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={title}
    >
      <div
        className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-l border-t border-emerald-200/80"
        aria-hidden
      />
      <div className="pp-card p-3 w-[min(16rem,calc(100vw-3rem))] shadow-lg border border-emerald-200/80">
        <div className="flex items-start gap-2">
          {iconNode ?? (emoji ? <span className="text-2xl shrink-0 leading-none">{emoji}</span> : null)}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-stone-900 leading-snug">{title}</p>
            {subtitle && <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{subtitle}</p>}
            {meta && <p className="text-[10px] text-stone-400 mt-1">{meta}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 text-lg leading-none shrink-0 px-0.5"
              aria-label="Zavřít"
            >
              ×
            </button>
          )}
        </div>
        {onDetail && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDetail();
            }}
            className="mt-2.5 w-full py-1.5 text-xs font-semibold text-white rounded-lg"
            style={{ background: "#1B4332" }}
          >
            Detail
          </button>
        )}
      </div>
    </div>
  );
}
