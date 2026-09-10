/** Městské části statutárních měst podle PSČ — ať se Praha neslévá do jedné obce. */

import { pscDigits } from "./addressValidation.js";

const BARE_CITIES = ["praha", "brno", "ostrava", "plzeň", "plzen"];

/** Konkrétnější čtvrť u známých PSČ (offline i jako doplněk k API). */
const PSC_NEIGHBORHOOD = {
  11000: "Staré Město",
  11800: "Malá Strana",
  12000: "Vinohrady",
  13000: "Žižkov",
  14000: "Nusle",
  14100: "Michle",
  14200: "Lhotka",
  14300: "Modřany",
  14700: "Braník",
  14800: "Kunratice",
  14900: "Újezd u Průhonic",
  14941: "Chodov",
  15000: "Smíchov",
  15500: "Řeporyje",
  16000: "Dejvice",
  16200: "Břevnov",
  16500: "Stodůlky",
  17000: "Holešovice",
  18000: "Libeň",
  18600: "Karlín",
  19000: "Vysočany",
  19800: "Kyje",
  19900: "Letňany",
  60200: "Brno-střed",
  61200: "Královo Pole",
  61300: "Husovice",
  61600: "Žabovřesky",
  62100: "Řečkovice",
  62700: "Slatina",
  63400: "Nový Lískovec",
  63900: "Štýřice",
};

function normalizeMun(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("cs")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ");
}

