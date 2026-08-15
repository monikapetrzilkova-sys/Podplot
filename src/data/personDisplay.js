/** Odlišení osob se stejným jménem v rámci obce — bez zobrazení přesné adresy */

export const PUBLIC_AREA_LABEL_HINT =
  "Např. ulice bez čísla, čtvrť nebo místo v obci — nikdy přesná adresa s číslem popisným.";

export function normalizePersonName(name = "") {
  return name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Veřejný popisek jen se souhlasem; jinak hrubá vzdálenost z profilu sousedství */
export function personDisambiguator(person) {
  if (person?.allowPublicAreaLabel && person?.publicAreaLabel?.trim()) {
    return person.publicAreaLabel.trim();
  }
  if (person?.location?.trim()) return person.location.trim();
  return "";
}

export function dedupePeopleById(people) {
  const map = new Map();
  people.forEach((p) => {
    if (!p?.id || !p?.name) return;
    const prev = map.get(p.id);
    if (!prev) {
      map.set(p.id, { ...p });
      return;
    }
    map.set(p.id, {
      ...prev,
      ...p,
      publicAreaLabel: p.publicAreaLabel || prev.publicAreaLabel,
      allowPublicAreaLabel: p.allowPublicAreaLabel ?? prev.allowPublicAreaLabel,
      location: p.location || prev.location,
      municipality: p.municipality || prev.municipality,
    });
  });
  return Array.from(map.values());
}

export function buildPersonNameIndex(people = []) {
  const peopleById = new Map();
  const duplicateIds = new Set();

  people.forEach((p) => peopleById.set(p.id, p));

  const groups = new Map();
  people.forEach((p) => {
    const key = `${p.municipality ?? ""}|${normalizePersonName(p.name)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p.id);
  });

  groups.forEach((ids) => {
    if (ids.length > 1) ids.forEach((id) => duplicateIds.add(id));
  });

  return { peopleById, duplicateIds };
}

export function formatPersonDisplayName(person, index) {
  if (!person?.name) return "";
  if (!index?.duplicateIds?.has(person.id)) return person.name;
  const hint = personDisambiguator(person);
  return hint ? `${person.name} · ${hint}` : person.name;
}

function personFromNeighbor(n, municipality) {
  return {
    id: n.id,
    name: n.name,
    initials: n.initials,
    allowPublicAreaLabel: Boolean(n.allowPublicAreaLabel),
    publicAreaLabel: n.publicAreaLabel ?? "",
    location: n.location,
    municipality: n.municipality ?? municipality,
  };
}

export function collectLocalPeople({
  municipality = "",
  currentUser = null,
  neighbors = [],
  events = [],
  posts = [],
  lendingItems = [],
  neighborHelp = [],
  chats = [],
}) {
  const people = [];
  const neighborById = new Map(neighbors.map((n) => [n.id, n]));

  const add = (entry) => {
    if (!entry?.id || !entry?.name) return;
    const fromNeighbor = neighborById.get(entry.id);
    if (fromNeighbor) {
      entry = { ...personFromNeighbor(fromNeighbor, municipality), ...entry, id: entry.id, name: entry.name };
    }
    people.push({
      municipality: entry.municipality ?? municipality,
      allowPublicAreaLabel: Boolean(entry.allowPublicAreaLabel),
      publicAreaLabel: entry.publicAreaLabel ?? "",
      location: entry.location ?? "",
      initials: entry.initials,
      ...entry,
    });
  };

  if (currentUser) {
    add({
      id: currentUser.id ?? "me",
      name: currentUser.name,
      initials: currentUser.initials,
      allowPublicAreaLabel: Boolean(currentUser.allowPublicAreaLabel),
      publicAreaLabel: currentUser.publicAreaLabel ?? "",
      municipality,
    });
  }

  neighbors.forEach((n) => add(personFromNeighbor(n, municipality)));

  events.forEach((ev) => {
    (ev.attendees ?? []).forEach((a) => {
      if (a.id === "me") return;
      add({
        id: a.id,
        name: a.name,
        initials: a.initials,
        allowPublicAreaLabel: a.allowPublicAreaLabel,
        publicAreaLabel: a.publicAreaLabel,
        location: a.location,
      });
    });
  });

  posts.forEach((p) => {
    if (p.mine) return;
    add({
      id: p.authorId ?? `author-${p.id}`,
      name: p.author,
      initials: p.initials,
      location: p.meta?.match(/\d+\s*m/)?.[0],
    });
  });

  lendingItems.forEach((item) => {
    if (item.mine) return;
    add({
      id: item.authorId ?? item.id,
      name: item.author,
      initials: item.initials,
      location: item.distance,
    });
  });

  neighborHelp.forEach((item) => {
    add({ id: item.id, name: item.author, location: item.distance });
  });

  chats.forEach((c) => {
    add({ id: c.participantId, name: c.participantName });
  });

  return dedupePeopleById(people);
}

export function resolvePersonProfile(
  index,
  { id, name, municipality, publicAreaLabel, allowPublicAreaLabel, location } = {}
) {
  if (id && index.peopleById.has(id)) return index.peopleById.get(id);
  if (id) {
    return { id, name: name ?? id, municipality, publicAreaLabel, allowPublicAreaLabel, location };
  }
  if (name) {
    const match = [...index.peopleById.values()].find(
      (p) => p.name === name && (!municipality || p.municipality === municipality)
    );
    if (match) return match;
    return { id: normalizePersonName(name), name, municipality, publicAreaLabel, allowPublicAreaLabel, location };
  }
  return null;
}

export function getDisplayNameForPerson(index, personInput) {
  const person =
    typeof personInput === "string"
      ? index.peopleById.get(personInput)
      : resolvePersonProfile(index, personInput);
  if (!person) {
    if (typeof personInput === "object" && personInput?.name) return personInput.name;
    return typeof personInput === "string" ? personInput : "";
  }
  return formatPersonDisplayName(person, index);
}
