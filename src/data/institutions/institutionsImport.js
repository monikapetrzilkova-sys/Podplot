import {
  isEligibleMunicipalityOfficeName,
  normalizeEmailDomain,
} from "./institutionTypes.js";
import { INSTITUTIONS_SEED } from "./registrySeed.js";

/**
 * Parsuje CSV (UTF-8, čárka) do řádků pro staging / mergeInstitutionsImport.
 * Očekávané sloupce: name,ico,psc,seat_city,seat_address,allowed_email_domain,kind,region
 */
export function parseInstitutionsCsv(csvText) {
  const lines = String(csvText ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { rows: [], errors: ["CSV je prázdné nebo chybí hlavička."] };

  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const required = ["name", "psc", "seat_city", "allowed_email_domain"];
  const missing = required.filter((k) => !header.includes(k));
  if (missing.length) {
    return { rows: [], errors: [`Chybí sloupce: ${missing.join(", ")}`] };
  }

  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (key) => {
      const idx = header.indexOf(key);
      return idx >= 0 ? (cols[idx] ?? "").trim() : "";
    };
    const name = get("name");
    const psc = get("psc").replace(/\D/g, "");
    const seatCity = get("seat_city");
    const domain = normalizeEmailDomain(get("allowed_email_domain"));

    if (!isEligibleMunicipalityOfficeName(name)) {
      errors.push(`Řádek ${i + 1}: vyloučeno („${name}“) — není obecní/městský úřad.`);
      continue;
    }
    if (psc.length !== 5 || !seatCity || !domain) {
      errors.push(`Řádek ${i + 1}: neplatné PSČ, sídlo nebo doména.`);
      continue;
    }

    rows.push({
      name,
      ico: get("ico") || null,
      psc,
      seatCity,
      seatAddress: get("seat_address") || null,
      allowedEmailDomain: domain,
      kind: normalizeKind(get("kind")),
      region: get("region") || null,
      sourceRow: i + 1,
    });
  }

  return { rows, errors };
}

function normalizeKind(raw) {
  const k = String(raw ?? "").toLowerCase();
  if (k.includes("magistr")) return "magistrat";
  if (k.includes("mest") || k.includes("měst")) return "mestsky_urad";
  return "obecni_urad";
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/**
 * Merge importovaných řádků do lokálního pole (dedupe dle IČO nebo name+psc).
 * Pro Supabase použijte SQL funkci merge_institutions_from_staging().
 */
export function mergeInstitutionsImport(existing, importRows) {
  const next = [...existing];
  let added = 0;

  for (const row of importRows) {
    if (!isEligibleMunicipalityOfficeName(row.name)) continue;
    const dup = next.find(
      (x) =>
        (row.ico && x.ico && x.ico === row.ico) ||
        (x.name.toLowerCase() === row.name.toLowerCase() && x.psc === row.psc)
    );
    if (dup) continue;
    next.push({
      id: `inst-import-${row.psc}-${added}-${Date.now().toString(36)}`,
      name: row.name,
      ico: row.ico,
      psc: row.psc,
      seatCity: row.seatCity,
      seatAddress: row.seatAddress,
      allowedEmailDomain: row.allowedEmailDomain,
      kind: row.kind,
      region: row.region,
      isActive: true,
      eligibleForRegistration: true,
    });
    added += 1;
  }

  return { institutions: next, added };
}

export function getImportTemplateCsv() {
  const sample = INSTITUTIONS_SEED.slice(0, 2)
    .map((i) =>
      [
        quote(i.name),
        i.ico ?? "",
        i.psc,
        quote(i.seatCity),
        quote(i.seatAddress ?? ""),
        i.allowedEmailDomain,
        i.kind,
        i.region ?? "",
      ].join(",")
    )
    .join("\n");
  return `name,ico,psc,seat_city,seat_address,allowed_email_domain,kind,region\n${sample}\n`;
}

function quote(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
