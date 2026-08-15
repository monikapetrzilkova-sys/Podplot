/** Ultra tenký vodorovný řádek kategorií — místo velké mřížky po vstupu do sekce */

export default function CategoryPills({ items, activeId, onSelect, ariaLabel = "Kategorie" }) {
  return (
    <div className="pp-category-pills" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(item.id)}
            className={`pp-category-pill ${active ? "pp-category-pill--active" : ""}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
