import { doodleStroke } from "./doodleStroke.js";

/** Obal pro doodle ikony v mřížkách a navigaci */
export default function DoodleIcon({ children, className = "w-6 h-6", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
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
