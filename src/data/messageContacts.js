/** Adresář kontaktů a návrhy pro zprávy */



function slugId(name, prefix = "user") {

  if (!name) return prefix;

  const slug = name

    .toLowerCase()

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "")

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-|-$/g, "");

  return slug || prefix;

}



function initialsFromName(name) {

  if (!name) return "?";

  return name

    .split(/\s+/)

    .map((w) => w[0])

    .join("")

    .slice(0, 2)

    .toUpperCase();

}



function addContact(

  map,

  { id, name, initials, source, publicAreaLabel, allowPublicAreaLabel, municipality, location }

) {

  if (!name?.trim()) return;

  const key = id || slugId(name);

  const existing = map.get(key);

  if (existing) {

    if (source && !existing.sources.includes(source)) {

      existing.sources.push(source);

    }

    if (allowPublicAreaLabel && publicAreaLabel) {

      existing.allowPublicAreaLabel = true;

      existing.publicAreaLabel = publicAreaLabel;

    }

    existing.location = existing.location || location || "";

    existing.municipality = existing.municipality || municipality || "";

    return;

  }

  map.set(key, {

    id: key,

    name: name.trim(),

    initials: initials || initialsFromName(name),

    sources: source ? [source] : [],

    allowPublicAreaLabel: Boolean(allowPublicAreaLabel),

    publicAreaLabel: allowPublicAreaLabel ? (publicAreaLabel ?? "") : "",

    municipality: municipality ?? "",

    location: location ?? "",

  });

}



export function buildMessageContactDirectory({

  neighbors = [],

  feedPosts = [],

  userPosts = [],

  userGroupPosts = [],

  events = [],

  servicesCatalog = [],

  lendingItems = [],

  neighborHelp = [],

  chats = [],

  municipality = "",

}) {

  const map = new Map();



  neighbors.forEach((n) =>

    addContact(map, {

      id: n.id,

      name: n.name,

      initials: n.initials,

      source: "Sousedé",

      allowPublicAreaLabel: n.allowPublicAreaLabel,

      publicAreaLabel: n.publicAreaLabel,

      municipality: n.municipality ?? municipality,

      location: n.location,

    })

  );



  [...feedPosts, ...userPosts, ...userGroupPosts].forEach((p) => {

    if (p.mine) return;

    const person = resolvePerson(p.author, p.authorId, p.initials, neighbors);

    addContact(map, { ...person, source: "Příspěvky", municipality });

  });



  events.forEach((ev) => {

    if (ev.organizer && ev.organizer !== "Vy") {

      const org = resolvePerson(ev.organizer, slugId(ev.organizer, `org-${ev.id}`), null, neighbors);

      addContact(map, { ...org, source: "Akce" });

    }

    (ev.attendees ?? []).forEach((a) => {

      if (a.id === "me") return;

      const person = neighbors.find((n) => n.id === a.id) ?? a;

      addContact(map, {

        id: person.id ?? a.id,

        name: person.name ?? a.name,

        initials: person.initials ?? a.initials,

        source: "Akce",

        allowPublicAreaLabel: person.allowPublicAreaLabel ?? a.allowPublicAreaLabel,

        publicAreaLabel: person.publicAreaLabel ?? a.publicAreaLabel,

        municipality,

        location: person.location ?? a.location,

      });

    });

  });



  servicesCatalog.forEach((s) => {

    const shortName = s.name.split("—")[0]?.trim() ?? s.name;

    addContact(map, { id: s.id, name: shortName, source: "Katalog služeb" });

  });



  lendingItems.forEach((item) => {

    if (item.mine) return;

    addContact(map, {

      id: item.authorId ?? item.id,

      name: item.author,

      initials: item.initials,

      source: "Výpůjčky",

    });

  });



  neighborHelp.forEach((item) => {

    addContact(map, { id: item.id, name: item.author, source: "Sousedská pomoc" });

  });



  chats.forEach((c) => {

    addContact(map, { id: c.participantId, name: c.participantName, source: "Konverzace" });

  });



  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "cs"));

}



function resolvePerson(name, id, initials, neighbors = []) {

  const match = neighbors.find((n) => n.id === id) ?? neighbors.find((n) => n.name === name);

  if (match) {

    return {

      id: match.id,

      name: match.name,

      initials: match.initials ?? initials,

      allowPublicAreaLabel: match.allowPublicAreaLabel,

      publicAreaLabel: match.publicAreaLabel,

      municipality: match.municipality,

      location: match.location,

    };

  }

  return {

    id: id ?? slugId(name),

    name,

    initials: initials || initialsFromName(name),

  };

}



