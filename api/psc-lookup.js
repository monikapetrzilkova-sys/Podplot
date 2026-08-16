import { lookupPscCity } from "../lib/podplotBackend.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const psc = String(req.query?.psc ?? "").replace(/\D/g, "");
  if (psc.length !== 5) {
    res.status(400).json({ error: "Neplatné PSČ" });
    return;
  }

  const formatted = `${psc.slice(0, 3)} ${psc.slice(3)}`;
  try {
    const data = await lookupPscCity(psc);
    res.status(200).json(data ?? { city: null, psc: formatted });
  } catch {
    res.status(200).json({ city: null, psc: formatted });
  }
}
