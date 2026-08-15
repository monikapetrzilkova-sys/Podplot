import { normalizeCzechTime } from "../data/czechDateTime.js";

/** Textové pole ve 24hodinovém formátu HH:mm (bez AM/PM) */
export default function CzechTimeInput({
  id,
  value = "",
  onChange,
  disabled = false,
  required = false,
  className = "",
  placeholder = "17:00",
  "aria-label": ariaLabel = "Čas",
}) {
  const handleChange = (e) => {
    const next = e.target.value.replace(/[^\d:]/g, "").slice(0, 5);
    onChange?.(next);
  };

  const handleBlur = () => {
    if (!value?.trim()) {
      if (required) return;
      onChange?.("");
      return;
    }
    const normalized = normalizeCzechTime(value);
    if (normalized) onChange?.(normalized);
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      lang="cs"
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
      title="Čas ve formátu 24 hodin, např. 17:00"
      pattern="^([01]?\d|2[0-3]):[0-5]\d$"
      className={className}
    />
  );
}
