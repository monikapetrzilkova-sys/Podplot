/** Kosterní náhled živého dění při načítání */
export default function FeedSkeleton({ rows = 3, className = "" }) {
  return (
    <div className={`space-y-2 px-4 ${className}`} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="pp-card p-3.5 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D8E8E2] shrink-0" />
            <div className="flex-1 min-w-0 space-y-2 pt-0.5">
              <div className="h-3 w-24 rounded-md bg-[#D8E8E2]" />
              <div className="h-3.5 w-[88%] rounded-md bg-[#E8F3EF]" />
              <div className="h-3 w-[62%] rounded-md bg-[#E8F3EF]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
