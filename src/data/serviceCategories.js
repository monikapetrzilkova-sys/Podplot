/** Kategorie katalogu služeb — populární + kompletní seznam */

export const SERVICE_PARENT_CATEGORIES = [
  { id: "vse", label: "Vše", emoji: "🎨" },
  { id: "remeslo", label: "Řemeslo & Stavba", emoji: "🛠️" },
  { id: "zahrada", label: "Zahrada", emoji: "🌳" },
  { id: "uklid", label: "Úklid & Domácnost", emoji: "🧼" },
  { id: "doucovani", label: "Doučování & Kurzy", emoji: "📚" },
  { id: "krasa", label: "Krása & Zdraví", emoji: "💅" },
];

/** Podkategorie „Služby u vás doma“ v Průvodci / registraci */
export const HOME_SERVICE_SUB_FILTERS = [
  { id: "domov-zahrada", label: "Domov a zahrada", shortLabel: "Domov" },
  { id: "pece-krasa", label: "Péče a krása", shortLabel: "Péče" },
  { id: "deti-rodina", label: "Děti a rodina", shortLabel: "Děti" },
  { id: "ostatni", label: "Ostatní", shortLabel: "Ostatní" },
];

export const SUBCATEGORY_TO_HOME_GROUP = {
  instalater: "domov-zahrada",
  elektrikar: "domov-zahrada",
  malir: "domov-zahrada",
  truhlar: "domov-zahrada",
  klempir: "domov-zahrada",
  zahrada: "domov-zahrada",
  uklid: "domov-zahrada",
  it: "domov-zahrada",
  auto: "domov-zahrada",
  fotograf: "domov-zahrada",
  veterinar: "domov-zahrada",
  beauty: "pece-krasa",
  kadernictvi: "pece-krasa",
  masaz: "pece-krasa",
  fitness: "pece-krasa",
  hlidani: "deti-rodina",
  doucovani: "deti-rodina",
  preklad: "deti-rodina",
  gastro: "ostatni",
  pravo: "ostatni",
  ucetni: "ostatni",
  event: "ostatni",
  ostatni: "ostatni",
};

export function getHomeServiceSubFilter(id) {
  return HOME_SERVICE_SUB_FILTERS.find((c) => c.id === id);
}

/** Podkategorie dostupné v dané hlavní skupině (registrace / profil) */
export function getSubcategoriesForHomeGroup(homeGroupId) {
  return ALL_SERVICE_CATEGORIES.filter(
    (c) => (SUBCATEGORY_TO_HOME_GROUP[c.id] ?? "ostatni") === homeGroupId
  );
}

export function serviceHomeGroupId(svc) {
  const ids = getServiceSubcategoryIds(svc);
  if (ids.length === 0) return "ostatni";
  return SUBCATEGORY_TO_HOME_GROUP[ids[0]] ?? svc.homeGroupId ?? "ostatni";
}

export function serviceMatchesHomeGroup(svc, groupId) {
  if (!groupId) return true;
  if (svc.homeGroupId === groupId) return true;
  return getServiceSubcategoryIds(svc).some(
    (id) => (SUBCATEGORY_TO_HOME_GROUP[id] ?? "ostatni") === groupId
  );
}

export const SUBCATEGORY_TO_PARENT = {
  instalater: "remeslo",
  elektrikar: "remeslo",
  malir: "remeslo",
  truhlar: "remeslo",
  klempir: "remeslo",
  it: "remeslo",
  auto: "remeslo",
  fotograf: "remeslo",
  pravo: "remeslo",
  ucetni: "remeslo",
  zahrada: "zahrada",
  veterinar: "zahrada",
  uklid: "uklid",
  gastro: "uklid",
  doucovani: "doucovani",
  hlidani: "doucovani",
  preklad: "doucovani",
  event: "doucovani",
  beauty: "krasa",
  kadernictvi: "krasa",
  masaz: "krasa",
  fitness: "krasa",
  ostatni: "remeslo",
};

