import { googlePlacesTextSearch } from "../../lib/podplotBackend.mjs";

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const q = String(req.query?.q ?? "").trim();
  const lat = req.query?.lat;
  const lng = req.query?.lng;
  if (q.length < 2) {
    res.status(200).json({ places: [] });
    return;
  }

  try {
    const data = await googlePlacesTextSearch(q, lat, lng);
    res.status(200).json(data);
  } catch (err) {
    res.status(200).json({ places: [], error: err.message });
  }
}
