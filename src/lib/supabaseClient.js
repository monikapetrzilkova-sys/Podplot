/**
 * Volitelný Supabase klient. Bez VITE_SUPABASE_URL běží appka na lokálním seedu.
 */

let client = null;
let initTried = false;

export function getSupabase() {
  if (initTried) return client;
  initTried = true;

  const url = import.meta.env?.VITE_SUPABASE_URL;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    client = null;
    return null;
  }

  // Dynamický import by vyžadoval závislost — lazy přes globalThis pokud je CDN,
  // jinak null (lokální seed). Po `npm i @supabase/supabase-js` lze nahradit.
  try {
    // eslint-disable-next-line no-undef
    if (typeof window !== "undefined" && window.supabase?.createClient) {
      client = window.supabase.createClient(url, key);
      return client;
    }
  } catch {
    client = null;
  }
  return null;
}

export function isSupabaseConfigured() {
  return Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);
}
