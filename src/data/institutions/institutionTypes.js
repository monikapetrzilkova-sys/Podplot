/**
 * Typy institucí samosprávy — pouze obecní / městské úřady a magistráty.
 * Stavební úřady a jiné orgány státní správy sem nepatří.
 */

export const INSTITUTION_KINDS = {
  obecni_urad: { id: "obecni_urad", label: "Obecní úřad" },
  mestsky_urad: { id: "mestsky_urad", label: "Městský úřad" },
  magistrat: { id: "magistrat", label: "Magistrát" },
};

export const INSTITUTION_MEMBER_ROLES = {
  admin: { id: "admin", label: "Administrátor" },
  editor: { id: "editor", label: "Editor" },
};

/** Klíčová slova vylučující zápis z registrace / importu */
export const INSTITUTION_EXCLUSION_PATTERNS = [
  /stavebn/i,
  /dotčen/i,
  /krajský\s+úřad/i,
  /financn[ií]\s+úřad/i,
  /živnostensk/i,
  /katastr/i,
  /hygienick/i,
  /celní/i,
  /úřad\s+práce/i,
  /soud/i,
  /policie/i,
  /hasič/i,
];

export function isEligibleMunicipalityOfficeName(name) {
  const n = String(name ?? "").trim();
  if (!n) return false;
  return !INSTITUTION_EXCLUSION_PATTERNS.some((re) => re.test(n));
}

export function normalizeEmailDomain(domainOrEmail) {
  const raw = String(domainOrEmail ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("@")) {
    const at = raw.lastIndexOf("@");
    return at >= 0 ? raw.slice(at + 1) : null;
  }
  return raw.replace(/^@/, "");
}
