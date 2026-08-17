import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import NeighborsGrid, { NEIGHBORS_TILES } from "./NeighborsGrid.jsx";
import SmartSectionBar from "./SmartSectionBar.jsx";
import ThingsModule from "../modules/ThingsModule.jsx";
import NeighborHelp from "./NeighborHelp.jsx";
import CommunityGroupsView from "./CommunityGroupsView.jsx";
import CalendarPage from "./CalendarPage.jsx";
import { VECI_TYPE_FILTERS } from "../utils/thingsModule.js";
import { getSkupinySubfilters } from "../data/worldNavigation.js";
import { getMyMemberGroups } from "../data/locations.js";
import { NEIGHBOR_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

const NEIGHBORS_MAIN = NEIGHBORS_TILES.map((tile) => ({
  ...tile,
  shortLabel: tile.id === "akce" ? "Akce" : tile.label,
  Icon: NEIGHBOR_DOODLE_ICONS[tile.id],
}));

const VYPOMOC_SUBS = [
  { id: "vse", label: "Vše" },
  { id: "hledam", label: "Hledám" },
  { id: "nabizim", label: "Nabízím" },
];

const AKCE_SUBS = [
  { id: "all", label: "Všechny akce", shortLabel: "Všechny" },
  { id: "mine", label: "Moje akce", shortLabel: "Moje" },
];

function NeighborsContent({ section, helpFilter, onHelpFilterChange }) {
  const { communityGroups } = useApp();

  if (section === "veci") {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <ThingsModule hideCategoryFilters />
      </div>
    );
  }

  if (section === "vypomoc") {
    return (
      <div className="flex-1 min-h-0 px-3 py-1 overflow-y-auto">
        <NeighborHelp
          showCreateForm
          hideFilterRow
          filter={helpFilter}
          onFilterChange={onHelpFilterChange}
        />
      </div>
    );
  }

  if (section === "akce") {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CalendarPage embedded hideTopFilters />
      </div>
    );
  }

  if (section === "skupiny" || communityGroups.some((g) => g.id === section)) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <CommunityGroupsView hideFilterBar />
      </div>
    );
  }

  return null;
}

function NeighborsHub({ onSelectSection }) {
  const { activeLocation } = useApp();
  const place = activeLocation?.municipality || activeLocation?.shortLabel || "okolí";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-8">
      <h1 className="text-lg font-bold text-stone-900 leading-snug">Sousedé</h1>
      <p className="text-xs text-stone-500 mt-0.5 mb-4 leading-relaxed">
        Čtyři věci od lidí v {place}. Novinky jsou na Domů.
      </p>

      <NeighborsGrid activeId={null} onSelect={onSelectSection} />
    </div>
  );
}

export default function NeighborsPage() {
  const {
    selectFeedSubFilter,
    pendingNeighborsSection,
    setPendingNeighborsSection,
    neighborsRootKey,
    thingsCategory,
    setThingsCategory,
    communityGroups,
    setFeedSubFilter,
    calendarFilter,
    setCalendarFilter,
    activeLocationId,
  } = useApp();

  const [activeSection, setActiveSection] = useState(null);
  const [helpFilter, setHelpFilter] = useState("vse");
  const [skupinyListFilter, setSkupinyListFilter] = useState("vse");

  const hasMyGroups = getMyMemberGroups(communityGroups, activeLocationId).length > 0;

  const applySkupinyFilter = (filterId) => {
    const id = filterId === "moje" ? "moje" : "vse";
    setSkupinyListFilter(id);
    setFeedSubFilter(id === "vse" ? "skupiny" : "moje");
    selectFeedSubFilter(id === "vse" ? "skupiny" : "moje");
  };

  useEffect(() => {
    setActiveSection(null);
    setHelpFilter("vse");
    setCalendarFilter("all");
    setSkupinyListFilter("vse");
  }, [neighborsRootKey, setCalendarFilter]);

  useEffect(() => {
    if (!pendingNeighborsSection) return;
    const section = pendingNeighborsSection;
    setActiveSection(section);
    setPendingNeighborsSection(null);
    if (section === "skupiny") {
      const id = hasMyGroups ? "moje" : "vse";
      setSkupinyListFilter(id);
      setFeedSubFilter(id === "vse" ? "skupiny" : "moje");
      selectFeedSubFilter(id === "vse" ? "skupiny" : "moje");
    }
  }, [
    pendingNeighborsSection,
    setPendingNeighborsSection,
    hasMyGroups,
    setFeedSubFilter,
    selectFeedSubFilter,
  ]);

  const skupinySubs = useMemo(
    () =>
      getSkupinySubfilters(communityGroups).map((s) => ({
        id: s.id,
        label: s.label,
        shortLabel: s.shortLabel ?? s.label,
      })),
    [communityGroups]
  );

  const subItems = useMemo(() => {
    if (activeSection === "veci") return VECI_TYPE_FILTERS;
    if (activeSection === "vypomoc") return VYPOMOC_SUBS;
    if (activeSection === "skupiny") return skupinySubs;
    if (activeSection === "akce") return AKCE_SUBS;
    return [];
  }, [activeSection, skupinySubs]);

  const subActiveId = useMemo(() => {
    if (activeSection === "veci") return thingsCategory;
    if (activeSection === "vypomoc") return helpFilter;
    if (activeSection === "skupiny") return skupinyListFilter;
    if (activeSection === "akce") return calendarFilter;
    return null;
  }, [activeSection, thingsCategory, helpFilter, skupinyListFilter, calendarFilter]);

  const handleSelectMain = (id) => {
    setActiveSection(id);
    if (id === "veci") {
      selectFeedSubFilter("veci");
      setThingsCategory("vse");
    }
    if (id === "skupiny") {
      applySkupinyFilter(hasMyGroups ? "moje" : "vse");
    }
    if (id === "vypomoc") setHelpFilter("vse");
    if (id === "akce") setCalendarFilter("all");
  };

  const handleSelectSub = (id) => {
    if (activeSection === "veci") setThingsCategory(id);
    if (activeSection === "vypomoc") setHelpFilter(id);
    if (activeSection === "akce") setCalendarFilter(id);
    if (activeSection === "skupiny") {
      applySkupinyFilter(id);
    }
  };

  const handleBack = () => {
    setActiveSection(null);
  };

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco">
      {activeSection ? (
        <>
          <div className="tab-header-container px-3 pt-2 pb-0 shrink-0 w-full">
            <SmartSectionBar
              mode="sub"
              mainItems={NEIGHBORS_MAIN}
              subItems={subItems}
              activeId={subActiveId}
              onSelectMain={handleSelectMain}
              onSelectSub={handleSelectSub}
              onBack={handleBack}
              ariaLabel="Podkategorie"
              prominent
              fit
              className="w-full"
            />
          </div>
          <NeighborsContent
            section={activeSection}
            helpFilter={helpFilter}
            onHelpFilterChange={setHelpFilter}
          />
        </>
      ) : (
        <NeighborsHub onSelectSection={handleSelectMain} />
      )}
    </div>
  );
}
