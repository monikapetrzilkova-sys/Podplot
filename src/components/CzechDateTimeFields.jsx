import {
  joinDateTimeLocal,
  minDateInputValue,
  splitDateTimeLocal,
} from "../data/czechDateTime.js";
import CzechTimeInput from "./CzechTimeInput.jsx";

/** Datum + čas (24 h) místo nativního datetime-local s AM/PM */
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
    // Bez času doplníme poledne — vždy 24h hodnota YYYY-MM-DDTHH:mm
    onChange?.(joinDateTimeLocal(nextDate, nextTime || "12:00"));
  };

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`.trim()}>
      <div>
        <label htmlFor={`${id}-date`} className="sr-only">
          Datum
        </label>
        <input
          id={`${id}-date`}
          type="date"
          lang="cs"
          min={minDate}
          value={date}
          disabled={disabled}
          required={required}
          onChange={(e) => update(e.target.value, time)}
          className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm"
        />
      </div>
      <div>
        <CzechTimeInput
          id={`${id}-time`}
          value={time}
          disabled={disabled}
          required={required && Boolean(date)}
          onChange={(nextTime) => update(date, nextTime)}
          className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm disabled:bg-stone-100 disabled:text-stone-400"
        />
      </div>
    </div>
  );
}
