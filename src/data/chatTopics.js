/** Kontext konverzace — sekce podle inzerátu / hlášení / výpomoci atd. */

const KIND_LABELS = {
  listing: "Inzerát",
  report: "Hlášení",
  help: "Výpomoc",
  lending: "Půjčovna",
  event: "Akce",
  prompt: "Podnět",
  inquiry: "Poptávka",
  service: "Služba",
  place: "Místo",
  general: "Obecná konverzace",
};

export function chatTopicKindLabel(kind) {
  return KIND_LABELS[kind] || "Téma";
}

export function normalizeChatTopic(input) {
  if (!input || typeof input !== "object") return null;
  const kind = String(input.kind || input.topicKind || "general").trim() || "general";
  const refId = String(input.refId || input.topicId || input.id || "").trim();
  const title = String(input.title || input.topicTitle || "").trim();
  const label = String(input.label || input.topicLabel || chatTopicKindLabel(kind)).trim();

  if (kind === "general" && !refId && !title) {
    return { kind: "general", refId: "", title: "", label: KIND_LABELS.general };
  }

  return {
    kind,
    refId,
    title,
    label: label || chatTopicKindLabel(kind),
  };
}

export function topicSectionKey(topic) {
  const t = normalizeChatTopic(topic);
  if (!t || t.kind === "general" || (!t.refId && !t.title)) return "general";
  return `${t.kind}:${t.refId || t.title}`;
}

export function formatTopicHeading(topic) {
  const t = normalizeChatTopic(topic) || {
    kind: "general",
    title: "",
    label: KIND_LABELS.general,
  };
  if (t.kind === "general" || (!t.refId && !t.title)) return KIND_LABELS.general;
  const label = t.label || chatTopicKindLabel(t.kind);
  return t.title ? `${label} · ${t.title}` : label;
}

/** Odhadne téma ze stávajícího message.meta (i starší zprávy). */
export function topicFromMessageMeta(meta) {
  if (!meta || typeof meta !== "object") return null;
  if (meta.topic) return normalizeChatTopic(meta.topic);
  if (meta.kind === "interest") {
    return normalizeChatTopic({
      kind: "inquiry",
      refId: meta.inquiryId,
      title: meta.inquiryTitle,
      label: "Poptávka",
    });
  }
  if (meta.kind === "office_prompt_status" || meta.kind === "office_prompt_reply") {
    return normalizeChatTopic({
      kind: "prompt",
      refId: meta.promptId,
      title: meta.promptTitle || meta.title,
      label: "Podnět",
    });
  }
  if (meta.kind && meta.kind !== "general") {
    return normalizeChatTopic({
      kind: meta.kind,
      refId: meta.refId || meta.postId || meta.reportId || meta.helpId || meta.listingId,
      title: meta.title || meta.postTitle || meta.reportTitle,
      label: meta.label,
    });
  }
  return null;
}

export function topicToMessageMeta(topic, extra = null) {
  const t = normalizeChatTopic(topic);
  if (!t || t.kind === "general") {
    return extra && Object.keys(extra).length ? { ...extra } : null;
  }
  return {
    ...(extra && typeof extra === "object" ? extra : null),
    kind: t.kind,
    refId: t.refId || null,
    title: t.title || null,
    label: t.label,
    topic: t,
  };
}

/**
 * Seskupí zprávy do vláken podle tématu.
 * `ensureTopic` — vždy zahrnout (nové vlákno z inzerátu ještě bez historie).
 * Pořadí: nejnovější aktivita nahoře.
 */
export function groupMessagesByTopic(messages = [], { ensureTopic = null } = {}) {
  const sections = [];
  const indexByKey = new Map();

  const pushTopic = (topic, seedMessages = []) => {
    const normalized = normalizeChatTopic(topic) || {
      kind: "general",
      refId: "",
      title: "",
      label: KIND_LABELS.general,
    };
    const key = topicSectionKey(normalized);
    let section = indexByKey.get(key);
    if (!section) {
      section = { key, topic: normalized, messages: [] };
      indexByKey.set(key, section);
      sections.push(section);
    }
    seedMessages.forEach((m) => section.messages.push(m));
    return section;
  };

  messages.forEach((m) => {
    const topic = topicFromMessageMeta(m?.meta) || {
      kind: "general",
      refId: "",
      title: "",
      label: KIND_LABELS.general,
    };
    pushTopic(topic, [m]);
  });

  if (ensureTopic) {
    pushTopic(ensureTopic);
  }

  // Obecná konverzace vždy dostupná jako volba
  if (!indexByKey.has("general")) {
    pushTopic({ kind: "general", refId: "", title: "", label: KIND_LABELS.general });
  }

  const lastActivity = (section) => {
    const last = section.messages[section.messages.length - 1];
    if (!last) return 0;
    if (last.createdAt) {
      const t = Date.parse(last.createdAt);
      if (!Number.isNaN(t)) return t;
    }
    return section.messages.length;
  };

  sections.sort((a, b) => {
    // prázdné ensure topic (právě otevřené) nahoru, pokud je to ensureTopic
    const ensureKey = ensureTopic ? topicSectionKey(ensureTopic) : null;
    if (ensureKey) {
      if (a.key === ensureKey && a.messages.length === 0) return -1;
      if (b.key === ensureKey && b.messages.length === 0) return 1;
    }
    return lastActivity(b) - lastActivity(a);
  });

  return sections;
}

export function topicPreviewText(section) {
  const last = section?.messages?.[section.messages.length - 1];
  if (!last?.text) return "Zatím bez zpráv — napište první";
  const text = String(last.text).replace(/\s+/g, " ").trim();
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

export function topicLastTime(section) {
  const last = section?.messages?.[section.messages.length - 1];
  return last?.time || "";
}

/** Téma z inzerátu / feed postu */
export function topicFromPost(post) {
  if (!post?.id) return null;
  const subtype = String(post.feedSubtype || post.categoryId || "").toLowerCase();
  const type = String(post.type || "").toLowerCase();
  const isReport =
    Boolean(post.fromSecurityReportId) ||
    subtype === "hlaseni" ||
    type.includes("hlášení") ||
    type.includes("hlaseni") ||
    type.includes("pátrání") ||
    type.includes("tip");
  if (isReport) {
    return normalizeChatTopic({
      kind: "report",
      refId: post.fromSecurityReportId || post.id,
      title: post.title,
      label: type.includes("tip") ? "Tip" : type.includes("pátr") ? "Pátrání" : "Hlášení",
    });
  }
  return normalizeChatTopic({
    kind: "listing",
    refId: post.id,
    title: post.title,
    label: post.type || "Inzerát",
  });
}

export function topicFromHelp(help) {
  if (!help) return null;
  return normalizeChatTopic({
    kind: "help",
    refId: help.helpId || help.id,
    title: help.title,
    label: help.helpType === "nabizim" || help.type === "nabizim" ? "Nabízím" : "Výpomoc",
  });
}

export function topicFromLending(item) {
  if (!item) return null;
  return normalizeChatTopic({
    kind: "lending",
    refId: item.id,
    title: item.item || item.title || item.itemTypeLabel,
    label: "Půjčovna",
  });
}
