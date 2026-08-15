import { useApp } from "../context/AppContext.jsx";
import { APP_ROLES } from "../data/userRoles.js";
import {
  IconAlert,
  IconBook,
  IconBulb,
  IconHammer,
  IconShop,
  IconTabCalendar,
  IconTabCatalog,
  IconTabNeighbors,
} from "../data/icons.jsx";

const NEIGHBOR_ACTIONS = [
  {
    id: "market",
    label: "Prodám / Daruji / Sháním",
    icon: IconShop,
    action: "create",
    category: null,
  },
  {
    id: "lend",
    label: "Půjčím",
    icon: IconHammer,
    action: "create",
    category: "pujcovna",
  },
  {
    id: "help",
    label: "Potřebuji / Nabízím pomoc",
    icon: IconTabNeighbors,
    action: "help",
  },
  {
    id: "event",
    label: "Nová akce",
    icon: IconTabCalendar,
    action: "event",
  },
  {
    id: "report",
    label: "Nahlásit",
    icon: IconAlert,
    action: "report",
  },
];

/** Mobilní řemeslník — bez reklam do sousedského feedu */
const CRAFTSMAN_ACTIONS = [
  {
    id: "invoice",
    label: "Vytvořit fakturu",
    hint: "Doklad k zakázce — pouze u vás",
    icon: IconBook,
    action: "invoice",
  },
  {
    id: "catalog",
    label: "Upravit katalogový profil",
    hint: "Otevře Profil — služby a ceník",
    icon: IconTabCatalog,
    action: "catalog-edit",
  },
  {
    id: "capacity",
    label: "Kapacita a dojezd",
    hint: "Otevře Profil — nastavení okruhu",
    icon: IconHammer,
    action: "capacity",
  },
];

/** Provozovna — rychlá aktualita / změna provozu */
const BUSINESS_ACTIONS = [
  {
    id: "note",
    label: "Sdělení sousedům",
    hint: "Menu, akce, upozornění na změnu",
    icon: IconBulb,
    action: "business-note",
  },
  {
    id: "hours",
    label: "Změna otevírací doby",
    hint: "Svátky, dovolená, mimořádný provoz",
    icon: IconTabCalendar,
    action: "business-hours",
  },
  {
    id: "menu",
    label: "Polední menu",
    hint: "Otevře Provoz — publikace menu",
    icon: IconShop,
    action: "business-note",
  },
];

/** Pouze oficiální akce instituce / úřadu — pořadí: oznámení → výzva → akce */
const OFFICE_ACTIONS = [
  {
    id: "announce",
    label: "Nové oznámení",
    hint: "Mimořádné hlášení nebo běžná aktualita obce",
    icon: IconAlert,
    action: "office-announce",
  },
  {
    id: "call",
    label: "Nová výzva občanům",
    hint: "Vyjádření k projektu, úklid, sběr nápadů",
    icon: IconBulb,
    action: "office-call",
  },
  {
    id: "event",
    label: "Nová akce",
    hint: "Veřejná událost obce do kalendáře",
    icon: IconTabCalendar,
    action: "event",
  },
];

export default function PlusActionMenu() {
  const {
    plusMenuOpen,
    closePlusMenu,
    openCreate,
    openMapReport,
    openCreateEvent,
    openOfficePromptCall,
    openOfficeAnnouncementComposer,
    openInvoice,
    openProfile,
    openBusinessComposer,
    setActiveTab,
    setPendingNeighborsSection,
    setPendingHelpFormOpen,
    appUserRole,
    viewAsNeighbor,
    isB2BWorkMode,
    isFyzickaWorkMode,
    isMobilniWorkMode,
  } = useApp();

  if (!plusMenuOpen) return null;

  const isOfficeMode = appUserRole === APP_ROLES.OFFICE && !viewAsNeighbor;
  const actions = isOfficeMode
    ? OFFICE_ACTIONS
    : isFyzickaWorkMode
      ? BUSINESS_ACTIONS
      : isMobilniWorkMode || isB2BWorkMode
        ? CRAFTSMAN_ACTIONS
        : NEIGHBOR_ACTIONS;

  const handleAction = (item) => {
    closePlusMenu();
    if (item.action === "report") {
      openMapReport();
      return;
    }
    if (item.action === "event") {
      openCreateEvent();
      return;
    }
    if (item.action === "office-call") {
      openOfficePromptCall?.();
      return;
    }
    if (item.action === "office-announce" || item.action === "office-crisis") {
      openOfficeAnnouncementComposer?.();
      return;
    }
    if (item.action === "business-note") {
      openBusinessComposer?.("note");
      return;
    }
    if (item.action === "business-hours") {
      openBusinessComposer?.("hours");
      return;
    }
    if (item.action === "invoice") {
      openInvoice?.();
      return;
    }
    if (item.action === "catalog-edit" || item.action === "capacity") {
      openProfile?.();
      return;
    }
    if (item.action === "help") {
      setPendingHelpFormOpen(true);
      setPendingNeighborsSection("vypomoc");
      setActiveTab("neighbors");
      return;
    }
    openCreate(item.category ?? null);
  };

  return (
    <div className="pp-plus-menu" role="dialog" aria-label="Akční menu">
      <button type="button" className="pp-plus-menu-backdrop" onClick={closePlusMenu} aria-label="Zavřít" />
      <div className="pp-plus-menu-panel">
        {isOfficeMode && (
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#3D7A68]">
            Akce úřadu
          </p>
        )}
        {isFyzickaWorkMode && (
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#3D7A68]">
            Akce provozu
          </p>
        )}
        {(isMobilniWorkMode || (isB2BWorkMode && !isFyzickaWorkMode && !isOfficeMode)) && (
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#3D7A68]">
            Pracovní akce
          </p>
        )}
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAction(item)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-[#F1F6F5] transition-colors"
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#E8F3EF", color: "#3D7A68" }}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-stone-900 leading-snug">{item.label}</span>
                {item.hint && (
                  <span className="block text-[11px] text-stone-500 mt-0.5">{item.hint}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
