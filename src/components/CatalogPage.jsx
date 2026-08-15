import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import SmartSectionBar from "./SmartSectionBar.jsx";
import ServicesList from "../modules/ServicesList.jsx";
import CompactSearchToggle from "./CompactSearchToggle.jsx";
import { HOME_SERVICE_SUB_FILTERS } from "../data/serviceCategories.js";
import { CATALOG_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

const CATALOG_SHORT = {
  vse: "Vše",
  "domov-zahrada": "Domov",
  "pece-krasa": "Péče",
  "deti-rodina": "Děti",
  ostatni: "Ostatní",
};

const CATALOG_MAIN = [
  { id: "vse", label: "Vše", shortLabel: "Vše", Icon: CATALOG_DOODLE_ICONS.vse },
  ...HOME_SERVICE_SUB_FILTERS.map((cat) => ({
    ...cat,
    shortLabel: CATALOG_SHORT[cat.id] ?? cat.label,
    Icon: CATALOG_DOODLE_ICONS[cat.id],
  })),
];

export default function CatalogPage() {
  const { catalogRootKey } = useApp();
  const [homeSub, setHomeSub] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    setHomeSub(null);
    setCatalogSearch("");
    setSearchExpanded(false);
  }, [catalogRootKey]);

  const handleSelectMain = (id) => {
    setHomeSub(id === "vse" ? null : id);
  };

  const searchActive = searchExpanded || Boolean(catalogSearch.trim());

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full px-3 pt-2 pb-8 gap-2 bg-abstract-organic has-deco">
      {searchActive ? (
        <CompactSearchToggle
          value={catalogSearch}
          onChange={setCatalogSearch}
          expanded={searchExpanded || Boolean(catalogSearch.trim())}
          onExpandedChange={setSearchExpanded}
          placeholder="Hledat v katalogu…"
          ariaLabel="Hledat v katalogu"
        />
      ) : (
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex-1 min-w-0">
            <SmartSectionBar
              mode="main"
              mainItems={CATALOG_MAIN}
              activeId={homeSub ?? "vse"}
              onSelectMain={handleSelectMain}
              ariaLabel="Katalog — kategorie"
              prominent
              fit
            />
          </div>
          <CompactSearchToggle
            value={catalogSearch}
            onChange={setCatalogSearch}
            expanded={false}
            onExpandedChange={setSearchExpanded}
            placeholder="Hledat v katalogu…"
            ariaLabel="Hledat v katalogu"
          />
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        <ServicesList searchQuery={catalogSearch} homeSubCategory={homeSub} />
      </div>
    </div>
  );
}
