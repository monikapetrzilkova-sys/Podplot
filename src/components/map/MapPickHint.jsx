import { DoodleTargetIcon } from "../doodle/doodleIcons.jsx";

/** Nápověda při výběru místa — monochromatický doodle cíl */
export default function MapPickHint({
  children = "Klepni na mapu nebo přetáhni špendlík",
  className = "",
}) {
  return (
    <div className={`pp-map-pick-hint ${className}`.trim()} role="status">
      <DoodleTargetIcon className="pp-map-pick-hint-icon" />
      <span>{children}</span>
    </div>
  );
}
