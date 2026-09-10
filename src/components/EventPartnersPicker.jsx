import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { GROUPS } from "../data/groups.js";
import {
  normalizeEventPartners,
  partnerFromPlace,
  partnerFromActivity,
  partnerFromGroup,
  partnerKindLabel,
  removeEventPartner,
  upsertEventPartner,
} from "../data/eventPartners.js";

/**
 * Označí podniky, kroužky a sdružení, které se akce účastní (např. Město sobě).
 */
export default function EventPartnersPicker({ value = [], onChange }) {
  const { institutionsSorted, hostedActivities } = useApp();
  const [query, setQuery] = useState("");
  const selected = normalizeEventPartners(value);

  const suggestions = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("cs");
    const selectedIds = new Set(selected.map((p) => p.id));
    const places = (institutionsSorted ?? [])
      .map(partnerFromPlace)
      .filter(Boolean)
      .filter((p) => p.kind === "podnik" || p.kind === "instituce");
    const activities = (hostedActivities ?? []).map(partnerFromActivity).filter(Boolean);
    const groups = GROUPS.map(partnerFromGroup).filter(Boolean);
    return [...places, ...activities, ...groups]
      .filter((p) => !selectedIds.has(p.id))
      .filter((p) => !q || p.name.toLocaleLowerCase("cs").includes(q))
      .slice(0, 8);
  }, [institutionsSorted, hostedActivities, query, selected]);

  const add = (partner) => {
    onChange?.(upsertEventPartner(selected, partner));
    setQuery("");
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1">
        Na programu
      </label>
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange?.(removeEventPartner(selected, p.id))}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E8F3EF] text-[#1B4D3E] text-[11px] font-semibold"
              title="Odebrat"
            >
              {p.name}
              <span className="text-stone-400 font-medium">×</span>
            </button>
          ))}
        </div>
      ) : null}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Přidat podnik, kroužek nebo sdružení…"
        className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
      />
      {query.trim() || selected.length === 0 ? (
        <ul className="mt-1.5 space-y-1">
          {suggestions.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => add(p)}
                className="w-full text-left px-3 py-2 rounded-xl border border-stone-100 hover:border-[#C5DDD4] hover:bg-[#F7FAF9] text-sm"
              >
                <span className="font-semibold text-stone-800">{p.name}</span>
                <span className="ml-1.5 text-[10px] text-stone-400">{partnerKindLabel(p.kind)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
