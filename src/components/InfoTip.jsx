import { useEffect, useId, useState } from "react";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { IconBulb } from "../data/icons.jsx";

/**
 * Stejná žárovka jako u hlášení — delší vysvětlení až po klepnutí.
 */
export default function InfoTip({
  title,
  children,
  className = "",
  label = "Více informací",
  /** Vedle textu / lišty — ne absolutně vpravo nahoře jako u dlaždice Hlášení */
  inline = false,
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span className={`inline-flex items-center ${className}`.trim()}>
      <button
        type="button"
        className={`pp-map-tab-info-btn ${inline ? "pp-map-tab-info-btn--inline" : ""} ${open ? "pp-map-tab-info-btn--open" : ""}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label}
        title={label}
      >
        <IconBulb className="w-3.5 h-3.5" />
      </button>
      {open ? (
        <AppPanelPortal>
          <div className="pp-info-tip-overlay">
            <button
              type="button"
              className="pp-info-tip-backdrop"
              onClick={() => setOpen(false)}
              aria-label="Zavřít nápovědu"
            />
            <div className="pp-info-tip-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <div className="pp-info-tip-header">
                <span className="pp-info-tip-icon" aria-hidden>
                  <IconBulb className="w-5 h-5" />
                </span>
                <h3 id={titleId} className="pp-info-tip-title">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="pp-info-tip-close"
                  aria-label="Zavřít"
                >
                  ×
                </button>
              </div>
              <div className="pp-info-tip-body">{children}</div>
            </div>
          </div>
        </AppPanelPortal>
      ) : null}
    </span>
  );
}
