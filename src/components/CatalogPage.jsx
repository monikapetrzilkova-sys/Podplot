import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import CatalogGrid, { CATALOG_TILES } from "./CatalogGrid.jsx";
import ServicesList from "../modules/ServicesList.jsx";
import CompactSearchToggle from "./CompactSearchToggle.jsx";
import SectionBackButton from "./SectionBackButton.jsx";
import { CATALOG_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import { useKeepSearchAboveKeyboard } from "../hooks/useKeepSearchAboveKeyboard.js";

/** Zpět + aktivní kategorie + malé ikony ostatních — celá šířka lišty */
function CatalogCategorySwitch({ activeId, onSelect, onBack, trailing = null }) {
  const active = CATALOG_TILES.find((t) => t.id === activeId);
  const ActiveIcon = activeId ? CATALOG_DOODLE_ICONS[activeId] : null;
  const others = CATALOG_TILES.filter((t) => t.id !== activeId);

  return (
    <div
      className="pp-catalog-cat-switch"
      role="tablist"
      aria-label="Kategorie služeb"
    >
      <SectionBackButton
        onClick={onBack}
        ariaLabel="Zpět na kategorie"
        className="pp-catalog-cat-switch__back"
      />
      <div className="pp-catalog-cat-switch__active" role="tab" aria-selected="true">
        {ActiveIcon ? (
          <span className="pp-catalog-cat-switch__active-icon" aria-hidden>
            <ActiveIcon />
          </span>
        ) : null}
        <span className="pp-catalog-cat-switch__active-label">
          {active?.shortLabel ?? active?.label ?? "Služby"}
        </span>
      </div>
      <div className="pp-catalog-cat-switch__others">
        {others.map((tile) => {
          const Icon = CATALOG_DOODLE_ICONS[tile.id];
          return (
            <button
              key={tile.id}
              type="button"
              role="tab"
              aria-selected={false}
              aria-label={tile.label}
              title={tile.label}
              onClick={() => onSelect(tile.id)}
              className="pp-catalog-cat-switch__icon-btn"
            >
              {Icon ? <Icon /> : null}
            </button>
          );
        })}
      </div>
      {trailing ? <div className="pp-catalog-cat-switch__trailing shrink-0">{trailing}</div> : null}
    </div>
  );
}

export default function CatalogPage() {
  const { catalogRootKey } = useApp();
  const [homeSub, setHomeSub] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchAnchorRef = useRef(null);

  useEffect(() => {
    setHomeSub(null);
    setCatalogSearch("");
    setSearchExpanded(false);
  }, [catalogRootKey]);

  const searchActive = searchExpanded || Boolean(catalogSearch.trim());
  useKeepSearchAboveKeyboard(searchAnchorRef, searchActive);

  const goBackToHub = () => {
    setHomeSub(null);
    setCatalogSearch("");
    setSearchExpanded(false);
  };

  const searchToggle = (
    <CompactSearchToggle
      value={catalogSearch}
      onChange={setCatalogSearch}
      expanded={searchExpanded || Boolean(catalogSearch.trim())}
      onExpandedChange={setSearchExpanded}
      placeholder={
        homeSub
          ? "Hledat v kategorii… např. catering"
          : "Hledat ve službách… např. catering"
      }
      ariaLabel="Hledat ve službách"
      className={searchActive ? "w-full" : "shrink-0"}
    />
  );

  if (homeSub) {
    return (
      <div className="pp-page pp-page--doodle pp-catalog-page flex flex-col min-h-full bg-abstract-organic has-deco">
        {searchActive ? (
          <div className="flex-1 min-h-0 flex flex-col px-3 pb-8 pt-2 gap-2">
            <div ref={searchAnchorRef} className="pp-catalog-search-anchor flex items-center gap-2 min-w-0 shrink-0">
              <SectionBackButton
                onClick={() => {
                  setCatalogSearch("");
                  setSearchExpanded(false);
                }}
                ariaLabel="Zavřít hledání"
              />
              <div className="flex-1 min-w-0">{searchToggle}</div>
            </div>
            <div data-catalog-search-results className="pp-catalog-search-results min-w-0">
              <ServicesList searchQuery={catalogSearch} homeSubCategory={homeSub} />
            </div>
          </div>
        ) : (
          <>
            <div className="tab-header-container px-3 pt-2 pb-0 shrink-0 w-full">
              <CatalogCategorySwitch
                activeId={homeSub}
                onSelect={setHomeSub}
                onBack={goBackToHub}
                trailing={searchToggle}
              />
            </div>
            <div className="flex-1 min-h-0 flex flex-col px-3 pb-8 pt-2 gap-2">
              <ServicesList searchQuery={catalogSearch} homeSubCategory={homeSub} />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pp-page pp-page--doodle pp-catalog-page flex flex-col min-h-full bg-abstract-organic has-deco">
      <div className="flex-1 min-h-0 px-4 pt-4 pb-6">
        {searchActive ? (
          <div className="flex flex-col gap-3">
            <div ref={searchAnchorRef} className="pp-catalog-search-anchor shrink-0">
              {searchToggle}
            </div>
            <div data-catalog-search-results className="pp-catalog-search-results">
              <ServicesList searchQuery={catalogSearch} homeSubCategory={null} />
            </div>
          </div>
        ) : (
          <>
            <CatalogGrid activeId={null} onSelect={setHomeSub} large />
            <div className="mt-3 flex items-center justify-end gap-2">
              <div ref={searchAnchorRef} className="pp-catalog-search-anchor shrink-0">
                {searchToggle}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
