import { EVENTS_KIND_FILTERS } from "../data/hostedActivities.js";

export default function EventsKindFilter({ value = "all", onChange }) {
  return (
    <div className="pp-category-pills shrink-0 px-0.5" role="tablist" aria-label="Typ akcí">
      {EVENTS_KIND_FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          onClick={() => onChange?.(item.id)}
          className={`pp-category-pill ${value === item.id ? "pp-category-pill--active" : ""}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
