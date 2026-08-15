import { useApp } from "../context/AppContext.jsx";
import SearchField from "./SearchField.jsx";
import CategoryPills from "./CategoryPills.jsx";
import { MARKET_CATEGORIES } from "../data/marketCategories.js";

export default function ThingsToolbar({ embedded = false }) {
  const { zboziSearchQuery, setZboziSearchQuery, zboziMarketCategory, setZboziMarketCategory } = useApp();

  return (
    <div className={`space-y-2 ${embedded ? "" : "px-4 py-3 bg-white border-b border-stone-200 shrink-0"}`}>
      <SearchField
        value={zboziSearchQuery}
        onChange={setZboziSearchQuery}
        placeholder="🔍 Hledat věc v okolí… (např. kočárek, vrtačka)"
      />
      <CategoryPills
        categories={MARKET_CATEGORIES}
        activeId={zboziMarketCategory}
        onSelect={setZboziMarketCategory}
      />
    </div>
  );
}
