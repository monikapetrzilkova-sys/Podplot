export const ADDRESS_PRIVACY_NOTE_INLINE =
  "Adresa nebude veřejně zobrazena ostatním — slouží jen k zafixování geolokace v okolí.";

export function formatPscInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

export function pscDigits(psc) {
  return String(psc ?? "").replace(/\D/g, "");
}

export function formatFullAddress({ street, houseNumber, psc, city }) {
  const pscFmt = formatPscInput(pscDigits(psc));
  return `${street.trim()} ${houseNumber.trim()}, ${pscFmt} ${city.trim()}`;
}

export function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: "Zadej e-mail." };
  if (trimmed.includes(" ")) return { valid: false, error: "E-mail nesmí obsahovat mezery." };
  if (!trimmed.includes("@")) {
    return { valid: false, error: "E-mail musí obsahovat znak @ (např. jmeno@email.cz)." };
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(trimmed)) {
    return { valid: false, error: "E-mail nemá správný tvar. Zkus např. jmeno@email.cz." };
  }
  return { valid: true, error: null };
}

export function parseStoredAddress(address = "") {
  const trimmed = address.trim();
  if (!trimmed) return { street: "", houseNumber: "", psc: "", city: "" };

  const withPsc = trimmed.match(/^(.+?)\s+(\d+[a-zA-Z0-9/-]*),\s*(\d{3}\s?\d{2})\s+(.+)$/);
  if (withPsc) {
    return {
      street: withPsc[1].trim(),
      houseNumber: withPsc[2].trim(),
      psc: formatPscInput(pscDigits(withPsc[3])),
      city: withPsc[4].trim(),
    };
  }

  const simple = trimmed.match(/^(.+?)\s+(\d+[a-zA-Z0-9/-]*),\s*(.+)$/);
  if (simple) {
    return {
      street: simple[1].trim(),
      houseNumber: simple[2].trim(),
      psc: "",
      city: simple[3].trim(),
    };
  }

  return { street: trimmed, houseNumber: "", psc: "", city: "" };
}

export function validateAddressFields({ street, houseNumber, psc, city }) {
  const errors = {};

  if (!street.trim()) {
    errors.street = "Zadej ulici.";
  } else if (!/[A-Za-zÁ-žÀ-ÿ]{2,}/u.test(street)) {
    errors.street = "Název ulice vypadá neúplně.";
  }

  if (!houseNumber.trim()) {
    errors.houseNumber = "Zadej číslo popisné.";
  } else if (!/^\d+[a-zA-Z0-9/-]*$/u.test(houseNumber.trim())) {
    errors.houseNumber = "Číslo popisné vypadá neplatně (např. 12 nebo 12a).";
  }

  const digits = pscDigits(psc);
  if (!digits) {
    errors.psc = "Zadej PSČ.";
  } else if (digits.length !== 5) {
    errors.psc = "PSČ má mít 5 číslic (např. 142 00).";
  }

  if (!city?.trim()) {
    errors.city = "Obec se doplní z PSČ — zkontroluj, že je PSČ správně.";
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors };
}

export async function lookupCityByPsc(psc) {
  const digits = pscDigits(psc);
  if (digits.length !== 5) return null;

  try {
    const res = await fetch(`/api/psc-lookup?psc=${digits}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.city) return data;
  } catch {
    /* offline fallback below */
  }

  return PSC_OFFLINE[digits] ? { city: PSC_OFFLINE[digits], psc: formatPscInput(digits) } : null;
}

/** Záložní mapa běžných PSČ pro offline testování. */
const PSC_OFFLINE = {
  "11000": "Praha 1",
  "14000": "Praha 4",
  "14200": "Praha 4 — Lhotka",
  "60200": "Brno",
  "40001": "Ústí nad Labem",
  "30100": "Plzeň",
  "70030": "Ostrava",
  "25222": "Jesenice u Prahy",
  "25101": "Říčany",
  "29001": "Poděbrady",
  "37001": "České Budějovice",
};
