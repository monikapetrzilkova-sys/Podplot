import { proxyAddressSearch } from "../lib/podplotBackend.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const q = String(req.query?.q ?? "").trim();
  if (q.length < 3) {
    res.status(200).json({ source: "empty", features: [], items: [] });
    return;
  }

  try {
    const data = await proxyAddressSearch(q);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Address search failed" });
  }
}
