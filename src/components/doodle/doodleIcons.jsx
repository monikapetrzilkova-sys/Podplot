import DoodleIcon, { doodleStroke } from "./DoodleIcon.jsx";

const s = doodleStroke;

/* —— Mřížka Sousedé —— */

export function DoodleThingsIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M4.5 9.2c.3-1.1 1.2-2 2.4-2.2h10.2c1.4.1 2.6 1.2 2.8 2.6v8.4c-.2 1.3-1.3 2.3-2.6 2.4H7.1c-1.3-.1-2.4-1.1-2.6-2.4V9.2z"
      />
      <path {...s} d="M8.5 13.5v3.2M12 12.8v4M15.5 13.8v2.8" />
      <path {...s} d="M9 6.5l3-2.2 3 2.3" opacity="0.7" />
    </DoodleIcon>
  );
}

export function DoodleHelpIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M7.5 11.2V8.5a4.5 4.5 0 0 1 9-.3" />
      <path {...s} d="M5.8 11.5h12.4c1.1.1 2 1 2 2.1v5.8c0 1.1-.9 2-2 2H5.8c-1.1 0-2-.9-2-2v-5.8c0-1 .8-1.9 2-2.1z" />
      <path {...s} d="M9.5 15.2c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" />
      <circle {...s} cx="12" cy="8.2" r="1.2" fill="currentColor" stroke="none" opacity="0.5" />
    </DoodleIcon>
  );
}

export function DoodleGroupsIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="8.4" cy="8.2" r="2.6" />
      <circle {...s} cx="15.8" cy="8.4" r="2.4" />
      <path {...s} d="M3.6 19.6c0-2.6 2.1-4.5 4.8-4.5s4.8 1.9 4.8 4.5" />
      <path {...s} d="M11.2 19.6c0-2.5 2-4.3 4.6-4.3s4.6 1.8 4.6 4.3" />
    </DoodleIcon>
  );
}

export function DoodleCalendarIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M4.8 7.5c.2-1.2 1.2-2.1 2.4-2.1h9.6c1.2 0 2.2.9 2.4 2.1v11.2c-.2 1.2-1.2 2.1-2.4 2.1H7.2c-1.2 0-2.2-.9-2.4-2.1V7.5z" />
      <path {...s} d="M4.5 10.5h15" />
      <path {...s} d="M8.2 5.5v3M15.8 5.2v3.2" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" opacity="0.45" />
      <circle cx="12.2" cy="14.2" r="1" fill="currentColor" stroke="none" opacity="0.45" />
      <circle cx="15.5" cy="14" r="1" fill="currentColor" stroke="none" opacity="0.45" />
    </DoodleIcon>
  );
}

/* —— Mřížka Katalog —— */

export function DoodleHomeGardenIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M12 5.5L4.5 11v8.5c0 .8.7 1.5 1.5 1.5h13c.8 0 1.5-.7 1.5-1.5V11L12 5.5z" />
      <path {...s} d="M9.5 20.5v-5.5h5v5.5" />
      <path {...s} d="M15.5 14c1.5-2 2.5-2.8 3.5-2.5-.5 2.2-1.8 3.8-3.5 4.5" opacity="0.75" />
    </DoodleIcon>
  );
}

export function DoodleBeautyIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M12 4.5c2.8 0 5 2.5 5 5.5 0 4-5 9.5-5 9.5S7 14 7 10c0-3 2.2-5.5 5-5.5z" />
      <path {...s} d="M12 8.5v6M9.5 11.5h5" opacity="0.5" />
    </DoodleIcon>
  );
}

export function DoodleFamilyIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="8.6" cy="7.8" r="2.5" />
      <circle {...s} cx="15.8" cy="8" r="2.3" />
      <path {...s} d="M3.8 19.6c0-2.5 2.1-4.4 4.8-4.4s4.8 1.9 4.8 4.4" />
      <path {...s} d="M11.4 19.6c0-2.4 1.9-4.1 4.4-4.1s4.4 1.7 4.4 4.1" />
    </DoodleIcon>
  );
}

export function DoodleOtherIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <rect {...s} x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect {...s} x="13.5" y="4.5" width="6.5" height="6.5" rx="1.2" />
      <rect {...s} x="4.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <path {...s} d="M14 14.5h6M17 11.5v6" />
    </DoodleIcon>
  );
}

export function DoodleAllIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="7.5" cy="7.5" r="2.2" />
      <circle {...s} cx="16.5" cy="7.5" r="2.2" />
      <circle {...s} cx="7.5" cy="16.5" r="2.2" />
      <circle {...s} cx="16.5" cy="16.5" r="2.2" />
      <path {...s} d="M9.8 7.5h4.4M9.8 16.5h4.4M7.5 9.8v4.4M16.5 9.8v4.4" opacity="0.55" />
    </DoodleIcon>
  );
}