export const POPULAR_SERVICE_CATEGORIES = [
  { id: "instalater", label: "Instalatér", emoji: "🔧" },
  { id: "elektrikar", label: "Elektrikář", emoji: "⚡" },
  { id: "zahrada", label: "Zahrada", emoji: "🌿" },
  { id: "uklid", label: "Úklid", emoji: "🧹" },
  { id: "beauty", label: "Beauty", emoji: "💅" },
  { id: "hlidani", label: "Hlídání", emoji: "👶" },
  { id: "doucovani", label: "Doučování", emoji: "📚" },
  { id: "gastro", label: "Gastro", emoji: "🍽️" },
];

export const ALL_SERVICE_CATEGORIES = [
  ...POPULAR_SERVICE_CATEGORIES,
  { id: "malir", label: "Malíř & tapety", emoji: "🎨" },
  { id: "truhlar", label: "Truhlář", emoji: "🪚" },
  { id: "klempir", label: "Klempíř & střecha", emoji: "🏠" },
  { id: "it", label: "IT & počítače", emoji: "💻" },
  { id: "fotograf", label: "Fotograf", emoji: "📷" },
  { id: "pravo", label: "Právní poradna", emoji: "⚖️" },
  { id: "ucetni", label: "Účetnictví", emoji: "📊" },
  { id: "auto", label: "Auto & servis", emoji: "🚗" },
  { id: "veterinar", label: "Veterinář", emoji: "🐾" },
  { id: "kadernictvi", label: "Kadeřnictví", emoji: "✂️" },
  { id: "masaz", label: "Masáže", emoji: "💆" },
  { id: "fitness", label: "Fitness & kouč", emoji: "🏋️" },
  { id: "preklad", label: "Překlady", emoji: "🌍" },
  { id: "event", label: "Event & catering", emoji: "🎉" },
  { id: "ostatni", label: "Ostatní služby", emoji: "📋" },
];

export const SERVICE_PLACEHOLDERS = {
  instalater: "Co potřebujete? např. Oprava kohoutku, ucpaný odpad…",
  elektrikar: "Co potřebujete? např. Montáž lustru, revize…",
  zahrada: "Co přesně potřebujete udělat? např. Realizace terasy…",
  uklid: "Popište rozsah — např. Generální úklid bytu 3+1…",
  beauty: "Co hledáte? např. Manikúra, líčení na akci…",
  hlidani: "Kdy a koho? např. Hlídání dětí večer o víkendu…",
  doucovani: "Předmět a ročník — např. Matematika pro 6. třídu…",
  gastro: "Co hledáte? např. Catering na oslavu 20 lidí…",
  default: "Popište, co potřebujete…",
};

export function getServiceCategory(id) {
  return ALL_SERVICE_CATEGORIES.find((c) => c.id === id);
}

/** Seznam zaměření služby (více oborů) — zpětně kompatibilní s jedním subcategory */
export function getServiceSubcategoryIds(svc) {
  if (!svc) return [];
  if (Array.isArray(svc.subcategories) && svc.subcategories.length > 0) {
    return [...new Set(svc.subcategories.filter(Boolean))];
  }
  if (svc.subcategory) return [svc.subcategory];
  return [];
}

export function formatServiceSubcategoryLabels(ids = []) {
  return ids
    .map((id) => getServiceCategory(id)?.label)
    .filter(Boolean)
    .join(" · ");
}

export function serviceHasSubcategory(svc, categoryId) {
  if (!categoryId || categoryId === "vse") return true;
  return getServiceSubcategoryIds(svc).includes(categoryId);
}

export function getServicePlaceholder(id) {
  return SERVICE_PLACEHOLDERS[id] ?? SERVICE_PLACEHOLDERS.default;
}

export function serviceMatchesParentCategory(svc, parentId) {
  if (!parentId || parentId === "vse") return true;
  return getServiceSubcategoryIds(svc).some((id) => SUBCATEGORY_TO_PARENT[id] === parentId);
}

export function serviceMatchesSearch(svc, query) {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase();
  const homeGroup = getHomeServiceSubFilter(serviceHomeGroupId(svc));
  const blob = [
    svc.name,
    svc.subcategoryLabel,
    svc.profession,
    svc.address,
    homeGroup?.label,
    ...(svc.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return blob.includes(q);
}
