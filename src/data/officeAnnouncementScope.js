/** Rozsah oznámení úřadu — celá obec, místo, nebo vybrané ulice. */

export const ANNOUNCEMENT_SCOPES = {
  municipality: { id: "municipality", label: "Celá obec" },
  place: { id: "place", label: "Konkrétní místo" },
  streets: { id: "streets", label: "Vybrané ulice" },
};

export function formatAnnouncementScope(item, municipality = "obec") {
  const scope = item?.scope || (item?.streets?.length ? "streets" : item?.address ? "place" : "municipality");
  if (scope === "streets") {
    const streets = Array.isArray(item.streets) ? item.streets.filter(Boolean) : [];
    if (streets.length === 1) return streets[0];
    if (streets.length === 2) return streets.join(" · ");
    if (streets.length > 2) return `${streets.slice(0, 2).join(" · ")} +${streets.length - 2}`;
    return "Vybrané ulice";
  }
  if (scope === "place") {
    return item.address || item.placeLabel || "Konkrétní místo";
  }
  return `Celá ${municipality}`;
}
