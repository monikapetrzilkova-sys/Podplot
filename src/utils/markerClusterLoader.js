/** Načtení @googlemaps/markerclusterer (ESM CDN, bez npm). */

let clustererModule = null;
let loadPromise = null;

export async function loadMarkerClusterer() {
  if (clustererModule) return clustererModule;
  if (loadPromise) return loadPromise;

  loadPromise = import(
    "https://esm.sh/@googlemaps/markerclusterer@2.5.3"
  ).then((mod) => {
    clustererModule = mod;
    return mod;
  });

  return loadPromise;
}

/** Vlastní vzhled clusteru — zelené kolečko s počtem. */
export function createPodPlotClusterRenderer(googleMaps) {
  return {
    render: ({ count, position }, _stats, map) => {
      const size = count > 50 ? 52 : count > 20 ? 46 : count > 10 ? 42 : 38;
      const fill = count > 20 ? "#1B4332" : count > 10 ? "#2D6A4F" : "#40916C";

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="${fill}" fill-opacity="0.92" stroke="#B7E4C7" stroke-width="2"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="13" font-weight="700">${count}</text>
      </svg>`;

      return new googleMaps.Marker({
        position,
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new googleMaps.Size(size, size),
          anchor: new googleMaps.Point(size / 2, size / 2),
        },
        zIndex: Number(googleMaps.Marker.MAX_ZINDEX) + count,
        title: `${count} míst`,
      });
    },
  };
}
