/**
 * Systémová upozornění prohlížeče (jako WhatsApp / Messenger).
 * Fungují, když je stránka otevřená nebo na pozadí (PWA / se service workerem).
 * iOS: nejlépe po „Přidat na plochu“.
 */

const PREF_KEY = "podplot-message-alerts-v1";

export function getStoredMessageAlertsPref() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw === "0" || raw === "false") return false;
    if (raw === "1" || raw === "true") return true;
  } catch {
    /* ignore */
  }
  return true; // výchozí: chtít upozornění
}

export function setStoredMessageAlertsPref(enabled) {
  try {
    localStorage.setItem(PREF_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function notificationPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

/** Vyžádá oprávnění (musí jít z gestu uživatele). */
export async function requestNotificationPermission() {
  if (typeof Notification === "undefined") {
    return { ok: false, permission: "unsupported" };
  }
  if (Notification.permission === "granted") {
    return { ok: true, permission: "granted" };
  }
  if (Notification.permission === "denied") {
    return { ok: false, permission: "denied" };
  }
  try {
    const permission = await Notification.requestPermission();
    return { ok: permission === "granted", permission };
  } catch {
    return { ok: false, permission: "denied" };
  }
}

/**
 * Zobrazí systémové upozornění o nové zprávě.
 * Preferuje service worker (lepší na mobilu na pozadí).
 */
export async function showMessageNotification({
  title,
  body,
  peerId = null,
  peerName = null,
  tag = null,
} = {}) {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission !== "granted") return false;

  const payload = {
    title: title || "Nová zpráva",
    body: body || "Někdo ti napsal na Podplotu.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: tag || (peerId ? `podplot-msg-${peerId}` : `podplot-msg-${Date.now()}`),
    renotify: true,
    data: {
      type: "message",
      peerId,
      peerName,
      url: "/",
    },
  };

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) {
      await reg.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        tag: payload.tag,
        renotify: true,
        requireInteraction: false,
        data: payload.data,
      });
      return true;
    }
  } catch {
    /* fallback níže */
  }

  try {
    const n = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      tag: payload.tag,
      data: payload.data,
    });
    n.onclick = () => {
      try {
        window.focus();
        n.close();
        window.dispatchEvent(
          new CustomEvent("podplot:open-chat", {
            detail: { peerId, peerName },
          })
        );
      } catch {
        /* ignore */
      }
    };
    return true;
  } catch {
    return false;
  }
}
