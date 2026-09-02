import { institutionPinVariant } from "../data/institutionsMapData.js";
import {
  MAP_PIN_ICON_CX,
  MAP_PIN_ICON_CY,
  mapPinSvgOpenTag,
  mapPinTeardropPath,
} from "./mapPinShape.js";

/** Barvy špendlíků průvodce — shodné s mapPinAdapter / ReportsMap */
const PIN_COLORS = {
  google: { bg: "#4285F4", border: "#1a73e8" },
  gastro: { bg: "#F4A261", border: "#E76F51" },
  services: { bg: "#E76F51", border: "#D95D39" },
  shop: { bg: "#E9C46A", border: "#F4A261" },
  health: { bg: "#06D6A0", border: "#118AB2" },
  public: { bg: "#4895EF", border: "#4361EE" },
  sport: { bg: "#52B788", border: "#2D6A4F" },
  waste: { bg: "#2D6A4F", border: "#1B4332" },
  leisure: { bg: "#ADB5BD", border: "#6C757D" },
  institution: { bg: "#7209B7", border: "#560BAD" },
  default: { bg: "#B7E4C7", border: "#2D6A4F" },
};

/**
 * SVG cesty ikon kategorií Průvodce — stejné symboly jako GuideCategoryIcon / PlaceIcon.
 * viewBox 0 0 24 24, stroke-based.
 */
const ICON_PATHS = {
  gastro:
    '<path d="M4 11h16M6 11V4h3v7M11 11V4h3v7M16 11V4h2v7"/><path d="M4 11v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2"/>',
  shop: '<path d="M6 3 3 8v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8l-3-5H6z"/><path d="M3 8h18"/><path d="M16 12a4 4 0 0 1-8 0"/>',
  health:
    '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M12 10v6M9 13h6"/>',
  instituce:
    '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 9h1M14 9h1M9 13h1M14 13h1"/>',
  "verejny-prostor":
    '<path d="M12 3c-3 2-6 4-6 8a6 6 0 0 0 12 0c0-4-3-6-6-8z"/><path d="M8 21h8M10 17h4"/>',
  sluzby: '<path d="M3 9h18v12H3z"/><path d="M3 9l2-5h14l2 5"/><path d="M9 14h6"/>',
  remeslnici:
    '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  waste:
    '<path d="M4 7h16M9 7V5h6v2M6 7l1 12h10l1-12"/><path d="M10 11v5M14 11v5"/>',
  bus: '<rect x="5" y="4" width="14" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M8 8h8"/>',
  post: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 10l8 5 8-5"/>',
  playground: '<path d="M6 20V8l6-4 6 4v12"/><path d="M12 4v16"/>',
  carwash: '<path d="M3 11h18l-1-4H4l-1 4z"/><path d="M5 11v6h14v-6"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
  ostatni:
    '<circle cx="5" cy="12" r="1.5" fill="white" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="white" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="white" stroke="none"/>',
};

/** Stejná logika jako getPlaceIconKey — bez JSX */
export function resolveInstitutionIconKey(place) {
  if (!place) return "ostatni";
  const cat = place.category;
  const name = (place.name ?? "").toLowerCase();
  const tag = (place.tagline ?? "").toLowerCase();
  const blob = `${name} ${tag}`;

  if (/zastávk|autobus/.test(blob)) return "bus";
  if (/pošt|balíkovna/.test(blob)) return "post";
  if (/hřišt|hriste|playground/.test(blob)) return "playground";
  if ((cat === "verejny-prostor" || cat === "vybavenost" || cat === "odpad") && place.wasteType) {
    return "waste";
  }
  if (cat === "sluzby" && (place.provozovnaType === "automycka" || place.provozovnaType === "auto"))
    return "carwash";
  if (cat === "sluzby") return "sluzby";
  if (cat === "vybavenost" || cat === "odpad") return "verejny-prostor";

  const map = {
    gastro: "gastro",
    obchody: "shop",
    sluzby: "sluzby",
    zdravi: "health",
    instituce: "instituce",
    urady: "instituce",
    "verejny-prostor": "verejny-prostor",
    remeslnici: "remeslnici",
    ostatni: "ostatni",
  };
  if (map[cat]) return map[cat];

  if (/restaurace|kavárna|bistro|hospoda|pekař|gastro|menu/.test(blob)) return "gastro";
  if (/lékárna|ordinace|zubař|zdrav|masáž|salon|krás/.test(blob)) return "health";
  if (/obchod|potraviny|prodejna/.test(blob)) return "shop";
  if (/škola|úřad|knihovna|hasič|polici|instituc/.test(blob)) return "instituce";
  if (/myčka|autoservis|klíč|bankomat|servis/.test(blob)) return "sluzby";
  return "ostatni";
}

/** SVG ikona špendlíku místa v Průvodci pro Google Maps — kategorie uvnitř. */
export function institutionMarkerIconSvg(place, selected = false) {
  const variant = place?.isGooglePlace ? "google" : institutionPinVariant(place);
  const c = PIN_COLORS[variant] ?? PIN_COLORS.default;
  const iconKey = resolveInstitutionIconKey(place);
  const paths = ICON_PATHS[iconKey] ?? ICON_PATHS.ostatni;
  const filledDots = iconKey === "ostatni";

  const svg = `${mapPinSvgOpenTag(selected)}
    <path d="${mapPinTeardropPath()}" fill="${c.bg}" stroke="${c.border}" stroke-width="1.6" stroke-linejoin="round"/>
    <g transform="translate(${MAP_PIN_ICON_CX} ${MAP_PIN_ICON_CY}) scale(0.46) translate(-12 -12)" fill="${
      filledDots ? "white" : "none"
    }" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
