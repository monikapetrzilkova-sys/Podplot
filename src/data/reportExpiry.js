/** Platnost hlášení — časová (48 h / vlastní termín) nebo dokud se nevyřeší */

import { formatCzechDateTimeFull, minDateTimeLocalValue } from "./czechDateTime.js";

export { minDateTimeLocalValue };

export const REPORT_DEFAULT_TTL_MS = 48 * 60 * 60 * 1000;

/** Režimy při vytváření */
export const REPORT_VALIDITY_MODE = {
  TTL: "ttl",
  CUSTOM: "custom",
  UNTIL_RESOLVED: "until_resolved",
};

export const REPORT_STATUS = {
  OPEN: "open",
  RESOLVED: "resolved",
};

export const REPORT_EXPIRY_DISCLAIMER =
  "Bez termínu se tipy, ztráty a varování skryjí po 48 hodinách. Závady defaultně zůstávají, dokud je neoznačíte jako vyřešené. Stejné pravidlo platí ve feedu i na mapě.";

/** Závada — default „dokud se nevyřeší“ */
export function categoryDefaultsToUntilResolved(categoryId) {
  return categoryId === "damage";
}

export function defaultValidityModeForCategory(categoryId) {
  return categoryDefaultsToUntilResolved(categoryId)
    ? REPORT_VALIDITY_MODE.UNTIL_RESOLVED
    : REPORT_VALIDITY_MODE.TTL;
}

export function computeExpiresAt(createdAt, validUntil = null, { untilResolved = false } = {}) {
  if (untilResolved) return null;
  const created = new Date(createdAt).getTime();
  if (validUntil) {
    const until = new Date(validUntil).getTime();
    if (!Number.isNaN(until) && until > created) {
      return new Date(until).toISOString();
    }
  }
  return new Date(created + REPORT_DEFAULT_TTL_MS).toISOString();
}

export function isReportResolved(report) {
  if (!report) return false;
  return report.status === REPORT_STATUS.RESOLVED || Boolean(report.resolvedAt);
}

/**
 * Viditelné ve feedu i na mapě — jedno pravidlo.
 * Dokud nevyřešeno + (untilResolved NEBO ještě neexpirovalo).
 */
export function isReportActive(report, now = Date.now()) {
  if (!report) return false;
  const r = normalizeReportValidity(report);
  if (isReportResolved(r)) return false;
  if (r.untilResolved) return true;
  const expiresAt =
    r.expiresAt ??
    computeExpiresAt(r.createdAt ?? new Date(now).toISOString(), r.validUntil, {
      untilResolved: false,
    });
  if (!expiresAt) return true;
  const ts = new Date(expiresAt).getTime();
  if (Number.isNaN(ts)) return true;
  return now < ts;
}

export function filterActiveReports(reports, now = Date.now()) {
  return reports.filter((r) => isReportActive(normalizeReportValidity(r), now));
}

export function formatReportExpiryLabel(report) {
  if (!report) return null;
  if (isReportResolved(report)) {
    return report.resolvedAt
      ? `Vyřešeno ${formatCzechDateTimeFull(new Date(report.resolvedAt))}`
      : "Vyřešeno";
  }
  if (report.untilResolved) {
    return "Platí, dokud se nevyřeší";
  }
  const expiresAt =
    report.expiresAt ?? computeExpiresAt(report.createdAt ?? Date.now(), report.validUntil);
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;
  const hasCustom = Boolean(report.validUntil);
  const formatted = formatCzechDateTimeFull(date);
  if (!isReportActive(report)) {
    return hasCustom ? `Vypršelo ${formatted}` : `Automaticky vypršelo ${formatted}`;
  }
  return hasCustom ? `Platné do ${formatted}` : `Automaticky zmizí ${formatted}`;
}

/** Badge pro Moje hlášení */
export function getReportLifecycleBadge(report, now = Date.now()) {
  if (!report) return { id: "unknown", label: "—", tone: "muted" };
  if (isReportResolved(report)) {
    return { id: "resolved", label: "Vyřešeno", tone: "ok" };
  }
  if (!isReportActive(report, now)) {
    return { id: "expired", label: "Vypršelo", tone: "muted" };
  }
  if (report.untilResolved) {
    return { id: "open_until", label: "Otevřené", tone: "active" };
  }
  return { id: "open", label: "Aktivní", tone: "active" };
}

/** Jak dlouho ještě držet vypršelá / vyřešená hlášení v profilu (Moje hlášení). */
export const REPORT_PROFILE_RETENTION_MS = 24 * 60 * 60 * 1000;

/**
 * Vlastní přehled v profilu — aktivní vždy; po vypršení/vyřešení ještě ~1 den, pak pryč.
 */
export function isReportVisibleInOwnerProfile(report, now = Date.now()) {
  if (!report) return false;
  const r = normalizeReportValidity(report);
  if (isReportActive(r, now)) return true;

  if (isReportResolved(r)) {
    const resolvedAt = r.resolvedAt ? new Date(r.resolvedAt).getTime() : NaN;
    if (!Number.isFinite(resolvedAt)) return false;
    return now < resolvedAt + REPORT_PROFILE_RETENTION_MS;
  }

  const expiresAt =
    r.expiresAt ??
    computeExpiresAt(r.createdAt ?? new Date(now).toISOString(), r.validUntil, {
      untilResolved: false,
    });
  if (!expiresAt) return false;
  const ts = new Date(expiresAt).getTime();
  if (Number.isNaN(ts)) return false;
  // ještě v „grace“ okně po expiraci
  return now >= ts && now < ts + REPORT_PROFILE_RETENTION_MS;
}

/** Normalizace mock / starých záznamů */
export function normalizeReportValidity(report) {
  if (!report) return report;
  const untilResolved =
    report.untilResolved === true ||
    (report.untilResolved !== false &&
      categoryDefaultsToUntilResolved(report.reportCategoryId) &&
      !report.validUntil);
  const status = report.status ?? (report.resolvedAt ? REPORT_STATUS.RESOLVED : REPORT_STATUS.OPEN);
  const expiresAt = untilResolved
    ? null
    : report.expiresAt ??
      computeExpiresAt(report.createdAt ?? new Date().toISOString(), report.validUntil ?? null);
  return {
    ...report,
    untilResolved: Boolean(untilResolved),
    status,
    expiresAt,
  };
}
