/** Mřížka 2×2 — rozcestník sekce Sousedé (doodle ikony) */

import { NEIGHBOR_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

const TILE_BORDERS = {
  veci: "#A8B971",
  vypomoc: "#4D9B86",
  skupiny: "#78716C",
  akce: "#1B4D3E",
};

export const NEIGHBORS_TILES = [
  { id: "veci", label: "Věci" },
  { id: "vypomoc", label: "Výpomoc" },
  { id: "skupiny", label: "Skupiny" },
  { id: "akce", label: "Kalendář akcí" },
];

export default function NeighborsGrid({ activeId, onSelect }) {
  return (
    <div className="pp-tile-grid pp-tile-grid--doodle" role="group" aria-label="Sousedé — kategorie">
      {NEIGHBORS_TILES.map((tile) => {
        const active = activeId === tile.id;
        const Icon = NEIGHBOR_DOODLE_ICONS[tile.id];
        const borderColor = TILE_BORDERS[tile.id] ?? "#e8f0ed";

        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onSelect(tile.id)}
            aria-pressed={active}
            className={`pp-tile-grid-item pp-pressable ${active ? "pp-tile-grid-item--active" : ""}`}
            style={{ borderColor: active ? borderColor : borderColor }}
          >
            <span className={active ? "text-[#3D7A68]" : "text-[#64A08D]"}>
              {Icon ? <Icon /> : null}
            </span>
            <span className="pp-text-title text-center leading-snug">{tile.label}</span>
          </button>
        );
      })}
    </div>
  );
}
