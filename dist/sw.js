/* Podplot PWA service worker — síť first + systémová upozornění na zprávy */
const CACHE = "podplot-v4";
const PRECACHE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isAppShell(url) {
  const path = url.pathname;
  return (
    path === "/" ||
    path.endsWith(".html") ||
    path.endsWith(".js") ||
    path.endsWith(".jsx") ||
    path.endsWith(".css") ||
    path.startsWith("/src/") ||
    path.startsWith("/assets/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isAppShell(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});

/** Klik na systémové upozornění → otevřít appku / chat */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          client.postMessage({
            type: "podplot-notification-click",
            peerId: data.peerId || null,
            peerName: data.peerName || null,
          });
          return;
        }
      }
      if (self.clients.openWindow) {
        const win = await self.clients.openWindow(targetUrl);
        if (win) {
          // krátká prodleva — appka se načte a pak otevře chat
          setTimeout(() => {
            win.postMessage?.({
              type: "podplot-notification-click",
              peerId: data.peerId || null,
              peerName: data.peerName || null,
            });
          }, 800);
        }
      }
    })()
  );
});
