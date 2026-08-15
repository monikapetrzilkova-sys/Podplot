import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function CompactAccordion({ summary, children, className = "", prefKey }) {
  const { getUiPref, toggleUiPref } = useApp();
  const [localOpen, setLocalOpen] = useState(false);
  const open = prefKey ? getUiPref(prefKey, false) : localOpen;

  const handleToggle = () => {
    if (prefKey) toggleUiPref(prefKey, false);
    else setLocalOpen((v) => !v);
  };

  return (
    <article className={`bg-white border border-stone-200 rounded-xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-stone-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">{summary}</div>
        <span className="shrink-0 text-stone-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-stone-100 animate-[fadeIn_0.15s_ease-out]">
          {children}
        </div>
      )}
    </article>
  );
}
