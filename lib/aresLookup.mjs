/** Veřejný ARES (MFČR) — název a sídlo podle IČO. */

const ARES_URL = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty";
const UA = "Podplot/1.0 (https://podplot.vercel.app)";

export function normalizeIco(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.padStart(8, "0").slice(-8);
}

export function isValidIco(value) {
  const ico = String(value ?? "").replace(/\D/g, "");
  if (ico.length !== 8) return false;
  let sum = 0;
  for (let i = 0; i < 7; i += 1) sum += Number(ico[i]) * (8 - i);
  let check = sum % 11;
  check = check === 0 ? 1 : 11 - check;
  if (check === 10) check = 0;
  return Number(ico[7]) === check;
}

/** "Budějovická 778/3a, Michle, 14000 Praha 4" → strukturované sídlo */
export function parseAresTextAddress(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const match = raw.match(
    /^(.+?)\s+(\d+[a-zA-Z0-9/-]*),\s*(?:([^,]+),\s*)?(\d{3}\s?\d{2})\s+(.+)$/
  );
  if (!match) return null;
  return {
    street: match[1].trim(),
    houseNumber: match[2].trim(),
    suburb: (match[3] || "").trim(),
    psc: String(match[4] ?? "").replace(/\D/g, ""),
    city: match[5].trim(),
  };
}

export function mapAresEntity(data) {
  const sidlo = data?.sidlo || {};
  const parsed = parseAresTextAddress(sidlo.textovaAdresa);
  const psc = String(sidlo.psc ?? parsed?.psc ?? "").replace(/\D/g, "");
  const orient = [sidlo.cisloOrientacni, sidlo.cisloOrientacniPismeno]
    .filter((part) => part != null && part !== "")
    .join("");
  const house = [sidlo.cisloDomovni, orient].filter(Boolean).join("/") || parsed?.houseNumber || "";
  return {
    ico: String(data.ico ?? ""),
    name: String(data.obchodniJmeno ?? "").trim(),
    city: String(sidlo.nazevObce || parsed?.city || "").trim(),
    district: String(
      sidlo.nazevMestskeCastiObvodu ||
        sidlo.nazevMestskehoObvodu ||
        sidlo.nazevSpravnihoObvodu ||
        sidlo.nazevMestskeCasti ||
        ""
    ).trim(),
    suburb: String(sidlo.nazevCastiObce || parsed?.suburb || "").trim(),
    psc: psc.length === 5 ? `${psc.slice(0, 3)} ${psc.slice(3)}` : psc,
    street: String(sidlo.nazevUlice || parsed?.street || "").trim(),
    houseNumber: String(house),
    addressText: String(sidlo.textovaAdresa || "").trim(),
  };
}

export async function lookupAresCompany(icoRaw) {
  const ico = normalizeIco(icoRaw);
  if (!isValidIco(ico)) {
    return { ok: false, error: "IČO musí mít 8 číslic a platný kontrolní součet." };
  }
  const res = await fetch(`${ARES_URL}/${ico}`, {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(10000),
  });
  if (res.status === 404) {
    return { ok: false, error: "V ARES toto IČO není. Zkontroluj číslo." };
  }
  if (!res.ok) {
    return { ok: false, error: "Rejstřík ARES teď neodpovídá. Zkus to za chvíli." };
  }
  const data = await res.json();
  const company = mapAresEntity(data);
  if (!company.name) {
    return { ok: false, error: "ARES vrátil subjekt bez názvu." };
  }
  return { ok: true, company };
}
