/**
 * Supabase Auth — registrace, přihlášení, odhlášení, obnova hesla.
 */

import { ensureSupabase } from "../lib/supabaseClient.js";

export const MIN_PASSWORD_LENGTH = 6;

export function validatePassword(password, confirm) {
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Heslo musí mít alespoň ${MIN_PASSWORD_LENGTH} znaků.` };
  }
  if (confirm != null && password !== confirm) {
    return { ok: false, error: "Hesla se neshodují." };
  }
  return { ok: true };
}

function mapAuthError(error) {
  const msg = error?.message ?? "Něco se nepovedlo.";
  if (/Invalid login|invalid credentials/i.test(msg)) return "Nesprávný e-mail nebo heslo.";
  if (/already registered|User already registered/i.test(msg)) {
    return "Tento e-mail už je registrovaný — přihlaste se.";
  }
  if (/Email not confirmed/i.test(msg)) {
    return "Nejdřív potvrďte e-mail z odkazu, který jsme poslali.";
  }
  if (/rate limit|security purposes/i.test(msg)) {
    return "Příliš mnoho pokusů — zkuste to za chvíli.";
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
