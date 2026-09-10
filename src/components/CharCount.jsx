/** Viditelné odečítání znaků u nadpisu / popisu. */
export default function CharCount({ value, max }) {
  const used = String(value ?? "").length;
  const left = Math.max(0, max - used);
  const tight = left <= 12;

  return (
    <p
      className={`mt-1 text-right text-[11px] tabular-nums ${
        tight ? "text-amber-800 font-semibold" : "text-stone-400"
      }`}
      aria-live="polite"
    >
      {left === 0 ? `Limit ${max} znaků` : `Zbývá ${left} z ${max}`}
    </p>
  );
}
