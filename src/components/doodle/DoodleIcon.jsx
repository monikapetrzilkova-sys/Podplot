import { doodleStroke } from "./doodleStroke.js";

/** Obal pro doodle ikony v mřížkách a navigaci */
export default function DoodleIcon({
  children,
  className = "w-6 h-6",
  viewBox = "0 0 24 24",
  preserveAspectRatio = "xMidYMid meet",
  overflow = "hidden",
  ...props
}) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      overflow={overflow}
      fill="none"
      className={`pp-doodle-icon ${className}`}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export { doodleStroke };
