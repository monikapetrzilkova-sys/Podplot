/** Výrazné tlačítko zpět v hubu Sousedé / Služby */

export default function SectionBackButton({ onClick, label = "Zpět", ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pp-section-back-btn"
      aria-label={ariaLabel ?? label}
      title={label}
    >
      <span className="pp-section-back-btn-arrow" aria-hidden>
        ←
      </span>
      <span className="pp-section-back-btn-label">{label}</span>
    </button>
  );
}
