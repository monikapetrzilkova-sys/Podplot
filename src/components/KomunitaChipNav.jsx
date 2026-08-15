import { KOMUNITA_SUBFILTERS } from "../data/worldNavigation.js";
import { KomunitaNavIcon } from "./communityNavIcons.jsx";

function isSubActive(subId, feedSubFilter, communityGroups) {
  if (subId === "veci") return feedSubFilter === "veci";
  if (subId === "vypomoc") return feedSubFilter === "vypomoc";
  if (subId === "skupiny") {
    return (
      feedSubFilter === "skupiny" ||
      feedSubFilter === "moje" ||
      feedSubFilter === "vse" ||
      communityGroups.some((g) => g.id === feedSubFilter)
    );
  }
  return false;
}

/** Sekundární navigace Komunity — kompaktní horizontální chips */
export default function KomunitaChipNav({ feedSubFilter, communityGroups, onSelect }) {
  return (
    <div className="subfilter-scroll flex flex-nowrap gap-1 overflow-x-auto mt-2 -mx-1 px-1">
      {KOMUNITA_SUBFILTERS.map((sub) => {
        const active = isSubActive(sub.id, feedSubFilter, communityGroups);
        return (
          <button
            key={sub.id}
            type="button"
            onClick={() => onSelect(sub.id)}
            aria-pressed={active}
            className={`pp-chip flex items-center gap-1 shrink-0 px-2.5 py-1 text-[11px] ${
              active ? "pp-chip--active" : "pp-chip--inactive"
            }`}
          >
            <KomunitaNavIcon id={sub.icon} className="w-3 h-3" />
            {sub.label}
          </button>
        );
      })}
    </div>
  );
}
