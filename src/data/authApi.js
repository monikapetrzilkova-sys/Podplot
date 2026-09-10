/**
 * Supabase Auth — registrace, přihlášení, odhlášení, obnova hesla.
 */

import { ensureSupabase } from "../lib/supabaseClient.js";

export const MIN_PASSWORD_LENGTH = 6;

export const EMAIL_TAKEN_CODE = "email_taken";
export const EMAIL_TAKEN_MESSAGE =
  "Tento e-mail už je registrovaný. Přihlaš se, nebo si nech poslat odkaz na nové heslo.";

export function validatePassword(password, confirm) {
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.` };
  }
  if (confirm != null && password !== confirm) {
    return { ok: false, error: "Hesla se neshodují." };
  }
  return { ok: true };
}

/** Síla hesla pro lištu v registraci — 0 prázdné, 1 slabé … 4 velmi silné. */
export function getPasswordStrength(password) {
  const p = String(password ?? "");
  if (!p) return { score: 0, label: "", tone: "empty" };
  if (p.length < MIN_PASSWORD_LENGTH) {
    return { score: 1, label: "Slabé", tone: "weak" };
  }
  let points = 1;
  if (p.length >= 8) points += 1;
  if (p.length >= 12) points += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) points += 1;
  if (/\d/.test(p)) points += 1;
  if (/[^A-Za-z0-9]/.test(p)) points += 1;
  const score = points <= 2 ? 1 : points <= 3 ? 2 : points <= 4 ? 3 : 4;
  const labels = { 1: "Slabé", 2: "Střední", 3: "Silné", 4: "Velmi silné" };
  const tones = { 1: "weak", 2: "fair", 3: "good", 4: "strong" };
  return { score, label: labels[score], tone: tones[score] };
}

export function isExistingAccountSignUp(data, error) {
  const msg = `${error?.message ?? ""} ${error?.code ?? ""}`;
  if (/already registered|user already registered|user_already_exists|already been registered/i.test(msg)) {
    return true;
  }
  const identities = data?.user?.identities;
  return Array.isArray(identities) && identities.length === 0;
}

function mapAuthError(error) {
  const msg = error?.message ?? "Něco se nepovedlo.";
  if (/Invalid login|invalid credentials/i.test(msg)) return "Nesprávný e-mail nebo heslo.";
  if (/already registered|User already registered|user_already_exists/i.test(msg)) {
    return EMAIL_TAKEN_MESSAGE;
  }
  if (/Email not confirmed/i.test(msg)) {
    return "Nejdřív potvrď e-mail z odkazu, který jsme poslali.";
  }
  if (/rate limit|security purposes/i.test(msg)) {
    return "Příliš mnoho pokusů — zkus to za chvíli.";
  }
  if (/Password should be/i.test(msg)) {
    return `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.`;
  }
  return msg;
}

function redirectOrigin() {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

/** @returns {Promise<{ ok: boolean, error?: string, user?: object, session?: object, needsEmailConfirm?: boolean, localOnly?: boolean }>} */
export async function authSignUp({ email, password, metadata = {} }) {
  const sb = await ensureSupabase();
  if (!sb) {
    return { ok: false, error: "Registrace s heslem vyžaduje připojení k serveru.", localOnly: true };
  }
  const { data, error } = await sb.auth.signUp({
    email: String(email).trim(),
    password,
    options: {
      data: metadata,
      emailRedirectTo: redirectOrigin(),
    },
  });
  if (isExistingAccountSignUp(data, error)) {
    return { ok: false, error: EMAIL_TAKEN_MESSAGE, code: EMAIL_TAKEN_CODE };
  }
  if (error) return { ok: false, error: mapAuthError(error) };
  return {
    ok: true,
    user: data.user,
    session: data.session,
    needsEmailConfirm: Boolean(data.user && !data.session),
  };
}

export async function authSignIn(email, password) {
  const sb = await ensureSupabase();
  if (!sb) return { ok: false, error: "Přihlášení momentálně není k dispozici." };
  const { data, error } = await sb.auth.signInWithPassword({
    email: String(email).trim(),
    password,
  });
  if (error) return { ok: false, error: mapAuthError(error) };
  return { ok: true, user: data.user, session: data.session };
}

export async function authSignOut() {
  const sb = await ensureSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function authResetPassword(email) {
  const sb = await ensureSupabase();
  if (!sb) return { ok: false, error: "Obnova hesla momentálně není k dispozici." };
  const { error } = await sb.auth.resetPasswordForEmail(String(email).trim(), {
    redirectTo: `${redirectOrigin()}/`,
  });
  if (error) return { ok: false, error: mapAuthError(error) };
  return { ok: true };
}

export async function authUpdatePassword(password) {
  const sb = await ensureSupabase();
  if (!sb) return { ok: false, error: "Změna hesla momentálně není k dispozici." };
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { ok: false, error: mapAuthError(error) };
  return { ok: true };
}

export async function authGetSession() {
  const sb = await ensureSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session ?? null;
}

/** @param {(event: string, session: object | null) => void} callback */
export function subscribeAuth(callback) {
  let unsub = () => {};
  let cancelled = false;
  ensureSupabase().then((sb) => {
    if (!sb || cancelled) return;
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    unsub = () => data.subscription.unsubscribe();
  });
  return () => {
    cancelled = true;
    unsub();
  };
}
