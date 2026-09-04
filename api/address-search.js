import { handleAddressSearch } from "../lib/podplotBackend.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const data = await handleAddressSearch({
      street: req.query?.street,
      city: req.query?.city,
      psc: req.query?.psc,
      houseNumber: req.query?.houseNumber,
      q: req.query?.q,
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Address search failed" });
  }
}
