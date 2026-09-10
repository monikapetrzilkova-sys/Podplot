/**
 * Veřejné dohledání obecního / městského úřadu podle PSČ
 * a oficiální e-mailové domény z webu obce (RÚIAN + ARES + Wikidata).
 */

import { brnoDistrictFromPsc, prahaDistrictFromPsc } from "../src/data/czechCityDistricts.js";

const UA = "Podplot/1.0 (https://podplot.vercel.app)";
const RUIAN_MAP = "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/MapServer";
const ARES_SEARCH = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat";
const WD_API = "https://www.wikidata.org/w/api.php";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "seznam.cz",
  "email.cz",
  "post.cz",
  "centrum.cz",
  "atlas.cz",
  "volny.cz",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
]);

const MUNICIPAL_FORMS = {
  801: { kind: "obecni_urad", officePrefix: "Obecní úřad" },
  804: { kind: "mestsky_urad", officePrefix: "Městský úřad" },
  811: { kind: "obecni_urad", officePrefix: "Obecní úřad" },
};

const officesCache = new Map();
const domainCache = new Map();

function normalizePsc(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizeDomain(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  const host = raw.includes("@") ? raw.slice(raw.lastIndexOf("@") + 1) : raw.replace(/^@/, "");
  return host.replace(/^www\./, "") || null;
}

function hostnameFromWebsite(url) {
  if (!url) return null;
  try {
    const href = String(url).includes("://") ? String(url) : `https://${url}`;
    return normalizeDomain(new URL(href).hostname);
  } catch {
    return null;
  }
}

function isPublicMailbox(domain) {
  return !domain || PUBLIC_EMAIL_DOMAINS.has(domain);
}

function slugCity(name) {
  return String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function officeIdFromIco(ico) {
  const digits = String(ico ?? "").replace(/\D/g, "");
  return digits ? `inst-ico-${digits}` : null;
}

const MUNICIPAL_NAME_PREFIX =
  /^(obec|město|městys|statutární město|hlavní město|městská část|městský obvod|úřad městské části|úřad městského obvodu)\s+/i;

export function parseRuianAddress(adresa) {
  const raw = String(adresa ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/^(.*),\s*(\d{5})\s+(.+)$/);
  if (!match) {
    const loose = raw.match(/(\d{5})\s+(.+)$/);
    if (!loose) return null;
    return { street: "", part: "", psc: loose[1], postalCity: loose[2].trim() };
  }
  const parts = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    street: parts[0] || "",
    part: parts.length > 1 ? parts[parts.length - 1] : "",
    psc: match[2],
    postalCity: match[3].trim(),
  };
}

export function stripMunicipalPrefix(name) {
  return String(name ?? "").replace(MUNICIPAL_NAME_PREFIX, "").trim();
}

export function isCityWideCapitalOffice(rowOrName) {
  const name = String(rowOrName?.obchodniJmeno ?? rowOrName ?? "").toLowerCase();
  return /hlavní město/.test(name) || /magistrát/.test(name) || /^statutární město\b/.test(name);
}

/** Poštovní popisek typu „Praha 4“, ne název obce / městské části. */
export function isPostalCityLabel(name) {
  return /^(praha|brno|ostrava|plzeň|plzen)(\s+\d+)?$/i.test(String(name ?? "").trim());
}

export function isStatutoryCityName(name) {
  const n = String(name ?? "")
    .trim()
    .toLocaleLowerCase("cs")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /^(praha|brno|ostrava|plzen|liberec)$/.test(n);
}

export function officeSearchTargets(psc, units = {}) {
  const digits = normalizePsc(psc);
  const districts = [...new Set((units.districts ?? []).map((name) => String(name).trim()).filter(Boolean))];
  const obce = [...new Set((units.obce ?? []).map((name) => String(name).trim()).filter(Boolean))];
  const seen = new Set();
  const targets = [];
  const add = (name, type) => {
    const trimmed = String(name ?? "").trim();
    const key = `${type}:${trimmed.toLocaleLowerCase("cs")}`;
    if (!trimmed || seen.has(key)) return;
    seen.add(key);
    targets.push({ name: trimmed, type });
  };

  districts.forEach((name) => add(name, "mestska_cast"));
  if (!districts.length) {
    const praha = prahaDistrictFromPsc(digits);
    if (praha) add(praha, "mestska_cast");
    const brno = brnoDistrictFromPsc(digits);
    if (brno) add(brno, "mestska_cast");
  }

  obce.forEach((name) => {
    if (isPostalCityLabel(name) || isStatutoryCityName(name)) return;
    add(name, "obec");
  });
  return targets;
}

export function mapOfficeName(aresName, city, formCode) {
  const raw = String(aresName ?? "").trim();
  const lower = raw.toLowerCase();
  if (/městsk(á|é|ý)\s+(část|obvod)/i.test(raw)) {
    return `Úřad městské části ${stripMunicipalPrefix(raw) || city}`.trim();
  }
  if (lower.includes("hlavní město") || lower.includes("magistrát")) {
    return raw.includes("Magistrát") ? raw : `Magistrát ${city}`.trim();
  }
  const fromName = /^město\b/i.test(raw) ? "Městský úřad" : /^městys\b/i.test(raw) ? "Obecní úřad" : null;
  const meta = MUNICIPAL_FORMS[formCode] || MUNICIPAL_FORMS[801];
  const cityName = city || stripMunicipalPrefix(raw);
  return `${fromName || meta.officePrefix} ${cityName}`.trim();
}

export function officeKind(aresName, formCode) {
  const lower = String(aresName ?? "").toLowerCase();
  if (/městsk(á|é|ý)\s+(část|obvod)/i.test(lower)) return "mestska_cast";
  if (lower.includes("magistrát") || lower.includes("hlavní město") || lower.includes("statutární")) {
    return "magistrat";
  }
  if (/^město\b/i.test(String(aresName ?? ""))) return "mestsky_urad";
  return (MUNICIPAL_FORMS[formCode] || MUNICIPAL_FORMS[801]).kind;
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": UA,
      ...(init.headers || {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function queryRuianLayer(layerId, { where, outFields, resultRecordCount = 40, resultOffset = 0 } = {}) {
  const url = new URL(`${RUIAN_MAP}/${layerId}/query`);
  url.searchParams.set("where", where);
  url.searchParams.set("outFields", outFields);
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("resultRecordCount", String(resultRecordCount));
  if (resultOffset) url.searchParams.set("resultOffset", String(resultOffset));
  url.searchParams.set("f", "json");
  const data = await fetchJson(url);
  if (data?.error) throw new Error(data.error.message || "RÚIAN query failed");
  return Array.isArray(data?.features) ? data.features : [];
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function ruianAddressCount(psc) {
  const url = new URL(`${RUIAN_MAP}/1/query`);
  url.searchParams.set("where", `psc=${psc}`);
  url.searchParams.set("returnCountOnly", "true");
  url.searchParams.set("f", "json");
  const data = await fetchJson(url);
  return Number(data?.count || 0);
}

function evenOffsets(total, pages = 6, pageSize = 30) {
  if (total <= 0) return [0];
  if (total <= pageSize) return [0];
  const maxStart = total - pageSize;
  const out = [];
  for (let i = 0; i < pages; i += 1) {
    out.push(Math.round((i / (pages - 1)) * maxStart));
  }
  return [...new Set(out)];
}

/** Oficiální městské části / obce z RÚIAN — ne poštovní popisek za PSČ. */
export async function ruianAdminUnitsForPsc(psc) {
  const digits = normalizePsc(psc);
  const buildingCodes = new Set();
  const obce = new Set();
  let offsets = [0, 400, 1200, 2500, 4500];
  try {
    offsets = evenOffsets(await ruianAddressCount(digits));
  } catch {
    /* zůstanou pevné offsety */
  }

  for (const offset of offsets) {
    let rows = [];
    try {
      rows = await queryRuianLayer(1, {
        where: `psc=${digits}`,
        outFields: "stavebniobjekt,adresa",
        resultRecordCount: 30,
        resultOffset: offset,
      });
    } catch {
      break;
    }
    if (!rows.length) break;
    rows.forEach((row) => {
      const kod = row?.attributes?.stavebniobjekt;
      if (kod) buildingCodes.add(Number(kod));
      const parsed = parseRuianAddress(row?.attributes?.adresa);
      if (!parsed?.postalCity || isPostalCityLabel(parsed.postalCity) || isStatutoryCityName(parsed.postalCity)) {
        return;
      }
      obce.add(parsed.postalCity);
    });
  }

  const momcCodes = new Set();
  const allBuildings = [...buildingCodes];
  const sampledBuildings =
    allBuildings.length <= 45
      ? allBuildings
      : evenOffsets(allBuildings.length, 15, 1).map((index) => allBuildings[index]).filter(Boolean);
  for (const group of chunk(sampledBuildings, 15)) {
    try {
      const buildings = await queryRuianLayer(3, {
        where: group.map((kod) => `kod=${kod}`).join(" OR "),
        outFields: "kod,momc",
        resultRecordCount: 20,
      });
      buildings.forEach((row) => {
        if (row?.attributes?.momc) momcCodes.add(Number(row.attributes.momc));
      });
    } catch {
      /* další vzorek budov */
    }
  }

  const districts = [];
  if (momcCodes.size) {
    try {
      const parts = await queryRuianLayer(8, {
        where: [...momcCodes].map((kod) => `kod=${kod}`).join(" OR "),
        outFields: "kod,nazev",
        resultRecordCount: 20,
      });
      parts.forEach((row) => {
        const name = String(row?.attributes?.nazev ?? "").trim();
        if (name) districts.push(name);
      });
    } catch {
      /* ARES katalog podle sídla PSČ to ještě doplní */
    }
  }

  return {
    districts: [...new Set(districts)],
    obce: [...obce],
  };
}

let districtCatalogPromise = null;

async function loadAresDistrictCatalog() {
  if (districtCatalogPromise) return districtCatalogPromise;
  districtCatalogPromise = (async () => {
    const rows = [];
    for (let start = 0; start < 200; start += 20) {
      try {
        const data = await fetchJson(ARES_SEARCH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ obchodniJmeno: "Městská část", start, pocet: 20 }),
          signal: AbortSignal.timeout(8000),
        });
        const page = data?.ekonomickeSubjekty ?? [];
        rows.push(...page);
        if (!page.length || rows.length >= Number(data?.pocetCelkem || 0)) break;
      } catch {
        break;
      }
    }
    return rows.filter((row) => isMunicipalEntity(row) && /městsk(á|ý)\s+(část|obvod)/i.test(row?.obchodniJmeno ?? ""));
  })();
  return districtCatalogPromise;
}

async function searchAresMunicipal(name, type = "obec") {
  const queries =
    type === "mestska_cast"
      ? [`Městská část ${name}`, `Městský obvod ${name}`, name]
      : [`Obec ${name}`, `Město ${name}`, `Městys ${name}`, `Statutární město ${name}`];
  const rows = [];
  for (const obchodniJmeno of queries) {
    try {
      const data = await fetchJson(ARES_SEARCH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obchodniJmeno, pocet: 8 }),
        signal: AbortSignal.timeout(8000),
      });
      rows.push(...(data?.ekonomickeSubjekty ?? []));
    } catch {
      /* ARES může jeden tvar názvu vynechat */
    }
  }
  return rows;
}

