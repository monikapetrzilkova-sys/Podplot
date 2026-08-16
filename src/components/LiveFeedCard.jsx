import { useUiPref } from "../hooks/useUiPref.js";
import { accordionKey } from "../data/uiPreferences.js";
import EditedBadge from "./EditedBadge.jsx";
import ReportMenu from "./ReportMenu.jsx";

/** Štítek typu inzerátu / hlášení — label + barevná třída */
export function getListingBadge(type) {
  const t = (type ?? "").toLowerCase();
  if (t.includes("prodám") || t === "prodam") {
    return { label: "PRODÁM", className: "pp-badge--prodam" };
  }
  if (t.includes("půjčovna") || t === "pujcovna") {
    return { label: "PŮJČOVNA", className: "pp-badge--pujcovna" };
  }
  if (t.includes("daruji") || t === "daruji") {
    return { label: "DARUJI", className: "pp-badge--daruji" };
  }
  if (t.includes("sháním") || t === "shanim") {
    return { label: "SHÁNÍM", className: "pp-badge--shanim" };
  }
  if (t === "tip" || t.includes("tip:")) {
    return { label: "TIP", className: "pp-badge--tip" };
  }
  if (t.includes("pátrání") || t.includes("pátrani") || t.includes("zaběhl") || t.includes("ztrát")) {
    return { label: "PÁTRÁNÍ", className: "pp-badge--patrani" };
  }
  if (t.includes("hlášení") || t.includes("hlaseni")) {
    return { label: "HLÁŠENÍ", className: "pp-badge--hlaseni" };
  }
  return { label: (type ?? "BAZAR").toUpperCase(), className: "pp-badge--default" };
}

/** Štítky sekcí Sousedé (výpomoc / skupina / akce) */
export function getNeighborSectionBadge(section, helpType = null) {
  if (section === "vypomoc") {
    if (helpType === "hledam") return { label: "Hledám", className: "pp-badge--hledam" };
    if (helpType === "nabizim") return { label: "Nabízím", className: "pp-badge--nabizim" };
    return { label: "Výpomoc", className: "pp-badge--vypomoc" };
  }
  if (section === "skupiny") return { label: "Skupina", className: "pp-badge--skupina" };
  if (section === "akce") return { label: "Akce", className: "pp-badge--akce" };
  return { label: "Sousedé", className: "pp-badge--default" };
}

/**
 * Sbalený řádek feedu Domů / Sousedé — badge + nadpis, náhled textu, rozbalení.
 * Volitelně řízené (`expanded` + `onToggle`), jinak ukládá stav do UI prefs.
 */
export default function LiveFeedCard({
  itemId,
  badge,
  badgeClassName = "",
  title,
  preview = null,
  authorLabel = null,
  onReport,
  onSummaryClick,
  expandable = true,
  children,
  statusLabel = null,
  statusIcon = null,
  statusTitle = null,
  priceLabel = null,
  editedItem = null,
  expanded: expandedProp,
  onToggle,
  domId,
}) {
  const [prefOpen, , togglePref] = useUiPref(accordionKey("liveFeed", itemId), false);
  const canExpand = expandable && Boolean(children);
  const controlled = typeof expandedProp === "boolean";
  const isOpen = canExpand && (controlled ? expandedProp : prefOpen);

  const handleSummaryClick = () => {
    if (onSummaryClick) {
      onSummaryClick();
      return;
    }
    if (!canExpand) return;
    if (controlled && onToggle) onToggle();
    else togglePref();
  };

  return (
    <article id={domId} className="pp-feed-card overflow-hidden relative">
      <button
        type="button"
        onClick={handleSummaryClick}
        className="w-full text-left px-3 py-2 hover:bg-[#FAFAFA]/80 transition-colors pr-9 box-border"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <div className={`flex gap-1.5 min-w-0 ${isOpen ? "items-start flex-wrap" : "items-center"}`}>
              {badge && (
                <span className={`pp-badge pp-badge--inline shrink-0 ${badgeClassName}`.trim()}>
                  {badge}
                </span>
              )}
              <h3
                className={`font-semibold text-[12px] leading-snug text-stone-900 flex-1 min-w-0 ${
                  isOpen ? "whitespace-normal break-words" : "line-clamp-1"
                }`}
              >
                {title}
              </h3>
              {editedItem && <EditedBadge item={editedItem} className="shrink-0" />}
            </div>
            {authorLabel ? (
              <p className="pp-text-meta text-[10px] mt-0.5 truncate text-stone-500">{authorLabel}</p>
            ) : null}
            {preview && !isOpen && (
              <p className="pp-text-body text-[11px] leading-snug line-clamp-2 mt-0.5 text-stone-600">
                {preview}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {statusIcon ? (
              <span
                className="inline-flex items-center justify-center text-stone-500"
                title={statusTitle || statusLabel || undefined}
                aria-label={statusTitle || statusLabel || undefined}
              >
                {statusIcon}
              </span>
            ) : null}
            {statusLabel && !statusIcon ? (
              <span className="text-amber-800 font-semibold text-[10px] whitespace-nowrap">
                {statusLabel}
              </span>
            ) : null}
            {priceLabel && !(statusLabel && !statusIcon) ? (
              <span className="text-emerald-700 font-bold text-[10px] tabular-nums whitespace-nowrap">
                {priceLabel}
              </span>
            ) : null}
            {canExpand && !onSummaryClick && (
              <span className="pp-text-meta text-[10px]">{isOpen ? "▲" : "▼"}</span>
            )}
          </div>
        </div>
      </button>

      {onReport && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <ReportMenu compact onReport={onReport} />
        </div>
      )}

      {isOpen && (
        <div className="px-3 pb-3 pt-2 border-t border-stone-100 animate-[fadeIn_0.15s_ease-out] space-y-2">
          {children}
        </div>
      )}
    </article>
  );
}
