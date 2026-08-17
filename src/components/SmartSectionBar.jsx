/** Jediná inteligentní lišta: hlavní sekce ↔ podkategorie se šipkou zpět */

import SectionBackButton from "./SectionBackButton.jsx";

export default function SmartSectionBar({
  mode = "main",
  mainItems = [],
  subItems = [],
  activeId,
  onSelectMain,
  onSelectSub,
  onBack,
  ariaLabel = "Navigace sekcí",
  className = "",
  /** Výrazné zelené záložky (hlavní sekce Sousedé) */
  prominent = false,
  /** Všechny položky vedle sebe ve stejném řádku */
  fit = false,
  /** Při úzkém panelu schovat text — zůstanou ikony, název v title (hover) */
  preferIcons = false,
}) {
  const items = mode === "sub" ? subItems : mainItems;
  const onSelect = mode === "sub" ? onSelectSub : onSelectMain;
  const showProminent = Boolean(prominent);

  return (
    <div
      className={[
        "pp-smart-bar",
        showProminent ? "pp-smart-bar--prominent" : "",
        fit ? "pp-smart-bar--fit" : "",
        preferIcons ? "pp-smart-bar--prefer-icons" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="navigation"
      aria-label={ariaLabel}
    >
      {mode === "sub" && (
        <SectionBackButton onClick={onBack} ariaLabel="Zpět na hlavní sekce" />
      )}
      <div
        className={`pp-smart-bar-pills ${fit ? "pp-smart-bar-pills--fit" : "pp-category-pills"}`}
        role="tablist"
        aria-label={ariaLabel}
      >
        {items.map((item) => {
          const active = activeId === item.id;
          const label = item.shortLabel ?? item.label;
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={item.label ?? label}
              title={item.label ?? label}
              data-tip={item.label ?? label}
              onClick={() => onSelect?.(item.id)}
              className={[
                "pp-smart-tab",
                showProminent ? "pp-smart-tab--prominent" : "pp-category-pill",
                active ? (showProminent ? "pp-smart-tab--prominent-active" : "pp-category-pill--active") : "",
                Icon ? "pp-smart-tab--has-icon" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {Icon ? (
                <span className="pp-smart-tab-icon" aria-hidden>
                  <Icon className="w-5 h-5" />
                </span>
              ) : null}
              <span className="pp-smart-tab-label">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