/* —— Mřížka Mapa —— */

export function DoodleReportIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M10.4 5L3.6 17.2c-.55 1 .16 2.3 1.32 2.3h14.16c1.16 0 1.87-1.3 1.32-2.3L13.6 5c-.5-.9-1.7-.9-2.2 0z"
      />
      <path {...s} d="M12 9.2v4.4" />
      <circle cx="12" cy="16.6" r="0.95" fill="currentColor" stroke="none" />
    </DoodleIcon>
  );
}

export function DoodleMapPinIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M12 3.5c-3.2 0-5.8 2.6-5.8 5.8 0 4.2 5.8 10.2 5.8 10.2s5.8-6 5.8-10.2c0-3.2-2.6-5.8-5.8-5.8z"
      />
      <circle {...s} cx="12" cy="9.2" r="2.2" />
    </DoodleIcon>
  );
}

/* —— Přepínač lokality (Domov / Práce / Chata) —— */

export function DoodleLocHomeIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M4.5 11.2L12 5.2l7.5 6" />
      <path {...s} d="M6.5 10.5V19c0 .8.7 1.5 1.5 1.5h8c.8 0 1.5-.7 1.5-1.5v-8.5" />
      <path {...s} d="M10 20.5v-5h4v5" />
      <path {...s} d="M15.5 9.2V6.8h2.2" opacity="0.55" />
    </DoodleIcon>
  );
}

export function DoodleLocWorkIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M4.5 9.5c.2-1 1-1.8 2-1.8h11c1 0 1.8.8 2 1.8v8.2c-.2 1.1-1.1 1.9-2.2 1.9H6.7c-1.1 0-2-.8-2.2-1.9V9.5z"
      />
      <path {...s} d="M9 7.7V6.2c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6v1.5" />
      <path {...s} d="M4.5 12.5h15" />
      <path {...s} d="M11 12.5v2.2h2v-2.2" opacity="0.7" />
    </DoodleIcon>
  );
}

export function DoodleLocCabinIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M5 13.5L12 6.5l7 7" />
      <path {...s} d="M7 12.2v7.3h10v-7.3" />
      <path {...s} d="M10.5 19.5v-3.5h3v3.5" />
      <path {...s} d="M16.5 8.5c1.2-1.8 2.2-2.5 3.2-2.2-.4 1.8-1.5 3.2-3 4" opacity="0.7" />
      <path {...s} d="M17.8 6.8v3.5" opacity="0.55" />
    </DoodleIcon>
  );
}

/** Výběr místa na mapě — doodle cíl (bullseye) se šipkou */
export function DoodleTargetIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      {/* vnější kruh — mírně organický */}
      <path
        {...s}
        d="M12 4.2c4.2.1 7.6 3.4 7.7 7.5-.1 4.3-3.5 7.8-7.8 7.9-4.2-.2-7.5-3.6-7.6-7.8C4.4 7.6 7.7 4.3 12 4.2z"
      />
      {/* vnitřní kruh */}
      <circle {...s} cx="12" cy="12" r="3.6" />
      {/* střed */}
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      {/* krátké rysky jako u terče */}
      <path {...s} d="M12 4.8v1.6M12 17.6v1.6M4.8 12h1.6M17.6 12h1.6" opacity="0.55" />
      {/* šipka mířící do středu */}
      <path {...s} d="M18.6 5.4l-4.8 4.8" />
      <path {...s} d="M14.2 5.6l4.4-.4-.2 4.3" />
    </DoodleIcon>
  );
}

/* —— Profil —— */

export function DoodleHeartIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M12 20.2S4.5 15.2 4.5 9.8c0-2.8 2.1-4.8 4.6-4.8 1.6 0 3 .9 3.9 2.2.9-1.3 2.3-2.2 3.9-2.2 2.5 0 4.6 2 4.6 4.8 0 5.4-7.5 10.4-7.5 10.4z"
      />
    </DoodleIcon>
  );
}

export function DoodleBellIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M12 4.5c.4 0 .8.1 1.1.3" opacity="0.55" />
      <path
        {...s}
        d="M7.2 10.2c0-2.6 2-4.8 4.8-4.8s4.8 2.2 4.8 4.8c0 3.2.8 4.2 1.4 5.2H5.8c.6-1 1.4-2 1.4-5.2z"
      />
      <path {...s} d="M10.2 18.2c.5.9 1.3 1.4 2.3 1.4s1.8-.5 2.3-1.4" />
      <path {...s} d="M12 3.8v1.2" />
    </DoodleIcon>
  );
}