export function isMunicipalEntity(row) {
  const form = String(row?.pravniForma ?? row?.pravniFormaRos ?? "");
  if (MUNICIPAL_FORMS[form]) return true;
  const name = String(row?.obchodniJmeno ?? "").toLowerCase();
  return /^(obec|město|městys|statutární město|hlavní město|městská část|městský obvod)\b/.test(name);
}

export function cityMatches(row, city) {
  const target = String(city ?? "").trim().toLocaleLowerCase("cs");
  if (!target) return true;
  const nazev = String(row?.sidlo?.nazevObce ?? "").trim().toLocaleLowerCase("cs");
  const district = String(row?.sidlo?.nazevMestskeCastiObvodu ?? row?.sidlo?.nazevMestskehoObvodu ?? "")
    .trim()
    .toLocaleLowerCase("cs");
  const name = stripMunicipalPrefix(row?.obchodniJmeno).toLocaleLowerCase("cs");
  return nazev === target || name === target || district === target;
}

export function shortlistMunicipalEntities(entities, { psc, targetName, allowNameMatch = false } = {}) {
  const digits = normalizePsc(psc);
  const municipal = (entities ?? []).filter((row) => isMunicipalEntity(row) && cityMatches(row, targetName));
  const usable = municipal.filter(
    (row) => !isCityWideCapitalOffice(row) || normalizePsc(row?.sidlo?.psc) === digits
  );
  const pscMatches = usable.filter((row) => normalizePsc(row?.sidlo?.psc) === digits);
  if (pscMatches.length) return pscMatches;
  if (allowNameMatch) return usable.filter((row) => !isCityWideCapitalOffice(row));
  return [];
}

