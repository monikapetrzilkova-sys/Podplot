/** Monochromatické line-art ikony pro mřížku Průvodce */

const iconClass = "w-5 h-5";

export function IconGuideGastro({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 11h16M6 11V4h3v7M11 11V4h3v7M16 11V4h2v7" />
      <path d="M4 11v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2" />
    </svg>
  );
}

export function IconGuideShop({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3 3 8v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8l-3-5H6z" />
      <path d="M3 8h18" />
      <path d="M16 12a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function IconGuideHealth({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M12 10v6M9 13h6" />
    </svg>
  );
}

export function IconGuideInstitution({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 9h1M14 9h1M9 13h1M14 13h1" />
    </svg>
  );
}

export function IconGuidePublicSpace({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3c-3 2-6 4-6 8a6 6 0 0 0 12 0c0-4-3-6-6-8z" />
      <path d="M8 21h8M10 17h4" />
    </svg>
  );
}

export function IconGuideCraftsman({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
      <path d="M19 14l2 2" />
    </svg>
  );
}

export function IconGuideServices({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9h18v12H3z" />
      <path d="M3 9l2-5h14l2 5" />
      <path d="M9 14h6" />
    </svg>
  );
}

export function IconGuideOther({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGuideAll({ className = iconClass }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const GUIDE_ICON_BY_ID = {
  vse: IconGuideAll,
  gastro: IconGuideGastro,
  obchody: IconGuideShop,
  sluzby: IconGuideServices,
  zdravi: IconGuideHealth,
  instituce: IconGuideInstitution,
  "verejny-prostor": IconGuidePublicSpace,
  remeslnici: IconGuideCraftsman,
  ostatni: IconGuideOther,
};

export function GuideCategoryIcon({ id, className }) {
  const Icon = GUIDE_ICON_BY_ID[id];
  if (!Icon) return null;
  return <Icon className={className} />;
}

/* —— Sub-filtry Průvodce —— */

const subS = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };

/** Kadeřnické nůžky — Péče a krása */
export function IconProvozovnaBeauty({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <path d="M8.2 8.5 20 19M8.2 15.5 20 5" />
    </svg>
  );
}

/** Auto */
export function IconProvozovnaCar({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <path d="M4 14h16l-1.2-4.2A2 2 0 0 0 16.9 8H7.1a2 2 0 0 0-1.9 1.8L4 14z" />
      <path d="M4 14v3.5h2.2M20 14v3.5h-2.2" />
      <circle cx="7.5" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
      <path d="M9 8.2l1.2-2.2h3.6L15 8.2" />
    </svg>
  );
}

export function IconProvozovnaCarWash({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <path d="M3 11h18l-1-4H4l-1 4z" />
      <circle cx="7" cy="16" r="2" />
      <circle cx="17" cy="16" r="2" />
      <path d="M12 7V4" />
    </svg>
  );
}

export function IconProvozovnaGarage({ className = "w-3.5 h-3.5" }) {
  return <IconProvozovnaCar className={className} />;
}

/** Klíč */
export function IconProvozovnaKeys({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <circle cx="8" cy="8" r="3" />
      <path d="M11 11l9 9M16 16l3 3M17.5 14.5l2 2" />
    </svg>
  );
}

/** Bankomat */
export function IconProvozovnaAtm({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <rect x="7" y="6.5" width="10" height="5.5" rx="1" />
      <path d="M8 15.5h8M8 18h5" />
    </svg>
  );
}

/** Čistírna / praní — věšák + kapka */
export function IconProvozovnaLaundry({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <path d="M8 5h8" />
      <path d="M12 5v2.5" />
      <path d="M7 8.5h10l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H9.7a1.5 1.5 0 0 1-1.5-1.3L7 8.5z" />
      <path d="M10.5 13.5c0-1.2 1.5-2.8 1.5-2.8s1.5 1.6 1.5 2.8a1.5 1.5 0 0 1-3 0z" />
    </svg>
  );
}

/** Sport — míč */
export function IconProvozovnaSport({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5c2.2 2.8 2.2 12.2 0 15M12 4.5c-2.2 2.8-2.2 12.2 0 15" />
      <path d="M4.8 12h14.4" />
    </svg>
  );
}

export function IconHomeServiceGarden({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <path d="M3 10l9-7 9 7v11H3z" />
      <path d="M12 14v7" />
      <path d="M9 18c0-3 3-5 3-5s3 2 3 5" />
    </svg>
  );
}

export function IconHomeServiceBeauty({ className = "w-3.5 h-3.5" }) {
  return <IconProvozovnaBeauty className={className} />;
}

export function IconHomeServiceFamily({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
    </svg>
  );
}

export function IconGuideSubOther({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...subS}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const PROVOZOVNA_SUB_ICON = {
  krasa: IconProvozovnaBeauty,
  auto: IconProvozovnaCar,
  klicove: IconProvozovnaKeys,
  bankomat: IconProvozovnaAtm,
  cistirna: IconProvozovnaLaundry,
  sport: IconProvozovnaSport,
  automycka: IconProvozovnaCarWash,
  autoservis: IconProvozovnaCar,
  ostatni: IconGuideSubOther,
};

const HOME_SERVICE_SUB_ICON = {
  "domov-zahrada": IconHomeServiceGarden,
  "pece-krasa": IconHomeServiceBeauty,
  "deti-rodina": IconHomeServiceFamily,
  ostatni: IconGuideSubOther,
};

export function GuideSubFilterIcon({ group, id, active, className = "w-3 h-3 shrink-0" }) {
  const map = group === "provozovny" ? PROVOZOVNA_SUB_ICON : HOME_SERVICE_SUB_ICON;
  const Icon = map[id] ?? IconGuideSubOther;
  return <Icon className={`${className} ${active ? "text-white" : "text-[#64A08D]"}`} />;
}
