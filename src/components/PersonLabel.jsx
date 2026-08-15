import { useApp } from "../context/AppContext.jsx";

/** Jméno osoby — v obci s duplicitami doplní ulici nebo vzdálenost */
export default function PersonLabel({ personId, name, className = "", title }) {
  const { formatPersonName } = useApp();
  const label = formatPersonName({ id: personId, name });
  return (
    <span className={className} title={title ?? label}>
      {label}
    </span>
  );
}
