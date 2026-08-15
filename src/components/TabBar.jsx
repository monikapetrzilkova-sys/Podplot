import { useApp } from "../context/AppContext.jsx";
import { APP_ROLES } from "../data/userRoles.js";
import {
  IconTabHome,
  IconTabMap,
  IconTabNeighbors,
  IconTabCatalog,
  IconTabStar,
  IconTabAd,
  IconAlert,
  IconTabUser,
} from "../data/icons.jsx";

const NEIGHBOR_TABS = [
  { id: "home", label: "Domů", icon: IconTabHome },
  { id: "map", label: "Mapa", icon: IconTabMap },
  { id: "plus", label: "", isPlus: true },
  { id: "neighbors", label: "Sousedé", icon: IconTabNeighbors },
  { id: "catalog", label: "Katalog", icon: IconTabCatalog },
];

/**
 * Řemeslník: Poptávky · Propagace · + · Recenze · Katalog
 * Katalog vždy poslední. Profil jen přes avatar v headeru.
 */
const CRAFTSMAN_TABS = [
  { id: "home", label: "Poptávky", icon: IconTabHome },
  { id: "ads", label: "Propagace", icon: IconTabAd },
  { id: "plus", label: "", isPlus: true },
  { id: "reviews", label: "Recenze", icon: IconTabStar },
  { id: "catalog", label: "Katalog", icon: IconTabCatalog },
];

/** Provozovna: Provoz · Propagace · + · Recenze · Katalog (vlevo aktivní, vpravo příjem info) */
const BUSINESS_TABS = [
  { id: "home", label: "Provoz", icon: IconTabHome },
  { id: "ads", label: "Propagace", icon: IconTabAd },
  { id: "plus", label: "", isPlus: true },
  { id: "reviews", label: "Recenze", icon: IconTabStar },
  { id: "catalog", label: "Katalog", icon: IconTabCatalog },
];

/** Úřad: Dění (přehled obce) · Oznámení · + · Agenda · Katalog */
const OFFICE_TABS = [
  { id: "reports", label: "Dění", icon: IconTabMap },
  { id: "crisis", label: "Oznámení", icon: IconAlert },
  { id: "plus", label: "", isPlus: true },
  { id: "office", label: "Agenda", icon: IconTabUser },
  { id: "catalog", label: "Katalog", icon: IconTabCatalog },
];

export default function TabBar() {
  const {
    activeTab,
    setActiveTab,
    selectMainTab,
    closeGroup,
    isB2BWorkMode,
    isMobilniWorkMode,
    isFyzickaWorkMode,
    appUserRole,
    viewAsNeighbor,
    openPlusMenu,
    openMessages,
    openProfile,
    unreadMessagesCount,
    profileOpen,
  } = useApp();

  const isOfficeMode = appUserRole === APP_ROLES.OFFICE && !viewAsNeighbor;
  const tabs = isOfficeMode
    ? OFFICE_TABS
    : isFyzickaWorkMode
      ? BUSINESS_TABS
      : isMobilniWorkMode || isB2BWorkMode
        ? CRAFTSMAN_TABS
        : NEIGHBOR_TABS;

  const handleTab = (id) => {
    closeGroup();
    if (id === "plus") {
      openPlusMenu();
      return;
    }
    if (id === "profile") {
      openProfile();
      return;
    }
    if (id === "messages") {
      if (isOfficeMode) {
        setActiveTab("messages");
        return;
      }
      openMessages();
      return;
    }
    if (isOfficeMode) {
      setActiveTab(id);
      return;
    }
    if (id === "home" || id === "map" || id === "neighbors" || id === "catalog" || id === "reviews" || id === "ads") {
      selectMainTab(id);
      return;
    }
    setActiveTab(id);
  };

  return (
    <nav className="pp-tabbar flex items-end px-1 pt-1 pb-4 shrink-0">
      {tabs.map((tab) => {
        if (tab.isPlus) {
          return (
            <div key="plus" className="flex-1 flex justify-center">
              <button
                type="button"
                onClick={() => handleTab("plus")}
                className="pp-plus-fab flex items-center justify-center"
                aria-label="Vytvořit"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          );
        }

        const active = tab.id === "profile" ? profileOpen : activeTab === tab.id;
        const TabIcon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1 relative transition-colors ${
              active ? "text-[#3D7A68]" : "text-stone-400"
            }`}
          >
            <TabIcon className="w-5 h-5" />
            {active && <span className="pp-tab-dot mt-0.5" aria-hidden />}
            {tab.label && (
              <span className={`text-[9px] ${active ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
            )}
            {tab.id === "messages" && unreadMessagesCount > 0 && (
              <span className="absolute top-0 right-1.5 w-4 h-4 text-white text-[8px] font-bold rounded-full flex items-center justify-center bg-[#3D7A68]">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