function isCzOfficialWebsite(url) {
  const host = hostnameFromWebsite(url);
  return Boolean(host && (host.endsWith(".cz") || host.endsWith(".eu")));
}

async function findOfficialWebsite({ city, ico }) {
  const params = new URLSearchParams({
    action: "wbsearchentities",
    search: city,
    language: "cs",
    uselang: "cs",
    type: "item",
    limit: "8",
    format: "json",
    origin: "*",
  });
  try {
    const search = await fetchJson(`${WD_API}?${params}`);
    const ids = (search?.search ?? []).map((hit) => hit.id).filter(Boolean);
    if (!ids.length) return null;
    const get = new URLSearchParams({
      action: "wbgetentities",
      ids: ids.join("|"),
      props: "claims|labels",
      languages: "cs",
      format: "json",
      origin: "*",
    });
    const entities = await fetchJson(`${WD_API}?${get}`);
    const icoDigits = String(ico ?? "").replace(/\D/g, "");
    const candidates = Object.values(entities?.entities ?? {}).map((entity) => {
      const website = entity?.claims?.P856?.[0]?.mainsnak?.datavalue?.value ?? null;
      const entityIco = String(entity?.claims?.P4156?.[0]?.mainsnak?.datavalue?.value ?? "").replace(/\D/g, "");
      const countryId = entity?.claims?.P17?.[0]?.mainsnak?.datavalue?.value?.id;
      const label = entity?.labels?.cs?.value ?? city;
      return { website, entityIco, label, countryId, id: entity.id };
    });
    const czech = candidates.filter((c) => !c.countryId || c.countryId === "Q213");
    const byIco = icoDigits ? czech.find((c) => c.entityIco === icoDigits && isCzOfficialWebsite(c.website)) : null;
    const exactLabel = czech.find(
      (c) =>
        isCzOfficialWebsite(c.website) &&
        String(c.label).trim().toLocaleLowerCase("cs") === String(city).trim().toLocaleLowerCase("cs")
    );
    return (byIco || exactLabel)?.website ?? null;
  } catch {
    return null;
  }
}

