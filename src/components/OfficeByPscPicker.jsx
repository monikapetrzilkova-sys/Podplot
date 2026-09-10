import { useEffect, useState } from "react";
import { formatPscInput, pscDigits } from "../data/addressValidation.js";
import { listInstitutionsByPsc, listLocalInstitutionsByPsc, INSTITUTION_KINDS } from "../data/institutions/index.js";

function ReqStar() {
  return (
    <span className="text-teal-800" aria-hidden="true">
      {" *"}
    </span>
  );
}

/**
 * Registrace úřadu: nejdřív PSČ, pak konkrétní úřad v lokalitě.
 */
export default function OfficeByPscPicker({
  psc,
  onPscChange,
  value = null,
  onChange,
  required = false,
}) {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const digits = pscDigits(psc);

  useEffect(() => {
    if (digits.length !== 5) {
      setOffices([]);
      setError("");
      setLoading(false);
      if (value) onChange?.(null);
      return undefined;
    }

    let cancelled = false;
    const local = listLocalInstitutionsByPsc(digits);
    setOffices(local);
    setLoading(true);
    setError("");
    if (local.length === 1 && !value) onChange?.(local[0]);
    listInstitutionsByPsc(digits, { limit: 20 }).then((rows) => {
      if (cancelled) return;
      setOffices(rows);
      setLoading(false);
      if (rows.length === 0) {
        setError("V tomto PSČ se nepodařilo dohledat obecní nebo městský úřad.");
        if (value) onChange?.(null);
        return;
      }
      if (value && !rows.some((row) => row.id === value.id)) {
        onChange?.(null);
      } else if (!value && rows.length === 1) {
        onChange?.(rows[0]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [digits]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">
          PSČ úřadu
          {required ? <ReqStar /> : null}
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          value={psc}
          onChange={(e) => onPscChange?.(formatPscInput(e.target.value))}
          placeholder="252 42"
          maxLength={6}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
        />
        <p className="mt-1 text-[10px] text-stone-400 leading-relaxed">
          Podle PSČ dohledám úřad v lokalitě a jeho oficiální e-mailovou doménu.
        </p>
      </div>

      {digits.length === 5 ? (
        <div>
          <p className="text-xs font-semibold text-stone-600 mb-1.5">
            Úřad v lokalitě
            {required ? <ReqStar /> : null}
          </p>
          {loading ? (
            <p className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
              {offices.length
                ? "Doplňuji úřady z veřejných registrů…"
                : `Hledám úřad v PSČ ${formatPscInput(digits)}…`}
            </p>
          ) : null}
          {!loading && error ? (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              {error}
            </p>
          ) : null}
          {!loading && offices.length > 0 ? (
            <ul className="space-y-2">
              {offices.map((inst) => {
                const selected = value?.id === inst.id;
                const kindLabel = INSTITUTION_KINDS[inst.kind]?.label ?? "Úřad";
                return (
                  <li key={inst.id}>
                    <button
                      type="button"
                      onClick={() => onChange?.(inst)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                        selected
                          ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-stone-900">{inst.name}</span>
                      <span className="block text-[11px] text-stone-500 mt-0.5">
                        {kindLabel}
                        {inst.seatCity ? ` · ${inst.seatCity}` : ""}
                        {inst.allowedEmailDomain ? ` · @${inst.allowedEmailDomain}` : ""}
                      </span>
                      {inst.seatAddress ? (
                        <span className="block text-[11px] text-stone-400 mt-0.5">{inst.seatAddress}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
