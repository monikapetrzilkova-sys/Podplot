/**
 * Veřejné dohledání obecního / městského úřadu podle PSČ
 * a oficiální e-mailové domény z webu obce (RÚIAN + ARES + Wikidata).
 */

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

function mapOfficeName(aresName, city, formCode) {
  const raw = String(aresName ?? "").trim();
  const lower = raw.toLowerCase();
  if (lower.includes("hlavní město") || lower.includes("magistrát")) {
    return raw.includes("Magistrát") ? raw : `Magistrát ${city}`.trim();
  }
  const fromName = /^město\b/i.test(raw) ? "Městský úřad" : /^městys\b/i.test(raw) ? "Obecní úřad" : null;
  const meta = MUNICIPAL_FORMS[formCode] || MUNICIPAL_FORMS[801];
  const cityName = city || raw.replace(/^(obec|město|městys|statutární město)\s+/i, "").trim();
  return `${fromName || meta.officePrefix} ${cityName}`.trim();
}

function officeKind(aresName, formCode) {
  const lower = String(aresName ?? "").toLowerCase();
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

async function queryRuianLayer(layerId, { where, outFields, resultRecordCount = 200, distinct = false } = {}) {
  const url = new URL(`${RUIAN_MAP}/${layerId}/query`);
  url.searchParams.set("where", where);
  url.searchParams.set("outFields", outFields);
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("f", "json");
  if (!distinct) url.searchParams.set("resultRecordCount", String(resultRecordCount));
  if (distinct) url.searchParams.set("returnDistinctValues", "true");
  const data = await fetchJson(url);
  if (data?.error) throw new Error(data.error.message || "RÚIAN query failed");
  return Array.isArray(data?.features) ? data.features : [];
}

function sampleEvenly(items, max) {
  if (items.length <= max) return items;
  const out = [];
  const step = (items.length - 1) / (max - 1);
  for (let i = 0; i < max; i += 1) {
    out.push(items[Math.round(i * step)]);
  }
  return [...new Set(out)];
}

function cityFromRuianAddress(adresa) {
  const raw = String(adresa ?? "").trim();
  const match = raw.match(/\d{5}\s+(.+)$/);
  return match ? match[1].trim() : "";
}

async function municipalitiesForPsc(psc) {
  const digits = normalizePsc(psc);
  let streets = [];
  try {
    streets = await queryRuianLayer(1, {
      where: `psc=${digits}`,
      outFields: "ulice",
      distinct: true,
    });
  } catch {
    streets = [];
  }
  const codes = streets.map((f) => f?.attributes?.ulice).filter((n) => Number.isFinite(Number(n)));
  const sample = sampleEvenly(codes, 24);
  const found = new Map();

  if (sample.length) {
    try {
      const streetRows = await queryRuianLayer(4, {
        where: sample.map((kod) => `kod=${Number(kod)}`).join(" OR "),
        outFields: "obec,ulice,nazev",
        resultRecordCount: 40,
      });
      const obecCodes = [...new Set(streetRows.map((f) => f?.attributes?.obec).filter(Boolean))];
      if (obecCodes.length) {
        const obce = await queryRuianLayer(12, {
          where: obecCodes.map((kod) => `kod=${Number(kod)}`).join(" OR "),
          outFields: "kod,nazev",
          resultRecordCount: 20,
        });
        obce
          .map((f) => ({
            kod: f?.attributes?.kod ?? null,
            name: String(f?.attributes?.nazev ?? "").trim(),
          }))
          .filter((row) => row.name)
          .forEach((row) => found.set(row.name.toLocaleLowerCase("cs"), row));
      }
    } catch {
      /* zkusíme obce z textu adresy */
    }
  }

  const names = new Set();
  for (const offset of [0, 250, 500]) {
    const url = new URL(`${RUIAN_MAP}/1/query`);
    url.searchParams.set("where", `psc=${digits}`);
    url.searchParams.set("outFields", "adresa");
    url.searchParams.set("returnGeometry", "false");
    url.searchParams.set("resultRecordCount", "40");
    url.searchParams.set("resultOffset", String(offset));
    url.searchParams.set("f", "json");
    try {
      const data = await fetchJson(url);
      (data?.features ?? []).forEach((f) => {
        const city = cityFromRuianAddress(f?.attributes?.adresa);
        if (city) names.add(city);
      });
    } catch {
      break;
    }
  }
  names.forEach((name) => {
    const key = name.toLocaleLowerCase("cs");
    if (!found.has(key)) found.set(key, { kod: null, name });
  });
  return [...found.values()];
}

async function searchAresMunicipal(name) {
  const queries = [`Obec ${name}`, `Město ${name}`, `Městys ${name}`, `Statutární město ${name}`];
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

function isMunicipalEntity(row) {
  const form = String(row?.pravniForma ?? row?.pravniFormaRos ?? "");
  if (MUNICIPAL_FORMS[form]) return true;
  const name = String(row?.obchodniJmeno ?? "").toLowerCase();
  return /^(obec|město|městys|statutární město|hlavní město)\b/.test(name);
}

function cityMatches(row, city) {
  const target = String(city ?? "").trim().toLocaleLowerCase("cs");
  if (!target) return true;
  const nazev = String(row?.sidlo?.nazevObce ?? "").trim().toLocaleLowerCase("cs");
  const name = String(row?.obchodniJmeno ?? "")
    .replace(/^(obec|město|městys|statutární město|hlavní město)\s+/i, "")
    .trim()
    .toLocaleLowerCase("cs");
  return nazev === target || name === target;
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
  const city = String(sidlo.nazevObce || "").trim();
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

  let cities = [];
  try {
    cities = await municipalitiesForPsc(digits);
  } catch {
    cities = [];
  }
  if (!cities.length) {
    try {
      const nom = new URL("https://nominatim.openstreetmap.org/search");
      nom.searchParams.set("postalcode", digits);
      nom.searchParams.set("country", "cz");
      nom.searchParams.set("format", "json");
      nom.searchParams.set("addressdetails", "1");
      nom.searchParams.set("limit", "5");
      nom.searchParams.set("accept-language", "cs");
      const items = await fetchJson(nom);
      const fallback = (Array.isArray(items) ? items : [])
        .map((item) => item?.address?.city || item?.address?.town || item?.address?.village || item?.address?.municipality)
        .filter(Boolean)
        .map((name) => ({ kod: null, name: String(name).trim() }));
      cities = fallback;
    } catch {
      cities = [];
    }
  }
  const uniqueCities = [...new Map(cities.map((c) => [c.name.toLocaleLowerCase("cs"), c])).values()];
  const offices = [];

  for (const city of uniqueCities.slice(0, 6)) {
    const entities = (await searchAresMunicipal(city.name)).filter(
      (row) => isMunicipalEntity(row) && cityMatches(row, city.name)
    );
      const pscMatches = entities.filter((row) => normalizePsc(row?.sidlo?.psc) === digits);
      const shortlist = pscMatches.length ? pscMatches : entities;
      const seen = new Set();
    for (const row of shortlist) {
      const ico = String(row.ico ?? "").replace(/\D/g, "");
      if (!ico || seen.has(ico)) continue;
      seen.add(ico);
      let website = await findOfficialWebsite({ city: city.name, ico });
      if (!isCzOfficialWebsite(website)) website = null;
      if (!website) website = await guessMunicipalWebsite(city.name);
      if (!isCzOfficialWebsite(website)) continue;
      const scraped = await scrapeOfficialEmailDomain(website);
      const domain = scraped.domain || hostnameFromWebsite(website);
      if (!domain || isPublicMailbox(domain) || !(domain.endsWith(".cz") || domain.endsWith(".eu"))) continue;
      offices.push(toInstitution(row, digits, scraped.website || website, domain));
    }
  }

  const result = {
    ok: true,
    psc: digits,
    cities: uniqueCities.map((c) => c.name),
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
    const city = String(data?.sidlo?.nazevObce || "").trim();
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
