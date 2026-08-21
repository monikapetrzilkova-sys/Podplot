import { classifyReportType, reportPinVariant } from "./reportPinUtils.js";
import { doodlePawSvgInner } from "../components/doodle/doodleIcons.jsx";

const PIN_COLORS = {
  urgent: { bg: "#A85858", border: "#8F4545" },
  urgentMunicipality: { bg: "#8F4545", border: "#6B3333" },
  reportDefault: { bg: "#95D5B2", border: "#40916C" },
  reportLoss: { bg: "#74C69D", border: "#2D6A4F" },
  reportAnimal: { bg: "#52B788", border: "#1B4332" },
  reportInfra: { bg: "#40916C", border: "#1B4332" },
  reportDamage: { bg: "#3D7A68", border: "#1B4332" },
  reportWarn: { bg: "#4d8b7a", border: "#1B4332" },
  reportTip: { bg: "#C5D97A", border: "#6B8E23" },
  reportPublic: { bg: "#64A08D", border: "#2D6A4F" },
  reportFire: { bg: "#5a9587", border: "#1B4332" },
};

/** SVG cesty ikon kategorií — stejné symboly jako v ReportPinIcon / Doodle*. */
const ICON_PATHS = {
  pin: '<path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"/><circle cx="12" cy="11" r="2"/>',
  search:
    '<circle cx="10.5" cy="10.5" r="5.5"/><path d="M15 15l4.5 4.5"/>',
  paw: doodlePawSvgInner(),
  flame: '<path d="M12 22c4-3 6-6.5 6-10a6 6 0 0 0-10.5-4C8 6 6 7.5 5 10c-1.5 4 2 8.5 7 12z"/>',
  alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 10-14h-7l0-6z"/>',
  water: '<path d="M12 3c3 5 6 8.5 6 12a6 6 0 1 1-12 0c0-3.5 3-7 6-12z"/>',
  light: '<path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-3 11v1h6v-1a6 6 0 0 0-3-11z"/>',
  tip: '<path d="M9 18h6M10 22h4"/><path d="M12 2a6 6 0 0 0-3 11v1h6v-1a6 6 0 0 0-3-11z"/><path d="M10.5 12.5h3"/>',
  barrier:
    '<path d="M4 20h16M6 20V8l6-4 6 4v12"/><path d="M9 12h1M14 12h1M9 16h1M14 16h1"/>',
  megaphone: '<path d="M4 10v4h4l6 4V6L8 10H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  bike:
    '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17 11 8h3l2 3h3M11 8l3 9M14 11h-3"/>',
};

function resolveIconKey(report) {
  const category = classifyReportType(report?.type, report?.body, report?.reportCategoryId);
  const text = `${report?.type ?? ""} ${report?.body ?? ""}`.toLowerCase();

  if (category === "tip") return "tip";

  if (category === "warning" || category === "infrastructure") {
    if (/voda|vodovod/.test(text)) return "water";
    if (/osvětlen|lamp|proud|elektr|výpadek/.test(text)) return "bolt";
    return "alert";
  }
  if (category === "loss") {
    if (/kolo|odcizen|krádež/.test(text)) return "bike";
    return "search";
  }

  const map = {
    loss: "search",
    animal: "paw",
    fire: "flame",
    warning: "alert",
    infrastructure: "alert",
    tip: "tip",
    damage: "barrier",
    public: "megaphone",
    default: "pin",
  };
  return map[category] ?? "pin";
}

/** SVG ikona špendlíku hlášení pro Google Maps — s kategorií uvnitř. */
export function reportMarkerIconSvg(report, selected = false) {
  const variant = reportPinVariant(report);
  const c = PIN_COLORS[variant] ?? PIN_COLORS.reportDefault;
  const iconKey = resolveIconKey(report);
  const paths = ICON_PATHS[iconKey] ?? ICON_PATHS.pin;
  const w = selected ? 28 : 24;
  const h = selected ? 36 : 32;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 32">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${c.bg}" stroke="${c.border}" stroke-width="1.5"/>
    <g transform="translate(12 11) scale(0.42) translate(-12 -12)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
