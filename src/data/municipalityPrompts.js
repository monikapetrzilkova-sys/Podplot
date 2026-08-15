/** Podněty sousedů → obecní úřad a výzvy úřadu k podání podnětů */

export const PROMPT_STATUS = {
  new: { id: "new", label: "Nový podnět" },
  progress: { id: "progress", label: "V řešení" },
  done: { id: "done", label: "Vyřešeno" },
  /** Úřad neřeší — pryč z aktivní agendy, občan dostane zprávu */
  declined: { id: "declined", label: "Neřešíme" },
};

export const PROMPT_STATUS_AUTO_MESSAGE = {
  progress: (title) =>
    `Úřad přijal váš podnět „${title}" a začal ho řešit. O průběhu vás budeme informovat.`,
  done: (title) => `Úřad označil podnět „${title}" jako vyřešený. Děkujeme za nahlášení.`,
};

export const INITIAL_PROMPT_CALLS = [
  {
    id: "pc1",
    title: "Navrhněte úpravy parku Na Louce",
    body: "Připravujeme revitalizaci — napište, co byste v parku uvítali (lavičky, osvětlení, pískoviště).",
    deadline: "30. 7. 2026",
    author: "Městský úřad Jesenice",
    active: true,
    createdAt: "před 2 dny",
  },
  {
    id: "pc2",
    title: "Pojďme uklidit dětské hřiště u školy",
    body: "Zveme sousedy na společný úklid v sobotu od 9:00. Nářadí zajistí obec, přineste si rukavice.",
    deadline: "16. 8. 2026",
    author: "Městský úřad Jesenice",
    active: true,
    createdAt: "před 1 dnem",
  },
];

export const INITIAL_MUNICIPALITY_PROMPTS = [
  {
    id: "mp1",
    title: "Výmol na chodníku — Na Louce",
    body: "Hluboký výmol u přechodu pro chodce.",
    status: "new",
    statusLabel: PROMPT_STATUS.new.label,
    authorId: "petr",
    authorName: "Petr Svoboda",
    time: "před 3 dny",
    callId: null,
    mapPos: { x: 42, y: 55 },
    distance: "120 m",
    fromReportId: "r-prompt-mp1",
  },
  {
    id: "mp2",
    title: "Nefunkční lampa ve parku",
    body: "Osvětlení u laviček nefunguje 3 dny.",
    status: "progress",
    statusLabel: PROMPT_STATUS.progress.label,
    authorId: "jana",
    authorName: "Jana Horáková",
    time: "před 5 dny",
    callId: null,
    mapPos: { x: 55, y: 48 },
    distance: "280 m",
    fromReportId: "r-prompt-mp2",
  },
  {
    id: "mp3",
    title: "Více laviček u pískoviště",
    body: "Uvítali bychom dvě lavičky s opěrkami pro rodiče.",
    status: "new",
    statusLabel: PROMPT_STATUS.new.label,
    authorId: "martin",
    authorName: "Martin Černý",
    time: "před 1 dnem",
    callId: "pc1",
    callTitle: "Navrhněte úpravy parku Na Louce",
    mapPos: null,
    distance: null,
    fromReportId: null,
  },
];

export function getPromptStatusLabel(status) {
  return PROMPT_STATUS[status]?.label ?? status;
}

export function getPromptStatusStyle(status) {
  if (status === "done") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "progress") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "declined") return "bg-stone-100 text-stone-600 border-stone-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
}

/** Aktivní položky v Agendě úřadu (ne vyřešené / neodmítnuté / vlastní návrhy) */
export function isActiveOfficePrompt(p) {
  return p && !p.fromOffice && p.status !== "done" && p.status !== "declined";
}
