/** Logické plátno kapky — viewBox. Tah špičky musí zůstat uvnitř. */
export const MAP_PIN_W = 40;
export const MAP_PIN_H = 54;

export function mapPinDisplaySize(selected = false) {
  return selected ? { w: 46, h: 62 } : { w: 36, h: 49 };
}

/**
 * Kapka uvnitř plátna 40×54.
 * Střed hlavy (20, 17.5), rádius 13 — nahoře/po stranách ~4 px rezerva na tah.
 * Špička končí na y=50, pod ní zbývají 4 px, ať stroke 1.6 neuteče z viewBoxu.
 */
export function mapPinTeardropPath() {
  return "M20 4.5c-7.2 0-13 5.8-13 13 0 12.2 13 32.5 13 32.5S33 29.7 33 17.5C33 10.3 27.2 4.5 20 4.5z";
}

export const MAP_PIN_ICON_CX = 20;
export const MAP_PIN_ICON_CY = 17.5;

/** Kořen SVG v pixelové velikosti, kterou pak dostane Google Maps (size === scaledSize). */
export function mapPinSvgOpenTag(selected = false) {
  const { w, h } = mapPinDisplaySize(selected);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${MAP_PIN_W} ${MAP_PIN_H}">`;
}

/**
 * size musí být stejné jako scaledSize i jako width/height SVG.
 * Když je scaledSize větší než size, Maps bere size jako ořez sprite
 * a u vybraného (většího) špendlíku usekne špičku.
 */
export function googleMapsPinIcon(maps, url, selected = false) {
  const { w, h } = mapPinDisplaySize(selected);
  return {
    url,
    size: new maps.Size(w, h),
    scaledSize: new maps.Size(w, h),
    origin: new maps.Point(0, 0),
    anchor: new maps.Point(Math.round(w / 2), h),
  };
}
