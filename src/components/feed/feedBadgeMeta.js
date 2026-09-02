/** Metadata štítků ve feedu — doodle ikona + tón (barva jen na ikoně/textu) */

import { resolveGroupName } from "../../data/groups.js";
import {
  DoodleSearchIcon,
  DoodlePawIcon,
  DoodleReportIcon,
  DoodleCraftIcon,
  DoodleBulbIcon,
  DoodleTargetIcon,
  DoodleQuestionIcon,
  DoodleGiveIcon,
  DoodleWantIcon,
  DoodleSellIcon,
  DoodleCartIcon,
  DoodleMegaphoneIcon,
  DoodleHandIcon,
  DoodleGroupsIcon,
  DoodleCalendarIcon,
} from "../doodle/doodleIcons.jsx";

/** 4 hlavní skupiny barev — hlubší tóny (razítka) */
export const FEED_BADGE_TONES = {
  report: "report", // petrolejová — hlášení
  things: "things", // terakota — věci
  events: "events", // vínová — akce
  help: "help", // lahvově zelená — výpomoc
  groups: "groups",
  default: "default",
};

const byClass = {
  "pp-badge--prodam": { tone: "things", Icon: DoodleSellIcon, label: "Prodám" },
  "pp-badge--daruji": { tone: "things", Icon: DoodleGiveIcon, label: "Daruji" },
  "pp-badge--shanim": { tone: "things", Icon: DoodleWantIcon, label: "Sháním" },
  "pp-badge--pujcovna": { tone: "things", Icon: DoodleCartIcon, label: "Půjčovna" },
  "pp-badge--tip": { tone: "report", Icon: DoodleBulbIcon, label: "Tip" },
  "pp-badge--patrani": { tone: "report", Icon: DoodleSearchIcon, label: "Pátrání" },
  "pp-badge--hlaseni": { tone: "report", Icon: DoodleReportIcon, label: "Hlášení" },
  "pp-badge--hledam": { tone: "help", Icon: DoodleHandIcon, label: "Hledám" },
  "pp-badge--nabizim": { tone: "help", Icon: DoodleHandIcon, label: "Nabízím" },
  "pp-badge--vypomoc": { tone: "help", Icon: DoodleHandIcon, label: "Výpomoc" },
  "pp-badge--skupina": { tone: "groups", Icon: DoodleGroupsIcon, label: "Skupina" },
  "pp-badge--akce": { tone: "events", Icon: DoodleMegaphoneIcon, label: "Akce" },
  "pp-badge--default": { tone: "default", Icon: DoodleQuestionIcon, label: null },
};

/** Hlášení podle reportCategoryId */
const byReportCategory = {
  loss: { tone: "report", Icon: DoodleSearchIcon, label: "Ztráta/Nález" },
  animal: { tone: "report", Icon: DoodlePawIcon, label: "Zvíře" },
  warning: { tone: "report", Icon: DoodleReportIcon, label: "Varování" },
  damage: { tone: "report", Icon: DoodleCraftIcon, label: "Závada" },
  tip: { tone: "report", Icon: DoodleBulbIcon, label: "Tip" },
  vyzvy: { tone: "report", Icon: DoodleTargetIcon, label: "Výzva" },
  default: { tone: "report", Icon: DoodleQuestionIcon, label: "Hlášení" },
};

function fromTypeString(type) {
  const t = String(type ?? "").toLowerCase();
  if (t.includes("prodám") || t === "prodam") return byClass["pp-badge--prodam"];
  if (t.includes("půjčovna") || t === "pujcovna") return byClass["pp-badge--pujcovna"];
  if (t.includes("daruji") || t === "daruji") return byClass["pp-badge--daruji"];
  if (t.includes("sháním") || t === "shanim") return byClass["pp-badge--shanim"];
  if (t === "tip" || t.includes("tip:")) return byClass["pp-badge--tip"];
  if (t.includes("pátrání") || t.includes("patrani") || t.includes("zaběhl") || t.includes("ztrát")) {
    return byClass["pp-badge--patrani"];
  }
  if (t.includes("varování") || t.includes("varovani")) return byReportCategory.warning;
  if (t.includes("závada") || t.includes("zavada") || t.includes("nehoda")) return byReportCategory.damage;
  if (t.includes("zvíř") || t.includes("zvir") || t.includes("pes") || t.includes("koč")) {
    return byReportCategory.animal;
  }
  if (t.includes("výzv") || t.includes("vyzv")) return byReportCategory.vyzvy;
  if (t.includes("hlášení") || t.includes("hlaseni") || t.includes("aktualit")) {
    return byClass["pp-badge--hlaseni"];
  }
  if (t.includes("akce") || t.includes("událost") || t.includes("udalost")) return byClass["pp-badge--akce"];
  if (t.includes("výpomoc") || t.includes("vypomoc") || t.includes("pomoc")) return byClass["pp-badge--vypomoc"];
  if (t.includes("skupin")) return byClass["pp-badge--skupina"];
  return null;
}

