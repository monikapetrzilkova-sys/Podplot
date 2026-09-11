import { resolveGooglePlacePhotoUrl } from "../../lib/podplotBackend.mjs";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ref = String(req.query?.ref ?? "").trim();
  const maxwidth = Number(req.query?.maxwidth) || 800;
  if (!ref || ref.length > 2048) {
    res.status(400).json({ error: "Chybí photo reference" });
    return;
  }

  try {
    const location = await resolveGooglePlacePhotoUrl(ref, maxwidth);
    if (!location) {
      res.status(404).json({ error: "Fotka nenalezena" });
      return;
    }
    res.redirect(302, location);
  } catch (err) {
    res.status(500).json({ error: err.message || "Place photo failed" });
  }
}
