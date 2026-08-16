/**
 * Vercel serverless — Supabase config pro prohlížeč.
 * Nastavte VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (nebo SUPABASE_URL + SUPABASE_ANON_KEY).
 */
export default function handler(req, res) {
  const url = (
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).trim();
  const anonKey = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  ).trim();

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    enabled: Boolean(url && anonKey),
    url: url || null,
    anonKey: anonKey || null,
    source: url && anonKey ? "env" : "offline",
  });
}
