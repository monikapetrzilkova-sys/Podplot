/** Barevné role a vizuální identita PodPlot */

export const ROLES = {
  soused: {
    id: "soused",
    label: "Soused",
    color: "teal",
    bg: "bg-teal-200",
    border: "border-teal-200",
    text: "text-teal-700",
    accent: "bg-teal-700",
    badge: "bg-teal-200 text-teal-800",
    ring: "ring-teal-700",
  },
  urad: {
    id: "urad",
    label: "Obecní úřad",
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "bg-blue-600",
    badge: "bg-blue-100 text-blue-800",
    card: "bg-blue-50/80 border-l-4 border-l-blue-500",
    ring: "ring-blue-500",
  },
  podnik: {
    id: "podnik",
    label: "Podnik / Služba",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    accent: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
    ring: "ring-amber-500",
  },
  /** @deprecated aliasy */
  podnikatel: {
    id: "podnik",
    label: "Podnik / Služba",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    accent: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
    ring: "ring-amber-500",
  },
  remeslnik: {
    id: "podnik",
    label: "Mobilní služba",
    color: "orange",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    accent: "bg-orange-600",
    badge: "bg-orange-100 text-orange-800",
    ring: "ring-orange-500",
  },
  instituce: {
    id: "urad",
    label: "Úřad",
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "bg-blue-600",
    badge: "bg-blue-100 text-blue-800",
    card: "bg-blue-50/80 border-l-4 border-l-blue-500",
    ring: "ring-blue-500",
  },
};

const ROLE_ALIASES = {
  podnikatel: "podnik",
  remeslnik: "podnik",
  instituce: "urad",
};

export function getRole(roleId) {
  const id = ROLE_ALIASES[roleId] ?? roleId;
  return ROLES[id] ?? ROLES.soused;
}
