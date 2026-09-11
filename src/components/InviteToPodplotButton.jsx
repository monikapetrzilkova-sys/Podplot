import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  getPodplotAppUrl,
  getPodplotInviteText,
  mailtoInviteUrl,
  messengerInviteUrl,
  sharePodplotInvite,
  whatsappInviteUrl,
} from "../data/appInviteShare.js";

/** Kompaktní pozvánka do Podplotu přes WhatsApp / Messenger / e-mail. */
export default function InviteToPodplotButton({
  className = "",
  label = "Poslat odkaz na Podplot",
  compact = true,
}) {
  const { user, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const text = getPodplotInviteText({ name: user?.name });
  const appUrl = getPodplotAppUrl();

  const btnClass = compact
    ? "text-[10px] font-semibold text-[#3D7A68] hover:underline"
    : "text-xs font-semibold text-[#3D7A68] hover:underline";

  const openChannel = async (channel) => {
    try {
      if (channel === "whatsapp") {
        window.open(whatsappInviteUrl(text), "_blank", "noopener,noreferrer");
      } else if (channel === "email") {
        window.location.href = mailtoInviteUrl(text);
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
      } else if (channel === "more") {
        const result = await sharePodplotInvite({ name: user?.name });
        if (result === "copied") showToast?.("Pozvánka zkopírována do schránky.", "success");
        if (result === "unavailable") showToast?.("Sdílení v tomto prohlížeči není dostupné.", "info");
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      showToast?.("Sdílení se nepodařilo.", "error");
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`.trim()}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={btnClass}>
        {label}
      </button>
      {open ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => openChannel("whatsapp")}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-[#C5DDD4] bg-white text-[#1B4D3E]"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => openChannel("messenger")}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-[#C5DDD4] bg-white text-[#1B4D3E]"
          >
            Messenger
          </button>
          <button
            type="button"
            onClick={() => openChannel("email")}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-[#C5DDD4] bg-white text-[#1B4D3E]"
          >
            E-mail
          </button>
          <button
            type="button"
            onClick={() => openChannel("more")}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-600"
          >
            Kopírovat
          </button>
        </div>
      ) : null}
    </div>
  );
}
