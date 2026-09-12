export function activePostsLabel(count) {
  const n = Number(count) || 0;
  if (n <= 0) return "Žádný aktivní příspěvek";
  if (n === 1) return "1 aktivní příspěvek";
  if (n >= 2 && n <= 4) return `${n} aktivní příspěvky`;
  return `${n} aktivních příspěvků`;
}

/** Obecné české skloňování počtů pro hlavičky rozbalovacích sekcí. */
export function czechCountLabel(count, { zero, one, few, many }) {
  const n = Number(count) || 0;
  if (n <= 0) return zero;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few.replace("{n}", String(n));
  return many.replace("{n}", String(n));
}

export const profileActivityLabels = {
  trustPending: (n) =>
    czechCountLabel(n, {
      zero: "Nikdo nečeká na potvrzení",
      one: "1 soused čeká na potvrzení",
      few: "{n} sousedé čekají na potvrzení",
      many: "{n} sousedů čeká na potvrzení",
    }),
  groupProposals: (n) =>
    czechCountLabel(n, {
      zero: "Žádný aktivní návrh",
      one: "1 aktivní návrh",
      few: "{n} aktivní návrhy",
      many: "{n} aktivních návrhů",
    }),
  helpOffers: (n) =>
    czechCountLabel(n, {
      zero: "Žádná aktivní nabídka pomoci",
      one: "1 aktivní nabídka pomoci",
      few: "{n} aktivní nabídky pomoci",
      many: "{n} aktivních nabídek pomoci",
    }),
  marketplace: (n) =>
    czechCountLabel(n, {
      zero: "Žádná aktivní nabídka",
      one: "1 aktivní položka",
      few: "{n} aktivní položky",
      many: "{n} aktivních položek",
    }),
  reports: (n) =>
    czechCountLabel(n, {
      zero: "Žádné aktivní hlášení",
      one: "1 aktivní hlášení",
      few: "{n} aktivní hlášení",
      many: "{n} aktivních hlášení",
    }),
  prompts: (n) =>
    czechCountLabel(n, {
      zero: "Žádný aktivní podnět",
      one: "1 aktivní podnět",
      few: "{n} aktivní podněty",
      many: "{n} aktivních podnětů",
    }),
};

