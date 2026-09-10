/** Limity textu u sousedských příspěvků — dost místa, ne esej. */

export const POST_TITLE_MAX = 70;
export const POST_BODY_MAX = 400;

export function clampPostText(value, max) {
  return String(value ?? "").slice(0, max);
}
