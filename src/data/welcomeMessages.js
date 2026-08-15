/** Vtipná uvítací hláška po registraci. */
const WELCOME_LINES = [
  (first) => `${first}, vítejte v sousedství! 🏘️ Plot začíná právě u vás.`,
  (first) => `Ahoj ${first}! Sousedé v okolí vás vítají. 🤝`,
  (first) => `${first}, jste doma — Podplot je připraven.`,
  (first) => `Vítejte na place, ${first}! 🌿 Ať se tu cítíte dobře.`,
  (first) => `${first}, zapnili jsme vám sousedskou síť. ☕ Kávu si u sousedů nenechte ujít.`,
];

export function buildWelcomeToast(name, { isVerified = false, domain = null } = {}) {
  const first = name.split(" ")[0] || name;
  const line = WELCOME_LINES[Math.floor(Math.random() * WELCOME_LINES.length)](first);
  if (isVerified && domain) {
    return `${line} Doména @${domain} je ověřená.`;
  }
  return line;
}
