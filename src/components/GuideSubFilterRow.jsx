import { GuideSubFilterIcon } from "./module/guideCategoryIcons.jsx";

/** Sub-bubliny v modulu Průvodce (Provozovny / Služby u vás doma) */
export default function GuideSubFilterRow({
  options,
  group,
  value,
  onChange,
  className = "",
  ariaLabel = "Podkategorie",
  /** Jen ikony + title (starší režim) */
  iconOnly = false,
  /** Ikona + krátký popisek — čitelnější u Provozoven */
  iconWithLabel = false,
}) {
  const compactIcons = iconOnly && !iconWithLabel;

  return (
    <div
      className={`flex gap-1.5 ${
        compactIcons || iconWithLabel
          ? "pp-guide-sub-row--icons justify-between"
          : "flex-nowrap overflow-x-auto subfilter-scroll"
      } ${iconWithLabel ? "pp-guide-sub-row--labeled" : ""} ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        const caption = opt.shortLabel || opt.label;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(active ? null : opt.id)}
            aria-pressed={active}
            aria-label={opt.label}
            title={opt.label}
            className={`pp-guide-sub-chip shrink-0 ${
              iconWithLabel
                ? "pp-guide-sub-chip--icon-label"
                : compactIcons
                  ? "pp-guide-sub-chip--icon"
                  : ""
            } ${active ? "pp-guide-sub-chip--active" : "pp-guide-sub-chip--inactive"}`}
          >
            <GuideSubFilterIcon
              group={group}
              id={opt.id}
              active={active}
              className={compactIcons || iconWithLabel ? "w-[17px] h-[17px] shrink-0" : "w-3 h-3 shrink-0"}
            />
            {compactIcons ? null : iconWithLabel ? (
              <span className="pp-guide-sub-chip__caption">{caption}</span>
            ) : (
              opt.label
            )}
          </button>
        );
      })}
    </div>
  );
}
