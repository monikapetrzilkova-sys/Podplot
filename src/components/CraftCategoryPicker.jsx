import {
  HOME_SERVICE_SUB_FILTERS,
  getSubcategoriesForHomeGroup,
  getServiceCategory,
} from "../data/serviceCategories.js";
import {
  CATALOG_DOODLE_ICONS,
  SERVICE_CATEGORY_DOODLE_ICONS,
  DoodleCheckIcon,
} from "./doodle/doodleIcons.jsx";

function categoryIcon(id) {
  return SERVICE_CATEGORY_DOODLE_ICONS[id] ?? SERVICE_CATEGORY_DOODLE_ICONS.ostatni;
}

function categoryLabel(id) {
  return getServiceCategory(id)?.label ?? id;
}

/**
 * Výběr oboru mobilní služby: skupina → hlavní zaměření (ikona katalogu) → vedlejší.
 */
export default function CraftCategoryPicker({
  homeGroup,
  onHomeGroupChange,
  primaryId,
  onPrimaryChange,
  secondaryIds = [],
  onSecondaryChange,
  required = false,
  className = "",
}) {
  const safeHomeGroup = homeGroup || "domov-zahrada";
  const craftSubs = getSubcategoriesForHomeGroup(safeHomeGroup) ?? [];
  const secondary = Array.isArray(secondaryIds) ? secondaryIds.filter(Boolean) : [];
  const primaryLabel = primaryId ? categoryLabel(primaryId) : null;

  const selectHomeGroup = (id) => {
    onHomeGroupChange?.(id);
    onPrimaryChange?.(null);
    onSecondaryChange?.([]);
  };

  const selectPrimary = (id) => {
    if (!id) return;
    onPrimaryChange?.(id);
    onSecondaryChange?.(secondary.filter((x) => x !== id));
  };

  const toggleSecondary = (id) => {
    if (!primaryId || !id || id === primaryId) return;
    if (secondary.includes(id)) {
      onSecondaryChange?.(secondary.filter((x) => x !== id));
    } else {
      onSecondaryChange?.([...secondary, id]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div>
        <p className="text-xs font-semibold text-stone-600 mb-1">
          Skupina služeb
          {required ? (
            <span className="text-teal-800" aria-hidden="true">
              {" *"}
            </span>
          ) : null}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {HOME_SERVICE_SUB_FILTERS.map((g) => {
            const GroupIcon = CATALOG_DOODLE_ICONS[g.id] ?? CATALOG_DOODLE_ICONS.ostatni;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => selectHomeGroup(g.id)}
                className={`px-2.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                  safeHomeGroup === g.id
                    ? "border-[#3D7A68] bg-white text-[#1B4D3E]"
                    : "border-stone-200 bg-white text-stone-600"
                }`}
              >
                {GroupIcon ? <GroupIcon className="w-4 h-4 shrink-0" /> : null}
                {g.shortLabel ?? g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-stone-600 mb-1">
          Hlavní zaměření
          {required ? (
            <span className="text-teal-800" aria-hidden="true">
              {" *"}
            </span>
          ) : null}
        </p>
        <p className="text-[10px] text-stone-500 mb-1.5 leading-snug">
          Podle něj se v katalogu ukáže ikona a hlavní štítek.
        </p>
        {craftSubs.length === 0 ? (
          <p className="text-[11px] text-stone-500">V této skupině zatím nejsou podkategorie.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {craftSubs.map((c) => {
              const selected = primaryId === c.id;
              const CatIcon = categoryIcon(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectPrimary(c.id)}
                  aria-pressed={selected}
                  className={`px-2.5 py-1.5 rounded-full border text-[11px] font-semibold inline-flex items-center gap-1 ${
                    selected
                      ? "border-[#3D7A68] bg-[#1B4D3E] text-white"
                      : "border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  {CatIcon ? <CatIcon className="w-3.5 h-3.5 shrink-0" /> : null}
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {primaryId ? (
        <div>
          <p className="text-xs font-semibold text-stone-600 mb-1">Vedlejší zaměření</p>
          <p className="text-[10px] text-stone-500 mb-1.5 leading-snug">
            Volitelně další obory ve stejné skupině.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {craftSubs
              .filter((c) => c.id !== primaryId)
              .map((c) => {
                const selected = secondary.includes(c.id);
                const CatIcon = categoryIcon(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleSecondary(c.id)}
                    aria-pressed={selected}
                    className={`px-2.5 py-1.5 rounded-full border text-[11px] font-semibold inline-flex items-center gap-1 ${
                      selected
                        ? "border-[#3D7A68] bg-[#E8F3EF] text-[#1B4D3E]"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    {selected ? (
                      <DoodleCheckIcon className="w-3.5 h-3.5 shrink-0" />
                    ) : CatIcon ? (
                      <CatIcon className="w-3.5 h-3.5 shrink-0" />
                    ) : null}
                    {c.label}
                  </button>
                );
              })}
          </div>
          <p className="text-[10px] text-[#3D7A68] mt-1.5">
            Hlavní: {primaryLabel}
            {secondary.length
              ? ` · vedlejší: ${secondary.map(categoryLabel).filter(Boolean).join(", ")}`
              : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
