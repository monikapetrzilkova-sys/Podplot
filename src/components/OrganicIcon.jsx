/** Organická ikona kategorie — bublina na stonku */

import { getCategoryTheme, LABEL_COLOR } from "../data/categoryThemes.js";

const BUBBLE_SIZE = 64;
const ICON_SIZE = 16; /* ~10 % menší než dřívějších 18 px — více white space */

export function CategoryIconContainer({ children, active = false, theme = null, className = "" }) {
  const t = theme ?? getCategoryTheme("zahrada");

  return (
    <div
      className={`category-icon-container organic-bubble transition-all duration-200 ${className}`}
      style={{
        background: active ? t.bubbleBgActive : t.bubbleBgIdle,
        borderWidth: active ? 2 : 1,
        borderStyle: "solid",
        borderColor: active ? t.borderActive : t.borderIdle,
        boxShadow: active ? t.glow : "none",
        transform: active ? "scale(1.05)" : "scale(1)",
      }}
    >
      <span
        className="flex items-center justify-center"
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
      >
        {children}
      </span>
    </div>
  );
}

export function OrganicStem({ active = false, theme = null, className = "" }) {
  const t = theme ?? getCategoryTheme("zahrada");

  return (
    <div
      className={`organic-stem transition-all duration-200 ${className}`}
      style={{
        width: 1,
        height: active ? 12 : 10,
        background: active ? t.stemActive : t.stemIdle,
      }}
      aria-hidden
    />
  );
}

export default function OrganicIcon({
  icon,
  label,
  active = false,
  onClick,
  disabled = false,
  theme = null,
  categoryId,
  className = "",
  labelClassName = "",
}) {
  const t = theme ?? getCategoryTheme(categoryId ?? "zahrada");
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`organic-icon flex flex-col items-center gap-0 min-w-[72px] max-w-[80px] transition-transform duration-200 disabled:opacity-40 overflow-visible ${className}`}
    >
      <CategoryIconContainer active={active} theme={t}>
        {icon}
      </CategoryIconContainer>
      <OrganicStem active={active} theme={t} />
      {label && (
        <span
          className={`text-[9px] font-semibold leading-tight text-center mt-1 transition-colors ${labelClassName}`}
          style={{ color: LABEL_COLOR }}
        >
          {label}
        </span>
      )}
    </Tag>
  );
}

export { BUBBLE_SIZE, ICON_SIZE };
