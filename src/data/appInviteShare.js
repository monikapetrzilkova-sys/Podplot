/** Sdílení odkazu na Podplot (pozvánka ke stažení / otevření). */

export function getPodplotAppUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/`;
  }
  return "https://podplot.vercel.app/";
}

export function getPodplotInviteText({ name } = {}) {
  const url = getPodplotAppUrl();
  const who = name ? `${String(name).trim().split(/\s+/)[0]}, ` : "";
  return `${who}zkus Podplot — appku pro sousedy v okolí (výpomoc, inzeráty, tipy). Otevři tu: ${url}`;
}

export function whatsappInviteUrl(text = getPodplotInviteText()) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function mailtoInviteUrl(text = getPodplotInviteText()) {
  return `mailto:?subject=${encodeURIComponent("Pozvánka do Podplotu")}&body=${encodeURIComponent(text)}`;
}

/** Messenger (mobilní deep link) — na desktopu často selže, pak použij native share / schránku. */
export function messengerInviteUrl(appUrl = getPodplotAppUrl()) {
  return `fb-messenger://share/?link=${encodeURIComponent(appUrl)}`;
}

export async function sharePodplotInvite({ name } = {}) {
  const url = getPodplotAppUrl();
  const text = getPodplotInviteText({ name });
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title: "Podplot", text, url });
    return "shared";
  }
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return "copied";
  }
  return "unavailable";
}
