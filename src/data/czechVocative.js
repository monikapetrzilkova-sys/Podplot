/**
 * Český vokativ (5. pád) křestního jména kvůli oslovení („Ahoj Moniko“).
 * Konzervativní: jisté tvary ze slovníku a pravidlo -a → -o, jinak 1. pád.
 */

const TITLE_PREFIX =
  /^(ing|mgr|bc|bcA|phdr|mudr|judr|rndr|mvdr|mdbc|prof|doc|arch|paeddr|thdr|rsdr)\.?$/i;

/** Běžná mužská jména na souhlásku → vokativ (malými písmeny). */
const MALE_VOCATIVE = {
  petr: "petře",
  pavel: "pavle",
  karel: "karle",
  tomáš: "tomáši",
  marek: "marku",
  jakub: "jakube",
  david: "davide",
  martin: "martine",
  jan: "jane",
  ondřej: "ondřeji",
  filip: "filipe",
  adam: "adame",
  dominik: "dominiku",
  lukáš: "lukáši",
  michal: "michale",
  daniel: "danieli",
  matěj: "matěji",
  vojtěch: "vojtěchu",
  štěpán: "štěpáne",
  radek: "radku",
  vašek: "vašku",
  mírek: "mírku",
  zdeněk: "zdeňku",
  josef: "josefe",
  jaroslav: "jaroslave",
  miroslav: "miroslave",
  jaromír: "jaromíre",
  milan: "milane",
  roman: "romane",
  robert: "roberte",
  patrik: "patriku",
  václav: "václave",
  antonín: "antoníne",
  františek: "františku",
  ladislav: "ladislave",
  vladimír: "vladimíre",
  aleš: "aleši",
  libor: "libore",
  oldřich: "oldřichu",
  kamil: "kamile",
  richard: "richarde",
  viktor: "viktore",
  šimon: "šimone",
  kryštof: "kryštofe",
  otakar: "otakare",
  igor: "igore",
  ivan: "ivane",
  luboš: "luboši",
  miloš: "miloši",
  radim: "radime",
  bohuslav: "bohuslave",
  přemysl: "přemysle",
  denis: "denisi",
  marcel: "marceli",
  emil: "emile",
  vít: "víte",
  tobiáš: "tobiáši",
  sebastian: "sebastiane",
  radovan: "radovane",
  hynek: "hynku",
  luděk: "luďku",
  tadeáš: "tadeáši",
  matouš: "matouši",
  jindřich: "jindřichu",
  bedřich: "bedřichu",
  erik: "eriku",
  tom: "tome",
  vítek: "vítku",
  darek: "darku",
  jarek: "jarku",
  lubomír: "lubomíre",
  stanislav: "stanislave",
  rostislav: "rostislave",
  ctibor: "ctibore",
};

function titleCaseCs(word) {
  if (!word) return "";
  return word.charAt(0).toLocaleUpperCase("cs") + word.slice(1).toLocaleLowerCase("cs");
}

function firstGivenName(name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const given = parts.find((part) => !TITLE_PREFIX.test(part.replace(/\.$/, ""))) ?? parts[0];
  return given ?? "";
}

function vocativeOneWord(word) {
  if (!word) return "";
  if (word.includes("-")) {
    return word.split("-").map(vocativeOneWord).join("-");
  }
  const lower = word.toLocaleLowerCase("cs");
  if (lower.length < 2 || /\d/.test(lower)) return titleCaseCs(lower);

  const fromDict = MALE_VOCATIVE[lower];
  if (fromDict) return titleCaseCs(fromDict);

  if (lower.endsWith("a")) {
    return titleCaseCs(`${lower.slice(0, -1)}o`);
  }

  return titleCaseCs(lower);
}

/** 5. pád křestního jména. Neznámé tvary nechá v 1. pádě. */
export function czechVocativeFirstName(name) {
  return vocativeOneWord(firstGivenName(name));
}

/** Oslovení do pozdravu; prázdné jméno → fallback (už ve 5. pádě). */
export function greetingFirstName(name, fallback = "sousede") {
  return czechVocativeFirstName(name) || fallback;
}
