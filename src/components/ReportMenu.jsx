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
  onDelete = null,
  compact = false,
  label = null,
  reasons = DEFAULT_REASONS,
  disabled = false,
  deleteLabel = "Smazat příspěvek",
}) {
  const [open, setOpen] = useState(false);
  const canReport = typeof onReport === "function";
  const canDelete = typeof onDelete === "function";
  const menuLabel = label || (canDelete && !canReport ? "Moje možnosti" : "Nahlásit příspěvek");

  const handleReport = (reasonId) => {
    onReport?.(reasonId);
    setOpen(false);
  };

  const handleDelete = () => {
    const ok =
      typeof window !== "undefined"
        ? window.confirm("Opravdu chceš smazat tento příspěvek? Tahle akce nejde vrátit.")
        : true;
    if (!ok) return;
    onDelete?.();
    setOpen(false);
  };

  if (disabled || (!canReport && !canDelete)) return null;

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
        aria-label={menuLabel}
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
            {canDelete ? (
              <>
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-stone-400 tracking-wide">
                  {canReport ? "Vlastní příspěvek" : menuLabel}
                </p>
                <button
                  type="button"
                  className="block w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  {deleteLabel}
                </button>
              </>
            ) : null}
            {canReport ? (
              <>
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-stone-400 tracking-wide">
                  {canDelete ? "Nahlásit" : menuLabel}
                </p>
                {reasons.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="block w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-[#F9F9F9]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReport(r.id);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
