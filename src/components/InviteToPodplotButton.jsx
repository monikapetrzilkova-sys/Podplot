import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  facebookShareUrl,
  getPodplotAppUrl,
  getPodplotInviteText,
  mailtoInviteUrl,
  messengerInviteUrl,
  sharePodplotInvite,
  whatsappInviteUrl,
} from "../data/appInviteShare.js";

/** Jednoduché rozpoznatelné piktogramy — ne oficiální brand assety. */
function IconWhatsApp({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.82c4.46 0 8.09 3.63 8.09 8.09 0 4.46-3.63 8.09-8.09 8.09-1.42 0-2.8-.37-4.01-1.07l-.29-.17-3.12.82.83-3.04-.19-.31a8.04 8.04 0 0 1-1.22-4.32c0-4.46 3.63-8.09 8.09-8.09zm4.57 10.85c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.44.1-.13.2-.5.65-.62.78-.11.13-.23.15-.43.05-.2-.1-.84-.31-1.6-.99-.59-.53-.99-1.18-1.1-1.38-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.33h-.37c-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63s.7 1.89.8 2.02c.1.13 1.37 2.09 3.32 2.93.46.2.83.32 1.11.41.47.15.89.13 1.23.08.37-.06 1.18-.48 1.35-.95.17-.47.17-.87.12-.95-.05-.08-.18-.13-.38-.23z" />
    </svg>
  );
}

function IconMessenger({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17V22l3.05-1.67c.95.26 1.97.4 3.01.4 5.64 0 10.2-4.13 10.2-9.03C21.4 6.13 17.64 2 12 2zm1.01 12.16-2.61-2.78-5.1 2.78L10.9 9.1l2.68 2.78 5.03-2.78-5.6 5.06z" />
    </svg>
  );
}

function IconFacebook({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M14 8.2V6.1c0-.6.1-1 1.1-1H16V2.1h-2.2C11.2 2.1 10 3.5 10 6v2.2H8V11h2v9h3.2v-9H16l.4-2.8H14z" />
    </svg>
  );
}

function IconCopyLink({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" />
    </svg>
  );
}

function IconEmail({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICON_BTN =
  "inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-xl border border-[#C5DDD4] bg-white text-[#3D7A68] hover:bg-[#E8F3EF] hover:border-[#3D7A68]/40 transition-colors";

/**
 * Řádek sdílecích tlačítek — ikony na jednom řádku (WhatsApp, Messenger, Facebook, Kopírovat).
 * @param {{ className?: string, showEmail?: boolean }} props
 */
export function InviteShareRow({ className = "", showEmail = false }) {
  const { user, showToast } = useApp();
  const text = getPodplotInviteText({ name: user?.name });
  const appUrl = getPodplotAppUrl();

  const openChannel = async (channel) => {
    try {
      if (channel === "whatsapp") {
        window.open(whatsappInviteUrl(text), "_blank", "noopener,noreferrer");
      } else if (channel === "email") {
        window.location.href = mailtoInviteUrl(text);
      } else if (channel === "facebook") {
        window.open(facebookShareUrl(appUrl), "_blank", "noopener,noreferrer");
      } else if (channel === "messenger") {
        const deep = messengerInviteUrl(appUrl);
        window.location.href = deep;
        window.setTimeout(async () => {
          const result = await sharePodplotInvite({ name: user?.name });
          if (result === "copied") {
            showToast?.("Odkaz zkopírován — můžeš ho vložit i do Messengeru.", "success");
          } else if (result === "unavailable") {
            showToast?.("Otevři Messenger a vlož odkaz ručně.", "info");
          }
        }, 700);
      } else if (channel === "copy") {
        const result = await sharePodplotInvite({ name: user?.name });
        if (result === "shared") return;
        if (result === "copied") showToast?.("Pozvánka zkopírována do schránky.", "success");
        if (result === "unavailable") showToast?.("Sdílení v tomto prohlížeči není dostupné.", "info");
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      showToast?.("Sdílení se nepodařilo.", "error");
    }
  };

  return (
    <div
      className={`flex flex-nowrap items-center justify-start gap-2 overflow-x-auto ${className}`.trim()}
      role="group"
      aria-label="Pozvat sousedy"
    >
      <button
        type="button"
        onClick={() => openChannel("whatsapp")}
        className={ICON_BTN}
        aria-label="WhatsApp"
        title="WhatsApp"
      >
        <IconWhatsApp />
      </button>
      <button
        type="button"
        onClick={() => openChannel("messenger")}
        className={ICON_BTN}
        aria-label="Messenger"
        title="Messenger"
      >
        <IconMessenger />
      </button>
      <button
        type="button"
        onClick={() => openChannel("facebook")}
        className={ICON_BTN}
        aria-label="Facebook"
        title="Facebook"
      >
        <IconFacebook />
      </button>
      <button
        type="button"
        onClick={() => openChannel("copy")}
        className={ICON_BTN}
        aria-label="Kopírovat odkaz"
        title="Kopírovat odkaz"
      >
        <IconCopyLink />
      </button>
      {showEmail ? (
        <button
          type="button"
          onClick={() => openChannel("email")}
          className={ICON_BTN}
          aria-label="E-mail"
          title="E-mail"
        >
          <IconEmail />
        </button>
      ) : null}
    </div>
  );
}

/** Kompaktní pozvánka do Podplotu — rozbalovací menu (profil). */
export default function InviteToPodplotButton({
  className = "",
  label = "Poslat odkaz na Podplot",
  compact = true,
}) {
  const [open, setOpen] = useState(false);

  const btnClass = compact
    ? "text-[10px] font-semibold text-[#3D7A68] hover:underline"
    : "text-xs font-semibold text-[#3D7A68] hover:underline";

  return (
    <div className={`relative ${className}`.trim()}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={btnClass}>
        {label}
      </button>
      {open ? <InviteShareRow className="mt-1.5" showEmail /> : null}
    </div>
  );
}
