import { lookupOfficialMunicipalityDomain } from "../lib/municipalityLookup.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const data = await lookupOfficialMunicipalityDomain({
      website: req.query?.website,
      city: req.query?.city,
      psc: req.query?.psc,
      name: req.query?.name,
      ico: req.query?.ico,
    });
    res.status(data.ok ? 200 : 404).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, domain: null, error: err.message || "Lookup failed" });
  }
}
