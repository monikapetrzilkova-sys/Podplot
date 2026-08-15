/** Canva paleta — každá kategorie vlastní „šťavnatý“ odstín */

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CATEGORY_COLORS = {
  vse: "#1B4D3E",
  domacnost: "#3D6B59",
  deti: "#8A9A5B",
  naradi: "#708238",
  zahrada: "#4F7942",
  sport: "#2E8B57",
  zvirata: "#6B8E4E",
  hobby: "#5B7C6E",
  jine: "#6B7C74",
};

export const LABEL_COLOR = "#0C361F";

export function getCategoryTheme(categoryId) {
  const color = CATEGORY_COLORS[categoryId] ?? CATEGORY_COLORS.zahrada;
  return {
    color,
    bubbleBgIdle: hexToRgba(color, 0.1),
    bubbleBgActive: color,
    iconColorIdle: color,
    iconColorActive: "#FFFFFF",
    stemIdle: hexToRgba(color, 0.35),
    stemActive: color,
    borderIdle: hexToRgba(color, 0.2),
    borderActive: color,
    glow: `0 0 0 2px ${hexToRgba(color, 0.35)}, 0 4px 14px ${hexToRgba(color, 0.18)}`,
  };
}

export { CATEGORY_COLORS };