export function DoodleTrustIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="8.2" cy="8" r="2.4" />
      <circle {...s} cx="15.8" cy="8.2" r="2.4" />
      <path {...s} d="M3.8 18.5c0-2.6 2-4.4 4.4-4.4s4.4 1.8 4.4 4.4" />
      <path {...s} d="M11.4 18.5c0-2.2 1.8-3.8 4.2-3.8s4.2 1.6 4.2 3.8" />
      <path {...s} d="M10.2 12.8l1.4 1.4 2.6-2.8" opacity="0.85" />
    </DoodleIcon>
  );
}

export function DoodleNameTagIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="9" cy="8.5" r="2.6" />
      <path {...s} d="M4.5 18.5c0-2.6 2-4.5 4.5-4.5s4.5 1.9 4.5 4.5" />
      <path {...s} d="M14.2 8.2h5.5c.7 0 1.2.5 1.2 1.2v5.2c0 .7-.5 1.2-1.2 1.2h-5.2" />
      <path {...s} d="M15.5 11h3.2M15.5 13.2h2.2" opacity="0.65" />
    </DoodleIcon>
  );
}

export function DoodleSettingsIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M10.2 3h3.6l.5 2.1 1.9-.6 1.8 3.1-1.6 1.2.5 2.1h2.1v3.6h-2.1l-.5 2.1 1.6 1.2-1.8 3.1-1.9-.6-.5 2.1h-3.6l-.5-2.1-1.9.6-1.8-3.1 1.6-1.2-.5-2.1H4.5V9.8h2.1l.5-2.1-1.6-1.2 1.8-3.1 1.9.6.5-2.1z"
      />
      <circle {...s} cx="12" cy="12" r="2.6" />
    </DoodleIcon>
  );
}

export function DoodleSportIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="12" cy="12" r="7.5" />
      <path {...s} d="M12 4.5c2.2 2.8 2.2 12.2 0 15M12 4.5c-2.2 2.8-2.2 12.2 0 15" />
      <path {...s} d="M4.8 12h14.4" />
    </DoodleIcon>
  );
}

export function DoodleCultureIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M5 18.5h14" />
      <path {...s} d="M8 18.5V10.2l4-3.2 4 3.2v8.3" />
      <path {...s} d="M12 7v3.2" />
      <path {...s} d="M9.2 13.5c.8.9 1.7 1.3 2.8 1.3s2-.4 2.8-1.3" opacity="0.65" />
    </DoodleIcon>
  );
}

export function DoodleCardIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M4.5 8.2c.2-1 1-1.8 2-1.8h11c1 0 1.8.8 2 1.8v7.6c-.2 1-1 1.8-2 1.8H6.5c-1 0-1.8-.8-2-1.8V8.2z"
      />
      <path {...s} d="M4.5 11h15" />
      <path {...s} d="M7.5 15h4" opacity="0.7" />
    </DoodleIcon>
  );
}

export function DoodleCarIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M5 14.5h14l-1.2-4.2c-.3-1-1.2-1.7-2.2-1.7H8.4c-1 0-1.9.7-2.2 1.7L5 14.5z" />
      <path {...s} d="M4.5 14.5h15v2.2c0 .7-.5 1.2-1.2 1.2H5.7c-.7 0-1.2-.5-1.2-1.2v-2.2z" />
      <circle {...s} cx="8" cy="17.8" r="1.2" />
      <circle {...s} cx="16" cy="17.8" r="1.2" />
      <path {...s} d="M9 10.2l1.2-2.2h3.6L15 10.2" opacity="0.65" />
    </DoodleIcon>
  );
}

export function DoodleMegaphoneIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M5.5 11.2h3.2l8.8-4.2v10.2L8.7 13H5.5c-.6 0-1.1-.5-1.1-1.1v-.6c0-.6.5-1.1 1.1-1.1z" />
      <path {...s} d="M8.5 13.2v3.2c0 .7.5 1.2 1.2 1.2h.8" />
      <path {...s} d="M18.8 9.2c.7.8 1.1 1.8 1.1 2.8s-.4 2-1.1 2.8" opacity="0.6" />
    </DoodleIcon>
  );
}

/** Push poptávek — zvonek s vlnami */
export function DoodlePushIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M7.2 10.2c0-2.6 2-4.8 4.8-4.8s4.8 2.2 4.8 4.8c0 3.2.8 4.2 1.4 5.2H5.8c.6-1 1.4-2 1.4-5.2z"
      />
      <path {...s} d="M10.2 18.2c.5.9 1.3 1.4 2.3 1.4s1.8-.5 2.3-1.4" />
      <path {...s} d="M12 3.8v1.2" />
      <path {...s} d="M17.8 7.2c.9.9 1.4 2 1.4 3.2" opacity="0.55" />
      <path {...s} d="M19.5 5.8c1.2 1.2 1.9 2.8 1.9 4.5" opacity="0.4" />
    </DoodleIcon>
  );
}

