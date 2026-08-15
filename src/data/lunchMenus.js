/** Polední menu — freemium publikace pro podniky */

export const LUNCH_PUBLISH_PLANS = {
  free: { id: "free", label: "Základní publikace (ZDARMA)", price: 0, push: false, top: false },
  push: { id: "push", label: "Push sousedům se zájmem o polední menu", price: 19, push: true, top: false },
  top: { id: "top", label: "Topovat menu na první pozici dne", price: 49, push: false, top: true },
};

export const LUNCH_MENUS = [
  {
    id: "lm1",
    businessId: "sp1",
    businessName: "Restaurace U Ráje",
    emoji: "🍽️",
    locationId: "domov",
    lat: 49.967,
    lng: 14.51,
    distanceKm: 0.4,
    menuText: "Polévka: kulajda · Hlavní: kuřecí řízek, bramborový salát · Vegetarián: těstoviny se zeleninou",
    date: "2026-07-10",
    priceRange: "od 129 Kč",
    isTop: true,
    publishedPlan: "top",
  },
  {
    id: "lm2",
    businessId: "sp3",
    businessName: "Kavárna Na Louce",
    emoji: "☕",
    locationId: "domov",
    lat: 49.965,
    lng: 14.515,
    distanceKm: 0.3,
    menuText: "Denní menu: guláš s knedlíkem, sekaná s bramborami",
    date: "2026-07-10",
    priceRange: "od 115 Kč",
    isTop: false,
    publishedPlan: "free",
  },
  {
    id: "lm3",
    businessId: "sp-praha",
    businessName: "Bistro Václavák",
    emoji: "🥗",
    locationId: "prace",
    lat: 50.082,
    lng: 14.428,
    distanceKm: 0.2,
    menuText: "Caesar salát, burger dne, polévka dle kuchaře",
    date: "2026-07-10",
    priceRange: "od 145 Kč",
    isTop: false,
    publishedPlan: "free",
  },
  {
    id: "lm4",
    businessId: "sp-sazava",
    businessName: "Hospoda U Mostu",
    emoji: "🍺",
    locationId: "chata",
    lat: 50.136,
    lng: 15.091,
    distanceKm: 0.5,
    menuText: "Svíčková, smažený sýr, dětské menu k dispozici",
    date: "2026-07-10",
    priceRange: "od 135 Kč",
    isTop: false,
    publishedPlan: "free",
  },
];

export function sortLunchMenus(menus) {
  return [...menus].sort((a, b) => {
    if (a.isTop && !b.isTop) return -1;
    if (!a.isTop && b.isTop) return 1;
    return a.distanceKm - b.distanceKm;
  });
}
