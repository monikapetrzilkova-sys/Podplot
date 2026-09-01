import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import SectionBackButton from "./SectionBackButton.jsx";
import ViewModeToggle from "./module/ViewModeToggle.jsx";
import CompactSearchToggle from "./CompactSearchToggle.jsx";
import { MODULE_IDS, EVENTS_VIEW_MODES } from "../data/moduleConfig.js";

/**
 * Jedna lišta: Zpět + Seznam/Mapa/Kalendář + hledání + nová akce / kroužek.
 * Šetří místo oproti samostatnému toolbaru pod hlavičkou.
 */
export default function EventsAkceTopBar({
  onBack,
  search = "",
  onSearchChange,
  searchExpanded = false,
  onSearchExpandedChange,
}) {
  const { moduleViewModes, setModuleViewMode, setCreateEventOpen, openCreateHostedActivity } = useApp();
  const rawViewMode = moduleViewModes[MODULE_IDS.EVENTS];
  const viewMode = EVENTS_VIEW_MODES.some((m) => m.id === rawViewMode) ? rawViewMode : "list";
  const searchActive = searchExpanded || Boolean(String(search).trim());
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div
      className="pp-events-akce-topbar flex items-center gap-1.5 w-full min-w-0 py-0.5"
      role="navigation"
      aria-label="Akce"
    >
      <SectionBackButton onClick={onBack} className="shrink-0" />
      {searchActive ? (
        <div className="flex-1 min-w-0">
          <CompactSearchToggle
            value={search}
            onChange={onSearchChange}
            expanded
            onExpandedChange={onSearchExpandedChange}
            placeholder="Hledat v akcích…"
            ariaLabel="Hledat v akcích"
          />
        </div>
      ) : (
        <>
          <ViewModeToggle
            value={viewMode}
            onChange={(mode) => setModuleViewMode(MODULE_IDS.EVENTS, mode)}
            modes={EVENTS_VIEW_MODES}
            className="pp-events-view-toggle flex-1 min-w-0 max-w-none"
          />
          <CompactSearchToggle
            value={search}
            onChange={onSearchChange}
            expanded={false}
            onExpandedChange={onSearchExpandedChange}
            placeholder="Hledat v akcích…"
            ariaLabel="Hledat v akcích"
            className="shrink-0"
          />
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              className="w-8 h-8 shrink-0 bg-[#3D7A68] text-white rounded-lg text-lg font-bold leading-none"
              aria-label="Přidat do kalendáře"
              aria-expanded={createOpen}
            >
              +
            </button>
            {createOpen ? (
              <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-stone-200 bg-white shadow-lg py-1">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
                  onClick={() => {
                    setCreateOpen(false);
                    setCreateEventOpen(true);
                  }}
                >
                  Jednorázová akce
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
                  onClick={() => {
                    setCreateOpen(false);
                    openCreateHostedActivity?.();
                  }}
                >
                  Kroužek / lekce
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