/** Banner Promo — proužek / štítek */
export function DoodleBannerIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M4.2 8.5c.2-1 1-1.7 2-1.7h11.6c1 0 1.8.7 2 1.7v7c-.2 1-1 1.7-2 1.7H6.2c-1 0-1.8-.7-2-1.7v-7z"
      />
      <path {...s} d="M7 11.2h10M7 13.8h6.5" opacity="0.65" />
      <path {...s} d="M4.2 8.8h15.6" />
      <circle cx="17.2" cy="15.2" r="0.9" fill="currentColor" stroke="none" opacity="0.5" />
    </DoodleIcon>
  );
}

/** Topování katalogu — seznam se šipkou nahoru */
export function DoodleCatalogBoostIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M5 6.5c.2-.9.9-1.5 1.8-1.5h10.4c.9 0 1.6.6 1.8 1.5v11c-.2.9-.9 1.5-1.8 1.5H6.8c-.9 0-1.6-.6-1.8-1.5v-11z"
      />
      <path {...s} d="M8 14.5h5M8 16.8h3.5" opacity="0.55" />
      <path {...s} d="M12 12.2V7.5M9.8 9.2L12 7l2.2 2.2" />
    </DoodleIcon>
  );
}

/** Plná kapacita — nepřijímá zakázky (kruh se šikmým přeškrtnutím) */
export function DoodleCapacityFullIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="12" cy="12" r="8.2" />
      <path {...s} d="M7.2 7.2l9.6 9.6" />
      <path {...s} d="M9.5 14.5h5" opacity="0.55" />
    </DoodleIcon>
  );
}

export function DoodleWalletIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M4.8 8.5c.2-1.1 1.1-1.9 2.2-1.9h10c1.1 0 2 .8 2.2 1.9v8c-.2 1.1-1.1 1.9-2.2 1.9H7c-1.1 0-2-.8-2.2-1.9v-8z"
      />
      <path {...s} d="M14.5 13h4.7c.6 0 1.1.5 1.1 1.1v1.2c0 .6-.5 1.1-1.1 1.1H14.5" />
      <circle cx="16.8" cy="14.8" r="0.9" fill="currentColor" stroke="none" opacity="0.55" />
      <path {...s} d="M7.5 6.6V5.8c0-.7.5-1.2 1.2-1.2h6.6c.7 0 1.2.5 1.2 1.2v.8" opacity="0.55" />
    </DoodleIcon>
  );
}

/** Žárovka — tip / užitečné (monochromatický doodle) */
export function DoodleBulbIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M12 3.8c-3.1 0-5.5 2.5-5.5 5.5 0 2.1 1.1 3.9 2.8 4.9V16c0 .7.5 1.2 1.2 1.2h3c.7 0 1.2-.5 1.2-1.2v-1.8c1.7-1 2.8-2.8 2.8-4.9 0-3-2.4-5.5-5.5-5.5z"
      />
      <path {...s} d="M10 19.2h4M10.8 21.2h2.4" />
      <path {...s} d="M10.5 13.2h3" opacity="0.55" />
    </DoodleIcon>
  );
}

/* —— Typy profilů (Soused / Úřad / Provozovna / Mobilní služba) —— */

export function DoodleSousedIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M4.5 11.2L12 5.2l7.5 6" />
      <path {...s} d="M6.5 10.5V19c0 .8.7 1.5 1.5 1.5h8c.8 0 1.5-.7 1.5-1.5v-8.5" />
      <path {...s} d="M10 20.5v-5h4v5" />
      <circle {...s} cx="16.2" cy="8.2" r="1.6" opacity="0.55" />
      <path {...s} d="M14.8 12.2c0-1.1.9-1.8 1.4-1.8s1.4.7 1.4 1.8" opacity="0.55" />
    </DoodleIcon>
  );
}

export function DoodleUradIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M5 20.5h14" />
      <path {...s} d="M6.5 20.5V10.5M10 20.5V10.5M14 20.5V10.5M17.5 20.5V10.5" />
      <path {...s} d="M4.5 10.5h15" />
      <path {...s} d="M12 3.8L4.8 9.2h14.4L12 3.8z" />
      <path {...s} d="M12 5.5v2.2" opacity="0.55" />
    </DoodleIcon>
  );
}

export function DoodlePodnikIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M5 10.5V20c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-9.5" />
      <path {...s} d="M4.5 10.5l1.2-4.2c.2-.6.7-1 1.3-1h10c.6 0 1.1.4 1.3 1l1.2 4.2" />
      <path {...s} d="M4.5 10.5h15" />
      <path {...s} d="M8 10.5v-2M12 10.5v-2.5M16 10.5v-2" opacity="0.55" />
      <path {...s} d="M10 21v-5h4v5" />
    </DoodleIcon>
  );
}

