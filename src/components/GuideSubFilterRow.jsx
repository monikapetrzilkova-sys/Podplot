import { GuideSubFilterIcon } from "./module/guideCategoryIcons.jsx";

/** Sub-bubliny v modulu Průvodce (Provozovny / Služby u vás doma) */
export default function GuideSubFilterRow({
  options,
  group,
  value,
  onChange,
  className = "",
  ariaLabel = "Podkategorie",
  /** Jen ikony + title (Provozovny — ušetří místo na jeden řádek) */
  iconOnly = false,
}) {
  return (
    <div
      className={`flex gap-1.5 ${
        iconOnly ? "pp-guide-sub-row--icons justify-between" : "flex-nowrap overflow-x-auto subfilter-scroll"
      } ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(active ? null : opt.id)}
            aria-pressed={active}
            aria-label={opt.label}
            title={opt.label}
            className={`pp-guide-sub-chip shrink-0 ${
              iconOnly ? "pp-guide-sub-chip--icon" : ""
            } ${active ? "pp-guide-sub-chip--active" : "pp-guide-sub-chip--inactive"}`}
          >
            <GuideSubFilterIcon
              group={group}
              id={opt.id}
              active={active}
              className={iconOnly ? "w-4 h-4 shrink-0" : "w-3 h-3 shrink-0"}
            />
            {iconOnly ? null : opt.label}
          </button>
        );
      })}
    </div>
  );
}
