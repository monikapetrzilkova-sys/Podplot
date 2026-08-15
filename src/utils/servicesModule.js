import { clampMapPos } from "../data/mapData.js";

function hashId(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ensureServiceMapPos(service) {
  if (service.mapPos) return service.mapPos;
  const h = hashId(service.id);
  return clampMapPos(48 + ((h % 19) - 9) * 1.1, 52 + (((h >> 4) % 19) - 9) * 1.1);
}

export function normalizeServiceForMap(service) {
  return {
    ...service,
    mapPos: ensureServiceMapPos(service),
    label: service.name.split("—")[0].trim(),
  };
}

export function servicePinVariant(service) {
  if (service.accountType === "podnik") return "institutionGastro";
  return "serviceCraft";
}

export function servicePinEmoji(service) {
  if (service.accountType === "podnik") return "🏪";
  return "🔧";
}
