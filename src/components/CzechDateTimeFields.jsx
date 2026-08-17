import {
  joinDateTimeLocal,
  minDateInputValue,
  splitDateTimeLocal,
} from "../data/czechDateTime.js";
import CzechTimeInput from "./CzechTimeInput.jsx";

/** Datum + čas (24 h) — pod sebou, ať se na úzkém displeji nepřekrývají. */
export default function CzechDateTimeFields({
  id,
  value = "",
  onChange,
  min,
  disabled = false,
  required = false,
  className = "",
}) {
  const { date, time } = splitDateTimeLocal(value);
  const minDate = min ? String(min).slice(0, 10) : minDateInputValue();

  const update = (nextDate, nextTime) => {
    if (!nextDate) {
      onChange?.("");
      return;
    }
    onChange?.(joinDateTimeLocal(nextDate, nextTime || "12:00"));
  };

  return (
    <div className={`pp-datetime-fields ${className}`.trim()}>
      <div className="pp-datetime-fields__item">
        <label htmlFor={`${id}-date`} className="block text-xs font-semibold text-stone-600 mb-1">
          Datum
        </label>
        <input
          id={`${id}-date`}
          type="date"
          lang="cs-CZ"
          min={minDate}
          value={date}
          disabled={disabled}
          required={required}
          onChange={(e) => update(e.target.value, time)}
          className="pp-datetime-fields__control"
        />
      </div>
      <div className="pp-datetime-fields__item">
        <label htmlFor={`${id}-time`} className="block text-xs font-semibold text-stone-600 mb-1">
          Čas
        </label>
        <CzechTimeInput
          id={`${id}-time`}
          value={time}
          disabled={disabled}
          required={required && Boolean(date)}
          onChange={(nextTime) => update(date, nextTime)}
          className="pp-datetime-fields__control"
        />
        <p className="text-[10px] text-stone-400 mt-1">24 hodin · např. 17:00</p>
      </div>
    </div>
  );
}
