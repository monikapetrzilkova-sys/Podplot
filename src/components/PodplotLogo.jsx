/** Logo Podplot — linkový doodle motiv plotu a podání ruky */

export default function PodplotLogo({ size = 32, className = "", variant = "color" }) {
  const stroke = variant === "white" ? "#FFFFFF" : "#3D7A68";
  const strokeLight = variant === "white" ? "rgba(255,255,255,0.75)" : "#A8B971";
  const fillHand = variant === "white" ? "#FFFFFF" : "#3D7A68";
  const fillHand2 = variant === "white" ? "rgba(255,255,255,0.85)" : "#64A08D";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden
    >
      {/* Plot — plotové sloupky a laťka */}
      <path
        d="M4 22V10M8 22V8M12 22V10M20 22V8M24 22V10M28 22V8"
        stroke={strokeLight}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M3 14h26M3 18h26" stroke={strokeLight} strokeWidth="1.25" strokeLinecap="round" opacity="0.8" />

      {/* Podání ruky */}
      <path
        d="M10 20c1-2 3-3 5-2.5 1.5.4 2.5 1.8 2.5 3.5v1.5c0 1.2-1 2-2.2 2H11c-1.5 0-2.8-1.2-2.8-2.8V20z"
        fill={fillHand}
        opacity="0.95"
      />
      <path
        d="M22 20c-1-2-3-3-5-2.5-1.5.4-2.5 1.8-2.5 3.5v1.5c0 1.2 1 2 2.2 2H21c1.5 0 2.8-1.2 2.8-2.8V20z"
        fill={fillHand2}
        opacity="0.95"
      />
      <path
        d="M14.5 19.5c1.2-.5 2.8-.5 4 0"
        stroke={variant === "white" ? "#3D7A68" : "#FFFFFF"}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
