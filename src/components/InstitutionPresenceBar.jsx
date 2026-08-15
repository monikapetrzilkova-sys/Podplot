/**
 * Indikátor Live Presence + varování při souběžné editaci stejného záznamu.
 */
export default function InstitutionPresenceBar({ peers = [], conflictPeers = [], className = "" }) {
  if (!peers.length && !conflictPeers.length) return null;

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {peers.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#C5DDD4] bg-[#F1F6F5] px-3 py-2">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          <p className="text-[11px] text-stone-700 leading-snug">
            <span className="font-semibold text-[#1B4D3E]">Online v administraci: </span>
            {peers.map((p) => p.displayName || "Kolega").join(", ")}
          </p>
        </div>
      ) : null}

      {conflictPeers.length > 0 ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 leading-snug"
        >
          <span className="font-bold">Pozor: </span>
          na tomto záznamu právě pracuje{" "}
          {conflictPeers.map((p) => p.displayName || "kolega").join(", ")}. Uložte až po domluvě, ať
          si nepřepíšete změny.
        </div>
      ) : null}
    </div>
  );
}
