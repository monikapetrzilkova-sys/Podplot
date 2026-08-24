/** Lokální perzistence vlastních hlášení (mapa/seznam přežije refresh). */

import { normalizeReportValidity } from "./reportExpiry.js";

function storageKey(userId) {
  return `podplot-reports-v1-${userId || "anon"}`;
}

export function loadStoredReports(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && typeof r === "object" && r.id)
      .map((r) => normalizeReportValidity(r));
  } catch {
    return [];
  }
}

export function persistStoredReports(userId, reports) {
  try {
    if (!userId) return;
    const list = (Array.isArray(reports) ? reports : [])
      .filter((r) => r && r.id)
      .slice(0, 120);
    localStorage.setItem(storageKey(userId), JSON.stringify(list));
  } catch {
    /* quota / private mode */
  }
}

/** Sloučí seznamy podle id — pozdější záznam má přednost. */
export function mergeReportsById(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const r of list ?? []) {
      if (!r?.id) continue;
      const prev = byId.get(r.id);
      byId.set(r.id, prev ? { ...prev, ...r } : r);
    }
  }
  return [...byId.values()].map((r) => normalizeReportValidity(r));
}
