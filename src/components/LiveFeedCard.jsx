import { useUiPref } from "../hooks/useUiPref.js";
import { accordionKey } from "../data/uiPreferences.js";
import EditedBadge from "./EditedBadge.jsx";
import ReportMenu from "./ReportMenu.jsx";
import FeedBadgePill from "./feed/FeedBadgePill.jsx";
import { getListingBadge, getNeighborSectionBadge } from "./feed/feedBadgeMeta.js";
import { bodyExceedsCollapsedPreview } from "./feed/feedExpand.js";
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
  const authorParts = [authorLabel, distanceLabel].filter(Boolean);
  const authorText = authorParts.length ? authorParts.join(" · ") : null;
  const footerLabel = ctaLabel || metaLine || null;
  const previewText = String(preview ?? "").trim();
  const titleText = String(title ?? "").trim();
  const showPreview = Boolean(previewText && previewText !== titleText);
  /** Když náhled pokračuje za řádek, vždy umožnit rozbalení (i bez children), pokud není odkaz pryč. */
  const previewNeedsExpand = showPreview && bodyExceedsCollapsedPreview(previewText);
  const hasChildren = children != null && children !== false;
  const canExpand =
    (Boolean(expandable) && hasChildren) || (previewNeedsExpand && !onSummaryClick);
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

  return (
    <article
      id={domId}
      className={`pp-feed-card relative ${mine ? "pp-feed-card--mine" : ""} ${
        isOpen ? "pp-feed-card--open" : "pp-feed-card--truncated"
      }`.trim()}
    >
      <button
        type="button"
        onClick={handleSummaryClick}
        className={`pp-feed-card__summary w-full text-left px-3 py-1.5 transition-colors box-border ${
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
            {/* Sbalené: vždy stejné 3 řádky (autor / náhled / CTA), ať mají karty jednotnou výšku */}
            {isOpen ? (
              <>
                {authorText ? (
                  <p className="pp-feed-card__author pp-text-meta text-[10px] mt-0.5 truncate text-stone-500">
                    {authorText}
                  </p>
                ) : null}
                {showPreview ? (
                  <p className="pp-feed-card__preview pp-text-body text-[11px] leading-snug mt-0.5 text-stone-600 whitespace-pre-wrap">
                    {preview}
                  </p>
                ) : null}
                <div className="pp-feed-card__footer flex items-center gap-1.5 mt-0.5 min-w-0">
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
                      className="shrink-0 w-[1.15rem] h-[1.15rem] inline-flex items-center justify-center rounded-[0.35rem] border border-[#C5DDD4] bg-white text-[#3D7A68] hover:bg-[#E8F3EF] hover:border-[#3D7A68] transition-colors"
                      aria-label="Zobrazit na mapě"
                      title="Zobrazit na mapě"
                    >
                      <IconMapPin className="w-3 h-3" aria-hidden />
                    </span>
                  ) : null}
                  {footerLabel ? (
                    <p
                      className={`pp-feed-card__cta text-[10px] truncate min-w-0 flex-1 ${
                        ctaLabel ? "font-semibold text-[#3D7A68]" : "text-stone-500"
                      }`}
                    >
                      {footerLabel}
                    </p>
                  ) : onMapClick ? (
                    <p className="pp-feed-card__cta text-[10px] truncate min-w-0 flex-1 font-semibold text-[#3D7A68]">
                      Na mapě
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <p className="pp-feed-card__author pp-text-meta text-[10px] mt-0 truncate text-stone-500">
                  {authorText || "\u00A0"}
                </p>
                <p className="pp-feed-card__preview pp-text-body text-[11px] leading-snug mt-0 text-stone-600 line-clamp-1">
                  {showPreview ? preview : "\u00A0"}
                </p>
                <div className="pp-feed-card__footer flex items-center gap-1.5 mt-0 min-w-0">
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
                      className="shrink-0 w-[1.15rem] h-[1.15rem] inline-flex items-center justify-center rounded-[0.35rem] border border-[#C5DDD4] bg-white text-[#3D7A68] hover:bg-[#E8F3EF] hover:border-[#3D7A68] transition-colors"
                      aria-label="Zobrazit na mapě"
                      title="Zobrazit na mapě"
                    >
                      <IconMapPin className="w-3 h-3" aria-hidden />
                    </span>
                  ) : null}
                  <p
                    className={`pp-feed-card__cta text-[10px] truncate min-w-0 flex-1 ${
                      footerLabel
                        ? ctaLabel
                          ? "font-semibold text-[#3D7A68]"
                          : "text-stone-500"
                        : onMapClick
                          ? "font-semibold text-[#3D7A68]"
                          : "invisible"
                    }`}
                  >
                    {footerLabel || (onMapClick ? "Na mapě" : "\u00A0")}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 self-start">
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

      {isOpen && hasChildren ? (
        <div className="px-3 pt-2 pb-3 border-t border-stone-100 animate-[fadeIn_0.15s_ease-out] space-y-2">
          {children}
        </div>
      ) : null}
    </article>
  );
}
