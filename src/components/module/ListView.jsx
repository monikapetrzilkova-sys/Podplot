/** Jednotný seznam s výběrem položky */



import DoodleEmptyState from "../doodle/DoodleEmptyState.jsx";



export default function ListView({

  items,

  renderItem,

  emptyMessage = "V tomto okruhu zatím nic není.",

  emptyIllustration = "box",

  className = "",

}) {

  if (items.length === 0) {

    return (

      <DoodleEmptyState illustration={emptyIllustration} message={emptyMessage} className={className} />

    );

  }



  return <div className={`space-y-1.5 ${className}`}>{items.map((item) => renderItem(item))}</div>;

}



export function ListItemShell({ selected, onShowOnMap, children, id, accentColor, muted = false }) {
  return (
    <article
      id={id ? `module-item-${id}` : undefined}
      className={`pp-card pp-card-interactive p-3 transition-all overflow-hidden ${
        selected ? "pp-list-item--selected" : ""
      } ${muted ? "bg-stone-50/80 opacity-75" : ""}`}
      style={
        accentColor
          ? {
              borderLeftWidth: 4,
              borderLeftStyle: "solid",
              borderLeftColor: muted ? "#A8A29E" : accentColor,
            }
          : undefined
      }
    >
      {children}
      {onShowOnMap && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShowOnMap();
          }}
          className="mt-2 text-xs font-semibold text-[#4D8B7A] hover:underline inline-flex items-center gap-1"
        >
          Zobrazit na mapě
        </button>
      )}
    </article>
  );
}


