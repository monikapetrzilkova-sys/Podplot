/** Formátování data a času dle zvyklostí v ČR (cs-CZ, 24 h) */

export const CS_LOCALE = "cs-CZ";
export const TIME_TBD_LABEL = "čas upřesníme";

/** Lokální kalendářní datum z YYYY-MM-DD (bez UTC posunu). */
export function parseLocalDateParts(dateValue) {
  if (!dateValue) return null;
  const m = String(dateValue).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function parseDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const asLocalDate = parseLocalDateParts(value);
  if (asLocalDate) {
    const d = new Date(asLocalDate.year, asLocalDate.month - 1, asLocalDate.day, 12, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function capitalizeCs(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** 14. 7. 2026 */
export function formatCzechDate(dateInput, { weekday = false, year = true } = {}) {
  const d = parseDateInput(dateInput);
  if (!d) return "";
  const opts = { day: "numeric", month: "numeric" };
  if (year) opts.year = "numeric";
  if (weekday) opts.weekday = "short";
  return capitalizeCs(d.toLocaleDateString(CS_LOCALE, opts));
}

/** 17:00 — vždy 24hodinový formát (nikdy AM/PM) */
export function formatCzechTime(dateInput) {
  const d = parseDateInput(dateInput);
  if (!d) return "";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** Normalizace vstupu na HH:mm, nebo null při neplatném čase */
export function normalizeCzechTime(raw) {
  if (raw == null) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  const colon = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  const compact = !colon ? trimmed.match(/^(\d{1,2})([0-5]\d)$/) : null;
  const m = colon || compact;
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function isValidCzechTime(raw) {
  return Boolean(raw) && normalizeCzechTime(raw) != null;
}

/** Rozdělí hodnotu datetime-local (YYYY-MM-DDTHH:mm) */
export function splitDateTimeLocal(value) {
  if (!value) return { date: "", time: "" };
  const [date = "", timePart = ""] = String(value).split("T");
  return { date, time: timePart.slice(0, 5) };
}

/** Spojí datum + čas do YYYY-MM-DDTHH:mm */
export function joinDateTimeLocal(date, time) {
  if (!date) return "";
  const normalized = normalizeCzechTime(time);
  if (!normalized) return date;
  return `${date}T${normalized}`;
}

/** Po 14. 7. · 17:00 */
export function formatCzechDateTime(dateInput) {
  const d = parseDateInput(dateInput);
  if (!d) return "";
  return `${formatCzechDate(d, { weekday: true, year: false })} · ${formatCzechTime(d)}`;
}

/** 14. 7. 2026 v 17:00 */
export function formatCzechDateTimeFull(dateInput) {
  const d = parseDateInput(dateInput);
  if (!d) return "";
  return `${formatCzechDate(d, { weekday: false, year: true })} v ${formatCzechTime(d)}`;
}

/** Po 14. 7. · 17:00  nebo  Po 14. 7. · čas upřesníme */
export function formatCzechEventSchedule(startsAtIso, timeTbd = false) {
  if (!startsAtIso) return "Termín upřesníme";
  const d = parseDateInput(startsAtIso);
  if (!d) return "Termín upřesníme";
  const datePart = formatCzechDate(d, { weekday: true, year: false });
  if (timeTbd) return `${datePart} · ${TIME_TBD_LABEL}`;
  return `${datePart} · ${formatCzechTime(d)}`;
}

export function nowCzechTime() {
  return formatCzechTime(new Date());
}

/** Timestamp z ISO / Date / ms (nebo s). */
export function toTimestamp(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? null : t;
  }
  const n = Date.parse(String(value));
  return Number.isFinite(n) ? n : null;
}

function czechDayPhrase(days) {
  if (days === 1) return "před 1 dnem";
  if (days >= 2 && days <= 4) return `před ${days} dny`;
  return `před ${days} dní`;
}

/**
 * Relativní stáří pro feed / hlášení — ať sousedé poznají aktuálnost.
 * např. právě teď · před 12 min · před 3 h · včera 14:30 · před 5 dní · 12. 8. · 09:15
 */
export function formatRelativeTimeCs(value, now = Date.now()) {
  const t = toTimestamp(value);
  if (t == null) return null;
  const diffMs = now - t;
  if (diffMs < -60_000) {
    return formatCzechDateTime(t);
  }
  const sec = Math.floor(Math.max(0, diffMs) / 1000);
  if (sec < 45) return "právě teď";
  const min = Math.floor(sec / 60);
  if (min < 60) return `před ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return hours === 1 ? "před 1 h" : `před ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return `včera ${formatCzechTime(t)}`;
  if (days < 7) return czechDayPhrase(days);
  return `${formatCzechDate(t, { year: false })} · ${formatCzechTime(t)}`;
}

/** Vezme createdAt z položky; jinak statický time/meta fallback. */
export function formatContentAge(item, now = Date.now()) {
  if (!item) return null;
  const t =
    toTimestamp(item.createdAt) ??
    toTimestamp(item.created_at) ??
    toTimestamp(item.postedAt) ??
    null;
  if (t != null) return formatRelativeTimeCs(t, now);
  const fallback = item.time || item.postedAtLabel || null;
  if (fallback && /před|právě|včera/i.test(String(fallback))) {
    return String(fallback).trim();
  }
  return null;
}

export function minDateInputValue(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function minDateTimeLocalValue(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function eventDateSortValue(startsAtIso) {
  const d = parseDateInput(startsAtIso);
  if (!d) return 999;
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** Akce je minulá, pokud už proběhl začátek (u „čas upřesníme“ až po konci dne). */
export function isEventPast(event, now = new Date()) {
  if (!event?.startsAt) return false;
  const start = new Date(event.startsAt);
  if (Number.isNaN(start.getTime())) return false;
  if (event.timeTbd) {
    const endOfDay = new Date(start);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.getTime() < now.getTime();
  }
  return start.getTime() < now.getTime();
}

/** Spojí lokální datum + čas (HH:mm) bez UTC posunu Safari/iOS. */
export function combineDateAndTime(dateValue, timeValue, timeTbd = false) {
  const parts = parseLocalDateParts(dateValue);
  if (!parts) return null;
  const normalized = timeTbd ? "12:00" : normalizeCzechTime(timeValue) || "12:00";
  if (!normalized) return null;
  const [hour, minute] = normalized.split(":").map(Number);
  const dt = new Date(parts.year, parts.month - 1, parts.day, hour, minute, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

/** Popisek termínu přímo z formuláře (nezávislé na timezone parse). */
export function formatCzechEventScheduleFromParts(dateValue, timeValue, timeTbd = false) {
  const parts = parseLocalDateParts(dateValue);
  if (!parts) return "Termín upřesníme";
  const d = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
  const datePart = formatCzechDate(d, { weekday: true, year: false });
  if (timeTbd) return `${datePart} · ${TIME_TBD_LABEL}`;
  const time = normalizeCzechTime(timeValue);
  if (!time) return `${datePart} · ${TIME_TBD_LABEL}`;
  return `${datePart} · ${time}`;
}

/** @deprecated alias */
export const minEventDateValue = minDateInputValue;
