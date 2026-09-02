/** Texty sítě důvěry — potvrzení sousedů není přátelství ani odmítnutí. */

const GENERIC_LOCALITY =
  /^(ve\s+(tvé|vaší|vaši)\s+lokalitě|ve\s+stejném\s+okolí|ve\s+tvé\s+lokalite)$/i;

export function isGenericLocalityHint(value) {
  return GENERIC_LOCALITY.test(String(value ?? "").trim());
}

/** Stejný popisek lokality u každého v seznamu potvrzení — ne jen u některých jmen. */
export function neighborLocalityCaption(neighbor, activeLocation) {
  const distance = String(neighbor?.distance ?? "").trim();
  if (distance && !isGenericLocalityHint(distance)) return distance;

  const loc = String(neighbor?.location ?? "").trim();
  if (loc && !isGenericLocalityHint(loc)) return loc;

  const mun = String(
    neighbor?.municipality || activeLocation?.shortLabel || activeLocation?.municipality || ""
  ).trim();
  if (mun) return mun;

  return "Ve stejném okolí";
}

export function trustPendingCountLabel(count) {
  const n = Number(count) || 0;
  if (n === 1) return "1 nový člověk v lokalitě";
  if (n >= 2 && n <= 4) return `${n} noví lidé v lokalitě`;
  return `${n} nových lidí v lokalitě`;
}

export const TRUST_COPY = {
  sectionTitle: "Potvrzení sousedů",
  sectionHint:
    "Pomoz nám udržet Podplot bezpečný. Potvrď sousedy, které znáš z okolí — nejde o klasické přátelství na sítích.",

  homeTitle: "Potvrzení sousedů",
  homeCollapsedHint: (countLabel) => `${countLabel} · nejde o klasické přátelství na sítích`,
  homeIntro:
    "Pomoz nám udržet Podplot bezpečný. Potvrď sousedy, které znáš z okolí — nejde o klasické přátelství na sítích.",
  hideOnHome: "Skrýt na Domů",

  cardEyebrow: "Nový člověk v lokalitě",
  cardHint: "Poznáváš ho z okolí? Pokud ne, jen přeskoč — nedozví se to.",
  confirmAction: "Znám z okolí",
  skipAction: "Zatím neznám",

  pendingTitle: (countLabel) => countLabel,
  pendingHint: "Potvrď jen ty, které znáš. Ostatní přeskoč — není to odmítnutí.",

  profileEmpty:
    "Teď tu nikdo nový nečeká. Až se v lokalitě objeví nový člověk, uvidíš ho tady. Potvrď ho jen pokud ho znáš z okolí — jinak stačí přeskočit.",

  settingsTitle: "Noví lidé v lokalitě na Domů",
  settingsHint:
    "Pomoz nám udržet Podplot bezpečný. Potvrď sousedy, které znáš z okolí — nejde o klasické přátelství na sítích.",

  verifiedHint: "Ověřený soused — ostatní ti snáz důvěřují.",
  unverifiedHint:
    "Když tě 3 lidé z okolí potvrdí, že tě znají, ostatní ti snáz důvěřují. Není to počet přátel.",
  verifiersTitle: "Kdo potvrdil, že mě zná",
  verifiersEmpty: "Zatím tě nikdo z okolí nepotvrdil. Do ověření zbývají 3 potvrzení — nejde o přátele.",
  verifiersDone: "Komunitou ověřený soused (alespoň 3 lidi z okolí potvrdili, že tě znají).",
  verifiersRemaining: (left) => `Do ověření zbývá ${left}. Není to počet přátel.`,

  toastConfirmed: "Hotovo. Říkáš tím, že ho znáš z okolí — ne že jste teď přátelé.",
  toastSkipped: "V pořádku. Jen ho přeskočíš — nedozví se to a není to odmítnutí.",
  toastAlready: "Tohoto člověka už jsi potvrdil/a.",
  toastSelf: "Sama sebe potvrdit nemůžeš.",
  toastHomeHidden: "Karty na Domů jsou skryté. Zapneš je znovu v profilu.",
  toastHomeShown: "Karty na Domů jsou znovu zapnuté.",

  notifNewTitle: (first) => `Nový člověk v lokalitě: ${first}`,
  notifNewBody:
    "Pokud ho znáš z okolí, potvrď to na Domů. Pokud ne, stačí přeskočit — nedozví se to.",
  toastNewNeighbor: (first) =>
    `${first} je ve tvé lokalitě. Když ho znáš z okolí, potvrď to na Domů — jinak stačí přeskočit.`,

  notifReceivedTitle: (first) => `${first} potvrdil/a, že tě zná`,
  notifReceivedBody: "Někdo z okolí potvrdil, že tě zná. Podívej se v profilu — nejde o přátelství.",
  toastReceived: (first) => `${first} potvrdil/a, že tě zná z okolí.`,
};