/**
 * @param {{ badge?: string, badgeClassName?: string, reportCategoryId?: string, type?: string }} opts
 * @returns {{ label: string, tone: string, Icon: function }}
 */
export function resolveFeedBadgeMeta({
  badge,
  badgeClassName = "",
  reportCategoryId = null,
  type = null,
} = {}) {
  if (reportCategoryId && byReportCategory[reportCategoryId]) {
    const m = byReportCategory[reportCategoryId];
    return { label: badge || m.label, tone: m.tone, Icon: m.Icon };
  }

  const fromClass = badgeClassName ? byClass[badgeClassName.trim()] : null;
  if (fromClass) {
    return {
      label: badge || fromClass.label || "Příspěvek",
      tone: fromClass.tone,
      Icon: fromClass.Icon,
    };
  }

  const fromType = fromTypeString(type || badge);
  if (fromType) {
    return {
      label: badge || fromType.label || "Příspěvek",
      tone: fromType.tone,
      Icon: fromType.Icon,
    };
  }

  return {
    label: badge || "Příspěvek",
    tone: "default",
    Icon: DoodleQuestionIcon,
  };
}

/** Legacy API — label + className (+ tone/Icon pro nové pilulky) */
export function getListingBadge(type, { reportCategoryId } = {}) {
  if (reportCategoryId && byReportCategory[reportCategoryId]) {
    const m = byReportCategory[reportCategoryId];
    const className =
      reportCategoryId === "tip"
        ? "pp-badge--tip"
        : reportCategoryId === "loss" || reportCategoryId === "animal"
          ? "pp-badge--patrani"
          : "pp-badge--hlaseni";
    return { label: m.label, className, tone: m.tone, Icon: m.Icon };
  }

  const t = (type ?? "").toLowerCase();
  if (t.includes("prodám") || t === "prodam") {
    return { label: "Prodám", className: "pp-badge--prodam", tone: "things", Icon: DoodleSellIcon };
  }
  if (t.includes("půjčovna") || t === "pujcovna") {
    return { label: "Půjčovna", className: "pp-badge--pujcovna", tone: "things", Icon: DoodleCartIcon };
  }
  if (t.includes("daruji") || t === "daruji") {
    return { label: "Daruji", className: "pp-badge--daruji", tone: "things", Icon: DoodleGiveIcon };
  }
  if (t.includes("sháním") || t === "shanim") {
    return { label: "Sháním", className: "pp-badge--shanim", tone: "things", Icon: DoodleWantIcon };
  }
  if (t === "tip" || t.includes("tip:")) {
    return { label: "Tip", className: "pp-badge--tip", tone: "report", Icon: DoodleBulbIcon };
  }
  if (t.includes("pátrání") || t.includes("pátrani") || t.includes("zaběhl") || t.includes("ztrát")) {
    return { label: "Pátrání", className: "pp-badge--patrani", tone: "report", Icon: DoodleSearchIcon };
  }
  if (t.includes("hlášení") || t.includes("hlaseni")) {
    return { label: "Hlášení", className: "pp-badge--hlaseni", tone: "report", Icon: DoodleReportIcon };
  }
  return {
    label: type ? String(type) : "Příspěvek",
    className: "pp-badge--default",
    tone: "default",
    Icon: DoodleQuestionIcon,
  };
}

export function getGroupPostBadge(post, communityGroups = []) {
  const name = resolveGroupName(post, communityGroups);
  return { label: name, className: "pp-badge--skupina", tone: "groups", Icon: DoodleGroupsIcon };
}

export function getNeighborSectionBadge(section, helpType = null) {
  if (section === "vypomoc") {
    if (helpType === "hledam") {
      return { label: "Hledám", className: "pp-badge--hledam", tone: "help", Icon: DoodleHandIcon };
    }
    if (helpType === "nabizim") {
      return { label: "Nabízím", className: "pp-badge--nabizim", tone: "help", Icon: DoodleHandIcon };
    }
    return { label: "Výpomoc", className: "pp-badge--vypomoc", tone: "help", Icon: DoodleHandIcon };
  }
  if (section === "skupiny") {
    return { label: "Skupina", className: "pp-badge--skupina", tone: "groups", Icon: DoodleGroupsIcon };
  }
  if (section === "akce") {
    return { label: "Akce", className: "pp-badge--akce", tone: "events", Icon: DoodleMegaphoneIcon };
  }
  return { label: "Sousedé", className: "pp-badge--default", tone: "default", Icon: DoodleCalendarIcon };
}