export function DoodleCraftIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M14.8 4.8c1.8-.2 3.4.4 4.4 1.6l-2.6 2.6c-.4.4-.4 1 0 1.4l1.2 1.2c.4.4 1 .4 1.4 0l2.6-2.6c1.1 1 1.7 2.6 1.5 4.3-.3 2.2-2 4-4.2 4.4-1.2.2-2.4 0-3.4-.6L8.2 20.5c-.8.8-2 .8-2.8 0l-.9-.9c-.8-.8-.8-2 0-2.8l7.5-7.5c-.6-1-.8-2.2-.6-3.4.3-1.6 1.4-2.9 2.8-3.5z"
      />
      <path {...s} d="M6.2 16.8l1.8 1.8" opacity="0.6" />
    </DoodleIcon>
  );
}

export function DoodlePaintBrushIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M7.2 16.8c1.2 1.4 3.2 1.6 4.4.4l7.2-7.2c.8-.8.8-2 0-2.8l-1.2-1.2c-.8-.8-2-.8-2.8 0l-7.2 7.2c-1.2 1.2-1 3.2.4 4.4z" />
      <path {...s} d="M14.2 7.2l2.6 2.6" />
      <path {...s} d="M5.5 18.5c.8.2 1.6-.2 2-.9" opacity="0.7" />
    </DoodleIcon>
  );
}

export function DoodleSawIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M4.5 16.5L16 5l3.5 3.5-11.5 11.5H4.5v-3.5z" />
      <path {...s} d="M8 16l1.2-1.2M10.2 13.8l1.2-1.2M12.4 11.6l1.2-1.2M14.6 9.4l1.2-1.2" opacity="0.65" />
    </DoodleIcon>
  );
}

export function DoodleBroomIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M12.5 3.8v9.2" />
      <path {...s} d="M7 13.2h10.5c.2 2.4-1.6 5-5.2 6.5-3.6-1.5-5.5-4.1-5.3-6.5z" />
      <path {...s} d="M9.2 15.2v3.2M12.2 15.5v3.6M15.2 15.2v3.2" opacity="0.55" />
    </DoodleIcon>
  );
}

export function DoodleScalesIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M12 4.5v15" />
      <path {...s} d="M8.5 19.5h7" />
      <path {...s} d="M5.5 8.5h13" />
      <path {...s} d="M7.5 8.5l-2.5 5.5h5L7.5 8.5z" />
      <path {...s} d="M16.5 8.5l-2.5 5.5h5L16.5 8.5z" />
    </DoodleIcon>
  );
}

export function DoodleScissorsIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="7.2" cy="7.2" r="2.4" />
      <circle {...s} cx="7.2" cy="16.8" r="2.4" />
      <path {...s} d="M9.2 8.6L19 16.2M9.2 15.4L19 7.8" />
    </DoodleIcon>
  );
}

export function DoodleSpaIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M12 5.2c1.8 2.2 3.8 3.6 5.8 4.2-2 .6-4 2-5.8 4.2-1.8-2.2-3.8-3.6-5.8-4.2 2-.6 4-2 5.8-4.2z" />
      <path {...s} d="M7.5 15.5c1.4.8 2.9 1.3 4.5 1.3s3.1-.5 4.5-1.3" opacity="0.7" />
      <path {...s} d="M9 18.5h6" opacity="0.55" />
    </DoodleIcon>
  );
}

export function DoodleCheckIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="12" cy="12" r="8.2" />
      <path {...s} d="M7.8 12.2l2.8 2.8 5.6-5.8" />
    </DoodleIcon>
  );
}

/** Účast na akci — postava + fajfka (místo hvězdy) */
export function DoodleJoinIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="9.2" cy="8" r="2.6" />
      <path {...s} d="M4.2 18.5c0-2.8 2.1-4.8 5-4.8s5 2 5 4.8" />
      <path {...s} d="M14.2 10.2l2.2 2.2 4-4.2" />
    </DoodleIcon>
  );
}

/** Daruji — dárková krabička */
export function DoodleGiveIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M6 10.5h12v8.2c0 .7-.5 1.3-1.2 1.3H7.2c-.7 0-1.2-.6-1.2-1.3V10.5z" />
      <path {...s} d="M5.5 7.8h13v2.7H5.5z" />
      <path {...s} d="M12 7.8v12.2" opacity="0.75" />
      <path {...s} d="M9.2 5.8c0-1.2.8-2 1.6-2 .7 0 1.2.5 1.2 1.2 0 .9-.8 1.6-1.6 2.8" />
      <path {...s} d="M14.8 5.8c0-1.2-.8-2-1.6-2-.7 0-1.2.5-1.2 1.2 0 .9.8 1.6 1.6 2.8" />
    </DoodleIcon>
  );
}

