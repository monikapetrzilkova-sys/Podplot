/** Aktivní nabídka pomoci platí 48 hodin */

export const HELP_OFFER_TTL_MS = 48 * 60 * 60 * 1000;

export function formatHelpOfferRemaining(expiresAt) {
  if (!expiresAt) return "do 48 h";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "vypršelo";
  const hours = Math.max(1, Math.ceil(ms / (60 * 60 * 1000)));
  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    return `ještě ${days} ${days === 1 ? "den" : "dny"}`;
  }
  return `ještě ${hours} h`;
}
