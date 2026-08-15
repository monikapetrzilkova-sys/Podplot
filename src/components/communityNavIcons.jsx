/** Monochromatické line-art ikony — navigace Komunita / Skupiny */

import { MarketCategoryIcon } from "../data/marketCategoryIcons.jsx";

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };

export function IconNavSearch({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l5 5" />
    </svg>
  );
}

export function IconNavPlus({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconWorldCommunity({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconWorldGuide({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconNavThings({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

export function IconNavHelp({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12h6" />
    </svg>
  );
}

export function IconNavGroups({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M3 19v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <path d="M16 19v-1a3.5 3.5 0 0 0-2.5-3.36" />
    </svg>
  );
}

export function IconGroupAll({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconGroupMine({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 2l2.4 4.8 5.3.8-3.85 3.7 1 5.2L12 14.8 7.15 16.5l1-5.2L4.3 7.6l5.3-.8L12 2z" />
    </svg>
  );
}

export function IconGroupBaby({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
    </svg>
  );
}

export function IconGroupGarden({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 22V12" />
      <path d="M12 12C12 7 7 4 4 4c0 4 3 8 8 8z" />
      <path d="M12 12c0-5 5-8 8-8 0 4-3 8-8 8z" />
    </svg>
  );
}

export function IconLendingTools({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M14 3l7 7-3 3-7-7 3-3z" />
      <path d="M5 21l6-6" />
      <path d="M3 19l2 2" />
    </svg>
  );
}

export function IconLendingGarden({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 22V11" />
      <path d="M12 11C12 6 6 3 3 3c0 4 4 8 9 8z" />
      <path d="M12 11c0-5 6-8 9-8 0 4-3 8-9 8z" />
    </svg>
  );
}

export function IconLendingLeisure({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2 3 2 15 0 18M12 3c-2 3-2 15 0 18M3 12h18" />
    </svg>
  );
}

export function IconLendingHome({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10.5V20h12v-9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function IconLendingParty({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 18l4-10 4 6 3-4 5 8H4z" />
      <path d="M8 6l1-2M12 5l.5-2M16 7l1-2" />
    </svg>
  );
}

export function IconLendingTransport({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 15h16v3H4z" />
      <path d="M5 15l1.5-6h11L19 15" />
      <circle cx="8" cy="18.5" r="1.5" />
      <circle cx="16" cy="18.5" r="1.5" />
    </svg>
  );
}

export function IconLendingKids({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="7" r="2.5" />
      <path d="M8 20v-5.5a4 4 0 0 1 8 0V20" />
      <path d="M6 14h12" />
    </svg>
  );
}

export function IconLendingOther({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 7h16v12H4z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

/** Stejné ikony jako u Daruji / Prodám / Sháním */
export function LendingSubFilterIcon({ id, className = "" }) {
  return <MarketCategoryIcon id={id} className={className} />;
}

export function IconGroupSport({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2 3 2 15 0 18M12 3c-2 3-2 15 0 18M3 12h18" />
    </svg>
  );
}

export function IconGroupCulture({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 20h16" />
      <path d="M8 20V10l4-3 4 3v10" />
      <path d="M12 7v3" />
    </svg>
  );
}

export function IconGroupTennis({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12c3-4 15-4 18 0" />
    </svg>
  );
}

export function IconGroupFootball({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3l2.5 4.5L12 12l-2.5-4.5L12 3z" />
      <path d="M12 12l4.5 2.5L12 21l-4.5-6.5L12 12z" />
    </svg>
  );
}

export function IconGroupRun({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="14" cy="5" r="2" />
      <path d="M11 22l2-7 4-2-3-4 5-2" />
    </svg>
  );
}

export function IconGroupPets({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <ellipse cx="8" cy="7" rx="2" ry="2.5" />
      <ellipse cx="16" cy="7" rx="2" ry="2.5" />
      <ellipse cx="5" cy="12" rx="2" ry="2.5" />
      <ellipse cx="19" cy="12" rx="2" ry="2.5" />
      <path d="M12 11c-3 0-5 2-5 5.5 0 2.5 2 3.5 5 3.5s5-1 5-3.5C17 13 15 11 12 11z" />
    </svg>
  );
}

export function IconGroupHelp({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M8 12h8" />
      <path d="M12 8v8" />
      <path d="M6 12c0-4 2.7-7 6-7s6 3 6 7-2.7 7-6 7-6-3-6-7z" />
    </svg>
  );
}

export function IconGroupMushroom({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M6 14h12" />
      <path d="M10 14V20" />
      <path d="M14 14V20" />
      <path d="M4 14c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function IconGroupFood({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M6 3v8a3 3 0 0 0 6 0V3" />
      <path d="M9 3v18" />
      <path d="M16 3v18" />
      <path d="M19 3v8a3 3 0 0 1-6 0" />
    </svg>
  );
}

export function IconGroupWork({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function IconGroupDefault({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

const WORLD_ICON = { komunita: IconWorldCommunity, pruvodce: IconWorldGuide };
const NAV_ICON = { veci: IconNavThings, vypomoc: IconNavHelp, skupiny: IconNavGroups };
const GROUP_ICON = {
  vse: IconGroupAll,
  moje: IconGroupMine,
  maminky: IconGroupBaby,
  krouzky: IconGroupBaby,
  hriste: IconGroupBaby,
  zahradkari: IconGroupGarden,
  kutilove: IconGroupGarden,
  sport: IconGroupSport,
  tenis: IconGroupTennis,
  fotbal: IconGroupFootball,
  beh: IconGroupRun,
  cyklistika: IconGroupRun,
  kultura: IconGroupCulture,
  pejskari: IconGroupPets,
  foto: IconGroupCulture,
  houbari: IconGroupMushroom,
  "praha-sousede": IconGroupWork,
  "praha-obedy": IconGroupFood,
};

const CLUB_CATEGORY_ICON = {
  deti: IconGroupBaby,
  sport: IconGroupSport,
  dum: IconGroupGarden,
  hobby: IconGroupCulture,
  // legacy aliases
  zahrada: IconGroupGarden,
  mazlicci: IconGroupPets,
  pomoc: IconGroupHelp,
};

/** Sjednocená třída pro monochromatické ikony skupin */
export const GROUP_ICON_CLASS = "text-[#4D8B7A]";

function mergeIconClass(size, className = "") {
  return `shrink-0 ${GROUP_ICON_CLASS} ${size} ${className}`.trim();
}

export function WorldNavIcon({ id, className }) {
  const Icon = WORLD_ICON[id];
  return Icon ? <Icon className={className} /> : null;
}

export function KomunitaNavIcon({ id, className }) {
  const Icon = NAV_ICON[id];
  return Icon ? <Icon className={className} /> : null;
}

export function GroupNavIcon({ id, className = "" }) {
  const Icon = GROUP_ICON[id] ?? IconGroupDefault;
  return <Icon className={mergeIconClass("w-3.5 h-3.5", className)} />;
}

export function ClubCategoryIcon({ id, className = "" }) {
  const Icon = CLUB_CATEGORY_ICON[id] ?? IconGroupDefault;
  return <Icon className={mergeIconClass("w-4 h-4", className)} />;
}
