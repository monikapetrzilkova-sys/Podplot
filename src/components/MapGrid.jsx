/** Kompaktní přepínač Hlášení / Průvodce na stránce Mapa */

import { useEffect, useState } from "react";
import { MAP_DOODLE_ICONS, LOCATION_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import { useApp } from "../context/AppContext.jsx";
import { URGENCY_REACH_COPY } from "../data/reportUrgency.js";
import { REPORT_EXPIRY_DISCLAIMER } from "../data/reportExpiry.js";
import { IconBulb } from "../data/icons.jsx";
import { IconNavSearch } from "./communityNavIcons.jsx";
import CompactSearchToggle from "./CompactSearchToggle.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

export const MAP_TILES = [
  { id: "reports", label: "Hlášení" },
  { id: "places", label: "Průvodce" },
];

/** Žárovka — tip / více informací u aktivního Hlášení */
function TabHelpMark({ open, onToggle }) {
  return (
    <button
      type="button"
      className={`pp-map-tab-info-btn ${open ? "pp-map-tab-info-btn--open" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label="Více informací o hlášeních"
      title="Více informací"
    >
      <IconBulb className="w-3.5 h-3.5" />
    </button>
  );
}

/** Lupa — hledání u aktivního Průvodce (stejné místo jako žárovka u Hlášení) */
function TabSearchMark({ open, onToggle }) {
  return (
    <button
      type="button"
      className={`pp-map-tab-info-btn pp-map-tab-search-btn ${open ? "pp-map-tab-info-btn--open" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-expanded={open}
      aria-label="Hledat v průvodci"
      title="Hledat v průvodci"
    >
      <IconNavSearch className="w-3.5 h-3.5" />
    </button>
  );
}

function ReportsHelpPopover({ onClose }) {
  const { activeLocation } = useApp();
  const LocIcon = LOCATION_DOODLE_ICONS[activeLocation?.id] ?? LOCATION_DOODLE_ICONS.domov;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AppPanelPortal>
      <div className="pp-info-tip-overlay">
        <button
          type="button"
          className="pp-info-tip-backdrop"
          onClick={onClose}
          aria-label="Zavřít nápovědu"
        />
        <div
          className="pp-info-tip-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reports-help-title"
        >
          <div className="pp-info-tip-header">
            <span className="pp-info-tip-icon" aria-hidden>
              <IconBulb className="w-5 h-5" />
            </span>
            <h3 id="reports-help-title" className="pp-info-tip-title">
              Jak fungují hlášení
            </h3>
            <button type="button" onClick={onClose} className="pp-info-tip-close" aria-label="Zavřít">
              ×
            </button>
          </div>
          <div className="pp-info-tip-body">
            <p>
              Tipy pro sousedy (obchod, místo…) zadáte stejnou cestou jako hlášení — kategorie Tip.
              Výpadky spadají pod Varování.
            </p>
            <p>{URGENCY_REACH_COPY.intro}</p>
            <p>{REPORT_EXPIRY_DISCLAIMER}</p>
            <p className="pp-info-tip-location">
              <LocIcon className="w-3.5 h-3.5 shrink-0" />
              <span>
                {activeLocation?.label} ({activeLocation?.shortLabel}) — zobrazena hlášení z této lokality
              </span>
            </p>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}

export default function MapGrid({ activeId, onSelect, compact = false, prominent = false }) {
  const { localGuideSearchQuery, setLocalGuideSearchQuery } = useApp();
  const [reportsHelpOpen, setReportsHelpOpen] = useState(false);
  const [guideSearchExpanded, setGuideSearchExpanded] = useState(false);

  const guideSearchActive =
    guideSearchExpanded || Boolean(localGuideSearchQuery?.trim());

  useEffect(() => {
    if (activeId !== "reports") setReportsHelpOpen(false);
  }, [activeId]);

  useEffect(() => {
    if (activeId !== "places") setGuideSearchExpanded(false);
  }, [activeId]);

  if (prominent) {
    return (
      <div className="pp-map-main-tabs-wrap">
        <div className="pp-map-main-tabs" role="tablist" aria-label="Mapa — hlavní kategorie">
          {MAP_TILES.map((tile) => {
            const active = activeId === tile.id;
            const Icon = MAP_DOODLE_ICONS[tile.id];
            const subtitle =
              tile.id === "reports" ? "Sousedská hlášení na mapě" : "Katalog míst v okolí";

            return (
              <div
                key={tile.id}
                role="tab"
                tabIndex={0}
                aria-selected={active}
                onClick={() => onSelect(tile.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(tile.id);
                  }
                }}
                className={`pp-map-main-tab ${active ? "pp-map-main-tab--active" : ""}`}
              >
                {active && tile.id === "reports" ? (
                  <TabHelpMark
                    open={reportsHelpOpen}
                    onToggle={() => setReportsHelpOpen((v) => !v)}
                  />
                ) : null}
                {active && tile.id === "places" && !guideSearchActive ? (
                  <TabSearchMark
                    open={false}
                    onToggle={() => setGuideSearchExpanded(true)}
                  />
                ) : null}
                <span className="pp-map-main-tab-icon">{Icon ? <Icon /> : null}</span>
                <span className="pp-map-main-tab-label">{tile.label}</span>
                <span className="pp-map-main-tab-sub">{subtitle}</span>
              </div>
            );
          })}
        </div>
        {activeId === "places" && guideSearchActive ? (
          <div className="pp-map-main-tab-search">
            <CompactSearchToggle
              value={localGuideSearchQuery}
              onChange={setLocalGuideSearchQuery}
              expanded
              onExpandedChange={setGuideSearchExpanded}
              placeholder="Hledat v obci…"
              ariaLabel="Hledat v průvodci"
            />
          </div>
        ) : null}
        {activeId === "reports" && reportsHelpOpen ? (
          <ReportsHelpPopover onClose={() => setReportsHelpOpen(false)} />
        ) : null}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="pp-map-section-tabs" role="tablist" aria-label="Mapa — kategorie">
        {MAP_TILES.map((tile) => {
          const active = activeId === tile.id;
          const Icon = MAP_DOODLE_ICONS[tile.id];

          return (
            <button
              key={tile.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(tile.id)}
              className={`pp-map-section-tab ${active ? "pp-map-section-tab--active" : ""}`}
            >
              <span className="pp-map-section-tab-icon">{Icon ? <Icon /> : null}</span>
              <span>{tile.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pp-tile-grid pp-tile-grid--doodle" role="group" aria-label="Mapa — kategorie">
      {MAP_TILES.map((tile) => {
        const active = activeId === tile.id;
        const Icon = MAP_DOODLE_ICONS[tile.id];

        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onSelect(tile.id)}
            aria-pressed={active}
            className={`pp-tile-grid-item pp-pressable ${active ? "pp-tile-grid-item--active" : ""}`}
          >
            <span className={active ? "text-[#3D7A68]" : "text-[#64A08D]"}>
              {Icon ? <Icon /> : null}
            </span>
            <span className={`pp-text-title text-center leading-snug text-sm ${active ? "font-extrabold" : "font-bold"}`}>
              {tile.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
