/** Plošná oznámení propojená s Hlášeními — modrý / červený majáček */

export const AREA_NEWS = [
  {
    id: "an1",
    reportId: "r3",
    type: "info",
    municipality: "Jesenice",
    locationIds: ["domov"],
    title: "Plánovaná oprava vodovodu zítra 8–14 h",
    body: "Ulice Pod Hájovnou bude bez vody. Připravte si zásobu vody.",
    author: "Obec Jesenice",
    time: "před 1 h",
    role: "urad",
  },
  {
    id: "an2",
    reportId: "r-block",
    type: "info",
    municipality: "Jesenice",
    locationIds: ["domov"],
    title: "Blokové čištění ulic ve středu",
    body: "Přeparkujte prosím vozidla v zóně Lípová a Na Louce.",
    author: "Městský úřad Jesenice",
    time: "dnes 9:00",
    role: "urad",
  },
  {
    id: "an3",
    reportId: "r-lost",
    type: "info",
    municipality: "Jesenice",
    locationIds: ["domov"],
    title: "Nalezeny klíče u obchodu",
    body: "Soused Martin našel klíče — vyzvedněte u obecního úřadu.",
    author: "Martin Černý",
    time: "před 2 h",
    role: "soused",
  },
  {
    id: "an4",
    reportId: "r-crisis-j",
    type: "crisis",
    municipality: "Jesenice",
    locationIds: ["domov"],
    title: "HAVÁRIE VODY — výpadek v části Jesenice",
    body: "Prasklo potrubí na Na Louce. Hasiči jsou na místě. Nepoužívejte vodu do odvolání.",
    author: "Obec Jesenice · SOS",
    time: "právě teď",
    role: "urad",
    active: true,
  },
  {
    id: "an5",
    reportId: "r-praha-info",
    type: "info",
    municipality: "Praha",
    locationIds: ["prace"],
    title: "Dopravní omezení — rekonstrukce Václavského nám.",
    body: "Autobusy objíždějí přes Jindřišskou ulici.",
    author: "MHMP",
    time: "dnes 7:30",
    role: "urad",
  },
  {
    id: "an6",
    reportId: "r-sazava",
    type: "info",
    municipality: "Přední Lhota",
    locationIds: ["chata"],
    title: "Svoz odpadu v pátek dříve",
    body: "Popelnice vystavte do 6:00 u hlavní silnice.",
    author: "Město Poděbrady — Přední Lhota",
    time: "včera",
    role: "urad",
  },
];

export function getAreaNewsForLocation(location, allNews = AREA_NEWS) {
  if (!location) return [];
  return allNews.filter((n) => {
    const locOk = !n.locationIds?.length || n.locationIds.includes(location.id);
    const munOk =
      !n.municipality ||
      n.municipality === "all" ||
      n.municipality === location.municipality;
    return locOk && munOk;
  });
}

export function getActiveCrisis(news) {
  return news.find((n) => n.type === "crisis" && n.active !== false) ?? null;
}
