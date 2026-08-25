/** Ověření převzetí profilu místa — telefon / e-mail z oficiálních údajů (Google Maps, web). */

export const CLAIM_OTP_LENGTH = 6;
/** Demo / vývoj — vždy platný kód vedle náhodně vygenerovaného. */
export const CLAIM_DEMO_OTP = "000000";
export const CLAIM_OTP_TTL_MS = 10 * 60 * 1000;

export function normalizeClaimPhone(value) {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length >= 9) return digits.slice(-9);
  return digits;
}

export function normalizeClaimEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function phonesMatch(a, b) {
  const na = normalizeClaimPhone(a);
  const nb = normalizeClaimPhone(b);
  return Boolean(na && nb && na === nb);
}

export function emailsMatch(a, b) {
  const ea = normalizeClaimEmail(a);
  const eb = normalizeClaimEmail(b);
  return Boolean(ea && eb && ea === eb);
}

export function maskClaimPhone(phone) {
  const digits = normalizeClaimPhone(phone);
  if (digits.length < 6) return "••••••";
  return `+420 ••• ••• ${digits.slice(-3)}`;
}

export function maskClaimEmail(email) {
  const e = normalizeClaimEmail(email);
  const [local, domain] = e.split("@");
  if (!local || !domain) return "••••@••••";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}•••@${domain}`;
}

/**
 * Oficiální kontakty dohledané u místa (Google Maps / katalog / webové údaje v datech).
 * Uživatel si nemůže vymyslet vlastní číslo — jen volí z těchto.
 */
export function getOfficialClaimContacts(place) {
  const phone = String(place?.phone ?? "").trim();
  const email = String(place?.email ?? "").trim();
  const website = String(place?.website ?? "").trim();
  const sources = [];
  if (place?.isGooglePlace) sources.push("Google Maps");
  if (website) sources.push("web místa");
  if (!sources.length) sources.push("veřejné údaje místa");

  return {
    phone: phone || null,
    email: email || null,
    website: website || null,
    hasPhone: Boolean(phone),
    hasEmail: Boolean(email),
    canVerify: Boolean(phone || email),
    sourceLabel: sources.join(" / "),
  };
}

export function generateClaimOtp() {
  let code = "";
  for (let i = 0; i < CLAIM_OTP_LENGTH; i++) {
    code += String(Math.floor(Math.random() * 10));
  }
  return code;
}

export function isClaimOtpValid(input, expected, expiresAt) {
  const code = String(input ?? "").replace(/\D/g, "");
  if (code.length !== CLAIM_OTP_LENGTH) return false;
  if (expiresAt && Date.now() > expiresAt) return false;
  if (code === CLAIM_DEMO_OTP) return true;
  return Boolean(expected) && code === expected;
}
