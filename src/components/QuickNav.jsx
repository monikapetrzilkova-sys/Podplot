import { useApp } from "../context/AppContext.jsx";
import { APP_WORLDS, normalizeWorldId } from "../data/worldNavigation.js";
import KomunitaChipNav from "./KomunitaChipNav.jsx";

export default function QuickNav() {
  const {
    feedSubFilter,
    expandedPillar: appWorld,
    togglePillar: toggleWorld,
    setFeedSubFilter,
    communityGroups,
    showDiscoveryWall,
    goToHomeWall,
  } = useApp();

  const world = normalizeWorldId(appWorld ?? "komunita");
  const menuOpen = appWorld != null && !showDiscoveryWall;

  return (
    <>
      <nav className="shrink-0 min-w-0 w-full px-3 pt-3 pb-2 bg-[var(--pp-bg)]">
        <div className="flex items-start gap-2">
          <div className="grid grid-cols-2 gap-2 flex-1 min-w-0" role="tablist" aria-label="Hlavní sekce">
            {APP_WORLDS.map((w) => {
              const active = menuOpen && world === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => toggleWorld(w.id)}
                  className={`nav-card${active ? " active" : ""}`}
                >
                  {w.shortLabel}
                </button>
              );
            })}
          </div>
          {menuOpen && (
            <button
              type="button"
              onClick={goToHomeWall}
              className="shrink-0 text-[10px] font-bold text-[#1B4D3E] hover:opacity-70 px-1 pt-2"
            >
              Živé dění
            </button>
          )}
        </div>

        {menuOpen && world === "komunita" && (
          <KomunitaChipNav
            feedSubFilter={feedSubFilter}
            communityGroups={communityGroups}
            onSelect={setFeedSubFilter}
          />
        )}
      </nav>
    </>
  );
}

export function AddListingButton({ className = "", category = null, groupId = null, label = "Přidat inzerát" }) {
  const { openCreate } = useApp();
  return (
    <button
      type="button"
      onClick={() => openCreate(category, groupId)}
      className={`text-xs font-medium text-stone-600 hover:text-stone-900 ${className}`}
    >
      + {label}
    </button>
  );
}
