import {
  lookupMunicipalityOfficesByPsc,
  lookupMunicipalityOfficeByIco,
} from "../lib/municipalityLookup.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const ico = String(req.query?.ico ?? "").replace(/\D/g, "");
  if (ico.length === 8) {
    try {
      const office = await lookupMunicipalityOfficeByIco(ico);
      res.status(200).json({ ok: Boolean(office), offices: office ? [office] : [] });
    } catch (err) {
      res.status(500).json({ ok: false, offices: [], error: err.message || "Lookup failed" });
    }
    return;
  }

  const psc = String(req.query?.psc ?? "").replace(/\D/g, "");
  if (psc.length !== 5) {
    res.status(400).json({ ok: false, offices: [], error: "Zadej pětimístné PSČ." });
    return;
  }

  try {
    const data = await lookupMunicipalityOfficesByPsc(psc);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, offices: [], error: err.message || "Lookup failed" });
  }
}
