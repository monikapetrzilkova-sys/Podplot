/** Veřejné e-mailové domény — nejsou považovány za oficiální instituci/podnik. */
import { normalizeAccountType } from "./accountTypes.js";

export const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "seznam.cz",
  "email.cz",
  "post.cz",
  "spoluzaci.cz",
  "centrum.cz",
  "atlas.cz",
  "volny.cz",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
]);

export const VERIFIABLE_ACCOUNT_TYPES = new Set(["urad", "instituce", "podnik", "remeslnik"]);

export function extractEmailDomain(email) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isPublicEmailDomain(domain) {
  if (!domain) return true;
  return PUBLIC_EMAIL_DOMAINS.has(domain.toLowerCase());
}

export function canVerifyAccountType(accountType) {
  const normalized = normalizeAccountType(accountType);
  return normalized === "urad" || normalized === "podnik";
}

export function verifyEmailDomain(email, accountType) {
  if (!canVerifyAccountType(accountType)) {
    return { isVerified: false, domain: null, eligible: false };
  }
  const domain = extractEmailDomain(email);
  if (!domain) {
    return { isVerified: false, domain: null, eligible: true };
  }
  const isVerified = !isPublicEmailDomain(domain);
  return { isVerified, domain, eligible: true };
}

export function getVerifiedLabel(accountType) {
  const normalized = normalizeAccountType(accountType);
  if (normalized === "urad") return "Ověřený úřad";
  if (normalized === "podnik") return "Ověřený podnik / služba";
  return "Ověřený účet";
}
