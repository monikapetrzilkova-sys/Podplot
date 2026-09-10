import { lookupAresCompany } from "../lib/aresLookup.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const data = await lookupAresCompany(req.query?.ico);
    res.status(data.ok ? 200 : 400).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || "ARES lookup failed" });
  }
}
