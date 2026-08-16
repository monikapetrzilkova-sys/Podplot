/**
 * Vercel serverless — Maps config pro produkci.
 * Nastavte GOOGLE_MAPS_API_KEY (nebo VITE_GOOGLE_MAPS_API_KEY) v Vercel → Settings → Environment Variables.
 * V Google Cloud přidejte HTTP referrer: https://podplot.vercel.app/*
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
