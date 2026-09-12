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

const BTN =
  "text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border border-[#C5DDD4] bg-white text-[#1B4D3E] hover:bg-[#F1F6F5]";

/**
 * Řádek sdílecích tlačítek (WhatsApp, Messenger, Facebook, Kopírovat odkaz).
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
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      <button type="button" onClick={() => openChannel("whatsapp")} className={BTN}>
        WhatsApp
      </button>
      <button type="button" onClick={() => openChannel("messenger")} className={BTN}>
        Messenger
      </button>
      <button type="button" onClick={() => openChannel("facebook")} className={BTN}>
        Facebook
      </button>
      <button type="button" onClick={() => openChannel("copy")} className={BTN}>
        Kopírovat odkaz
      </button>
      {showEmail ? (
        <button type="button" onClick={() => openChannel("email")} className={BTN}>
          E-mail
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
