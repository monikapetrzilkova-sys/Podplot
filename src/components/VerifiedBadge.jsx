import { getVerifiedLabel } from "../data/domainVerification.js";

export default function VerifiedBadge({ accountType, compact = false, className = "" }) {
  const label = getVerifiedLabel(accountType);

  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 shrink-0 ${className}`}
    >
      <span
        className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center text-[9px] font-bold leading-none shadow-sm"
        aria-label={label}
      >
        ✓
      </span>
      {!compact && (
        <span className="text-[10px] font-bold uppercase tracking-wide text-teal-700">Ověřeno</span>
      )}
    </span>
  );
}
