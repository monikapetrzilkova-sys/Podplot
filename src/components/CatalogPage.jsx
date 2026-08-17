import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import CatalogGrid, { CATALOG_TILES } from "./CatalogGrid.jsx";
import ServicesList from "../modules/ServicesList.jsx";
import CompactSearchToggle from "./CompactSearchToggle.jsx";
import { CATALOG_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

export default function CatalogPage() {
  const { catalogRootKey } = useApp();
  const [homeSub, setHomeSub] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    setHomeSub(null);
    setCatalogSearch("");
    setSearchExpanded(false);
  }, [catalogRootKey]);

  const searchActive = searchExpanded || Boolean(catalogSearch.trim());
  const inSection = Boolean(homeSub) || searchActive;

  const activeTile = CATALOG_TILES.find((t) => t.id === homeSub);
  const ActiveIcon = homeSub ? CATALOG_DOODLE_ICONS[homeSub] : null;

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco">
      {inSection ? (
        <>
          <div className="tab-header-container px-3 pt-2 pb-0 shrink-0 w-full flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setHomeSub(null);
                setCatalogSearch("");
                setSearchExpanded(false);
              }}
              className="shrink-0 w-9 h-9 rounded-xl border border-[#C5DDD4] bg-white text-[#1B4D3E] text-lg font-bold leading-none"
              aria-label="Zpět na kategorie"
            >
              ←
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {ActiveIcon ? (
                <span className="text-[#3D7A68] shrink-0">
                  <ActiveIcon />
                </span>
              ) : null}
              <p className="text-sm font-bold text-stone-900 truncate">
                {searchActive && !homeSub
                  ? "Hledání ve službách"
                  : activeTile?.label ?? "Služby"}
              </p>
            </div>
            <CompactSearchToggle
              value={catalogSearch}
              onChange={setCatalogSearch}
              expanded={searchExpanded || Boolean(catalogSearch.trim())}
              onExpandedChange={setSearchExpanded}
              placeholder="Hledat ve službách…"
              ariaLabel="Hledat ve službách"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col px-3 pb-8 pt-2">
            <ServicesList searchQuery={catalogSearch} homeSubCategory={homeSub} />
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6">
          <div className="flex justify-end mb-3">
            <CompactSearchToggle
              value={catalogSearch}
              onChange={setCatalogSearch}
              expanded={false}
              onExpandedChange={setSearchExpanded}
              placeholder="Hledat ve službách…"
              ariaLabel="Hledat ve službách"
            />
          </div>
          <CatalogGrid activeId={null} onSelect={setHomeSub} large />
        </div>
      )}
    </div>
  );
}
