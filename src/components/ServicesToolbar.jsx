import { useApp } from "../context/AppContext.jsx";
import SearchField from "./SearchField.jsx";
import CategoryPills from "./CategoryPills.jsx";
import { SERVICE_PARENT_CATEGORIES } from "../data/serviceCategories.js";

export default function ServicesToolbar() {
  const {
    servicesSearchQuery,
    setServicesSearchQuery,
    servicesParentCategory,
    setServicesParentCategory,
  } = useApp();

  return (
    <div className="space-y-2 pt-2 border-t border-stone-100 mt-2">
      <SearchField
        value={servicesSearchQuery}
        onChange={setServicesSearchQuery}
        placeholder="Hledat službu nebo řemeslníka… (např. instalatér)"
      />
      <CategoryPills
        categories={SERVICE_PARENT_CATEGORIES}
        activeId={servicesParentCategory}
        onSelect={setServicesParentCategory}
      />
    </div>
  );
}
