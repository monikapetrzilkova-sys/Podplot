/** Platnost hlášení — volitelný termín nebo automaticky 48 h */

import { formatCzechDateTimeFull, minDateTimeLocalValue } from "./czechDateTime.js";

export { minDateTimeLocalValue };

export const REPORT_DEFAULT_TTL_MS = 48 * 60 * 60 * 1000;

export const REPORT_EXPIRY_DISCLAIMER =
  "Hlášení bez uvedeného termínu platnosti se automaticky skryje 48 hodin od zveřejnění. S uvedeným termínem zmizí po jeho uplynutí.";

export function computeExpiresAt(createdAt, validUntil = null) {
  const created = new Date(createdAt).getTime();
  if (validUntil) {
    const until = new Date(validUntil).getTime();
    if (!Number.isNaN(until) && until > created) {
      return new Date(until).toISOString();
    }
  }
  return new Date(created + REPORT_DEFAULT_TTL_MS).toISOString();
}

export function isReportActive(report, now = Date.now()) {
  if (!report) return false;
  const expiresAt =
    report.expiresAt ?? computeExpiresAt(report.createdAt ?? new Date(now).toISOString(), report.validUntil);
  return now < new Date(expiresAt).getTime();
}

export function filterActiveReports(reports, now = Date.now()) {
  return reports.filter((r) => isReportActive(r, now));
}

export function formatReportExpiryLabel(report) {
  const expiresAt = report.expiresAt ?? computeExpiresAt(report.createdAt ?? Date.now(), report.validUntil);
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;
  const hasCustom = Boolean(report.validUntil);
  const formatted = formatCzechDateTimeFull(date);
  return hasCustom ? `Platné do ${formatted}` : `Automaticky zmizí ${formatted}`;
}
