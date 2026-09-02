import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import NeighborsGrid, { NEIGHBORS_TILES } from "./NeighborsGrid.jsx";
import SmartSectionBar from "./SmartSectionBar.jsx";
import ThingsModule from "../modules/ThingsModule.jsx";
import NeighborHelp from "./NeighborHelp.jsx";
import CommunityGroupsView from "./CommunityGroupsView.jsx";
import CalendarPage from "./CalendarPage.jsx";
import EventsAkceTopBar from "./EventsAkceTopBar.jsx";
import { VECI_TYPE_FILTERS } from "../utils/thingsModule.js";
import { getSkupinySubfilters } from "../data/worldNavigation.js";
import { getMyMemberGroups } from "../data/locations.js";
import { NEIGHBOR_DOODLE_ICONS, VECI_TYPE_DOODLE_ICONS, VYPOMOC_FILTER_DOODLE_ICONS, SKUPINY_FILTER_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import { DoodleSousedstviScene } from "./doodle/doodleIllustrations.jsx";
import { loadNavSession, saveNavSession } from "../data/navSession.js";

const NEIGHBORS_MAIN = NEIGHBORS_TILES.map((tile) => ({
  ...tile,
  shortLabel: tile.id === "akce" ? "Akce" : tile.label,
  Icon: NEIGHBOR_DOODLE_ICONS[tile.id],
}));

const VECI_SUBS = VECI_TYPE_FILTERS.map((f) => ({
  ...f,
  shortLabel: f.label,
  Icon: VECI_TYPE_DOODLE_ICONS[f.id],
}));

const VYPOMOC_SUBS = [
  { id: "vse", label: "Vše", shortLabel: "Vše", Icon: VYPOMOC_FILTER_DOODLE_ICONS.vse },
  { id: "hledam", label: "Hledám", shortLabel: "Hledám", Icon: VYPOMOC_FILTER_DOODLE_ICONS.hledam },
  { id: "nabizim", label: "Nabízím", shortLabel: "Nabízím", Icon: VYPOMOC_FILTER_DOODLE_ICONS.nabizim },
];

function NeighborsContent({ section, helpFilter, onHelpFilterChange, eventsSearch = "" }) {
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
        <CalendarPage embedded hideTopFilters hideToolbar searchQuery={eventsSearch} />
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
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6 flex flex-col">
      <NeighborsGrid activeId={null} onSelect={onSelectSection} large />
      <div className="pp-hub-doodle-footer" aria-hidden>
        <DoodleSousedstviScene className="w-full max-w-[200px] h-auto text-[#3D7A68]" />
      </div>
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
    setThingsLendingSubCategory,
    communityGroups,
    joinedGroupIds,
    setFeedSubFilter,
    feedSubFilter,
    setCalendarFilter,
  } = useApp();

  const [activeSection, setActiveSection] = useState(
    () => loadNavSession()?.neighborsSection ?? null
  );
  const [helpFilter, setHelpFilter] = useState("vse");
  const [skupinyListFilter, setSkupinyListFilter] = useState("vse");
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsSearchExpanded, setEventsSearchExpanded] = useState(false);
  const skipNeighborsRootReset = useRef(true);
  const prevNeighborsSection = useRef(null);

  const hasMyGroups = getMyMemberGroups(communityGroups, joinedGroupIds).length > 0;
  const defaultSkupinyFilter = hasMyGroups ? "moje" : "vse";

  const applySkupinyFilter = (filterId) => {
    const id = filterId === "moje" ? "moje" : "vse";
    setSkupinyListFilter(id);
    const feedId = id === "vse" ? "skupiny" : "moje";
    setFeedSubFilter(feedId);
    selectFeedSubFilter(feedId);
  };

  /** První vstup do Skupin: Moje pokud jste členem, jinak Všechny. */
  useEffect(() => {
    const prev = prevNeighborsSection.current;
    prevNeighborsSection.current = activeSection;
    if (activeSection === "skupiny" && prev !== "skupiny") {
      const alreadySpecificGroup =
        feedSubFilter &&
        feedSubFilter !== "vse" &&
        feedSubFilter !== "skupiny" &&
        feedSubFilter !== "moje";
      if (!alreadySpecificGroup) applySkupinyFilter(defaultSkupinyFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- jen při vstupu do sekce
  }, [activeSection, defaultSkupinyFilter, feedSubFilter]);

  useEffect(() => {
    saveNavSession({ neighborsSection: activeSection });
  }, [activeSection]);

  useEffect(() => {
    if (skipNeighborsRootReset.current) {
      skipNeighborsRootReset.current = false;
      return;
    }
    setActiveSection(null);
    setHelpFilter("vse");
    setCalendarFilter("all");
    setSkupinyListFilter("vse");
    setEventsSearch("");
    setEventsSearchExpanded(false);
  }, [neighborsRootKey, setCalendarFilter]);

  useEffect(() => {
    if (!pendingNeighborsSection) return;
    const section = pendingNeighborsSection;
    setActiveSection(section);
    setPendingNeighborsSection(null);
  }, [pendingNeighborsSection, setPendingNeighborsSection]);

  const skupinySubs = useMemo(() => {
    const items = getSkupinySubfilters(communityGroups).map((s) => ({
      id: s.id,
      label: s.label,
      shortLabel: s.shortLabel ?? s.label,
      Icon: SKUPINY_FILTER_DOODLE_ICONS[s.id] ?? SKUPINY_FILTER_DOODLE_ICONS.vse,
    }));
    if (!hasMyGroups) return items;
    return [...items].sort((a, b) => {
      if (a.id === "moje") return -1;
      if (b.id === "moje") return 1;
      return 0;
    });
  }, [communityGroups, hasMyGroups]);

  const subItems = useMemo(() => {
    if (activeSection === "veci") return VECI_SUBS;
    if (activeSection === "vypomoc") return VYPOMOC_SUBS;
    if (activeSection === "skupiny") return skupinySubs;
    return [];
  }, [activeSection, skupinySubs]);

  const subActiveId = useMemo(() => {
    if (activeSection === "veci") return thingsCategory;
    if (activeSection === "vypomoc") return helpFilter;
    if (activeSection === "skupiny") return skupinyListFilter;
    return null;
  }, [activeSection, thingsCategory, helpFilter, skupinyListFilter]);

  const handleSelectMain = (id) => {
    setActiveSection(id);
    if (id === "veci") {
      selectFeedSubFilter("veci");
      setThingsCategory("vse");
      setThingsLendingSubCategory(null);
    }
    if (id === "skupiny") {
      applySkupinyFilter(defaultSkupinyFilter);
    }
    if (id === "vypomoc") setHelpFilter("vse");
    if (id === "akce") {
      setCalendarFilter("all");
      setEventsSearch("");
      setEventsSearchExpanded(false);
    }
  };

  const handleSelectSub = (id) => {
    if (activeSection === "veci") {
      if (id !== thingsCategory) setThingsLendingSubCategory(null);
      setThingsCategory(id);
    }
    if (activeSection === "vypomoc") setHelpFilter(id);
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
            {activeSection === "akce" ? (
              <EventsAkceTopBar
                onBack={handleBack}
                search={eventsSearch}
                onSearchChange={setEventsSearch}
                searchExpanded={eventsSearchExpanded}
                onSearchExpandedChange={setEventsSearchExpanded}
              />
            ) : (
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
            )}
          </div>
          <NeighborsContent
            section={activeSection}
            helpFilter={helpFilter}
            onHelpFilterChange={setHelpFilter}
            eventsSearch={eventsSearch}
          />
        </>
      ) : (
        <NeighborsHub onSelectSection={handleSelectMain} />
      )}
    </div>
  );
}
