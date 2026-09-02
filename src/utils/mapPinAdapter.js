import { entityLatLng } from "./geoCoordinates.js";
import { institutionPinVariant } from "../data/institutionsMapData.js";
import { thingPinVariant, thingPinEmoji } from "./thingsModule.js";
import { servicePinVariant } from "./servicesModule.js";
import {
  reportPinVariant,
  reportPinShortLabel,
  shouldShowReportPinLabel,
} from "./reportPinUtils.js";
import { reportMarkerIconSvg } from "./reportPinMarkerSvg.js";
import { institutionMarkerIconSvg } from "./institutionPinMarkerSvg.js";
import {
  MAP_PIN_H,
  MAP_PIN_ICON_CX,
  MAP_PIN_ICON_CY,
  MAP_PIN_W,
  mapPinTeardropPath,
} from "./mapPinShape.js";

export {
  MAP_PIN_H,
  MAP_PIN_W,
  googleMapsPinIcon,
  mapPinDisplaySize,
  mapPinTeardropPath,
} from "./mapPinShape.js";

/** Sestaví jednotné markery pro Google Map z entit modulu. */
export function buildMapMarkers({
  mapMode,
  center,
  referenceRadiusKm,
  reports = [],
  events = [],
  institutions = [],
  things = [],
  services = [],
  selectedReportId,
  selectedEventId,
  selectedInstitutionId,
  selectedThingId,
  selectedServiceId,
  singleReportMode = false,
}) {
  const markers = [];

  if (mapMode === "reports" || mapMode === "report") {
    const visible = singleReportMode
      ? selectedReportId
        ? reports.filter((r) => r.id === selectedReportId)
        : []
      : reports;
    visible.forEach((r) => {
      const pos = entityLatLng(r, center, referenceRadiusKm);
      if (!pos) return;
      const selected = selectedReportId === r.id;
      markers.push({
        id: r.id,
        kind: "report",
        lat: pos.lat,
        lng: pos.lng,
        variant: reportPinVariant(r),
        iconUrl: reportMarkerIconSvg(r, selected),
        label: r.type,
        pinLabel: reportPinShortLabel(r),
        showPinLabel: shouldShowReportPinLabel(r, selectedReportId),
        selected,
        entity: r,
      });
    });
  }

  if (mapMode === "events") {
    events.forEach((ev) => {
      const pos = entityLatLng(ev, center, referenceRadiusKm);
      if (!pos) return;
      markers.push({
        id: ev.id,
        kind: "event",
        lat: pos.lat,
        lng: pos.lng,
        variant: "event",
        label: ev.title,
        selected: selectedEventId === ev.id,
        entity: ev,
      });
    });
  }

  if (mapMode === "institutions") {
    institutions.forEach((place) => {
      const pos = entityLatLng(place, center, referenceRadiusKm);
      if (!pos) return;
      const selected = selectedInstitutionId === place.id;
      markers.push({
        id: place.id,
        kind: "institution",
        lat: pos.lat,
        lng: pos.lng,
        variant: place.isGooglePlace ? "google" : institutionPinVariant(place),
        iconUrl: institutionMarkerIconSvg(place, selected),
        label: place.name,
        selected,
        entity: place,
      });
    });
  }

  if (mapMode === "things") {
    things.forEach((item) => {
      const pos = entityLatLng(item, center, referenceRadiusKm);
      if (!pos) return;
      markers.push({
        id: item.id,
        kind: "thing",
        lat: pos.lat,
        lng: pos.lng,
        variant: thingPinVariant(item),
        emoji: thingPinEmoji(item),
        label: item.label,
        selected: selectedThingId === item.id,
        entity: item,
      });
    });
  }

  if (mapMode === "services") {
    services.forEach((svc) => {
      const pos = entityLatLng(svc, center, referenceRadiusKm);
      if (!pos) return;
      markers.push({
        id: svc.id,
        kind: "service",
        lat: pos.lat,
        lng: pos.lng,
        variant: servicePinVariant(svc),
        label: svc.label,
        selected: selectedServiceId === svc.id,
        entity: svc,
      });
    });
  }

  return markers;
}

export const PIN_COLORS = {
  home: { bg: "#1B4332", border: "#40916C" },
  urgent: { bg: "#A85858", border: "#8F4545" },
  urgentMunicipality: { bg: "#8F4545", border: "#6B3333" },
  default: { bg: "#B7E4C7", border: "#2D6A4F" },
  draft: { bg: "#A85858", border: "#D95D39" },
  event: { bg: "#40916C", border: "#1B4332" },
  google: { bg: "#4285F4", border: "#1a73e8" },
  school: { bg: "#4361EE", border: "#3A0CA3" },
  gastro: { bg: "#F4A261", border: "#E76F51" },
  health: { bg: "#06D6A0", border: "#118AB2" },
  shop: { bg: "#E9C46A", border: "#F4A261" },
  beauty: { bg: "#F72585", border: "#B5179E" },
  sport: { bg: "#52B788", border: "#2D6A4F" },
  public: { bg: "#4895EF", border: "#4361EE" },
  services: { bg: "#E76F51", border: "#D95D39" },
  waste: { bg: "#2D6A4F", border: "#1B4332" },
  leisure: { bg: "#52B788", border: "#2D6A4F" },
  institution: { bg: "#7209B7", border: "#560BAD" },
  institutionGastro: { bg: "#F4A261", border: "#E76F51" },
  reportDefault: { bg: "#95D5B2", border: "#40916C" },
  reportLoss: { bg: "#74C69D", border: "#2D6A4F" },
  reportAnimal: { bg: "#52B788", border: "#1B4332" },
  reportInfra: { bg: "#40916C", border: "#1B4332" },
  reportDamage: { bg: "#3D7A68", border: "#1B4332" },
  reportWarn: { bg: "#4d8b7a", border: "#1B4332" },
  reportTip: { bg: "#C5D97A", border: "#6B8E23" },
  reportPublic: { bg: "#64A08D", border: "#2D6A4F" },
  reportFire: { bg: "#5a9587", border: "#1B4332" },
};

export function markerIconSvg(variant, emoji) {
  const c = PIN_COLORS[variant] ?? PIN_COLORS.default;
  const inner = emoji
    ? `<text x="${MAP_PIN_ICON_CX}" y="${MAP_PIN_ICON_CY + 4}" text-anchor="middle" font-size="12">${emoji}</text>`
    : `<circle cx="${MAP_PIN_ICON_CX}" cy="${MAP_PIN_ICON_CY}" r="3.4" fill="white"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_PIN_W}" height="${MAP_PIN_H}" viewBox="0 0 ${MAP_PIN_W} ${MAP_PIN_H}" preserveAspectRatio="xMidYMax meet">
    <path d="${mapPinTeardropPath()}" fill="${c.bg}" stroke="${c.border}" stroke-width="1.6" stroke-linejoin="round"/>
    ${inner}
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
