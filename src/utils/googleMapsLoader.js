let loadPromise = null;
let cachedConfig = null;

function clientEnvMapsKey() {
  try {
    // Vite injects import.meta.env; plain browser / babel server does not
    const env = import.meta.env;
    const fromVite = env && env.VITE_GOOGLE_MAPS_API_KEY;
    if (typeof fromVite === "string" && fromVite.trim()) return fromVite.trim();
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && typeof window.__PODPLOT_MAPS_KEY__ === "string") {
    return window.__PODPLOT_MAPS_KEY__.trim();
  }
  return "";
}

function configFromKey(key, source) {
  const apiKey = key || null;
  return {
    enabled: Boolean(apiKey),
    apiKey,
    source,
    mockPlaces: !apiKey,
  };
}

export async function fetchMapsConfig() {
  if (cachedConfig) return cachedConfig;

  try {
    const res = await fetch("/api/config/maps", { headers: { Accept: "application/json" } });
    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        if (data && typeof data === "object") {
          cachedConfig = {
            enabled: Boolean(data.enabled && data.apiKey),
            apiKey: data.apiKey || null,
            source: data.source || "api",
            mockPlaces: Boolean(data.mockPlaces ?? !data.apiKey),
          };
          return cachedConfig;
        }
      }
    }
  } catch {
    /* fall through */
  }

  const fallbackKey = clientEnvMapsKey();
  cachedConfig = configFromKey(fallbackKey, fallbackKey ? "client-env" : "offline");
  return cachedConfig;
}

export function didMapsAuthFail() {
  return Boolean(window.__podplotMapsAuthFailed);
}

export async function loadGoogleMaps() {
  const config = await fetchMapsConfig();
  if (!config.enabled || !config.apiKey) {
    throw new Error("Google Maps není nakonfigurováno");
  }
  if (window.google?.maps && !didMapsAuthFail()) return window.google.maps;
  if (loadPromise) return loadPromise;

  window.__podplotMapsAuthFailed = false;
  const prevAuthFailure = window.gm_authFailure;
  window.gm_authFailure = () => {
    window.__podplotMapsAuthFailed = true;
    if (typeof prevAuthFailure === "function") prevAuthFailure();
  };

  loadPromise = new Promise((resolve, reject) => {
    const cbName = "__podplotGoogleMapsInit";
    window[cbName] = () => {
      delete window[cbName];
      if (window.__podplotMapsAuthFailed) {
        loadPromise = null;
        reject(
          new Error(
            "Google Maps API klíč odmítnut. Přidejte HTTP referrer (localhost + podplot.vercel.app) v Google Cloud Console."
          )
        );
        return;
      }
      if (window.google?.maps) resolve(window.google.maps);
      else {
        loadPromise = null;
        reject(new Error("Google Maps se nepodařilo načíst"));
      }
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      config.apiKey
    )}&libraries=places&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Google Maps script failed"));
    };
    document.head.appendChild(script);
  }).then(async (maps) => {
    // Krátká prodleva jen pro detekci gm_authFailure; neblokuj funkční mapu
    await new Promise((r) => setTimeout(r, 300));
    if (didMapsAuthFail()) {
      loadPromise = null;
      throw new Error(
        "Google Maps API klíč odmítnut (prázdná mapa). Zkontrolujte HTTP referrer pro localhost a podplot.vercel.app."
      );
    }
    return maps;
  });

  return loadPromise;
}

export function resetMapsLoaderForTests() {
  loadPromise = null;
  cachedConfig = null;
}
