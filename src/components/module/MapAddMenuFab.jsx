/** Plovoucí plus — menu akcí nad mapou nebo seznamem (stejná pozice v obou režimech) */

import { useEffect, useRef, useState } from "react";
import { IconNavPlus } from "../communityNavIcons.jsx";

export default function MapAddMenuFab({ actions, className = "" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!actions?.length) return null;

  return (
    <div ref={rootRef} className={`pp-map-add-fab ${className}`}>
      {open && (
        <div className="pp-map-add-fab-menu" role="menu">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className="pp-map-add-fab-menu-item"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Přidat"
        aria-expanded={open}
        aria-haspopup="menu"
        className="pp-map-add-fab-btn"
      >
        <IconNavPlus className="w-4 h-4" />
      </button>
    </div>
  );
}
