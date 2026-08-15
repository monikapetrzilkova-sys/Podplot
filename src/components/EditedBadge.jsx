/** Zobrazí se u upraveného obsahu — vždy viditelné, ne jen po rozbalení */
export function isContentEdited(item) {
  return Boolean(item?.updatedAt);
}

export default function EditedBadge({ item, className = "" }) {
  if (!isContentEdited(item)) return null;
  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wide text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-md whitespace-nowrap ${className}`.trim()}
      title="Obsah byl upraven po zveřejnění"
    >
      Upraveno
    </span>
  );
}
