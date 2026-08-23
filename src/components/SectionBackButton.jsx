import { IconNavBack } from "./communityNavIcons.jsx";

/** Výrazné zpět — stejný jazyk jako „+ Nahlásit“ (plná zelená pilulka + ikona + text) */

export default function SectionBackButton({
  onClick,
  label = "Zpět",
  ariaLabel,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pp-section-back-btn ${className}`.trim()}
      aria-label={ariaLabel ?? label}
      title={label}
    >
      <IconNavBack className="w-4 h-4 shrink-0" aria-hidden />
      <span className="pp-section-back-btn-label">{label}</span>
    </button>
  );
}
