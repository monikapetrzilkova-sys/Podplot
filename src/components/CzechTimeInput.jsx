import { normalizeCzechTime } from "../data/czechDateTime.js";

/** Textové pole ve 24hodinovém formátu HH:mm (bez AM/PM, vhodné pro iPhone). */
export default function CzechTimeInput({
  id,
  value = "",
  onChange,
  disabled = false,
  required = false,
  className = "",
  placeholder = "17:00",
  "aria-label": ariaLabel = "Čas (24 hodin)",
}) {
  const formatAsYouType = (raw) => {
    const digits = String(raw ?? "").replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const handleChange = (e) => {
    onChange?.(formatAsYouType(e.target.value));
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
      lang="cs-CZ"
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
      title="Čas ve formátu 24 hodin, např. 17:00"
      pattern="^([01]\d|2[0-3]):[0-5]\d$"
      className={className}
    />
  );
}