function findPostAuthor(posts, postId, neighbors = []) {

  const post = posts.find((p) => p.id === postId);

  if (!post || post.mine) return null;

  return resolvePerson(post.author, post.authorId ?? slugId(post.author, `post-${post.id}`), post.initials, neighbors);

}



export function getSuggestedMessageContacts({

  user,

  myUsefulPosts = [],

  mySearchHelpPosts = [],

  helpOffersByPost = {},

  joinedEventIds = [],

  confirmationsGiven = [],

  neighbors = [],

  allPosts = [],

  events = [],

}) {

  const scored = new Map();

  const selfIds = new Set([user?.id, "me"].filter(Boolean));

  const selfName = user?.name;



  const push = (contact, reason, weight) => {

    if (!contact?.name || selfIds.has(contact.id) || contact.name === selfName) return;

    const key = contact.id;

    const prev = scored.get(key);

    if (prev) {

      if (!prev.reasons.includes(reason)) prev.reasons.push(reason);

      prev.weight = Math.max(prev.weight, weight);

      return;

    }

    scored.set(key, {

      id: contact.id,

      name: contact.name,

      initials: contact.initials || initialsFromName(contact.name),

      allowPublicAreaLabel: contact.allowPublicAreaLabel,

      publicAreaLabel: contact.publicAreaLabel,

      municipality: contact.municipality,

      location: contact.location,

      reasons: [reason],

      weight,

    });

  };



  myUsefulPosts.forEach((postId) => {

    const author = findPostAuthor(allPosts, postId, neighbors);

    if (author) push(author, "Reagoval/a jsi na příspěvek", 90);

  });



  mySearchHelpPosts.forEach((postId) => {

    const author = findPostAuthor(allPosts, postId, neighbors);

    if (author) push(author, "Pomáháte hledat u příspěvku", 85);

  });



  Object.entries(helpOffersByPost).forEach(([postId, offers]) => {

    if (!offers.some((o) => o.helperId === "me" || o.helperId === user?.id)) return;

    const author = findPostAuthor(allPosts, postId, neighbors);

    if (author) push(author, "Nabídl/a jsi pomoc u příspěvku", 88);

  });



  joinedEventIds.forEach((eventId) => {

    const ev = events.find((e) => e.id === eventId);

    if (!ev) return;

    if (ev.organizer && ev.organizer !== "Vy" && ev.organizer !== selfName) {

      const org = resolvePerson(ev.organizer, slugId(ev.organizer, `org-${ev.id}`), null, neighbors);

      push(org, `Akce: ${ev.title}`, 80);

    }

    (ev.attendees ?? []).forEach((a) => {

      if (a.id === "me" || a.name === selfName) return;

      const n = neighbors.find((x) => x.id === a.id);

      push(

        {

          id: a.id,

          name: a.name,

          initials: a.initials,

          allowPublicAreaLabel: n?.allowPublicAreaLabel ?? a.allowPublicAreaLabel,

          publicAreaLabel: n?.publicAreaLabel ?? a.publicAreaLabel,

          location: n?.location ?? a.location,

        },

        `Akce: ${ev.title}`,

        75

      );

    });

  });



  // Potvrzení sousedství záměrně není v návrzích kontaktů (nechceme přátelský seznam).

  return Array.from(scored.values())

    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name, "cs"))

    .slice(0, 8);

}



export function searchMessageContacts(query, directory, { excludeIds = [], excludeName = "" } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const blocked = new Set(excludeIds);
  const isNeighbor = (c) => (c.sources ?? []).some((s) => /soused/i.test(String(s)));

  return directory
    .filter((c) => {
      if (blocked.has(c.id) || c.name === excludeName) return false;
      const haystack = [c.name, c.publicAreaLabel, c.displayName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => {
      const aN = isNeighbor(a) ? 0 : 1;
      const bN = isNeighbor(b) ? 0 : 1;
      if (aN !== bN) return aN - bN;
      return String(a.displayName || a.name || "").localeCompare(
        String(b.displayName || b.name || ""),
        "cs"
      );
    })
    .slice(0, 12);
}

export function formatContactReasons(reasons = []) {
  return reasons[0] ?? "";
}


