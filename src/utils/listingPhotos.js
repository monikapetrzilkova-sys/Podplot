/** Normalizace a komprese fotek u inzerátů / skupinových příspěvků */

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.78;

/** Vytáhne použitelnou URL z řetězce nebo objektu { url / src }. */
export function normalizePhotoUrl(entry) {
  if (!entry) return null;
  if (typeof entry === "string") {
    const s = entry.trim();
    return s && s !== "[object Object]" ? s : null;
  }
  if (typeof entry === "object") {
    const raw = entry.url ?? entry.src ?? entry.photoUrl ?? null;
    return typeof raw === "string" && raw.trim() ? raw.trim() : null;
  }
  return null;
}

export function normalizePhotoList(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map(normalizePhotoUrl).filter(Boolean);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Soubor se nepodařilo načíst."));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Obrázek nelze zobrazit (nepodporovaný formát)."));
    img.src = src;
  });
}

/**
 * Převede vybraný soubor na JPEG data-URL vhodný pro <img> i sync (iPhone HEIC → JPEG).
 * Při selhání konverze vrací původní data-URL, pokud jde o běžný image/*.
 */
export async function fileToListingPhotoDataUrl(file) {
  if (!file || !String(file.type || "").startsWith("image/")) {
    throw new Error("Vyber obrázek (JPG, PNG, WEBP…).");
  }

  const original = await readFileAsDataUrl(file);

  try {
    const img = await loadImageElement(original);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return original;

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, cw, ch);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    // HEIC / nepodporovaný formát — bez canvas konverze prohlížeč stejně nezobrazí
    const isHeic = /heic|heif/i.test(file.type) || /\.heic$|\.heif$/i.test(file.name || "");
    if (isHeic) {
      throw new Error("Formát HEIC z iPhonu tu nejde zobrazit. V Fotech zvolte „Nejkompatibilnější“ (JPG), nebo fotku nejdřív uložte jako JPG.");
    }
    return original;
  }
}

export function initialsFromName(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase() || "S";
}
