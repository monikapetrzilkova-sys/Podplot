import { useRef, useState } from "react";
import AnchoredDropdown from "./AnchoredDropdown.jsx";

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

function IconFlag({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 21V4.5M5 4.5h9.5l-1.2 3.2 1.2 3.3H5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const btnRef = useRef(null);
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
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`text-stone-400 hover:text-red-600 transition-colors ${
          compact ? "p-1" : "p-1.5"
        }`}
        aria-label={menuLabel}
        aria-expanded={open}
        title={menuLabel}
      >
        {canDelete && !canReport ? (
          <span className={`inline-flex ${compact ? "w-4 h-4" : "w-5 h-5"} items-center justify-center text-lg leading-none`}>
            ···
          </span>
        ) : (
          <IconFlag className={compact ? "w-4 h-4" : "w-5 h-5"} />
        )}
      </button>
      <AnchoredDropdown open={open} onClose={() => setOpen(false)} anchorRef={btnRef}>
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
      </AnchoredDropdown>
    </div>
  );
}
