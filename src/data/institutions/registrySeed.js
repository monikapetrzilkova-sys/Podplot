/**
 * Seed číselníku obecních / městských úřadů pro lokální běh a demo import.
 * V produkci se načítá z Supabase (`institutions`). Žádná obec není „natvrdo“
 * v UI — vždy přes ID z tohoto zdroje / DB.
 *
 * Formát řádku odpovídá CSV importu (viz institutionsImport.js).
 */

/** @typedef {{
 *   id: string,
 *   name: string,
 *   ico: string | null,
 *   psc: string,
 *   seatCity: string,
 *   seatAddress: string | null,
 *   allowedEmailDomain: string,
 *   kind: 'obecni_urad' | 'mestsky_urad' | 'magistrat',
 *   region?: string | null,
 *   isActive?: boolean,
 *   eligibleForRegistration?: boolean,
 * }} InstitutionRecord
 */

/** @type {InstitutionRecord[]} */
export const INSTITUTIONS_SEED = [
  {
    id: "inst-jesenice",
    name: "Městský úřad Jesenice",
    ico: "00241301",
    psc: "25242",
    seatCity: "Jesenice",
    seatAddress: "Budějovická 97, 252 42 Jesenice",
    allowedEmailDomain: "jesenice.cz",
    kind: "mestsky_urad",
    region: "Středočeský",
  },
  {
    id: "inst-prichovice",
    name: "Obecní úřad Průhonice",
    ico: "00241522",
    psc: "25243",
    seatCity: "Průhonice",
    seatAddress: "Květnové náměstí 54, 252 43 Průhonice",
    allowedEmailDomain: "pruhonice-obec.cz",
    kind: "obecni_urad",
    region: "Středočeský",
  },
  {
    id: "inst-vestec",
    name: "Obecní úřad Vestec",
    ico: "00241611",
    psc: "25242",
    seatCity: "Vestec",
    seatAddress: "Vestecká 3, 252 42 Vestec",
    allowedEmailDomain: "vestec.cz",
    kind: "obecni_urad",
    region: "Středočeský",
  },
  {
    id: "inst-dolni-brezany",
    name: "Obecní úřad Dolní Břežany",
    ico: "00241328",
    psc: "25241",
    seatCity: "Dolní Břežany",
    seatAddress: "5. května 78, 252 41 Dolní Břežany",
    allowedEmailDomain: "dolnibrezany.cz",
    kind: "obecni_urad",
    region: "Středočeský",
  },
  {
    id: "inst-brno",
    name: "Magistrát města Brna",
    ico: "44992785",
    psc: "60167",
    seatCity: "Brno",
    seatAddress: "Dominikánské náměstí 1, 601 67 Brno",
    allowedEmailDomain: "brno.cz",
    kind: "magistrat",
    region: "Jihomoravský",
  },
  {
    id: "inst-ostrava",
    name: "Magistrát města Ostravy",
    ico: "00845451",
    psc: "72930",
    seatCity: "Ostrava",
    seatAddress: "Prokešovo náměstí 8, 729 30 Ostrava",
    allowedEmailDomain: "ostrava.cz",
    kind: "magistrat",
    region: "Moravskoslezský",
  },
  {
    id: "inst-plzen",
    name: "Magistrát města Plzně",
    ico: "00075370",
    psc: "30632",
    seatCity: "Plzeň",
    seatAddress: "náměstí Republiky 1, 306 32 Plzeň",
    allowedEmailDomain: "plzen.eu",
    kind: "magistrat",
    region: "Plzeňský",
  },
  {
    id: "inst-liberec",
    name: "Magistrát města Liberce",
    ico: "00262962",
    psc: "46059",
    seatCity: "Liberec",
    seatAddress: "nám. Dr. E. Beneše 1, 460 59 Liberec",
    allowedEmailDomain: "magistrat.liberec.cz",
    kind: "magistrat",
    region: "Liberecký",
  },
  {
    id: "inst-cesky-krumlov",
    name: "Městský úřad Český Krumlov",
    ico: "00245829",
    psc: "38101",
    seatCity: "Český Krumlov",
    seatAddress: "náměstí Svornosti 1, 381 01 Český Krumlov",
    allowedEmailDomain: "mu.ckrumlov.cz",
    kind: "mestsky_urad",
    region: "Jihočeský",
  },
  {
    id: "inst-kolin",
    name: "Městský úřad Kolín",
    ico: "00235425",
    psc: "28002",
    seatCity: "Kolín",
    seatAddress: "Karlovo náměstí 78, 280 02 Kolín",
    allowedEmailDomain: "mukolin.cz",
    kind: "mestsky_urad",
    region: "Středočeský",
  },
];

/** Ukázkový CSV obsah pro dokumentaci hromadného importu */
export const INSTITUTIONS_IMPORT_CSV_HEADER =
  "name,ico,psc,seat_city,seat_address,allowed_email_domain,kind,region";