/** Prodám — cedulka s cenou */
/** Prodám — nákupní taška */
export function DoodleSellIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M6.2 9.5h11.6c.7 0 1.2.6 1.1 1.3l-1 8.2c-.1.8-.8 1.4-1.6 1.4H7.7c-.8 0-1.5-.6-1.6-1.4l-1-8.2c-.1-.7.4-1.3 1.1-1.3z"
      />
      <path {...s} d="M9 9.5V7.8c0-1.6 1.3-2.9 2.9-2.9h.2c1.6 0 2.9 1.3 2.9 2.9v1.7" />
      <circle {...s} cx="12" cy="14.2" r="1.6" />
    </DoodleIcon>
  );
}

/** Sháním — lupa nad krabičkou */
export function DoodleWantIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <rect {...s} x="4.5" y="11.5" width="9.5" height="7" rx="1.2" />
      <path {...s} d="M7 11.5v-1.5c0-1.2 1-2.2 2.2-2.2h.6c1.2 0 2.2 1 2.2 2.2v1.5" opacity="0.75" />
      <circle {...s} cx="16.2" cy="9.2" r="3.2" />
      <path {...s} d="M18.5 11.5L21 14" />
    </DoodleIcon>
  );
}

/** Půjčovna — výměna / šipky */
export function DoodleLendIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M7.5 9.5H16l-2.2-2.2" />
      <path {...s} d="M16.5 14.5H8l2.2 2.2" />
      <path {...s} d="M6.5 12.2c0-3 2.4-5.4 5.4-5.4" opacity="0.55" />
      <path {...s} d="M17.5 11.8c0 3-2.4 5.4-5.4 5.4" opacity="0.55" />
    </DoodleIcon>
  );
}

/** Tlapka — zvíře (sdílená geometrie pro feed, Okolí i mapové špendlíky) */
export const DOODLE_PAW_PATHS = {
  toes: [
    { cx: 7.2, cy: 7.5, rx: 2.1, ry: 2.5 },
    { cx: 12, cy: 5.8, rx: 2.2, ry: 2.6 },
    { cx: 16.8, cy: 7.5, rx: 2.1, ry: 2.5 },
  ],
  pad: "M8.2 12.2c-1.2 0-2.8 1.1-2.8 3.2 0 2.6 2.2 4.6 6.6 4.6s6.6-2 6.6-4.6c0-2.1-1.6-3.2-2.8-3.2-1.1 0-2 .8-3.8.8s-2.7-.8-3.8-.8z",
};

export function doodlePawSvgInner() {
  const toes = DOODLE_PAW_PATHS.toes
    .map((t) => `<ellipse cx="${t.cx}" cy="${t.cy}" rx="${t.rx}" ry="${t.ry}"/>`)
    .join("");
  return `${toes}<path d="${DOODLE_PAW_PATHS.pad}"/>`;
}

export function DoodlePawIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      {DOODLE_PAW_PATHS.toes.map((t) => (
        <ellipse key={`${t.cx}-${t.cy}`} {...s} cx={t.cx} cy={t.cy} rx={t.rx} ry={t.ry} />
      ))}
      <path {...s} d={DOODLE_PAW_PATHS.pad} />
    </DoodleIcon>
  );
}

/** Nářadí — půjčovna (kladivo a klíč) */
export function DoodleToolsIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M3.2 5.4h6.2c.5 0 .8.4.8.8v2.2c0 .5-.3.8-.8.8H5.4L3 7.8c-.5-.4-.4-1.2.2-1.5z"
      />
      <path {...s} d="M6.4 9.2v11" />
      <path {...s} d="M14.6 7.4c0-2.2 1.6-3.6 3.4-3.6s3.4 1.4 3.4 3.6" />
      <path {...s} d="M16.4 7.2c0-1.1.8-1.8 1.6-1.8s1.6.7 1.6 1.8" />
      <path {...s} d="M18 7.4v12.8" />
    </DoodleIcon>
  );
}

/** Alias — dřív vozík, teď stejné nářadí jako DoodleToolsIcon */
export function DoodleCartIcon({ className }) {
  return <DoodleToolsIcon className={className} />;
}

/** Otazník — jiné / nezařazené */
export function DoodleQuestionIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="12" cy="12" r="8.2" />
      <path {...s} d="M9.8 9.2c.4-1.5 1.5-2.4 3-2.4 1.6 0 2.8 1 2.8 2.5 0 1.4-1 2-1.9 2.5-.8.4-1.2.9-1.2 1.8" />
      <circle cx="12.2" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </DoodleIcon>
  );
}

export function DoodleSearchIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="10.5" cy="10.5" r="5.8" />
      <path {...s} d="M15.2 15.2L20 20" />
    </DoodleIcon>
  );
}

