/** Testovací přepínač rolí v profilu — 3 kategorie + podtyp podniku */

export const TEST_ROLES = [
  {
    id: "soused",
    label: "Soused",
    hint: "Komunita a sousedský život",
    accountType: "soused",
    businessSubtype: null,
    role: "soused",
    emoji: "🏡",
    appRole: "NEIGHBOR",
  },
  {
    id: "urad",
    label: "Úřad",
    hint: "Veřejná správa · SOS",
    accountType: "urad",
    businessSubtype: null,
    role: "urad",
    emoji: "🏛️",
    appRole: "OFFICE",
  },
  {
    id: "podnik",
    label: "Podnik",
    hint: "Gastro, obchod — fyzická adresa",
    accountType: "podnik",
    businessSubtype: "fyzicka",
    role: "podnik",
    emoji: "🏪",
    appRole: "BUSINESS",
    personaKey: "podnik",
  },
  {
    id: "remeslnik",
    label: "Mobilní služba",
    hint: "Dojíždějící řemeslník · okruh",
    accountType: "podnik",
    businessSubtype: "mobilni",
    role: "podnik",
    emoji: "🛠️",
    appRole: "BUSINESS",
    personaKey: "remeslnik",
  },
];

export function getTestRole(id) {
  return TEST_ROLES.find((r) => r.id === id);
}
