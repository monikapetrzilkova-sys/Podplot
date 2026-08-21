import { googlePlacesNearby, mockNearbyPlaces } from "../../lib/podplotBackend.mjs";

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const lat = req.query?.lat;
  const lng = req.query?.lng;
  const radius = Math.min(15000, Math.max(200, Number(req.query?.radius) || 5000));
  const type = String(req.query?.type ?? "");
  const category = String(req.query?.category ?? "vse");

  if (!lat || !lng) {
    res.status(400).json({ error: "Chybí souřadnice" });
    return;
  }

  try {
    const data = await googlePlacesNearby(lat, lng, radius, { type, category });
    res.status(200).json(data);
  } catch (err) {
    res.status(200).json({
      places: mockNearbyPlaces(lat, lng),
      source: "mock",
      error: err.message,
    });
  }
}
