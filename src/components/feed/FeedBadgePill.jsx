import { resolveFeedBadgeMeta } from "./feedBadgeMeta.js";

/**
 * Kategorie jako razítko — výrazná doodle ikona na kulatém pozadí.
 * U Věcí / hlášení zůstává krátký popisek bez rámečku; u Akcí a Výpomoci stačí razítko.
 */
export default function FeedBadgePill({
  badge,
  badgeClassName = "",
  reportCategoryId = null,
  type = null,
  tone: toneProp = null,
  Icon: IconProp = null,
  className = "",
  showLabel: showLabelProp = null,
}) {
  const meta = resolveFeedBadgeMeta({ badge, badgeClassName, reportCategoryId, type });
  const tone = toneProp || meta.tone;
  const Icon = IconProp || meta.Icon;
  const label = badge || meta.label;

  if (!Icon && !label) return null;

  const showLabel =
    showLabelProp != null
      ? showLabelProp
      : tone === "things" || tone === "report" || tone === "groups" || tone === "default";

  return (
    <span
      className={`pp-feed-stamp pp-feed-stamp--${tone} ${className}`.trim()}
      title={label || undefined}
      aria-label={label || undefined}
    >
      <span className="pp-feed-stamp__mark" aria-hidden>
        {Icon ? <Icon className="pp-feed-stamp__icon" /> : null}
      </span>
      {showLabel && label ? <span className="pp-feed-stamp__caption">{label}</span> : null}
    </span>
  );
}
