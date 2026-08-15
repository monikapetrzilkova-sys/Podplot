/** Monochromatický doodle kurzor — cíl (bullseye) pro výběr místa na mapě */
export const MAP_PICK_CURSOR_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' fill='none'%3E%3Cpath d='M16 5.2c5.6.1 10.1 4.5 10.2 10-.1 5.7-4.7 10.4-10.4 10.5-5.6-.2-10-4.8-10.1-10.4C5.8 9.7 10.2 5.3 16 5.2z' stroke='%231B4332' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='16' cy='16' r='4.8' stroke='%231B4332' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='1.6' fill='%231B4332'/%3E%3Cpath d='M16 6v2.2M16 23.8V26M6 16h2.2M23.8 16H26' stroke='%231B4332' stroke-width='1.7' stroke-linecap='round' opacity='.55'/%3E%3Cpath d='M25 7l-6.4 6.4' stroke='%231B4332' stroke-width='2.1' stroke-linecap='round'/%3E%3Cpath d='M19.2 7.2l5.8-.5-.3 5.7' stroke='%231B4332' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

/** CSS / Google Maps hodnota kurzoru (hotspot ve středu cíle) */
export const MAP_PICK_CURSOR = `url("${MAP_PICK_CURSOR_URL}") 16 16, crosshair`;
