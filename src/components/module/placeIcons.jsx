/** Monochromatické ikony jednotlivých míst (podniky, instituce, provozovny) */

import {
  GuideCategoryIcon,
  GuideSubFilterIcon,
  IconGuideOther,
} from "./guideCategoryIcons.jsx";

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };

function IconWasteBin({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 7h16M9 7V5h6v2M6 7l1 12h10l1-12" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function IconBusStop({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <rect x="5" y="4" width="14" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
      <path d="M8 8h8" />
    </svg>
  );
}

function IconPostOffice({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10l8 5 8-5" />
    </svg>
  );
}

function IconPlayground({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M6 20V8l6-4 6 4v12" />
      <path d="M12 4v16" />
    </svg>
  );
}

/** Určí klíč ikony podle kategorie místa */
export function getPlaceIconKey(place) {
  if (!place) return "ostatni";
  const cat = place.category;
  if (cat === "sluzby" && place.provozovnaType) return `provozovna:${place.provozovnaType}`;
  if (place.wasteType) return "waste";
  if (cat === "vybavenost" || cat === "odpad") return "verejny-prostor";
  const map = {
    gastro: "gastro",
    obchody: "obchody",
    sluzby: "sluzby",
    zdravi: "zdravi",
    instituce: "instituce",
    urady: "instituce",
    "verejny-prostor": "verejny-prostor",
    ostatni: "ostatni",
  };
  if (map[cat]) return map[cat];

  const blob = `${place.name ?? ""} ${place.tagline ?? ""}`.toLowerCase();
  if (/restaurace|kavárna|bistro|hospoda|pekař|gastro|menu/.test(blob)) return "gastro";
  if (/lékárna|ordinace|zubař|zdrav|masáž|salon|krás/.test(blob)) return "zdravi";
  if (/obchod|potraviny|prodejna/.test(blob)) return "obchody";
  if (/škola|úřad|knihovna|hasič|polici|instituc/.test(blob)) return "instituce";
  if (/myčka|autoservis|klíč|bankomat|servis/.test(blob)) return "sluzby";
  return "ostatni";
}

function renderPlaceSpecificIcon(place, className) {
  const name = (place.name ?? "").toLowerCase();
  const tag = (place.tagline ?? "").toLowerCase();
  if (/zastávk|autobus/.test(name + tag)) return <IconBusStop className={className} />;
  if (/pošt|balíkovna/.test(name + tag)) return <IconPostOffice className={className} />;
  if (/hřišt|hriste|playground/.test(name + tag)) return <IconPlayground className={className} />;
  return null;
}

const GUIDE_CATEGORY_KEYS = new Set([
  "gastro",
  "obchody",
  "sluzby",
  "zdravi",
  "instituce",
  "verejny-prostor",
  "remeslnici",
  "ostatni",
]);

export function PlaceIcon({ place, className = "w-5 h-5", pin = false }) {
  const color = pin ? "text-white" : "text-[#4D8B7A]";
  const cls = `${className} shrink-0 ${color}`;

  const specific = renderPlaceSpecificIcon(place, cls);
  if (specific) return specific;

  const key = getPlaceIconKey(place);
  if (key.startsWith("provozovna:")) {
    const typeId = key.slice("provozovna:".length);
    return <GuideSubFilterIcon group="provozovny" id={typeId} active={pin} className={cls} />;
  }
  if (key === "waste") {
    return <IconWasteBin className={cls} />;
  }
  if (GUIDE_CATEGORY_KEYS.has(key)) {
    return <GuideCategoryIcon id={key} className={cls} />;
  }
  return <IconGuideOther className={cls} />;
}

/** Ikona služby u vás doma (katalog) */
export function ServicePlaceIcon({ service, className = "w-5 h-5", pin = false }) {
  const color = pin ? "text-white" : "text-[#4D8B7A]";
  const cls = `${className} shrink-0 ${color}`;
  const sub = service?.subcategory;
  const homeMap = {
    instalater: "domov-zahrada",
    elektrikar: "domov-zahrada",
    zahrada: "domov-zahrada",
    uklid: "domov-zahrada",
    beauty: "pece-krasa",
    kadernictvi: "pece-krasa",
    hlidani: "deti-rodina",
    doucovani: "deti-rodina",
  };
  if (homeMap[sub]) {
    return <GuideSubFilterIcon group="home-services" id={homeMap[sub]} active={pin} className={cls} />;
  }
  if (service?.accountType === "podnik" || sub === "gastro") {
    return <GuideCategoryIcon id="gastro" className={cls} />;
  }
  return <GuideCategoryIcon id="remeslnici" className={cls} />;
}
