import { doodleStroke, DOODLE_OLIVE } from "./doodleStroke.js";

const s = { ...doodleStroke, stroke: "#3D7A68", strokeWidth: 1.5 };

/** Opakující se doodle motiv pro pozadí modálů — domečky, stromy, sousedé, zvířátka */
export default function DoodleModalPattern() {
  return (
    <svg
      className="pp-modal-doodle-svg"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden
    >
      {/* Domečky */}
      <g opacity="0.55">
        <path {...s} d="M30 120V95l15-12 15 12v25" />
        <path {...s} d="M38 120h14" />
        <path {...s} d="M320 180V155l18-14 18 14v25" />
        <path {...s} d="M330 180h16" />
        <path {...s} d="M180 90V68l12-10 12 10v22" />
      </g>

      {/* Stromky */}
      <g opacity="0.5" stroke={DOODLE_OLIVE} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="70" cy="200" r="10" {...s} stroke={DOODLE_OLIVE} />
        <path {...s} stroke={DOODLE_OLIVE} d="M70 210V235" />
        <circle cx="350" cy="320" r="12" {...s} stroke={DOODLE_OLIVE} />
        <path {...s} stroke={DOODLE_OLIVE} d="M350 332V360" />
        <circle cx="120" cy="480" r="9" {...s} stroke={DOODLE_OLIVE} />
        <path {...s} stroke={DOODLE_OLIVE} d="M120 489V510" />
      </g>

      {/* Panáčci */}
      <g opacity="0.45">
        <circle cx="200" cy="250" r="8" {...s} />
        <path {...s} d="M200 258v22M200 266l-10 8M200 266l10 6" />
        <path {...s} d="M200 280l-7 14M200 280l7 14" />
        <circle cx="260" cy="420" r="7" {...s} />
        <path {...s} d="M260 427v18M260 434l-8 6M260 434l8 5" />
        <circle cx="90" cy="560" r="7" {...s} />
        <path {...s} d="M90 567v16M90 573l-7 6M90 573l7 4" />
      </g>

      {/* Kočička */}
      <g opacity="0.5" transform="translate(280 520)">
        <path {...s} d="M0 20c0-8 6-14 14-14 4 0 8 2 10 5 2-3 6-5 10-5 8 0 14 6 14 14v8H0V20z" />
        <path {...s} d="M4 8l4-6 4 4M24 6l4-5 3 5" />
        <circle cx="12" cy="18" r="1.5" fill="#3D7A68" />
        <circle cx="22" cy="18" r="1.5" fill="#3D7A68" />
        <path {...s} d="M14 24c2 2 4 2 6 0" />
      </g>

      {/* Pejsek */}
      <g opacity="0.48" transform="translate(40 640)">
        <ellipse cx="18" cy="22" rx="16" ry="12" {...s} />
        <circle cx="28" cy="12" r="9" {...s} />
        <path {...s} d="M22 8l-4-5M30 8l4-5" />
        <circle cx="31" cy="11" r="1.5" fill="#3D7A68" />
        <path {...s} d="M4 22c-4 2-6 6-4 10" />
      </g>

      {/* Ptáček */}
      <g opacity="0.5" transform="translate(300 680)">
        <path {...s} d="M0 12c8-6 18-4 22 4-6 2-12 0-16-4" />
        <path {...s} d="M22 16l8-4-2 6" />
        <circle cx="6" cy="10" r="1.5" fill="#3D7A68" />
      </g>

      {/* Kopie pro vyplnění */}
      <g opacity="0.35" transform="translate(0 400)">
        <path {...s} d="M30 80V60l12-10 12 10v20" />
        <circle cx="300" cy="100" r="8" {...s} stroke={DOODLE_OLIVE} />
        <path {...s} stroke={DOODLE_OLIVE} d="M300 108V130" />
        <circle cx="150" cy="60" r="6" {...s} />
        <path {...s} d="M150 66v14M150 72l-6 5M150 72l6 4" />
      </g>
    </svg>
  );
}
