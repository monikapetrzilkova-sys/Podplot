import ViewModeToggle from "./ViewModeToggle.jsx";
import FilterPanel from "./FilterPanel.jsx";

export default function ModuleShell({
  title,
  description,
  viewMode,
  onViewModeChange,
  showViewToggle = true,
  filters,
  children,
  className = "",
}) {
  return (
    <div className={`px-4 py-3 ${className}`}>
      <header className="mb-3">
        <h2 className="text-lg font-bold text-stone-900">{title}</h2>
        {description && <p className="text-xs text-stone-500 mt-1 leading-relaxed">{description}</p>}
      </header>

      {showViewToggle && onViewModeChange && (
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} className="mb-3" />
      )}

      {filters && <FilterPanel {...filters} className="mb-3" />}

      {children}
    </div>
  );
}
