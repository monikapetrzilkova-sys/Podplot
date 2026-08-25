/** Barevné proužky kategorií — výraznější rozdíly (včetně šedé) */

export const NEIGHBOR_CATEGORY_ACCENTS = {
  veci: "#A8B971", // olivová
  vypomoc: "#4D9B86", // sytější teal
  skupiny: "#78716C", // šedá
  akce: "#1B4D3E", // tmavě zelená
};

/** Domů / živé dění — mapování typů příspěvků */
export const HOME_FEED_ACCENTS = {
  listing: NEIGHBOR_CATEGORY_ACCENTS.veci,
  help: NEIGHBOR_CATEGORY_ACCENTS.vypomoc,
  eventGallery: NEIGHBOR_CATEGORY_ACCENTS.akce,
  news: "#94A3B8", // světlejší šedomodrá — aktuality obce
  announcement: "#57534E", // tmavší šedá — hlášení / pátrání
};

export const AGENDA_KIND_ACCENTS = {
  prompt: NEIGHBOR_CATEGORY_ACCENTS.vypomoc,
  "event-office": NEIGHBOR_CATEGORY_ACCENTS.akce,
  "event-neighbor": NEIGHBOR_CATEGORY_ACCENTS.veci,
};

export function getNeighborCategoryAccent(section) {
  return NEIGHBOR_CATEGORY_ACCENTS[section] ?? "#3D7A68";
}

export function getHomeFeedAccent(kind) {
  return HOME_FEED_ACCENTS[kind] ?? "#3D7A68";
}

export function getAgendaKindAccent(kind) {
  return AGENDA_KIND_ACCENTS[kind] ?? "#3D7A68";
}

/** Reklama služby / sponzorovaný podnik — nepatří do sousedského feedu Domů (jen Promo banner / katalog) */
export function isServiceOrSponsoredAdPost(post) {
  if (!post) return false;
  if (post.sponsored) return true;
  if (post.homeFeedHidden) return true;
  if (post.feedType === "sluzby") return true;
  const type = (post.type ?? "").toLowerCase();
  if (type === "služba" || type === "sluzba") return true;
  if (post.accountType === "remeslnik" && post.feedSubtype === "remeslnik") return true;
  return false;
}

/** Akce pořádaná úřadem / přihlášeným institucionálním účtem */
export function isOfficeOrganizedEvent(event, user) {
  if (!event) return false;
  if (event.fromOffice) return true;
  const org = String(event.organizer ?? "").trim();
  if (!org) return false;
  if (org === "Vy" || (user?.name && org === user.name)) return true;
  const lower = org.toLowerCase();
  return (
    lower.includes("obec") ||
    lower.includes("úřad") ||
    lower.includes("urad") ||
    lower.includes("městský") ||
    lower.includes("mestsky")
  );
}
