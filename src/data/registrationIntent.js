/** Intent před odhlášením — otevřít registraci konkrétního typu účtu */

const STORAGE_KEY = "podplot_register_intent";

/**
 * @typedef {{ accountType: 'soused' | 'urad', notice?: string }} RegisterIntent
 */

/** @returns {RegisterIntent | null} */
export function readRegisterIntent() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.accountType !== "soused" && parsed?.accountType !== "urad") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** @param {RegisterIntent} intent */
export function writeRegisterIntent(intent) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    /* ignore */
  }
}

export function clearRegisterIntent() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
