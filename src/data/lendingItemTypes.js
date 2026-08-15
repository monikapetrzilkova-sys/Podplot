/** Typy věcí v půjčovně — našeptávání do nadpisu (ne „Půjčím … na víkend“) */

export const LENDING_ITEM_TYPE_SUGGESTIONS = [
  // Nářadí
  { label: "Aku vrtačka", category: "naradi", aliases: ["vrtačka", "vrtacka", "aku"] },
  { label: "Šroubovák", category: "naradi", aliases: ["sroubovak"] },
  { label: "Hliníkový žebřík", category: "naradi", aliases: ["žebřík", "zebrik"] },
  { label: "Úhlová bruska", category: "naradi", aliases: ["bruska"] },
  { label: "Detektor kabelů", category: "naradi", aliases: ["detektor"] },
  { label: "Laserová vodováha", category: "naradi", aliases: ["laser", "vodováha"] },
  { label: "Svářečka", category: "naradi", aliases: ["svarecka"] },
  { label: "Pila", category: "naradi", aliases: ["okružní", "přímočará"] },
  // Zahrada
  { label: "Zahradní sekačka", category: "zahrada", aliases: ["sekačka", "sekacka"] },
  { label: "Křovinořez", category: "zahrada", aliases: ["krovinořez", "krovinořez"] },
  { label: "Plotostřih", category: "zahrada", aliases: ["plotostrih"] },
  { label: "Zahradní hadice", category: "zahrada", aliases: ["hadice"] },
  { label: "Kultivátor", category: "zahrada", aliases: [] },
  // Domácnost
  { label: "Vysavač", category: "domacnost", aliases: ["vysavac"] },
  { label: "Parní čistič", category: "domacnost", aliases: ["parní"] },
  { label: "Žehlička", category: "domacnost", aliases: ["zehlicka"] },
  { label: "Projektor", category: "domacnost", aliases: [] },
  // Sport / volný čas
  { label: "Kolo", category: "sport", aliases: ["bicykl"] },
  { label: "Koloběžka", category: "sport", aliases: ["kolobezka"] },
  { label: "Nafukovací člun", category: "sport", aliases: ["člun", "clun"] },
  { label: "Párty stan", category: "sport", aliases: ["stan", "party"] },
  { label: "Gril", category: "sport", aliases: [] },
  // Děti
  { label: "Kočárek", category: "deti", aliases: ["kocarek"] },
  { label: "Autosedačka", category: "deti", aliases: ["autosedačka"] },
  { label: "Chodítko", category: "deti", aliases: ["choditko"] },
  { label: "Nosítko", category: "deti", aliases: ["nositko"] },
  // Hobby
  { label: "Šicí stroj", category: "hobby", aliases: ["šicí", "sici"] },
  { label: "Malířské nářadí", category: "hobby", aliases: ["malíř", "štětec"] },
  // Zvířata
  { label: "Přepravka pro psa", category: "zvirata", aliases: ["přepravka", "prepravka"] },
  { label: "Klec", category: "zvirata", aliases: [] },
];

function normalizeSearch(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Odstraní fráze typu „Půjčím …“ / „na víkend“ — nechá typ věci */
export function cleanLendingTitleInput(raw = "") {
  let t = raw.trim();
  t = t.replace(/^(půjčím|pujcim|půjčuji|pujcuji|k\s+půjčení|k\s+pujceni)\s+/i, "");
  t = t.replace(/\s+(na\s+víkend|na\s+vikend|na\s+den|na\s+týden|na\s+tyden)\s*$/i, "");
  return t.trim();
}

export function filterLendingItemTypeSuggestions(query = "", categoryId = null) {
  const q = normalizeSearch(cleanLendingTitleInput(query));
  let list = LENDING_ITEM_TYPE_SUGGESTIONS;
  if (categoryId && categoryId !== "jine" && categoryId !== "vse") {
    const inCat = list.filter((s) => s.category === categoryId);
    const rest = list.filter((s) => s.category !== categoryId);
    list = [...inCat, ...rest];
  }
  if (!q) {
    return categoryId && categoryId !== "jine" && categoryId !== "vse"
      ? list.filter((s) => s.category === categoryId).slice(0, 8)
      : list.slice(0, 8);
  }
  return list
    .filter((s) => {
      const hay = normalizeSearch([s.label, ...(s.aliases ?? [])].join(" "));
      return hay.includes(q) || q.includes(normalizeSearch(s.label).slice(0, 4));
    })
    .slice(0, 8);
}

/** Najde kanonický typ z našeptávače, jinak vyčištěný vstup */
export function resolveLendingItemTypeLabel(rawTitle = "", categoryId = null) {
  const cleaned = cleanLendingTitleInput(rawTitle);
  if (!cleaned) return "";

  const n = normalizeSearch(cleaned);
  const pool = categoryId
    ? [
        ...LENDING_ITEM_TYPE_SUGGESTIONS.filter((s) => s.category === categoryId),
        ...LENDING_ITEM_TYPE_SUGGESTIONS.filter((s) => s.category !== categoryId),
      ]
    : LENDING_ITEM_TYPE_SUGGESTIONS;

  const exact = pool.find((s) => normalizeSearch(s.label) === n);
  if (exact) return exact.label;

  const byAlias = pool.find((s) => {
    if (normalizeSearch(s.label).includes(n) || n.includes(normalizeSearch(s.label))) return true;
    return (s.aliases ?? []).some((a) => {
      const an = normalizeSearch(a);
      return an && (n.includes(an) || an.includes(n));
    });
  });
  if (byAlias) return byAlias.label;

  // Kapitalizace vlastního typu
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function lendingDisplayTitle(item) {
  if (!item) return "";
  if (item.itemTypeLabel) return item.itemTypeLabel;
  const raw = item.item ?? item.title ?? item.label ?? "";
  return resolveLendingItemTypeLabel(raw, item.lendingCategory ?? item.marketCategory) || raw;
}
