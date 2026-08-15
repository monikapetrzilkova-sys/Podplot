/** Hlavní kmenové kategorie skupin (bez Pomoci — ta žije ve Výpomoci) */

export const CLUB_CATEGORIES = [
  { id: "deti", label: "Děti a rodina", shortLabel: "Děti" },
  { id: "sport", label: "Sport a pohyb", shortLabel: "Sport" },
  { id: "dum", label: "Dům a zahrada", shortLabel: "Dům" },
  { id: "hobby", label: "Volný čas / Hobby", shortLabel: "Hobby" },
];

export const CLUB_VOTES_REQUIRED = 5;

export function getClubCategory(id) {
  return CLUB_CATEGORIES.find((c) => c.id === id);
}
