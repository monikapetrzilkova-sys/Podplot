/** Mřížka 2×2 — rozcestník sekce Služby (stejný styl jako Sousedé / Okolí) */

import { CATALOG_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import { HOME_SERVICE_SUB_FILTERS } from "../data/serviceCategories.js";

const TILE_BORDERS = {
  "domov-zahrada": "#3D7A68",
  "pece-krasa": "#A8B971",
  "deti-rodina": "#64A08D",
  ostatni: "#78716C",
};

const TILE_HINTS = {
  "domov-zahrada": "Řemeslo, úklid, zahrada…",
  "pece-krasa": "Kadeřnictví, masáže…",
  "deti-rodina": "Hlídání, doučování…",
  ostatni: "Gastro, právo a další",
};

export const CATALOG_TILES = HOME_SERVICE_SUB_FILTERS.map((cat) => ({
  ...cat,
  hint: TILE_HINTS[cat.id] ?? "",
}));

export default function CatalogGrid({ activeId, onSelect, large = false }) {
  return (
    <div
      className={`pp-tile-grid pp-tile-grid--doodle${large ? " pp-tile-grid--hub" : ""}`}
      role="group"
      aria-label="Služby — kategorie"
    >
      {CATALOG_TILES.map((tile) => {
        const active = activeId === tile.id;
        const Icon = CATALOG_DOODLE_ICONS[tile.id];
        const borderColor = TILE_BORDERS[tile.id] ?? "#e8f0ed";

        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onSelect(tile.id)}
            aria-pressed={active}
            className={`pp-tile-grid-item pp-pressable ${active ? "pp-tile-grid-item--active" : ""}`}
            style={{ borderColor }}
          >
            <span className={active ? "text-[#3D7A68]" : "text-[#64A08D]"}>
              {Icon ? <Icon /> : null}
            </span>
            <span className="pp-text-title text-center leading-snug">
              {tile.shortLabel ?? tile.label}
            </span>
            {tile.hint ? (
              <span className="text-[10px] text-stone-400 text-center leading-snug px-1">
                {tile.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
