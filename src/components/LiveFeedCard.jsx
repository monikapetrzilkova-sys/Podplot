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
  distanceLabel = null,
      onReport,
      onDelete = null,
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
  metaLine = null,
  ctaLabel = null,
}) {
  const [prefOpen, , togglePref] = useUiPref(accordionKey("liveFeed", itemId), false);
  const canExpand = expandable && Boolean(children);
  const controlled = typeof expandedProp === "boolean";
  const isOpen = canExpand && (controlled ? expandedProp : prefOpen);

  const handleSummaryClick = () => {
    if (onSummaryClick && !canExpand) {
      onSummaryClick();
      return;
    }
    if (!canExpand) {
      onSummaryClick?.();
      return;
    }
    if (controlled && onToggle) onToggle();
    else togglePref();
  };

  const authorParts = [authorLabel, distanceLabel].filter(Boolean);
  const authorText = authorParts.length ? authorParts.join(" · ") : null;
  const footerLabel = ctaLabel || metaLine || null;
  const previewText = String(preview ?? "").trim();
  const titleText = String(title ?? "").trim();
  const showPreview = Boolean(previewText && previewText !== titleText);

  return (
    <article
      id={domId}
      className={`pp-feed-card relative ${mine ? "pp-feed-card--mine" : ""} ${
        isOpen ? "pp-feed-card--open" : "pp-feed-card--collapsed"
      }`.trim()}
    >
      <button
        type="button"
        onClick={handleSummaryClick}
        className={`pp-feed-card__summary w-full text-left px-3 py-2 transition-colors box-border ${
          onReport || onDelete ? "pr-10" : "pr-3"
        } ${mine ? "hover:bg-[#EEF5F1]/90" : "hover:bg-[#FAFAFA]/80"} ${
          canExpand || onSummaryClick ? "" : "cursor-default"
        }`}
        aria-expanded={canExpand ? isOpen : undefined}
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
              <h3 className="font-semibold text-[12px] leading-[1.3] text-stone-900 flex-1 min-w-0 self-center line-clamp-1">
                {title}
              </h3>
              {editedItem && <EditedBadge item={editedItem} className="shrink-0 self-center" />}
            </div>
            {authorText ? (
              <p className="pp-feed-card__author pp-text-meta text-[10px] mt-0.5 truncate text-stone-500">
                {authorText}
              </p>
            ) : null}
            {showPreview ? (
              <p
                className={`pp-feed-card__preview pp-text-body text-[11px] leading-snug mt-0.5 text-stone-600 ${
                  isOpen ? "whitespace-pre-wrap" : "line-clamp-2"
                }`}
              >
                {preview}
              </p>
            ) : null}
            {footerLabel ? (
              <p
                className={`pp-feed-card__cta text-[10px] mt-0.5 truncate ${
                  ctaLabel ? "font-semibold text-[#3D7A68]" : "text-stone-500"
                }`}
              >
                {footerLabel}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {onMapClick ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMapClick();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onMapClick();
                  }
                }}
                className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-[#C5DDD4] bg-white text-[#3D7A68] hover:bg-[#E8F3EF] transition-colors"
                aria-label="Zobrazit na mapě"
                title="Zobrazit na mapě"
              >
                <IconMapPin className="w-3.5 h-3.5" aria-hidden />
              </span>
            ) : null}
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
            {canExpand && (
              <span className="pp-text-meta text-[10px]">{isOpen ? "▲" : "▼"}</span>
            )}
          </div>
        </div>
      </button>

      {(onReport || onDelete) && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <ReportMenu
            compact
            onReport={mine ? undefined : onReport}
            onDelete={mine ? onDelete : undefined}
          />
        </div>
      )}

      {isOpen && (
        <div className="px-3 pt-2 pb-3 border-t border-stone-100 animate-[fadeIn_0.15s_ease-out] space-y-2">
          {children}
        </div>
      )}
    </article>
  );
}
