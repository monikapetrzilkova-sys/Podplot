/** Sdílený styl ručně kreslených doodle ilustrací */

export const DOODLE_INK = "#3D7A68";
export const DOODLE_INK_LIGHT = "#64A08D";
export const DOODLE_OLIVE = "#A8B971";

export const doodleStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const doodleStrokeLight = {
  ...doodleStroke,
  strokeWidth: 1.5,
  opacity: 0.85,
};
