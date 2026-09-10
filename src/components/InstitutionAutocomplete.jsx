import { useEffect, useId, useRef, useState } from "react";
import { searchInstitutions, listInstitutionsByPsc, INSTITUTION_KINDS } from "../data/institutions/index.js";

/**
 * Autocomplete výběru obecního / městského úřadu z číselníku.
 */
export default function InstitutionAutocomplete({
  value = null,
  onChange,
  disabled = false,
  required = false,
  pscFilter = "",
  placeholder = "Hledejte úřad — název, PSČ nebo obec…",
}) {
  const listId = useId();
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (value?.name) setQuery(value.name);
  }, [value?.id, value?.name]);

  useEffect(() => {
    const q = query.trim();
    const pscDigits = String(pscFilter ?? "").replace(/\D/g, "");
    if (value && q === value.name) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    const t = window.setTimeout(() => {
      setLoading(true);
      const request =
        pscDigits.length === 5 && q.length < 2
          ? listInstitutionsByPsc(pscDigits, { limit: 20 })
          : q.length >= 2
            ? searchInstitutions(q, { limit: 10 })
            : Promise.resolve([]);
      request.then((rows) => {
        if (cancelled) return;
        const filtered =
          pscDigits.length === 5 && q.length >= 2
            ? rows.filter((row) => row.psc === pscDigits)
            : rows;
        setResults(filtered);
        setLoading(false);
        setOpen(filtered.length > 0 || q.length >= 2 || pscDigits.length === 5);
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, value, pscFilter]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const select = (inst) => {
    onChange?.(inst);
    setQuery(inst.name);
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    onChange?.(null);
    setQuery("");
    setResults([]);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        Obecní / městský úřad
        {required ? (
          <span className="text-teal-800" aria-hidden="true">
            {" *"}
          </span>
        ) : null}
      </label>
      <div className="flex gap-2">
        <input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          disabled={disabled}
          aria-required={required || undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange?.(null);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 min-w-0 px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 px-3 text-xs font-semibold text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50"
          >
            Zrušit
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-[10px] text-stone-400 leading-relaxed">
        {String(pscFilter ?? "").replace(/\D/g, "").length === 5
          ? "Nabízím úřady v zadaném PSČ. Můžeš i přepsat název."
          : "Nejdřív zadej PSČ výše — nabídnu úřady v obci. Můžeš hledat i názvem."}
      </p>

      {open && (loading || results.length > 0) ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg"
        >
          {loading && results.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-stone-500">Hledám…</li>
          ) : null}
          {results.map((inst) => {
            const kindLabel = INSTITUTION_KINDS[inst.kind]?.label ?? "Úřad";
            return (
              <li key={inst.id} role="option">
                <button
                  type="button"
                  onClick={() => select(inst)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#F1F6F5] border-b border-stone-50 last:border-0"
                >
                  <span className="block text-sm font-semibold text-stone-900">{inst.name}</span>
                  <span className="block text-[11px] text-stone-500 mt-0.5">
                    {kindLabel} · {inst.psc.slice(0, 3)} {inst.psc.slice(3)} {inst.seatCity}
                    {inst.allowedEmailDomain ? ` · @${inst.allowedEmailDomain}` : ""}
                  </span>
                </button>
              </li>
            );
          })}
          {!loading && results.length === 0 && query.trim().length >= 2 ? (
            <li className="px-3 py-2.5 text-xs text-stone-500">Žádný úřad neodpovídá.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
