import { GuideSubFilterIcon } from "./module/guideCategoryIcons.jsx";

/** Sub-bubliny v modulu Průvodce (Provozovny / Služby u vás doma) */
export default function GuideSubFilterRow({ options, group, value, onChange, className = "", ariaLabel = "Podkategorie" }) {
  return (
    <div
      className={`flex gap-1.5 flex-nowrap overflow-x-auto subfilter-scroll ${className}`}
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
            className={`pp-guide-sub-chip shrink-0 ${active ? "pp-guide-sub-chip--active" : "pp-guide-sub-chip--inactive"}`}
          >
            <GuideSubFilterIcon group={group} id={opt.id} active={active} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
