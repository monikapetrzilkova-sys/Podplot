let loadPromise = null;
let cachedConfig = null;
export async function fetchMapsConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch("/api/config/maps");
    if (!res.ok) throw new Error("config unavailable");
    cachedConfig = await res.json();
    return cachedConfig;
  } catch {
    cachedConfig = { enabled: false, apiKey: null, source: "offline" };
    return cachedConfig;
  }
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
            "Google Maps API klíč odmítnut. Na mobilu přes Wi‑Fi přidejte HTTP referrer (např. http://192.168.*.*:5173/*) v Google Cloud Console."
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
    await new Promise((r) => setTimeout(r, 600));
    if (didMapsAuthFail()) {
      loadPromise = null;
      throw new Error(
        "Google Maps API klíč odmítnut (prázdná mapa). Zkontrolujte omezení HTTP referrer pro mobilní IP."
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
