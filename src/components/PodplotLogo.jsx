/** Logo Podplot — návrh F (dům + plot + ruce) */
import logoUrl from "../assets/logo-podplot.png";

export default function PodplotLogo({ size = 32, className = "", variant = "color" }) {
  return (
    <img
      src={logoUrl}
      alt="Podplot"
      width={size}
      height={size}
      className={`inline-block shrink-0 rounded-[22%] object-contain bg-white ${className}`}
      style={variant === "white" ? { filter: "brightness(0) invert(1)" } : undefined}
      decoding="async"
    />
  );
}
