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
 * „Dohledání na webu obce“ — krátká async fáze + výsledek pro UI registrace.
 */
export async function lookupMunicipalityEmailDomain(institution) {
  await new Promise((r) => setTimeout(r, 320));
  return resolveMunicipalityEmailDomain(institution);
}
