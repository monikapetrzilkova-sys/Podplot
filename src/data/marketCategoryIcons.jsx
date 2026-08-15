/** Tenké lineární SVG ikony — stroke 1px, smaragdové tóny */

import { normalizeThingItemCategory } from "./thingItemCategories.js";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round" };

export function IconTools({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-3.3-3.3 2.1-2.1z" />
    </svg>
  );
}

export function IconKids({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

export function IconGarden({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <path d="M12 22V12" />
      <path d="M12 12C12 6 7 3 4 3c0 4 2 7 8 9" />
      <path d="M12 12c0-6 5-9 8-9 0 4-2 7-8 9" />
    </svg>
  );
}

export function IconSport({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M5 7l14 10M5 17L19 7" />
    </svg>
  );
}

export function IconPets({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <ellipse cx="8" cy="9" rx="2" ry="2.5" />
      <ellipse cx="16" cy="9" rx="2" ry="2.5" />
      <ellipse cx="5.5" cy="14" rx="1.8" ry="2.2" />
      <ellipse cx="18.5" cy="14" rx="1.8" ry="2.2" />
      <path d="M12 18c-2.5 0-4.5 2-4.5 4.5h9c0-2.5-2-4.5-4.5-4.5z" />
    </svg>
  );
}

export function IconHomeGoods({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
    </svg>
  );
}

export function IconHobby({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      {/* Malířská paleta */}
      <path d="M12 3.5c-4.7 0-8.5 3.2-8.5 7.8 0 3.2 2 5.6 5 6.6.4.1.7-.2.7-.6v-1.4c0-1.3 1-2.4 2.3-2.4h2.7c3.4 0 6.3-2.5 6.3-5.8C20.5 5.4 16.7 3.5 12 3.5z" />
      <circle cx="8.2" cy="9" r="1" />
      <circle cx="11.5" cy="7.2" r="1" />
      <circle cx="15.2" cy="8.5" r="1" />
      <circle cx="12.8" cy="11.5" r="1" />
      {/* Štětec */}
      <path d="M16.5 14.5l3.2 3.2c.5.5.5 1.3 0 1.8l-.2.2c-.5.5-1.3.5-1.8 0l-3.2-3.2" />
      <path d="M15.2 15.8l1.5 1.5" />
    </svg>
  );
}

export function IconBox({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export function IconServices({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-3.3-3.3 2.1-2.1z" />
    </svg>
  );
}

export function IconGroups({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5M14 19c0-1.8 1.3-3.3 3-3.8" />
    </svg>
  );
}

export function IconImagePlaceholder({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" style={style} {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5-5-4 4-2-2-5 5" />
    </svg>
  );
}

export const MARKET_CATEGORY_ICONS = {
  domacnost: IconHomeGoods,
  deti: IconKids,
  naradi: IconTools,
  zahrada: IconGarden,
  sport: IconSport,
  zvirata: IconPets,
  hobby: IconHobby,
  jine: IconBox,
  /** legacy */
  nastroje: IconTools,
  "pro-deti": IconKids,
  ostatni: IconBox,
  akce: IconHobby,
  doprava: IconBox,
  "volny-cas": IconSport,
};

export function MarketCategoryIcon({ id, className = "w-[18px] h-[18px]", style }) {
  const resolved = normalizeThingItemCategory(id) ?? id;
  const Icon = MARKET_CATEGORY_ICONS[resolved] ?? MARKET_CATEGORY_ICONS[id] ?? IconBox;
  return <Icon className={className} style={style} />;
}

/** Alias — půjčovna používá stejné ikony */
export function ThingItemCategoryIcon(props) {
  return <MarketCategoryIcon {...props} />;
}
