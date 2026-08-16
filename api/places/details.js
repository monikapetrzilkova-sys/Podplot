import { googlePlaceDetails } from "../../lib/podplotBackend.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const placeId = String(req.query?.placeId ?? "").trim();
  if (!placeId) {
    res.status(400).json({ error: "Chybí placeId" });
    return;
  }

  try {
    const data = await googlePlaceDetails(placeId);
    res.status(200).json(data ?? { error: "Místo nenalezeno" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Place details failed" });
  }
}
