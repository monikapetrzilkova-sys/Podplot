/** Logo Podplot — vektorový mark (dům + plot + ruce). */
const LOGO_WHITE = "/logo-podplot-white.svg";
const LOGO_GREEN = "/logo-podplot-green.svg";

export default function PodplotLogo({ size = 32, className = "", variant = "color" }) {
  const src = variant === "white" ? LOGO_WHITE : LOGO_GREEN;
  return (
    <img
      src={src}
      alt="Podplot"
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
      decoding="async"
    />
  );
}
