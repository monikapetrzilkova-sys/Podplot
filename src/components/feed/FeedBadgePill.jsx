import { resolveFeedBadgeMeta } from "./feedBadgeMeta.js";

/** Pilulka kategorie ve feedu — neutrální pozadí, barva na ikoně + textu */
export default function FeedBadgePill({
  badge,
  badgeClassName = "",
  reportCategoryId = null,
  type = null,
  tone: toneProp = null,
  Icon: IconProp = null,
  className = "",
}) {
  const meta = resolveFeedBadgeMeta({ badge, badgeClassName, reportCategoryId, type });
  const tone = toneProp || meta.tone;
  const Icon = IconProp || meta.Icon;
  const label = badge || meta.label;

  if (!label) return null;

  return (
    <span className={`pp-feed-pill pp-feed-pill--${tone} ${className}`.trim()}>
      {Icon ? <Icon className="pp-feed-pill__icon" /> : null}
      <span className="pp-feed-pill__label">{label}</span>
    </span>
  );
}
