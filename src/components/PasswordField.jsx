import { useState } from "react";
import { getPasswordStrength } from "../data/authApi.js";

const TONE_BAR = {
  empty: "bg-stone-200",
  weak: "bg-red-400",
  fair: "bg-amber-400",
  good: "bg-teal-600",
  strong: "bg-emerald-600",
};

const TONE_TEXT = {
  empty: "text-stone-400",
  weak: "text-red-600",
  fair: "text-amber-700",
  good: "text-teal-800",
  strong: "text-emerald-700",
};

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M3 3l18 18" strokeLinecap="round" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
        <path
          d="M9.9 5.6C10.6 5.4 11.3 5.3 12 5.3c5.2 0 9.2 4.4 10 6.7-.3.8-1.1 2.3-2.6 3.7"
          strokeLinecap="round"
        />
        <path
          d="M6.1 6.1C4.2 7.5 2.9 9.3 2 12c.8 2.3 4.8 6.7 10 6.7 1.2 0 2.3-.2 3.4-.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  placeholder,
  required = false,
  className = "",
  showStrength = false,
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="block text-xs font-semibold text-stone-600 mb-1.5">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-required={required || undefined}
          className={`w-full px-3 py-2.5 pr-11 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${className}`.trim()}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700"
          aria-label={visible ? "Skrýt heslo" : "Zobrazit heslo"}
          aria-pressed={visible}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {showStrength && strength?.score > 0 ? (
        <div className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden>
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`h-1 flex-1 rounded-full ${
                  step <= strength.score ? TONE_BAR[strength.tone] : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <p className={`mt-1 text-[11px] font-medium ${TONE_TEXT[strength.tone]}`}>
            Síla hesla: {strength.label}
          </p>
        </div>
      ) : null}
    </div>
  );
}