export function DoodleCameraIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M4.5 8.5c.2-1 1-1.8 2-1.9h2.2l1.2-1.8h4.2l1.2 1.8h2.2c1 .1 1.8.9 2 1.9v8.2c-.2 1.1-1.1 1.9-2.2 2H6.7c-1.1-.1-2-.9-2.2-2V8.5z" />
      <circle {...s} cx="12" cy="13" r="3.2" />
    </DoodleIcon>
  );
}

export function DoodleChatIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M5 6.5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2H10l-4 3.2V15.5H7c-1.1 0-2-.9-2-2v-7z" />
      <path {...s} d="M8.5 10h7M8.5 12.5h4.5" opacity="0.55" />
    </DoodleIcon>
  );
}

export function DoodleStarIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path
        {...s}
        d="M12 4.2l1.9 4.2 4.6.5-3.4 3.1.9 4.5L12 14.6 8 16.5l.9-4.5-3.4-3.1 4.6-.5L12 4.2z"
      />
    </DoodleIcon>
  );
}

export function DoodleBoltIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M13.5 3.5L6.5 13h5l-1 7.5 7-9.5h-5l1-7.5z" />
    </DoodleIcon>
  );
}

export function DoodlePackageIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M4.5 8.2L12 4.2l7.5 4v8.2L12 20.2 4.5 16.4V8.2z" />
      <path {...s} d="M4.5 8.2L12 12.2l7.5-4M12 12.2V20.2" />
    </DoodleIcon>
  );
}

export function DoodleHandIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M8.5 11.5V7.2c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v3.2" />
      <path {...s} d="M11.3 10.8V6.5c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v4.8" />
      <path {...s} d="M14.1 11V7.8c0-.8.6-1.4 1.4-1.4s1.4.6 1.4 1.4v5.5" />
      <path {...s} d="M7.2 12.2V10c0-.7.5-1.2 1.2-1.2" />
      <path {...s} d="M7.2 12.2c0 0-1.2 1-1.2 3.2 0 3.2 2.8 5.3 6 5.3s6-2 6-5.3V12" />
    </DoodleIcon>
  );
}

export function DoodlePersonIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="12" cy="8" r="3" />
      <path {...s} d="M5.5 19.5c0-3.2 2.8-5.5 6.5-5.5s6.5 2.3 6.5 5.5" />
    </DoodleIcon>
  );
}

/** Dva kompletní sousedé — výpomoc / požádat o pomoc */
export function DoodlePairIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <circle {...s} cx="8.2" cy="7.4" r="2.5" />
      <circle {...s} cx="15.8" cy="7.6" r="2.5" />
      <path {...s} d="M3.6 19.6c0-2.6 2-4.5 4.6-4.5s4.6 1.9 4.6 4.5" />
      <path {...s} d="M11.2 19.6c0-2.6 2-4.5 4.6-4.5s4.6 1.9 4.6 4.5" />
    </DoodleIcon>
  );
}

/** Nota — kroužek / lekce */
export function DoodleLessonIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <ellipse
        cx="7"
        cy="16.8"
        rx="3.1"
        ry="2.25"
        transform="rotate(-22 7 16.8)"
        fill="currentColor"
        stroke="none"
      />
      <ellipse
        cx="15.6"
        cy="15.2"
        rx="3.1"
        ry="2.25"
        transform="rotate(-22 15.6 15.2)"
        fill="currentColor"
        stroke="none"
      />
      <path {...s} d="M9.8 15.8V6.2" />
      <path {...s} d="M18.4 14.2V4.8" />
      <path {...s} d="M9.8 6.2L18.4 4.8" />
    </DoodleIcon>
  );
}

export function DoodleListIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M8.5 7h11M8.5 12h11M8.5 17h11" />
      <circle cx="5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="17" r="1.1" fill="currentColor" stroke="none" />
    </DoodleIcon>
  );
}

export function DoodleGastroIcon({ className }) {
  return (
    <DoodleIcon className={className}>
      <path {...s} d="M7 4.5v7.5M10 4.5v7.5M4.5 12h8.5" />
      <path {...s} d="M8.5 12v7.5" />
      <path {...s} d="M15 5.5c1.8 0 3 1.4 3 3.2V20" />
      <path {...s} d="M15 8.7h3" opacity="0.55" />
    </DoodleIcon>
  );
}

/* —— Mapy ikon pro mřížky —— */

export const INTEREST_DOODLE_ICONS = {
  rodina: DoodleFamilyIcon,
  sport: DoodleSportIcon,
  zahrada: DoodleHomeGardenIcon,
  kultura: DoodleCultureIcon,
};

