import ThingCategoryGrid from "./ThingCategoryGrid.jsx";

/** Matice kategorií půjčovny — stejná jako u Daruji / Prodám / Sháním */
export default function LendingSubFilterRow({
  value,
  onChange,
  className = "",
  allowDeselect = true,
}) {
  return (
    <ThingCategoryGrid
      value={value}
      onChange={onChange}
      className={className}
      allowDeselect={allowDeselect}
      ariaLabel="Věcná kategorie"
    />
  );
}
