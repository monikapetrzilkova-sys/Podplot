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

export async function loadGoogleMaps() {
  const config = await fetchMapsConfig();
  if (!config.enabled || !config.apiKey) {
    throw new Error("Google Maps není nakonfigurováno");
  }
  if (window.google?.maps) return window.google.maps;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const cbName = "__podplotGoogleMapsInit";
    window[cbName] = () => {
      delete window[cbName];
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error("Google Maps se nepodařilo načíst"));
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.apiKey)}&libraries=places&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps script failed"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function resetMapsLoaderForTests() {
  loadPromise = null;
  cachedConfig = null;
}
