import { useState } from "react";

const DEFAULT_REASONS = [
  { id: "spam", label: "Spam" },
  { id: "offensive", label: "Urážlivé" },
  { id: "misleading", label: "Zavádějící obsah" },
];

export const EVENT_REPORT_REASONS = [
  { id: "inappropriate", label: "Nevhodná akce" },
  { id: "spam", label: "Spam" },
  { id: "offensive", label: "Urážlivé" },
  { id: "misleading", label: "Zavádějící obsah" },
];

function IconDots({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export default function ReportMenu({
  onReport,
  compact = false,
  label = "Nahlásit příspěvek",
  reasons = DEFAULT_REASONS,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const handleReport = (reasonId) => {
    onReport?.(reasonId);
    setOpen(false);
  };

  if (disabled) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`text-stone-400 hover:text-stone-600 transition-colors ${
          compact ? "p-1" : "p-1.5"
        }`}
        aria-label={label}
      >
        <IconDots className={compact ? "w-4 h-4" : "w-5 h-5"} />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-label="Zavřít"
          />
          <div className="absolute right-0 top-7 z-20 bg-white border border-stone-200 rounded-xl shadow-lg py-1 min-w-[160px]">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-stone-400 tracking-wide">
              {label}
            </p>
            {reasons.map((r) => (
              <button
                key={r.id}
                type="button"
                className="block w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-[#F9F9F9]"
                onClick={() => handleReport(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
