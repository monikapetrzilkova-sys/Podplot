import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  FEEDBACK_HINT,
  FEEDBACK_KINDS,
  FEEDBACK_MAX,
  FEEDBACK_TITLE,
  FEEDBACK_TO_EMAIL,
  submitAppFeedback,
} from "../data/appFeedback.js";
import { clampPostText } from "../data/postTextLimits.js";
import AppPanelPortal from "./AppPanelPortal.jsx";
import CharCount from "./CharCount.jsx";
import SectionBackButton from "./SectionBackButton.jsx";
import { DoodleFeedbackScene } from "./doodle/doodleIllustrations.jsx";

export default function FeedbackModal({ open, onClose }) {
  const { user, showToast } = useApp();
  const [kind, setKind] = useState("tip");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKind("tip");
    setMessage("");
    setBusy(false);
  }, [open]);

  if (!open) return null;

  const canSend = message.trim().length >= 8 && !busy;

  const send = async () => {
    if (!canSend) return;
    setBusy(true);
    const result = await submitAppFeedback({ kind, message, user });
    setBusy(false);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    if (result.mailto && !result.stored) {
      window.location.href = result.mailto;
      showToast(`Otevřel se e-mail na ${FEEDBACK_TO_EMAIL}. Pošli ho, ať nám to dorazí.`, "info");
    } else {
      showToast("Díky, zkusíme s tím něco udělat.", "success");
    }
    onClose?.();
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="pp-app-sheet pp-app-sheet--full flex flex-col" role="dialog" aria-label={FEEDBACK_TITLE}>
          <div className="px-4 pt-4 pb-3 border-b border-stone-100 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-stone-900 leading-snug">{FEEDBACK_TITLE}</h2>
                <p className="text-xs text-stone-500 leading-relaxed mt-1">{FEEDBACK_HINT}</p>
              </div>
              <SectionBackButton onClick={onClose} />
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto px-5 pt-4 pb-6">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {FEEDBACK_KINDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setKind(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    kind === item.id
                      ? "bg-[#E8F3EF] border-[#3D7A68] text-[#1B4332]"
                      : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="block mb-4">
              <span className="text-[11px] font-semibold text-stone-600">Zpráva</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(clampPostText(e.target.value, FEEDBACK_MAX))}
                maxLength={FEEDBACK_MAX}
                rows={8}
                placeholder="Např. při registraci jsem nenašla číslo popisné, nebo chci kalendář akcí na Domů…"
                className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none min-h-[10rem]"
              />
              <CharCount value={message} max={FEEDBACK_MAX} />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm border border-stone-200 rounded-xl"
              >
                Zrušit
              </button>
              <button
                type="button"
                disabled={!canSend}
                onClick={send}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
                style={{ background: "#1B4332" }}
              >
                {busy ? "Posílám…" : "Odeslat"}
              </button>
            </div>

            <div className="pp-hub-doodle-footer" aria-hidden>
              <DoodleFeedbackScene className="w-full max-w-[220px] h-auto text-[#3D7A68]" />
            </div>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
