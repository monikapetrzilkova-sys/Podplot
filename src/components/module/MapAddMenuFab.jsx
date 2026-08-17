/** Plovoucí plus — menu akcí nad mapou (s popiskem, ať je vidět) */

import { useEffect, useRef, useState } from "react";
import { IconNavPlus } from "../communityNavIcons.jsx";

export default function MapAddMenuFab({
  actions,
  label = "Nahlásit",
  className = "",
}) {
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

  const primary = actions[0];
  const secondary = actions.slice(1);

  const runPrimary = () => {
    setOpen(false);
    primary?.onClick?.();
  };

  return (
    <div ref={rootRef} className={`pp-map-add-fab ${className}`}>
      {open && secondary.length > 0 && (
        <div className="pp-map-add-fab-menu" role="menu">
          {secondary.map((action) => (
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
      <div className="pp-map-add-fab-row">
        <button
          type="button"
          onClick={runPrimary}
          aria-label={primary?.label || label}
          className="pp-map-add-fab-btn pp-map-add-fab-btn--labeled"
        >
          <IconNavPlus className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </button>
        {secondary.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Další možnosti"
            aria-expanded={open}
            aria-haspopup="menu"
            className="pp-map-add-fab-btn pp-map-add-fab-btn--more"
          >
            {open ? "▴" : "▾"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
