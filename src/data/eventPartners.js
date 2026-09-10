/** Účastníci akce kromě sousedů — podniky, kroužky, sdružení, instituce. */

export const EVENT_PARTNER_KINDS = {
  podnik: { id: "podnik", label: "Podnik" },
  krouzek: { id: "krouzek", label: "Kroužek" },
  sdruzeni: { id: "sdruzeni", label: "Sdružení" },
  instituce: { id: "instituce", label: "Instituce" },
};

export function partnerKindLabel(kind) {
  return EVENT_PARTNER_KINDS[kind]?.label ?? "Účastník";
}

export function normalizeEventPartners(partners) {
  if (!Array.isArray(partners)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of partners) {
    if (!raw) continue;
    const id = String(raw.id || raw.placeId || raw.hostedActivityId || raw.groupId || "").trim();
    const name = String(raw.name || "").trim();
    if (!id || !name) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    const kind = EVENT_PARTNER_KINDS[raw.kind] ? raw.kind : "podnik";
    out.push({
      id,
      kind,
      name,
      placeId: raw.placeId ?? null,
      hostedActivityId: raw.hostedActivityId ?? null,
      groupId: raw.groupId ?? null,
    });
  }
  return out;
}

export function eventPartnersOf(event) {
  return normalizeEventPartners(event?.partners);
}

export function eventHasPartner(event, candidate) {
  if (!candidate) return false;
  const id = candidate.id || candidate.placeId || candidate.hostedActivityId || candidate.groupId;
  const name = String(candidate.name || "").trim().toLocaleLowerCase("cs");
  return eventPartnersOf(event).some(
    (p) =>
      (id && (p.id === id || p.placeId === id || p.hostedActivityId === id || p.groupId === id)) ||
      (name && p.name.toLocaleLowerCase("cs") === name)
  );
}

export function upsertEventPartner(partners, partner) {
  const list = normalizeEventPartners(partners);
  const next = normalizeEventPartners([partner])[0];
  if (!next) return list;
  if (list.some((p) => p.id === next.id)) return list;
  return [...list, next];
}

export function removeEventPartner(partners, partnerId) {
  return normalizeEventPartners(partners).filter((p) => p.id !== partnerId);
}

export function partnerFromPlace(place) {
  if (!place?.id || !place?.name) return null;
  const isInstitution =
    place.accountType === "urad" ||
    place.accountType === "instituce" ||
    place.category === "instituce" ||
    place.category === "urady";
  return {
    id: place.id,
    kind: isInstitution ? "instituce" : "podnik",
    name: place.name,
    placeId: place.id,
  };
}

export function partnerFromActivity(activity) {
  if (!activity?.id || !activity?.title) return null;
  return {
    id: activity.id,
    kind: "krouzek",
    name: activity.title,
    hostedActivityId: activity.id,
  };
}

export function partnerFromGroup(group) {
  if (!group?.id || !group?.name) return null;
  return {
    id: group.id,
    kind: "sdruzeni",
    name: group.name,
    groupId: group.id,
  };
}