export const PROFILE_DOODLE_ICONS = {
  nameTag: DoodleNameTagIcon,
  places: DoodleMapPinIcon,
  interests: DoodleHeartIcon,
  alerts: DoodleBellIcon,
  trust: DoodleTrustIcon,
  wallet: DoodleWalletIcon,
  card: DoodleCardIcon,
  car: DoodleCarIcon,
  promote: DoodleMegaphoneIcon,
  groups: DoodleGroupsIcon,
  settings: DoodleSettingsIcon,
};

/** Propagace — push / banner / topování katalogu */
export const PROMO_DOODLE_ICONS = {
  push: DoodlePushIcon,
  banner: DoodleBannerIcon,
  catalog: DoodleCatalogBoostIcon,
};

/** Typy účtů — Soused / Úřad / Podnik */
export const ACCOUNT_TYPE_DOODLE_ICONS = {
  soused: DoodleSousedIcon,
  urad: DoodleUradIcon,
  podnik: DoodlePodnikIcon,
};

/** Testovací / přepínatelné profily (včetně podtypů podniku) */
export const ROLE_DOODLE_ICONS = {
  soused: DoodleSousedIcon,
  urad: DoodleUradIcon,
  podnik: DoodlePodnikIcon,
  remeslnik: DoodleCraftIcon,
  podnik_fyzicka: DoodlePodnikIcon,
  podnik_mobilni: DoodleCraftIcon,
};

export const BUSINESS_SUBTYPE_DOODLE_ICONS = {
  fyzicka: DoodlePodnikIcon,
  mobilni: DoodleCraftIcon,
};

export const NEIGHBOR_DOODLE_ICONS = {
  veci: DoodleThingsIcon,
  vypomoc: DoodleHelpIcon,
  skupiny: DoodleGroupsIcon,
  akce: DoodleCalendarIcon,
};

export const CATALOG_DOODLE_ICONS = {
  vse: DoodleAllIcon,
  "domov-zahrada": DoodleHomeGardenIcon,
  "pece-krasa": DoodleBeautyIcon,
  "deti-rodina": DoodleFamilyIcon,
  ostatni: DoodleOtherIcon,
};

export const MAP_DOODLE_ICONS = {
  reports: DoodleReportIcon,
  places: DoodleMapPinIcon,
};

/** Agenda úřadu — Hlášení / Akce */
export const AGENDA_DOODLE_ICONS = {
  prompts: DoodleReportIcon,
  events: DoodleCalendarIcon,
};

export const LOCATION_DOODLE_ICONS = {
  domov: DoodleLocHomeIcon,
  prace: DoodleLocWorkIcon,
  chata: DoodleLocCabinIcon,
};

/** Zaměření služeb (registrace / katalog) — monochromatické doodle */
export const SERVICE_CATEGORY_DOODLE_ICONS = {
  instalater: DoodleCraftIcon,
  elektrikar: DoodleBoltIcon,
  malir: DoodlePaintBrushIcon,
  truhlar: DoodleSawIcon,
  klempir: DoodleHomeGardenIcon,
  it: DoodleCardIcon,
  auto: DoodleCarIcon,
  fotograf: DoodleCameraIcon,
  pravo: DoodleScalesIcon,
  ucetni: DoodleListIcon,
  zahrada: DoodleHomeGardenIcon,
  veterinar: DoodlePawIcon,
  uklid: DoodleBroomIcon,
  gastro: DoodleCalendarIcon,
  event: DoodleCalendarIcon,
  doucovani: DoodleFamilyIcon,
  hlidani: DoodleFamilyIcon,
  preklad: DoodleChatIcon,
  beauty: DoodleBeautyIcon,
  kadernictvi: DoodleScissorsIcon,
  masaz: DoodleSpaIcon,
  fitness: DoodleSportIcon,
  ostatni: DoodleListIcon,
};

export const SERVICE_PARENT_DOODLE_ICONS = {
  vse: DoodleAllIcon,
  remeslo: DoodleCraftIcon,
  zahrada: DoodleHomeGardenIcon,
  uklid: DoodleHomeGardenIcon,
  doucovani: DoodleFamilyIcon,
  krasa: DoodleBeautyIcon,
};

/** Typy nabídky Věci — Vše / Daruji / Prodám / Sháním / Půjčovna */
export const VECI_TYPE_DOODLE_ICONS = {
  vse: DoodleAllIcon,
  daruji: DoodleGiveIcon,
  prodam: DoodleSellIcon,
  shanim: DoodleWantIcon,
  pujcovna: DoodleToolsIcon,
};

/** Filtry Výpomoc — Vše / Hledám / Nabízím */
export const VYPOMOC_FILTER_DOODLE_ICONS = {
  vse: DoodleAllIcon,
  hledam: DoodleWantIcon,
  nabizim: DoodleHandIcon,
};

/** Filtry Skupiny */
export const SKUPINY_FILTER_DOODLE_ICONS = {
  vse: DoodleGroupsIcon,
  moje: DoodlePersonIcon,
};
