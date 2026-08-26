import { createRoot } from "react-dom/client";
import { AppProvider } from "./context/AppContext.jsx";
import AppShell from "./App.jsx";

/** iOS Safari: pinch jinak zoomuje celou stránku — mapa si gesta bere sama (touch-action: none). */
function installNoPageZoom() {
  const blockGesture = (e) => {
    e.preventDefault();
  };
  document.addEventListener("gesturestart", blockGesture, { passive: false });
  document.addEventListener("gesturechange", blockGesture, { passive: false });
  document.addEventListener("gestureend", blockGesture, { passive: false });

  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length < 2) return;
      const el = e.target;
      if (
        el instanceof Element &&
        el.closest(".pp-map-google-canvas, .pp-map-container--google, .pp-map-google-wrap")
      ) {
        return;
      }
      e.preventDefault();
    },
    { passive: false }
  );
}

installNoPageZoom();

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <AppShell />
  </AppProvider>
);

/** PWA + systémová upozornění — musí být v JS bundlu (Vite vyhazuje inline skript z index.html). */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* ignore */
    }
    navigator.serviceWorker.register("/sw.js?v=6").catch(() => {});
  });
}
