import { createRoot } from "react-dom/client";
import { AppProvider } from "./context/AppContext.jsx";
import AppShell from "./App.jsx";

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
    navigator.serviceWorker.register("/sw.js?v=4").catch(() => {});
  });
}
