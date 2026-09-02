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
  14900: "Chodov",
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
  const district = prahaDistrictFromPsc(digits) || brnoDistrictFromPsc(digits);
  const hood = PSC_NEIGHBORHOOD[Number(digits)] || String(suburb ?? "").trim();
  if (district && hood && !hood.startsWith("Praha") && !hood.startsWith("Brno")) {
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
