/** Mřížka 2×2 — rozcestník sekce Sousedé (doodle ikony) */

import { NEIGHBOR_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

const TILE_BORDERS = {
  veci: "#A8B971",
  vypomoc: "#4D9B86",
  skupiny: "#78716C",
  akce: "#1B4D3E",
};

export const NEIGHBORS_TILES = [
  { id: "veci", label: "Věci", hint: "Daruji, prodám, sháním…" },
  { id: "vypomoc", label: "Výpomoc", hint: "Hledám nebo nabízím" },
  { id: "skupiny", label: "Skupiny", hint: "Komunity v okolí" },
  { id: "akce", label: "Akce", hint: "Kalendář událostí" },
];

export default function NeighborsGrid({ activeId, onSelect, large = false }) {
  return (
    <div
      className={`pp-tile-grid pp-tile-grid--doodle${large ? " pp-tile-grid--hub" : ""}`}
      role="group"
      aria-label="Sousedé — kategorie"
    >
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
            style={{ borderColor }}
          >
            <span className={active ? "text-[#3D7A68]" : "text-[#64A08D]"}>
              {Icon ? <Icon /> : null}
            </span>
            <span className="pp-text-title text-center leading-snug">{tile.label}</span>
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
