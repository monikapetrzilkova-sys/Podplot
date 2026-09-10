/**
 * Tipy a feedback na appku — uloží se do Supabase (Table Editor),
 * když tabulka ještě není, otevře se e-mail na tipy@podplot.cz.
 */

import { ensureSupabase } from "../lib/supabaseClient.js";

export const FEEDBACK_TO_EMAIL = "tipy@podplot.cz";
export const FEEDBACK_MAX = 400;
export const FEEDBACK_TITLE = "Pomoz nám vylepšit Podplot";
export const FEEDBACK_BUTTON_LABEL = "Napsat tip";
export const FEEDBACK_HINT =
  "Napiš, co ti chybí, co nefunguje správně, nebo na co jsi narazila. Pokusíme se to vylepšit.";

export const FEEDBACK_KINDS = [
  { id: "tip", label: "Nápad" },
  { id: "vylepseni", label: "Vylepšení" },
  { id: "chyba", label: "Chyba" },
  { id: "jine", label: "Něco jiného" },
];

export function feedbackKindLabel(id) {
  return FEEDBACK_KINDS.find((k) => k.id === id)?.label || "Tip";
}

export function buildFeedbackMailto({ kind, message, user }) {
  const subject = `Podplot: ${feedbackKindLabel(kind)}`;
  const lines = [
    message.trim(),
    "",
    "—",
    user?.name ? `Od: ${user.name}` : "",
    user?.email ? `E-mail: ${user.email}` : "",
    user?.id ? `Účet: ${user.id}` : "",
  ].filter(Boolean);
  const params = new URLSearchParams({
    subject,
    body: lines.join("\n"),
  });
  return `mailto:${FEEDBACK_TO_EMAIL}?${params.toString()}`;
}

export async function submitAppFeedback({ kind, message, user } = {}) {
  const text = String(message ?? "").trim();
  if (text.length < 8) {
    return { ok: false, error: "Napiš aspoň pár vět — ať vím, co zlepšit." };
  }
  const payload = {
    id: `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    user_id: user?.id ?? null,
    user_name: user?.name ?? null,
    user_email: user?.email ?? null,
    kind: FEEDBACK_KINDS.some((k) => k.id === kind) ? kind : "tip",
    message: text.slice(0, FEEDBACK_MAX),
    created_at: new Date().toISOString(),
  };

  try {
    const sb = await ensureSupabase();
    if (sb) {
      const { error } = await sb.from("app_feedback").insert(payload);
      if (!error) return { ok: true, stored: true };
      if (!String(error.message || "").includes("does not exist")) {
        console.warn("[feedback]", error.message);
      }
    }
  } catch {
    /* spadne na e-mail */
  }

  return { ok: true, stored: false, mailto: buildFeedbackMailto({ kind: payload.kind, message: text, user }) };
}
