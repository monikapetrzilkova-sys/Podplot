import { isValidIco, normalizeIco } from "../../lib/aresLookup.mjs";

export { isValidIco, normalizeIco };

export async function lookupCompanyByIco(ico) {
  const digits = String(ico ?? "").replace(/\D/g, "");
  if (digits.length !== 8) {
    return { ok: false, error: "IČO má 8 číslic." };
  }
  try {
    const res = await fetch(`/api/ares-lookup?ico=${encodeURIComponent(digits)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && data.company) return data;
      if (data?.error) return { ok: false, error: data.error };
    }
  } catch {
    /* zkusíme přímo ARES */
  }
  try {
    const { lookupAresCompany } = await import("../../lib/aresLookup.mjs");
    return await lookupAresCompany(digits);
  } catch {
    return { ok: false, error: "IČO se nepodařilo ověřit." };
  }
}
