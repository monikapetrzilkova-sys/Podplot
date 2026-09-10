/**
 * Vercel serverless — Maps config pro produkci.
 *
 * Dva klíče v Google Cloud Console:
 * - GOOGLE_MAPS_API_KEY / VITE_GOOGLE_MAPS_API_KEY
 *   Maps JavaScript API, HTTP referrers: https://podplot.vercel.app/* a localhost:5173/*
 * - GOOGLE_MAPS_SERVER_API_KEY
 *   Places API, bez HTTP referrer omezení (serverový klíč).
 *
 * „Oops! Something went wrong.“ = špatný referrer, vypnuté API, nebo billing.
 */
export default function handler(req, res) {
  const key = (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    ""
  ).trim();

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    enabled: Boolean(key),
    apiKey: key || null,
    source: key ? "env" : "mock-fallback",
    mockPlaces: !key,
  });
}
