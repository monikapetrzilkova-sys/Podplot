import { useLayoutEffect, useState } from "react";
import AppPanelPortal, { getAppModalHost } from "./AppPanelPortal.jsx";

/**
 * Rozbalovací nabídka ukotvená k tlačítku — přes portál do #app-modal-root,
 * aby ji neorezal overflow karty ani nepřekryl fixed backdrop ve stejném stacku.
 */
export default function AnchoredDropdown({ open, onClose, anchorRef, minWidth = 168, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: minWidth });

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return undefined;

    const place = () => {
      const host = getAppModalHost();
      const btn = anchorRef.current.getBoundingClientRect();
      const hostRect = host?.getBoundingClientRect() ?? {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const width = minWidth;
      const gap = 4;
      let top = btn.bottom - hostRect.top + gap;
      let left = btn.right - hostRect.left - width;
      left = Math.max(8, Math.min(left, hostRect.width - width - 8));
      const estimatedHeight = 160;
      if (top + estimatedHeight > hostRect.height - 8) {
        top = Math.max(8, btn.top - hostRect.top - estimatedHeight - gap);
      }
      setPos({ top, left, width });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef, minWidth]);

  if (!open) return null;

  return (
    <AppPanelPortal>
      <div
        className="absolute inset-0 z-[80]"
        style={{ pointerEvents: "auto" }}
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-transparent"
          onClick={onClose}
          aria-label="Zavřít"
        />
        <div
          className="absolute z-[81] bg-white border border-stone-200 rounded-xl shadow-lg py-1"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          role="menu"
        >
          {children}
        </div>
      </div>
    </AppPanelPortal>
  );
}
