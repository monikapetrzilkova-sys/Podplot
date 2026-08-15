import { MAP_CENTER } from "../data/mapRadiusSettings.js";
import { clampMapPos } from "../data/mapData.js";
import { isMunicipalityUrgent } from "../data/reportUrgency.js";

const NEAR_HOME_THRESHOLD = 3.2;
const NEAR_PIN_THRESHOLD = 2.8;

function posDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isValidMapPos(mapPos) {
  if (!mapPos) return false;
  const x = Number(mapPos.x);
  const y = Number(mapPos.y);
  return Number.isFinite(x) && Number.isFinite(y);
}

export function hasReportMapPosition(report) {
  if (!report) return false;
  if (isValidMapPos(report.mapPos)) return true;
  if (report.mapPos?.lat != null && report.mapPos?.lng != null) return true;
  if (report.lat != null && report.lng != null) return true;
  return false;
}

/** Posune překrývající se špendlíky — zejména vlastní hlášení u špendlíku Domov. */
export function buildReportDisplayPositions(reports, homeCenter = MAP_CENTER) {
  const positions = new Map();
  const occupied = [{ x: homeCenter.x, y: homeCenter.y }];

  for (const report of reports) {
    if (!isValidMapPos(report.mapPos)) continue;

    let x = Number(report.mapPos.x);
    let y = Number(report.mapPos.y);
    let slot = 0;

    const nearHome = posDistance({ x, y }, homeCenter) < NEAR_HOME_THRESHOLD;
    const avoidHome = nearHome && !isMunicipalityUrgent(report) && !report.urgent;

    while (
      occupied.some((p) => posDistance(p, { x, y }) < NEAR_PIN_THRESHOLD) ||
      (avoidHome && slot === 0)
    ) {
      slot += 1;
      const angle = ((slot * 137.5) * Math.PI) / 180;
      const radius = 3.2 + slot * 1.5;
      const origin = avoidHome ? homeCenter : report.mapPos;
      ({ x, y } = clampMapPos(
        Number(origin.x) + Math.cos(angle) * radius,
        Number(origin.y) + Math.sin(angle) * radius
      ));
    }

    occupied.push({ x, y });
    positions.set(report.id, { x, y });
  }

  return positions;
}

/** Kategorie hlášení pro barvu a ikonu špendlíku */
export function classifyReportType(type = "", body = "", categoryId = null) {
  if (categoryId === "infrastructure") return "warning";
  if (categoryId && categoryId !== "default") return categoryId;

  const t = `${type} ${body}`.toLowerCase();

  if (/^tip\b|tip:|tip pro|doporučuj|nový obchod|tip na/.test(t) || type === "Tip") return "tip";
  if (/ztrát|nález|pátr|hledám|zmizel|odcizen|krádež|kolo|peněžen/.test(t)) return "loss";
  if (/pes|kočka|zatoulan|zaběhl|zvíř|kočk|včel|vcel|úl|úlu/.test(t)) return "animal";
  if (/požár|hasič|kouř|oheň|hoří/.test(t)) return "fire";
  // Výpadky patří pod varování
  if (
    /varování|kriz|sos|evaku|úřad|obec|výstrah|výpadek|proud|elektr|voda|vodovod|osvětlen|lamp/.test(
      t
    )
  ) {
    return "warning";
  }
  if (/výmol|silnic|chodník|doprav|havári|nehoda|závada|poškoz/.test(t)) return "damage";
  if (/cvičení|akce|veřejn|hřiště|park|hasičsk/.test(t)) return "public";
  return "default";
}

/** Odstíny smaragdové palety + limetka pro tipy + červená pro urgentní */
const REPORT_PIN_VARIANT = {
  default: "reportDefault",
  loss: "reportLoss",
  animal: "reportAnimal",
  infrastructure: "reportWarn",
  damage: "reportDamage",
  public: "reportPublic",
  fire: "reportFire",
  warning: "reportWarn",
  tip: "reportTip",
};

export function reportPinVariant(report) {
  if (report?.urgent) {
    return isMunicipalityUrgent(report) ? "urgentMunicipality" : "urgent";
  }
  const category = classifyReportType(report?.type, report?.body, report?.reportCategoryId);
  return REPORT_PIN_VARIANT[category] ?? REPORT_PIN_VARIANT.default;
}

export function reportPinShortLabel(report) {
  const type = (report?.type ?? "Hlášení").trim();
  return type.length > 18 ? `${type.slice(0, 16)}…` : type;
}

/** Štítek u špendlíku — urgentní, vlastní nebo právě vybrané hlášení */
export function shouldShowReportPinLabel(report, selectedId) {
  if (!report) return false;
  if (report.id === selectedId) return true;
  if (report.mine) return true;
  return Boolean(report.urgent);
}

export function reportPinMeta(report) {
  return [report?.distance, report?.time].filter(Boolean).join(" · ");
}

/** Barvy náhledové ikony (bez urgentních) */
export function reportPinAccentColor(report) {
  if (report?.urgent) return "#A85858";
  const map = {
    default: "#40916C",
    loss: "#52B788",
    animal: "#3D7A68",
    infrastructure: "#4d8b7a",
    damage: "#1B4332",
    public: "#64A08D",
    fire: "#5a9587",
    warning: "#4d8b7a",
    tip: "#8FAE3E",
  };
  const category = classifyReportType(report?.type, report?.body, report?.reportCategoryId);
  return map[category] ?? map.default;
}
