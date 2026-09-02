import { greetingFirstName } from "./czechVocative.js";

/** Vtipná uvítací hláška po registraci. */
const WELCOME_LINES = [
  (first) => `${first}, vítej v sousedství! 🏘️ Plot začíná právě u tebe.`,
  (first) => `Ahoj ${first}! Sousedé v okolí tě vítají. 🤝`,
  (first) => `${first}, jsi doma — Podplot je připraven.`,
  (first) => `Vítej na place, ${first}! 🌿 Ať se tu cítíš dobře.`,
  (first) => `${first}, zapnuli jsme ti sousedskou síť. ☕ Kávu si u sousedů nenech ujít.`,
];

export function buildWelcomeToast(name, { isVerified = false, domain = null } = {}) {
  const first = greetingFirstName(name);
  const line = WELCOME_LINES[Math.floor(Math.random() * WELCOME_LINES.length)](first);
  if (isVerified && domain) {
    return `${line} Doména @${domain} je ověřená.`;
  }
  return line;
}