function stripDiacritics(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Přesné PSČ → městská část (ne 3 číslice).
 * 149 00 je Újezd u Průhonic, ne úřad Prahy 11 (ten sídlí na 149 41).
 */
const PSC_PRAHA_MESTSKA_CAST = {
  14900: "Praha-Újezd",
  14941: "Praha 11",
};

export function prahaMunicipalPartFromPsc(psc) {
  const digits = pscDigits(String(psc ?? ""));
  if (digits.length !== 5) return null;
  return PSC_PRAHA_MESTSKA_CAST[Number(digits)] || null;
}

/** Sjednotí pomlčky a mezery, ať „Praha-Újezd“ sedí i na „Praha – Újezd“. */
export function foldMunicipalName(value) {
  return String(value ?? "")
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[—–−]/g, "-")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function officeBelongsToMunicipalPart(officeOrName, partName) {
  const target = foldMunicipalName(partName);
  if (!target) return false;
  const blob = foldMunicipalName(
    [
      officeOrName?.name,
      officeOrName?.seatCity,
      officeOrName?.seatAddress,
      officeOrName?.obchodniJmeno,
      officeOrName?.sidlo?.nazevMestskeCastiObvodu,
      officeOrName?.sidlo?.nazevMestskehoObvodu,
      typeof officeOrName === "string" ? officeOrName : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  return blob.includes(target);
}

/** Praha-Újezd / Brno-střed — pojmenovaná městská část, ne číslovaná Praha 11. */
export function isNamedMunicipalPart(name) {
  return /^(praha|brno|ostrava|plzen)\s+[a-z]/.test(foldMunicipalName(name));
}

/**
 * Když sídlí víc úřadů na stejném PSČ, dej dopředu ten, který k němu patří
 * jako vlastní městská část — ne velkou číslovanou MČ, která PSČ jen sdílí.
 */
export function scoreOfficeForPsc(office, psc, units = {}) {
  const digits = pscDigits(String(psc ?? ""));
  const seat = pscDigits(String(office?.psc ?? ""));
  const districts = units.districts ?? [];
  const obce = units.obce ?? [];
  let value = 0;
  if (districts.some((name) => officeBelongsToMunicipalPart(office, name))) value += 30;
  if (obce.some((name) => officeBelongsToMunicipalPart(office, name))) value += 30;
  const counts = { ...(units.districtCounts || {}), ...(units.obecCounts || {}) };
  const matched = [...districts, ...obce].filter((name) => officeBelongsToMunicipalPart(office, name));
  const bestCount = matched.reduce((max, name) => Math.max(max, Number(counts[name]) || 0), 0);
  if (bestCount) value += Math.min(20, Math.round(Math.log10(bestCount + 1) * 8));
  if (seat && seat === digits) value += 20;
  if (seat && seat === digits && isNamedMunicipalPart(office?.seatCity || office?.name)) value += 50;
  if (office?.kind === "mestska_cast") value += 8;
  if (office?.kind === "magistrat") value -= 30;
  return value;
}

export function rankOfficesForPsc(offices, psc, units = {}) {
  const list = Array.isArray(offices) ? [...offices] : [];
  return list.sort(
    (a, b) =>
      scoreOfficeForPsc(b, psc, units) - scoreOfficeForPsc(a, psc, units) ||
      String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "cs")
  );
}

/** Praha-Újezd + část obce Újezd u Průhonic → Praha-Újezd u Průhonic. */
export function decorateNamedDistrictLabel(part, hood) {
  const official = String(part ?? "").trim();
  const neighborhood = String(hood ?? "").trim();
  if (!official || !neighborhood) return official;
  const partFold = foldMunicipalName(official);
  const hoodFold = foldMunicipalName(neighborhood);
  const stem = partFold.replace(/^(praha|brno|ostrava|plzen)\s+/, "");
  if (!stem || !/^[a-z]/.test(stem)) return official;
  if (hoodFold === partFold || hoodFold === stem) return official;
  if (!hoodFold.startsWith(stem) && !hoodFold.includes(` ${stem} `) && !hoodFold.includes(stem)) {
    return official;
  }
  const cityPrefix = official.match(/^(Praha|Brno|Ostrava|Plzeň)/i)?.[0];
  if (cityPrefix && official.includes("-")) return `${cityPrefix}-${neighborhood}`;
  return official;
}

export function isBareStatutoryCity(name) {
  const n = stripDiacritics(normalizeMun(name));
  return BARE_CITIES.includes(n);
}

/** Praha 1–22 z prvních tří číslic PSČ. */
export function prahaDistrictFromPsc(psc) {
  const digits = pscDigits(String(psc ?? ""));
  if (digits.length !== 5) return null;
  const prefix = Number(digits.slice(0, 3));
  if (prefix >= 110 && prefix <= 119) return "Praha 1";
  if (prefix >= 120 && prefix <= 129) return "Praha 2";
  if (prefix >= 130 && prefix <= 139) return "Praha 3";
  if (prefix === 143) return "Praha 12";
  if (prefix === 149) return "Praha 11";
  if (prefix === 145) return "Praha 11";
  if ((prefix >= 140 && prefix <= 144) || prefix === 147 || prefix === 148) return "Praha 4";
  if (prefix === 155 || prefix === 165) return "Praha 13";
  if ((prefix >= 150 && prefix <= 154) || (prefix >= 156 && prefix <= 159)) return "Praha 5";
  if (prefix >= 160 && prefix <= 169) return "Praha 6";
  if (prefix >= 170 && prefix <= 179) return "Praha 7";
  if (prefix >= 180 && prefix <= 189) return "Praha 8";
  if (prefix === 198) return "Praha 14";
  if (prefix === 199) return "Praha 18";
  if (prefix >= 190 && prefix <= 197) return "Praha 9";
  if (prefix >= 100 && prefix <= 109) return "Praha 10";
  return null;
}

/** Známé brněnské PSČ prefixy → městská část, ať nezůstane jen „Brno“. */
export function brnoDistrictFromPsc(psc) {
  const digits = pscDigits(String(psc ?? ""));
  if (digits.length !== 5) return null;
  const prefix = Number(digits.slice(0, 3));
  if (prefix < 600 || prefix > 649) return null;
  if (prefix === 602 || prefix === 603 || prefix === 611 || prefix === 639) return "Brno-střed";
  if (prefix === 612) return "Brno-Královo Pole";
  if (prefix === 613) return "Brno-sever";
  if (prefix === 616) return "Brno-Žabovřesky";
  if (prefix === 621) return "Brno-Řečkovice";
  if (prefix === 627) return "Brno-Slatina";
  if (prefix === 634) return "Brno-Nový Lískovec";
  return null;
}

export function parseCityDistrict(name) {
  const n = normalizeMun(name);
  if (!n) return null;
  const praha = n.match(/^praha(?:\s+|-)(\d{1,2})\b/);
  if (praha) return { city: "praha", district: praha[1] };
  const brno = n.match(/^brno(?:\s+|-)(.+)$/);
  if (brno) return { city: "brno", district: brno[1].split("-")[0].trim() };
  const ostrava = n.match(/^ostrava(?:\s+|-)(.+)$/);
  if (ostrava) return { city: "ostrava", district: ostrava[1].split("-")[0].trim() };
  const plzen = n.match(/^plze[nň](?:\s+|-)(.+)$/);
  if (plzen) return { city: "plzen", district: plzen[1].split("-")[0].trim() };
  return null;
}

export function pscLocalityKey(psc) {
  const digits = pscDigits(String(psc ?? ""));
  if (digits.length !== 5) return "";
  if (prahaDistrictFromPsc(digits)) return `psc-${digits.slice(0, 3)}`;
  return `psc-${digits}`;
}

/**
 * Zobrazovaný název lokality: u Prahy/Brna vždy městská část, ne jen „Praha“.
 */
export function refineLocalityFromPsc(psc, fallbackCity = "", suburb = "") {
  const digits = pscDigits(String(psc ?? ""));
  const district = prahaMunicipalPartFromPsc(digits) || prahaDistrictFromPsc(digits) || brnoDistrictFromPsc(digits);
  const hood = String(suburb ?? "").trim() || PSC_NEIGHBORHOOD[Number(digits)] || "";
  if (district && hood && !hood.startsWith("Praha") && !hood.startsWith("Brno")) {
    const districtKey = stripDiacritics(normalizeMun(district)).replace(/^praha-/, "");
    const hoodKey = stripDiacritics(normalizeMun(hood));
    if (hoodKey.includes(districtKey) || districtKey.includes(hoodKey.split(" ")[0])) {
      return district;
    }
    return `${district} — ${hood}`;
  }
  if (district) return district;
  if (hood && !isBareStatutoryCity(hood)) return hood;

  const fallback = String(fallbackCity ?? "").trim();
  if (fallback && !isBareStatutoryCity(fallback)) return fallback;
  if (fallback && isBareStatutoryCity(fallback) && district) return district;
  return fallback;
}

export function localityShortLabel(locality) {
  const raw = String(locality ?? "").trim();
  if (!raw) return "";
  return raw.split("—")[0].split("–")[0].trim() || raw;
}
