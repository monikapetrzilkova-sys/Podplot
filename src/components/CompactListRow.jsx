import { ListItemShell } from "./module/ListView.jsx";

/** Sloučí dílčí meta informace do jednoho řádku odděleného tečkami. */
export function joinMetaLine(...parts) {
  return parts.flat().filter(Boolean).join(" · ");
}

/** Kompaktní řádek seznamu — název (+ cena vpravo) + jeden meta řádek */
export default function CompactListRow({
  id,
  title,
  subtitle,
  meta,
  price = null,
  expanded = false,
  onToggle,
  onPress,
  children,
  selected = false,
  accentColor = null,
  muted = false,
}) {
  const metaLine = joinMetaLine(subtitle, meta);

  const isActive = selected || expanded;

  const body = (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <p
          className={`pp-text-title leading-snug flex-1 min-w-0 ${
            expanded ? "whitespace-normal break-words" : "line-clamp-1"
          } ${muted ? "text-stone-400" : ""}`}
        >
          {title}
        </p>
        {price ? (
          <span
            className={`shrink-0 text-[11px] font-bold tabular-nums whitespace-nowrap ${
              muted
                ? "text-stone-400"
                : String(price).toLowerCase().includes("rezervaci")
                  ? "text-amber-800"
                  : "text-[#1B4D3E]"
            }`}
          >
            {price}
          </span>
        ) : null}
      </div>
      {metaLine && (
        <p
          className={`pp-text-meta line-clamp-1 mt-0.5 leading-snug ${
            muted ? "text-stone-400" : ""
          }`}
        >
          {metaLine}
        </p>
      )}
    </div>
  );

  const showChevron = Boolean(onToggle);

  return (
    <ListItemShell id={id} selected={isActive} accentColor={accentColor} muted={muted}>
      {onToggle || onPress ? (
        <button
          type="button"
          onClick={onToggle ?? onPress}
          className="w-full text-left flex items-center gap-2"
          aria-expanded={showChevron ? expanded : undefined}
        >
          {body}
          {showChevron && (
            <span
              className={`shrink-0 text-xs font-bold ${
                muted ? "text-stone-300" : isActive ? "text-[#1B4332]" : "pp-text-meta"
              }`}
            >
              {expanded ? "▲" : "▼"}
            </span>
          )}
        </button>
      ) : (
        <div className="w-full text-left">{body}</div>
      )}
      {expanded && children && (
        <div className="pt-2 mt-2 border-t border-emerald-200/70 animate-[fadeIn_0.15s_ease-out]">
          {children}
        </div>
      )}
    </ListItemShell>
  );
}
