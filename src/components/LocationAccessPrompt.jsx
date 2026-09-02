/** První vysvětlení přístupu k poloze — před systémovým dialogem prohlížeče */

import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { requestUserGeolocation } from "../data/mapData.js";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { IconMapPin } from "../data/icons.jsx";

const STORAGE_KEY = "pp-location-access-prompt";

function wasPromptDone() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markPromptDone() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export default function LocationAccessPrompt() {
  const { user, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (wasPromptDone()) return;
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [user?.id]);

  if (!user || !open) return null;

  const finish = (toastMsg, toastType = "info") => {
    markPromptDone();
    setOpen(false);
    if (toastMsg) showToast(toastMsg, toastType);
  };

  const allow = async () => {
    setBusy(true);
    const result = await requestUserGeolocation();
    setBusy(false);
    if (result.mode === "gps") {
      finish("Poloha povolena — okolí a mapa se budou zobrazovat přesněji.", "success");
    } else {
      finish(
        "GPS není k dispozici. Použijeme adresu z registrace — fungovat to bude, ale méně přesně.",
        "info"
      );
    }
  };

  const skip = () => {
    finish(
      "Bez GPS použijeme adresu z profilu. Polohu můžeš povolit později v nastavení prohlížeče.",
      "info"
    );
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay pp-app-sheet-overlay--center" style={{ zIndex: 8 }}>
        <div
          className="pp-app-sheet max-w-[340px] mx-auto rounded-2xl pointer-events-auto overflow-hidden"
          role="dialog"
          aria-labelledby="location-prompt-title"
          aria-modal="true"
        >
          <div className="px-5 pt-5 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F3EF] text-[#1B4D3E] flex items-center justify-center mb-3">
              <IconMapPin className="w-6 h-6" />
            </div>
            <h2 id="location-prompt-title" className="text-lg font-bold text-stone-900 leading-snug">
              Přístup k poloze
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              Podplot podle polohy řadí <strong>hlášení, mapu a nabídky v okolí</strong>. Bez polohy (nebo
              alespoň adresy z registrace) nebude mapa a filtry podle vzdálenosti fungovat spolehlivě.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-stone-500 leading-relaxed">
              <li>· Přesnou adresu ostatním nezobrazujeme — jen vzdálenost a okruh.</li>
              <li>· Polohu používáme jen pro lokalizaci ve tvé obci / okolí.</li>
              <li>· Bez GPS použijeme adresu z profilu (méně přesné).</li>
            </ul>
          </div>
          <div className="px-5 pb-5 space-y-2">
            <button
              type="button"
              disabled={busy}
              onClick={allow}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "#1B4332" }}
            >
              {busy ? "Čekám na povolení…" : "Povolit polohu"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={skip}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200"
            >
              Teď ne — použít adresu
            </button>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
