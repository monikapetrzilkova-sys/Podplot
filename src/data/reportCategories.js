/** Kategorie hlášení — výběr uživatele pro správné zařazení a ikonu špendlíku */

import { classifyReportType } from "../utils/reportPinUtils.js";

/**
 * Výpadek sloučen do Varování.
 * Tipy = sousedské tipy (obchod, místo…) — ukládají se jako hlášení s kategorií tip.
 */
export const REPORT_CATEGORIES = [
  { id: "loss", label: "Ztráta / nález", shortLabel: "Ztráta/Nález", typeLabel: "Ztráta / nález" },
  { id: "animal", label: "Zvíře", shortLabel: "Zvíře", typeLabel: "Zatoulané zvíře" },
  { id: "damage", label: "Závada / nehoda", shortLabel: "Závada", typeLabel: "Závada" },
  {
    id: "warning",
    label: "Varování",
    shortLabel: "Varování",
    typeLabel: "Varování",
  },
  { id: "tip", label: "Tip pro sousedy", shortLabel: "Tip", typeLabel: "Tip" },
  { id: "default", label: "Jiné hlášení", shortLabel: "Jiné", typeLabel: "Hlášení" },
];

/** Filtry na mapě / v Dění — 2×4; Tipy a Výzvy vždy na konci */
export const MAP_REPORT_FILTER_CATEGORIES = [
  { id: "all", label: "Vše" },
  { id: "loss", label: "Ztráta/Nález", filterId: "loss" },
  { id: "animal", label: "Zvíře", filterId: "animal" },
  { id: "damage", label: "Závada", filterId: "damage" },
  { id: "warning", label: "Varování", filterId: "warning" },
  { id: "default", label: "Jiné", filterId: "default" },
  { id: "tip", label: "Tipy", filterId: "tip", isTip: true },
  { id: "vyzvy", label: "Výzvy", filterId: "vyzvy", isCalls: true },
];

export const REPORTS_CALLS_FILTER_ID = "vyzvy";
export const REPORTS_TIP_CATEGORY_ID = "tip";

/** Podtyp u kategorie Ztráta / nález — povinný výběr ve formuláři */
export const LOSS_KIND_OPTIONS = [
  { id: "lost", label: "Ztráta", typeLabel: "Ztráta", hint: "Něco jsem ztratil/a nebo hledám" },
  { id: "found", label: "Nález", typeLabel: "Nález", hint: "Něco jsem našel/a" },
];

export function getLossKindOption(id) {
  return LOSS_KIND_OPTIONS.find((o) => o.id === id) ?? null;
}

/** Odstín tipů — limetkově zelená */
export const REPORT_TIP_ACCENT = "#8FAE3E";
export const REPORT_TIP_ACCENT_SOFT = "#A8C45A";

/** Odstín výzev úřadu — sytější petrolejová zeleň (odlišná od tipů i běžných kategorií) */
export const REPORT_CALLS_ACCENT = "#0F766E";
export const REPORT_CALLS_ACCENT_SOFT = "#14B8A6";

export function getReportCategory(id) {
  const normalized = id === "infrastructure" ? "warning" : id;
  return (
    REPORT_CATEGORIES.find((c) => c.id === normalized) ??
    REPORT_CATEGORIES[REPORT_CATEGORIES.length - 1]
  );
}

export function normalizeReportCategoryId(id) {
  if (!id) return null;
  if (id === "infrastructure") return "warning";
  return id;
}

export function resolveReportCategoryId(report) {
  const raw = normalizeReportCategoryId(report?.reportCategoryId);
  if (raw && raw !== "default") return raw;
  return classifyReportType(report?.type, report?.body, report?.reportCategoryId);
}

export function isTipReport(report) {
  return resolveReportCategoryId(report) === "tip";
}

/** Filtr kategorie na mapě — „Vše“ zobrazí všechna hlášení v okruhu. */
export function reportMatchesMapCategoryFilter(report, filterId = "all") {
  if (!filterId || filterId === "all") return true;
  if (filterId === REPORTS_CALLS_FILTER_ID || filterId === "vyzvy") return false;

  const category = resolveReportCategoryId(report);

  if (filterId === "default") {
    return category === "default";
  }

  if (filterId === "warning") {
    return category === "warning" || category === "fire" || category === "infrastructure";
  }

  if (filterId === "tip") {
    return category === "tip";
  }

  return category === filterId;
}
