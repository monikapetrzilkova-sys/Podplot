/**
 * API vrstva institucí — lokální seed nebo Supabase.
 * UI nikdy nehardcoduje obec: vždy getInstitutionById / searchInstitutions.
 */

import { getSupabase } from "../../lib/supabaseClient.js";
import {
  isEligibleMunicipalityOfficeName,
  normalizeEmailDomain,
} from "./institutionTypes.js";
import { isPublicEmailDomain } from "../domainVerification.js";
import { INSTITUTIONS_SEED } from "./registrySeed.js";
import { mergeInstitutionsImport, parseInstitutionsCsv } from "./institutionsImport.js";

let localCache = INSTITUTIONS_SEED.map(normalizeRecord);

function normalizeRecord(row) {
  return {
    id: row.id,
    name: row.name,
    ico: row.ico ?? null,
    psc: String(row.psc ?? "").replace(/\D/g, ""),
    seatCity: row.seatCity ?? row.seat_city ?? "",
    seatAddress: row.seatAddress ?? row.seat_address ?? null,
    allowedEmailDomain: normalizeEmailDomain(row.allowedEmailDomain ?? row.allowed_email_domain) ?? "",
    officialWebsite: row.officialWebsite ?? row.official_website ?? null,
    kind: row.kind ?? "obecni_urad",
    region: row.region ?? null,
    isActive: row.isActive ?? row.is_active ?? true,
    eligibleForRegistration:
      row.eligibleForRegistration ?? row.eligible_for_registration ?? true,
  };
}

function mapDbRow(row) {
  return normalizeRecord({
    id: row.id,
    name: row.name,
    ico: row.ico,
    psc: row.psc,
    seat_city: row.seat_city,
    seat_address: row.seat_address,
    allowed_email_domain: row.allowed_email_domain,
    official_website: row.official_website,
    kind: row.kind,
    region: row.region,
    is_active: row.is_active,
    eligible_for_registration: row.eligible_for_registration,
  });
}

function isRegistrable(inst) {
  return (
    inst.isActive &&
    inst.eligibleForRegistration &&
    isEligibleMunicipalityOfficeName(inst.name)
  );
}

/** @returns {Promise<import('./registrySeed.js').InstitutionRecord[]>} */
export async function listRegistrableInstitutions() {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("institutions")
      .select("*")
      .eq("is_active", true)
      .eq("eligible_for_registration", true)
      .order("name");
    if (!error && data) {
      return data.map(mapDbRow).filter(isRegistrable);
    }
  }
  return localCache.filter(isRegistrable);
}

export async function getInstitutionById(id) {
  if (!id) return null;
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("institutions").select("*").eq("id", id).maybeSingle();
    if (!error && data) return mapDbRow(data);
  }
  return localCache.find((i) => i.id === id) ?? null;
}

/**
 * Fulltext / prefix search: název, PSČ, sídlo, adresa.
 * @param {string} query
 * @param {{ limit?: number }} [opts]
 */
export async function searchInstitutions(query, opts = {}) {
  const limit = opts.limit ?? 12;
  const q = String(query ?? "").trim().toLowerCase();
  if (q.length < 2) return [];

  const all = await listRegistrableInstitutions();
  const pscQ = q.replace(/\s/g, "").replace(/\D/g, "");

  const scored = all
    .map((inst) => {
      const name = inst.name.toLowerCase();
      const city = inst.seatCity.toLowerCase();
      const addr = (inst.seatAddress ?? "").toLowerCase();
      const psc = inst.psc;
      let score = 0;
      if (name.startsWith(q) || city.startsWith(q)) score += 40;
      if (name.includes(q)) score += 25;
      if (city.includes(q)) score += 20;
      if (addr.includes(q)) score += 10;
      if (pscQ.length >= 2 && psc.includes(pscQ)) score += 35;
      if (inst.allowedEmailDomain.includes(q.replace(/^@/, ""))) score += 8;
      return { inst, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.inst.name.localeCompare(b.inst.name, "cs"));

  return scored.slice(0, limit).map((x) => x.inst);
}

/**
 * Ověření: e-mail musí končit oficiální doménou obce (z webu / registru).
 * @param {string} email
 * @param {object} institution
 * @param {string} [expectedDomain] — výsledek dohledání na webu obce
 */
export function verifyWorkEmailForInstitution(email, institution, expectedDomain = null) {
  const domain = normalizeEmailDomain(email);
  const allowed =
    normalizeEmailDomain(expectedDomain) ||
    normalizeEmailDomain(institution?.allowedEmailDomain);
  if (!domain || !allowed) {
    return { ok: false, reason: "missing_domain", domain: domain ?? null, allowedDomain: allowed };
  }
  if (isPublicEmailDomain(domain)) {
    return { ok: false, reason: "public_mailbox", domain, allowedDomain: allowed };
  }
  const matches = domain === allowed || domain.endsWith(`.${allowed}`);
  return {
    ok: matches,
    reason: matches ? "domain_match" : "domain_mismatch",
    domain,
    allowedDomain: allowed,
  };
}

/** Lokální merge (demo). V produkci: staging + RPC merge_institutions_from_staging. */
export async function importInstitutionsFromCsv(csvText) {
  const { rows, errors } = parseInstitutionsCsv(csvText);
  const { institutions, added } = mergeInstitutionsImport(localCache, rows);
  localCache = institutions;
  return { added, errors, total: localCache.length };
}

export function getLocalInstitutionsSnapshot() {
  return [...localCache];
}

/** Pro testovací persony — výchozí demo úřad z registru (ne hardcode v UI). */
export function getDefaultDemoInstitution() {
  return localCache.find((i) => i.id === "inst-jesenice") ?? localCache[0] ?? null;
}
