import MapRadiusControl from "../map/MapRadiusControl.jsx";
import { formatMapRadiusKm } from "../../data/mapRadiusSettings.js";
import CategoryGrid from "./CategoryGrid.jsx";
import {
  INTEREST_DOODLE_ICONS,
  SERVICE_CATEGORY_DOODLE_ICONS,
  SERVICE_PARENT_DOODLE_ICONS,
  CATALOG_DOODLE_ICONS,
  DoodleOtherIcon,
} from "../doodle/doodleIcons.jsx";

function resolveCategoryIcon(cat) {
  return (
    SERVICE_PARENT_DOODLE_ICONS[cat.id] ||
    SERVICE_CATEGORY_DOODLE_ICONS[cat.id] ||
    CATALOG_DOODLE_ICONS[cat.id] ||
    INTEREST_DOODLE_ICONS[cat.id] ||
    DoodleOtherIcon
  );
}

function CategoryChipRow({ categories, activeId, onSelect }) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
      {categories.map((cat) => {
        const Icon = resolveCategoryIcon(cat);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
              activeId === cat.id
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-stone-600 border-stone-200"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterPanel({
  radius,
  categories,
  activeCategory,
  onCategoryChange,
  categoryLayout = "chips",
  search,
  onSearchChange,
  searchPlaceholder,
  className = "",
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {radius && (
        <MapRadiusControl
          id={radius.id}
          label={radius.label}
          hint={radius.hint}
          value={radius.value}
          min={radius.min}
          max={radius.max}
          step={radius.step ?? 1}
          onChange={radius.onChange}
        />
      )}
      {categories?.length > 0 && onCategoryChange && (
        categoryLayout === "grid" ? (
          <CategoryGrid categories={categories} activeId={activeCategory} onSelect={onCategoryChange} />
        ) : (
          <CategoryChipRow categories={categories} activeId={activeCategory} onSelect={onCategoryChange} />
        )
      )}
      {search != null && onSearchChange && (
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder ?? "Hledat…"}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm bg-white"
        />
      )}
    </div>
  );
}

export { formatMapRadiusKm };
