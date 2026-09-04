/** Logo Podplot — vektorový mark (dům + plot + ruce). */
import logoWhite from "../assets/logo-podplot.svg";
import logoGreen from "../assets/logo-podplot-green.svg";

export default function PodplotLogo({ size = 32, className = "", variant = "color" }) {
  const src = variant === "white" ? logoWhite : logoGreen;
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
