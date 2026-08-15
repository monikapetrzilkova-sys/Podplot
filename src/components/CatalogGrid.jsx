/** Mřížka 2×2 pro katalog služeb — doodle ikony */

import { CATALOG_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

const TILE_BORDERS = {
  "domov-zahrada": "#3D7A68",
  "pece-krasa": "#A8B971",
  "deti-rodina": "#64A08D",
  ostatni: "#A8B971",
};

export default function CatalogGrid({ categories, activeId, onSelect }) {
  return (
    <div className="pp-tile-grid pp-tile-grid--doodle" role="group" aria-label="Kategorie služeb">
      {categories.map((cat) => {
        const active = activeId === cat.id;
        const Icon = CATALOG_DOODLE_ICONS[cat.id];
        const borderColor = TILE_BORDERS[cat.id] ?? "#e8f0ed";

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={active}
            className={`pp-tile-grid-item pp-pressable ${active ? "pp-tile-grid-item--active" : ""}`}
            style={{ borderColor }}
          >
            <span className={active ? "text-[#3D7A68]" : "text-[#64A08D]"}>
              {Icon ? <Icon /> : null}
            </span>
            <span className="pp-text-title text-center leading-snug">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
