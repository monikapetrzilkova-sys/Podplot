/** Kompaktní pill filtry — mint systém */

export default function PillFilterRow({ options, value, onChange, className = "", nowrap = false }) {
  return (
    <div
      className={`flex gap-1.5 ${nowrap ? "flex-nowrap overflow-x-auto subfilter-scroll" : "flex-wrap"} ${className}`}
      role="group"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={`pp-chip shrink-0 ${
              nowrap ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
            } ${active ? "pp-chip--active" : "pp-chip--inactive"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
