/** Plátno špendlíku — rezervu kolem kapky, ať tah ani hlava neskončí oříznuté. */
export const MAP_PIN_W = 40;
export const MAP_PIN_H = 54;

export function mapPinDisplaySize(selected = false) {
  return selected ? { w: 46, h: 62 } : { w: 36, h: 49 };
}

/**
 * Kapka uvnitř plátna 40×54.
 * Střed hlavy (20, 17.5), rádius 13 — nahoře/po stranách ~4 px rezerva na tah.
 */
export function mapPinTeardropPath() {
  return "M20 4.5c-7.2 0-13 5.8-13 13 0 12.2 13 32.5 13 32.5S33 29.7 33 17.5C33 10.3 27.2 4.5 20 4.5z";
}

export const MAP_PIN_ICON_CX = 20;
export const MAP_PIN_ICON_CY = 17.5;

/** Google Maps jinak bere SVG jako 32×32 a kapku ořeže / zploští. */
export function googleMapsPinIcon(maps, url, selected = false) {
  const { w, h } = mapPinDisplaySize(selected);
  return {
    url,
    size: new maps.Size(MAP_PIN_W, MAP_PIN_H),
    scaledSize: new maps.Size(w, h),
    origin: new maps.Point(0, 0),
    anchor: new maps.Point(Math.round(w / 2), h),
  };
}
