import { useUiPref } from "../hooks/useUiPref.js";
import { accordionKey } from "../data/uiPreferences.js";
import EditedBadge from "./EditedBadge.jsx";
import ReportMenu from "./ReportMenu.jsx";
import FeedBadgePill from "./feed/FeedBadgePill.jsx";
import { getListingBadge, getNeighborSectionBadge } from "./feed/feedBadgeMeta.js";
import { IconMapPin } from "../data/icons.jsx";

export { getListingBadge, getNeighborSectionBadge };

/**
 * Sbalený řádek feedu Domů / Sousedé — razítko kategorie + nadpis, náhled, rozbalení.
 * Volitelně řízené (`expanded` + `onToggle`), jinak ukládá stav do UI prefs.
 */
export default function LiveFeedCard({
  itemId,
  badge,
  badgeClassName = "",
  badgeTone = null,
  BadgeIcon = null,
  reportCategoryId = null,
  title,
  preview = null,
  authorLabel = null,
  onReport,
  onSummaryClick,
  onMapClick = null,
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
  mine = false,
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
    <article
      id={domId}
      className={`pp-feed-card relative ${mine ? "pp-feed-card--mine" : ""}`.trim()}
    >
      <button
        type="button"
        onClick={handleSummaryClick}
        className={`w-full text-left px-3 py-2 transition-colors box-border ${
          onMapClick || onReport ? "pr-16" : "pr-9"
        } ${mine ? "hover:bg-[#EEF5F1]/90" : "hover:bg-[#FAFAFA]/80"}`}
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {badge ? (
                <FeedBadgePill
                  badge={badge}
                  badgeClassName={badgeClassName}
                  reportCategoryId={reportCategoryId}
                  tone={badgeTone}
                  Icon={BadgeIcon}
                  className="shrink-0 self-center"
                />
              ) : null}
              <h3
                className={`font-semibold text-[12px] leading-[1.35] text-stone-900 flex-1 min-w-0 self-center ${
                  isOpen ? "whitespace-normal break-words" : "line-clamp-1"
                }`}
              >
                {title}
              </h3>
              {editedItem && <EditedBadge item={editedItem} className="shrink-0 self-center" />}
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

      {/* Ikonka mapy vždy viditelná ve sbaleném stavu — mimo velké tlačítko karty */}
      {onMapClick && !isOpen && (
        <div className="px-3 pb-2 -mt-0.5">
          <button
            type="button"
            onClick={onMapClick}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#C5DDD4] bg-[#F7FAF9] px-2 py-1 text-[11px] font-semibold text-[#3D7A68] hover:bg-[#E8F3EF] transition-colors"
            aria-label="Zobrazit na mapě"
          >
            <IconMapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
            Na mapě
          </button>
        </div>
      )}

      {onMapClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMapClick();
          }}
          className={`absolute top-1.5 z-10 w-8 h-8 flex items-center justify-center rounded-xl border border-[#C5DDD4] bg-white text-[#3D7A68] shadow-sm hover:bg-[#E8F3EF] transition-colors ${
            onReport ? "right-8" : "right-1.5"
          }`}
          aria-label="Zobrazit na mapě"
          title="Zobrazit na mapě"
        >
          <IconMapPin className="w-4 h-4" aria-hidden />
        </button>
      )}

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
