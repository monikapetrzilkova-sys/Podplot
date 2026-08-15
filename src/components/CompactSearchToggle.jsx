import { useState } from "react";
import { IconNavSearch } from "./communityNavIcons.jsx";

/**
 * Úsporné hledání: zavřené = malá lupička, otevřené = pole + ×.
 * Volitelně řízené přes `expanded` / `onExpandedChange`.
 */
export default function CompactSearchToggle({
  value = "",
  onChange,
  placeholder = "Hledat…",
  ariaLabel = "Hledat",
  className = "",
  expanded: expandedProp,
  onExpandedChange,
}) {
  const [localExpanded, setLocalExpanded] = useState(Boolean(value));
  const controlled = typeof expandedProp === "boolean";
  const expanded = controlled ? expandedProp : localExpanded;

  const setExpanded = (next) => {
    if (!controlled) setLocalExpanded(next);
    onExpandedChange?.(next);
  };

  const active = expanded || Boolean(String(value).trim());

  if (active) {
    return (
      <div className={`flex items-center gap-1.5 min-w-0 w-full ${className}`.trim()}>
        <input
          type="search"
          autoFocus={expanded && !String(value).trim()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="flex-1 min-w-0 px-2.5 py-2 rounded-xl text-xs bg-white text-[#1B4D3E] border border-[#C5DDD4] focus:outline-none focus:border-[#1B4D3E]"
        />
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            onChange("");
          }}
          aria-label="Zavřít hledání"
          className="shrink-0 w-9 h-9 rounded-xl text-stone-500 hover:bg-stone-100 text-sm font-bold"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`shrink-0 w-9 h-9 rounded-xl border border-[#C5DDD4] bg-white text-[#1B4D3E] hover:bg-[#F1F6F5] inline-flex items-center justify-center ${className}`.trim()}
    >
      <IconNavSearch className="w-4 h-4" />
    </button>
  );
}