async function guessMunicipalWebsite(city) {
  const slug = slugCity(city);
  if (slug.length < 3) return null;
  const urls = [
    `https://www.${slug}.cz`,
    `https://www.ou${slug}.cz`,
    `https://www.mu${slug}.cz`,
    `https://${slug}.cz`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html" },
        redirect: "follow",
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const html = (await res.text()).slice(0, 80000).toLowerCase();
      if (/(úřad|urad|podatelna|samospr[aá]v|starosta|obecní|městský)/i.test(html)) {
        return res.url || url;
      }
    } catch {
      /* další odhad */
    }
  }
  return null;
}

export async function scrapeOfficialEmailDomain(website) {
  if (!website) return { domain: hostnameFromWebsite(website), emails: [] };
  try {
    const href = String(website).includes("://") ? String(website) : `https://${website}`;
    const res = await fetch(href, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { domain: hostnameFromWebsite(res.url || href), emails: [] };
    const html = (await res.text()).slice(0, 120000);
    const emails = [...html.matchAll(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)].map((m) =>
      m[1].toLowerCase()
    );
    const webDomain = hostnameFromWebsite(res.url || href);
    const officialEmails = emails.filter((email) => {
      const domain = normalizeDomain(email);
      if (!domain || isPublicMailbox(domain)) return false;
      return !webDomain || domain === webDomain || domain.endsWith(`.${webDomain}`) || webDomain.endsWith(`.${domain}`);
    });
    const scrapedDomain = normalizeDomain(officialEmails[0]) || webDomain;
    return {
      domain: isPublicMailbox(scrapedDomain) ? null : scrapedDomain,
      website: res.url || href,
      emails: officialEmails.slice(0, 4),
    };
  } catch {
    const domain = hostnameFromWebsite(website);
    return { domain: isPublicMailbox(domain) ? null : domain, emails: [] };
  }
}

function toInstitution(row, psc, website, domain) {
  const sidlo = row?.sidlo || {};
  const city = String(
    sidlo.nazevMestskeCastiObvodu || sidlo.nazevMestskehoObvodu || sidlo.nazevObce || ""
  ).trim();
  const form = String(row?.pravniForma ?? row?.pravniFormaRos ?? "801");
  const ico = String(row?.ico ?? "").replace(/\D/g, "") || null;
  return {
    id: officeIdFromIco(ico) || `inst-psc-${psc}-${slugCity(city)}`,
    name: mapOfficeName(row?.obchodniJmeno, city, form),
    ico,
    psc,
    seatCity: city,
    seatAddress: String(sidlo.textovaAdresa || "").trim() || null,
    allowedEmailDomain: domain || "",
    officialWebsite: website || null,
    kind: officeKind(row?.obchodniJmeno, form),
    region: sidlo.nazevKraje || null,
    isActive: true,
    eligibleForRegistration: true,
    source: "public_lookup",
  };
}

export async function lookupMunicipalityOfficesByPsc(psc) {
  const digits = normalizePsc(psc);
  if (digits.length !== 5) return { ok: false, offices: [], error: "Neplatné PSČ" };
  if (officesCache.has(digits)) return officesCache.get(digits);

  let units = { districts: [], obce: [] };
  try {
    units = await ruianAdminUnitsForPsc(digits);
  } catch {
    units = { districts: [], obce: [] };
  }
  if (!units.districts.length && !units.obce.length && !prahaDistrictFromPsc(digits) && !brnoDistrictFromPsc(digits)) {
    try {
      const nom = new URL("https://nominatim.openstreetmap.org/search");
      nom.searchParams.set("postalcode", digits);
      nom.searchParams.set("country", "cz");
      nom.searchParams.set("format", "json");
      nom.searchParams.set("addressdetails", "1");
      nom.searchParams.set("limit", "5");
      nom.searchParams.set("accept-language", "cs");
      const items = await fetchJson(nom);
      units.obce = (Array.isArray(items) ? items : [])
        .map((item) => item?.address?.city || item?.address?.town || item?.address?.village || item?.address?.municipality)
        .filter((name) => name && !isPostalCityLabel(name) && !isStatutoryCityName(name))
        .map((name) => String(name).trim());
    } catch {
      units.obce = [];
    }
  }

  const targets = officeSearchTargets(digits, units);
  const offices = [];
  const seen = new Set();

  const addRow = async (row, cityName) => {
    const ico = String(row.ico ?? "").replace(/\D/g, "");
    if (!ico || seen.has(ico)) return;
    seen.add(ico);
    let website = await findOfficialWebsite({ city: cityName, ico });
    if (!isCzOfficialWebsite(website)) website = null;
    if (!website) website = await guessMunicipalWebsite(cityName);
    if (!isCzOfficialWebsite(website)) return;
    const scraped = await scrapeOfficialEmailDomain(website);
    const domain = scraped.domain || hostnameFromWebsite(website);
    if (!domain || isPublicMailbox(domain) || !(domain.endsWith(".cz") || domain.endsWith(".eu"))) return;
    offices.push(toInstitution(row, digits, scraped.website || website, domain));
  };

  try {
    const seated = (await loadAresDistrictCatalog()).filter((row) => normalizePsc(row?.sidlo?.psc) === digits);
    for (const row of seated) {
      await addRow(row, stripMunicipalPrefix(row.obchodniJmeno));
    }
  } catch {
    /* zůstanou cíle z RÚIAN */
  }

  for (const target of targets.slice(0, 8)) {
    const shortlist = shortlistMunicipalEntities(await searchAresMunicipal(target.name, target.type), {
      psc: digits,
      targetName: target.name,
      allowNameMatch: target.type === "mestska_cast",
    });
    for (const row of shortlist) {
      await addRow(row, target.name);
    }
  }

  offices.sort((a, b) => {
    const inUnits = (office) =>
      units.districts.some((name) => String(office.name).includes(name) || office.seatCity === name);
    const score = (office) => {
      let value = 0;
      if (inUnits(office)) value += 20;
      if (office.kind === "mestska_cast") value += 10;
      if (normalizePsc(office.psc) === digits && office.kind === "mestska_cast") value += 5;
      if (office.kind === "magistrat") value -= 30;
      return value;
    };
    return score(b) - score(a) || a.name.localeCompare(b.name, "cs");
  });

  const result = {
    ok: true,
    psc: digits,
    cities: [...units.districts, ...units.obce, ...targets.map((target) => target.name)].filter(
      (name, index, all) => all.indexOf(name) === index
    ),
    offices,
  };
  officesCache.set(digits, result);
  return result;
}

export async function lookupMunicipalityOfficeByIco(icoRaw) {
  const ico = String(icoRaw ?? "").replace(/\D/g, "");
  if (ico.length !== 8) return null;
  try {
    const data = await fetchJson(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`
    );
    if (!isMunicipalEntity(data)) return null;
    const city = String(
      data?.sidlo?.nazevMestskeCastiObvodu || data?.sidlo?.nazevMestskehoObvodu || data?.sidlo?.nazevObce || ""
    ).trim();
    const psc = normalizePsc(data?.sidlo?.psc);
    let website = await findOfficialWebsite({ city, ico });
    if (!website) website = await guessMunicipalWebsite(city);
    const scraped = website ? await scrapeOfficialEmailDomain(website) : { domain: null };
    const domain = scraped.domain || hostnameFromWebsite(website);
    if (!domain || isPublicMailbox(domain)) return null;
    return toInstitution(data, psc, scraped.website || website, domain);
  } catch {
    return null;
  }
}

export async function lookupOfficialMunicipalityDomain({ website, city, psc, name, ico } = {}) {
  const cacheKey = [website, city, psc, ico].filter(Boolean).join("|");
  if (cacheKey && domainCache.has(cacheKey)) return domainCache.get(cacheKey);

  let resolvedWebsite = website || null;
  if (!resolvedWebsite && ico) {
    const office = await lookupMunicipalityOfficeByIco(ico);
    if (office) {
      const result = {
        ok: Boolean(office.allowedEmailDomain),
        domain: office.allowedEmailDomain || null,
        website: office.officialWebsite,
        source: "ares_wikidata",
      };
      domainCache.set(cacheKey, result);
      return result;
    }
  }
  if (!resolvedWebsite && city) {
    resolvedWebsite = (await findOfficialWebsite({ city, ico })) || (await guessMunicipalWebsite(city));
  }
  if (!resolvedWebsite && psc) {
    const found = await lookupMunicipalityOfficesByPsc(psc);
    const match = (found.offices || []).find((o) =>
      !name ? true : String(o.name).toLocaleLowerCase("cs").includes(String(name).toLocaleLowerCase("cs"))
    );
    if (match) {
      const result = {
        ok: Boolean(match.allowedEmailDomain),
        domain: match.allowedEmailDomain || null,
        website: match.officialWebsite,
        source: "psc_lookup",
      };
      domainCache.set(cacheKey, result);
      return result;
    }
  }

  const scraped = resolvedWebsite ? await scrapeOfficialEmailDomain(resolvedWebsite) : { domain: null };
  const domain = scraped.domain || hostnameFromWebsite(resolvedWebsite);
  const result = {
    ok: Boolean(domain) && !isPublicMailbox(domain),
    domain: isPublicMailbox(domain) ? null : domain,
    website: scraped.website || resolvedWebsite || null,
    source: scraped.domain ? "official_website" : domain ? "website_host" : "unavailable",
  };
  if (cacheKey) domainCache.set(cacheKey, result);
  return result;
}
