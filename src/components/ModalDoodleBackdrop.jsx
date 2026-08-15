import DoodleModalPattern from "./doodle/DoodleModalPattern.jsx";

/** Pozadí modálních oken — doodle vzor se zvířátky, blur a závoj */
export default function ModalDoodleBackdrop({ onClose, className = "" }) {
  return (
    <button
      type="button"
      className={`pp-modal-doodle-backdrop ${className}`.trim()}
      onClick={onClose}
      aria-label="Zavřít"
    >
      <div className="pp-modal-doodle-pattern-wrap" aria-hidden>
        <DoodleModalPattern />
      </div>
      <span className="pp-modal-doodle-veil" aria-hidden />
    </button>
  );
}
