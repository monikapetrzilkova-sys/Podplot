/** Rozbalovací kategorie profilu / oznámení — hlavička s počtem, obsah až po rozbalení */

import { IconNavPlus } from "./communityNavIcons.jsx";

function SectionAddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className="pp-map-add-fab-btn shrink-0"
      aria-label={label}
      title={label}
    >
      <IconNavPlus className="w-4 h-4" />
    </button>
  );
}

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.title
 * @param {string} props.countLabel — např. „2 aktivní nabídky“
 * @param {boolean} props.open
 * @param {() => void} props.onToggle
 * @param {(() => void)=} props.onAdd
 * @param {string=} props.addLabel
 * @param {string=} props.className
 * @param {import('react').ReactNode} props.children
 */
export default function CollapsibleCategoryCard({
  id,
  title,
  countLabel,
  open,
  onToggle,
  onAdd = null,
  addLabel = "Přidat",
  className = "",
  children,
}) {
  return (
    <section
      id={id}
      className={`pp-card overflow-hidden scroll-mt-4 mb-3 ${open ? "ring-1 ring-[#C5DDD4]" : ""} ${className}`.trim()}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          className="flex-1 min-w-0 text-left px-4 py-3.5 flex items-center gap-2"
        >
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-stone-900">{title}</span>
            <span className="block text-[11px] text-stone-500 mt-0.5">{countLabel}</span>
          </span>
          <span
            className={`shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
        {onAdd ? (
          <div className="flex items-center pr-3">
            <SectionAddButton label={addLabel} onClick={onAdd} />
          </div>
        ) : null}
      </div>
      {open ? (
        <div id={`${id}-body`} className="px-3 pb-3 pt-3 space-y-2 border-t border-stone-100">
          {children}
        </div>
      ) : null}
    </section>
  );
}
