/**
 * Dohledání oficiální e-mailové domény obce podle webu úřadu.
 * Klient používá oficiální web z registru institucí (hostname = povolená doména).
 * Veřejné schránky (Gmail, Seznam…) nejsou přijaty.
 */

import { isPublicEmailDomain } from "../domainVerification.js";
import { normalizeEmailDomain } from "./institutionTypes.js";

function hostnameFromWebsite(url) {
  if (!url) return null;
  try {
    const href = String(url).includes("://") ? String(url) : `https://${url}`;
    const host = new URL(href).hostname.toLowerCase().replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

/** Oficiální web obce — z registru, nebo odvozený z povolené domény. */
export function getInstitutionOfficialWebsite(institution) {
  if (!institution) return null;
  if (institution.officialWebsite) return String(institution.officialWebsite).trim();
  const domain = normalizeEmailDomain(institution.allowedEmailDomain);
  return domain ? `https://www.${domain}` : null;
}

/**
 * Synchronní odvození domény (web obce → e-mailová doména).
 * Kontaktní e-mailová doména je v registru (ověřená vůči oficiálnímu webu obce).
 * @returns {{ ok: boolean, domain: string | null, website: string | null, source: string }}
 */
export function resolveMunicipalityEmailDomain(institution) {
  const website = getInstitutionOfficialWebsite(institution);
  const fromRegistry = normalizeEmailDomain(institution?.allowedEmailDomain);
  const fromWeb = normalizeEmailDomain(hostnameFromWebsite(website));
  // Preferujeme doménu z registru (např. mu.ckrumlov.cz), web je důkaz dohledání.
  const domain = fromRegistry || fromWeb || null;

  if (!domain || isPublicEmailDomain(domain)) {
    return {
      ok: false,
      domain: null,
      website,
      source: "unavailable",
      reason: "missing_or_public_domain",
    };
  }

  return {
    ok: true,
    domain,
    website,
    source: website ? "official_website" : "registry",
  };
}

/**
 * Dohledání oficiální domény: nejdřív registr / web úřadu, jinak veřejné zdroje.
 */
export async function lookupMunicipalityEmailDomain(institution) {
  const local = resolveMunicipalityEmailDomain(institution);
  if (local.ok) return local;
  try {
    const params = new URLSearchParams();
    if (institution?.officialWebsite) params.set("website", institution.officialWebsite);
    if (institution?.psc) params.set("psc", institution.psc);
    if (institution?.seatCity) params.set("city", institution.seatCity);
    if (institution?.name) params.set("name", institution.name);
    if (institution?.ico) params.set("ico", institution.ico);
    const res = await fetch(`/api/municipality-domain?${params}`);
    const data = await res.json();
    if (data?.ok && data.domain && !isPublicEmailDomain(data.domain)) {
      return {
        ok: true,
        domain: normalizeEmailDomain(data.domain),
        website: data.website || local.website,
        source: data.source || "public_lookup",
      };
    }
  } catch {
    /* zůstane lokální výsledek */
  }
  return local;
}
