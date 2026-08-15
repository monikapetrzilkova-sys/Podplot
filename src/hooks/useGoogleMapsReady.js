import { useEffect, useState } from "react";
import { fetchMapsConfig, loadGoogleMaps, didMapsAuthFail } from "../utils/googleMapsLoader.js";
export function useGoogleMapsReady() {
  const [state, setState] = useState({
    ready: false,
    enabled: false,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await fetchMapsConfig();
        if (cancelled) return;
        if (!config.enabled || !config.apiKey) {
          setState({ ready: false, enabled: false, loading: false, error: null });
          return;
        }
        setState((s) => ({ ...s, enabled: true, loading: true, error: null }));
        await loadGoogleMaps();
        if (cancelled) return;
        if (didMapsAuthFail()) {
          setState({
            ready: false,
            enabled: false,
            loading: false,
            error: "Google Maps klíč odmítnut (referrer / mobilní IP)",
          });
          return;
        }
        setState({ ready: true, enabled: true, loading: false, error: null });
      } catch (err) {
        if (cancelled) return;
        setState({
          ready: false,
          enabled: false,
          loading: false,
          error: err?.message ?? "Mapa nedostupná",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}
