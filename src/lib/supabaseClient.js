/**
 * Volitelný Supabase klient.
 * Konfigurace: /api/config/supabase (runtime) nebo VITE_SUPABASE_* (Vite build).
 */

import { createClient } from "@supabase/supabase-js";

let client = null;
let initPromise = null;

function clientEnvSupabase() {
  try {
    const env = import.meta.env;
    const url = env?.VITE_SUPABASE_URL;
    const anonKey = env?.VITE_SUPABASE_ANON_KEY;
    if (typeof url === "string" && url.trim() && typeof anonKey === "string" && anonKey.trim()) {
      return { url: url.trim(), anonKey: anonKey.trim() };
    }
  } catch {
    /* babel / bez Vite */
  }
  if (typeof window !== "undefined" && window.__PODPLOT_SUPABASE__) {
    const cfg = window.__PODPLOT_SUPABASE__;
    if (cfg?.url && cfg?.anonKey) return { url: cfg.url, anonKey: cfg.anonKey };
  }
  return null;
}

async function fetchSupabaseConfig() {
  try {
    const res = await fetch("/api/config/supabase", { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.enabled && data.url && data.anonKey) {
      return { url: data.url, anonKey: data.anonKey };
    }
  } catch {
    /* offline */
  }
  return clientEnvSupabase();
}

/** Synchronní přístup — po await ensureSupabase(). */
export function getSupabase() {
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(client) || Boolean(clientEnvSupabase());
}

/** Inicializace klienta (jednou). Vrací klienta nebo null. */
export async function ensureSupabase() {
  if (client) return client;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const cfg = await fetchSupabaseConfig();
    if (!cfg?.url || !cfg?.anonKey) {
      client = null;
      return null;
    }
    client = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
    return client;
  })();

  return initPromise;
}
