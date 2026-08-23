import { useEffect, useMemo, useRef, useState } from "react";
import { buildMapMarkers, markerIconSvg } from "../../utils/mapPinAdapter.js";
import { buildMapPickResult, mapPosToLatLng } from "../../utils/geoCoordinates.js";
import { loadMarkerClusterer, createPodPlotClusterRenderer } from "../../utils/markerClusterLoader.js";
import {
  DEFAULT_EVENTS_MAP_RADIUS_KM,
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  DEFAULT_THINGS_MAP_RADIUS_KM,
  formatMapRadiusKm,
} from "../../data/mapRadiusSettings.js";
import MapPickHint from "./MapPickHint.jsx";
import { MAP_PICK_CURSOR } from "../../utils/mapPickCursor.js";

/** Skryje nativní Google POI — místa ukazujeme jen našimi špendlíky z Places API. */
const HIDE_GOOGLE_POI_STYLES = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

function MapZoomControls({ onZoomIn, onZoomOut }) {
  return (
    <div className="pp-map-google-controls" aria-label="Ovládání přiblížení">
      <button type="button" className="pp-map-google-control-btn" onClick={onZoomIn} aria-label="Přiblížit">
        +
      </button>
      <button type="button" className="pp-map-google-control-btn" onClick={onZoomOut} aria-label="Oddálit">
        −
      </button>
    </div>
  );
}

export default function PodPlotGoogleMap({
  mapMode = "reports",
  mapCenter,
  radiusKm,
  referenceRadiusKm,
  reports = [],
  events = [],
  institutions = [],
  things = [],
  services = [],
  pickMode = false,
  draftPin = null,
  onPickPin,
  onReportPinClick,
  onEventPinClick,
  onInstitutionPinClick,
  onThingPinClick,
  onServicePinClick,
  selectedReportId = null,
  selectedEventId = null,
  selectedInstitutionId = null,
  selectedThingId = null,
  selectedServiceId = null,
  singleReportMode = false,
  showHomePin = true,
  homeLabel = "Domov",
  areaLabel = "",
  hideStats = false,
  hidePickHint = false,
  focusDraftPin = false,
  draftPinOnly = false,
  fluid = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clustererRef = useRef(null);
  const circleRef = useRef(null);
  const homeMarkerRef = useRef(null);
  const draftMarkerRef = useRef(null);
  const handlersRef = useRef({});
  const centerRef = useRef(mapCenter ?? { lat: 49.966, lng: 14.512 });
  const viewCenterRef = useRef(centerRef.current);
  const [mapReady, setMapReady] = useState(false);

  handlersRef.current = {
    onReportPinClick,
    onEventPinClick,
    onInstitutionPinClick,
    onThingPinClick,
    onServicePinClick,
  };

  const defaultRadiusKm =
    mapMode === "events"
      ? DEFAULT_EVENTS_MAP_RADIUS_KM
      : mapMode === "things"
        ? DEFAULT_THINGS_MAP_RADIUS_KM
        : DEFAULT_REPORTS_MAP_RADIUS_KM;
  const effectiveRadiusKm = radiusKm ?? defaultRadiusKm;
  const refRadius = referenceRadiusKm ?? defaultRadiusKm;
  const center = mapCenter ?? { lat: 49.966, lng: 14.512 };
  centerRef.current = center;

  const resolveDraftLatLng = (pin) => {
    if (pin?.lat != null && pin?.lng != null) return { lat: Number(pin.lat), lng: Number(pin.lng) };
    if (pin?.x != null) return mapPosToLatLng(pin, centerRef.current, refRadius);
    return null;
  };

  const markers = useMemo(
    () =>
      buildMapMarkers({
        mapMode,
        center,
        referenceRadiusKm: refRadius,
        reports: draftPinOnly ? [] : reports,
        events,
        institutions,
        things,
        services,
        selectedReportId,
        selectedEventId,
        selectedInstitutionId,
        selectedThingId,
        selectedServiceId,
        singleReportMode: draftPinOnly || singleReportMode,
      }),
    [
      mapMode,
      center,
      refRadius,
      draftPinOnly,
      reports,
      events,
      institutions,
      things,
      services,
      selectedReportId,
      selectedEventId,
      selectedInstitutionId,
      selectedThingId,
      selectedServiceId,
      singleReportMode,
    ]
  );

  const fireMarkerClick = (marker) => {
    const h = handlersRef.current;
    if (marker.kind === "report") h.onReportPinClick?.(marker.entity);
    else if (marker.kind === "event") h.onEventPinClick?.(marker.entity);
    else if (marker.kind === "institution") h.onInstitutionPinClick?.(marker.entity);
    else if (marker.kind === "thing") h.onThingPinClick?.(marker.entity);
    else if (marker.kind === "service") h.onServicePinClick?.(marker.entity);
  };

  useEffect(() => {
    if (!containerRef.current || !window.google?.maps) return;

    const el = containerRef.current;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const draftFocus = focusDraftPin ? resolveDraftLatLng(draftPin) : null;
    const initialCenter = draftFocus ?? center;
    const initialZoom = draftFocus ? 16 : 14;
    viewCenterRef.current = initialCenter;

    const map = new window.google.maps.Map(el, {
      center: initialCenter,
      zoom: initialZoom,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      gestureHandling: pickMode || isTouch ? "greedy" : "cooperative",
      styles: mapMode === "institutions" ? HIDE_GOOGLE_POI_STYLES : undefined,
    });
    mapRef.current = map;
    setMapReady(true);

    const triggerResize = () => {
      if (!mapRef.current || !window.google?.maps?.event) return;
      window.google.maps.event.trigger(mapRef.current, "resize");
      mapRef.current.setCenter(viewCenterRef.current ?? centerRef.current);
    };

    // Mobil: flex layout často dostane výšku až po paintu — resize po layoutu
    requestAnimationFrame(() => {
      triggerResize();
      window.setTimeout(triggerResize, 100);
      window.setTimeout(triggerResize, 400);
    });

    const wrap = el.parentElement;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => triggerResize())
        : null;
    if (ro) {
      ro.observe(el);
      if (wrap) ro.observe(wrap);
    }

    return () => {
      ro?.disconnect();
      clustererRef.current?.setMap(null);
      clustererRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
    // Mount once — viewCenterRef drží špendlík při resize (formulář hlášení).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (focusDraftPin && draftPin) return;
    // Při výběru špendlíku z feedu neresetovat střed na Domov
    if (selectedReportId || selectedEventId || selectedInstitutionId || selectedThingId || selectedServiceId) {
      return;
    }
    viewCenterRef.current = center;
    mapRef.current.setCenter(center);
  }, [
    center.lat,
    center.lng,
    focusDraftPin,
    draftPin,
    selectedReportId,
    selectedEventId,
    selectedInstitutionId,
    selectedThingId,
    selectedServiceId,
  ]);

  const focusSelectionKey =
    selectedReportId ||
    selectedEventId ||
    selectedInstitutionId ||
    selectedThingId ||
    selectedServiceId ||
    null;
  const prevFocusSelectionRef = useRef(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !focusSelectionKey) return;
    if (focusDraftPin) return;

    const marker = markers.find((m) => m.id === focusSelectionKey);
    if (!marker || marker.lat == null || marker.lng == null) return;

    const alreadyFocused = prevFocusSelectionRef.current === focusSelectionKey;
    prevFocusSelectionRef.current = focusSelectionKey;
    const pos = { lat: Number(marker.lat), lng: Number(marker.lng) };
    viewCenterRef.current = pos;
    map.panTo(pos);
    if (!alreadyFocused) {
      const zoom = map.getZoom() ?? 14;
      if (zoom < 15) map.setZoom(15);
    }

    const t1 = window.setTimeout(() => {
      if (!mapRef.current || !viewCenterRef.current) return;
      mapRef.current.panTo(viewCenterRef.current);
    }, 120);
    const t2 = window.setTimeout(() => {
      if (!mapRef.current || !viewCenterRef.current) return;
      mapRef.current.panTo(viewCenterRef.current);
    }, 450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [focusSelectionKey, markers, mapReady, focusDraftPin]);

  useEffect(() => {
    if (!focusSelectionKey) prevFocusSelectionRef.current = null;
  }, [focusSelectionKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setOptions({
      gestureHandling: pickMode ? "greedy" : "cooperative",
      draggableCursor: pickMode ? MAP_PICK_CURSOR : null,
      draggingCursor: pickMode ? MAP_PICK_CURSOR : null,
      // V Průvodci schovej Google „obrázky“ podniků — zůstanou jen naše špendlíky
      styles: mapMode === "institutions" ? HIDE_GOOGLE_POI_STYLES : [],
      clickableIcons: false,
    });
  }, [pickMode, mapMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    let cancelled = false;

    const cleanupMarkers = () => {
      clustererRef.current?.clearMarkers?.();
      clustererRef.current?.setMap(null);
      clustererRef.current = null;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };

    cleanupMarkers();

    if (markers.length === 0) return () => { cancelled = true; };

    const gMarkers = markers.map((marker) => {
      const w = marker.selected ? 36 : 32;
      const h = marker.selected ? 46 : 40;
      const gMarker = new window.google.maps.Marker({
        map: null,
        position: { lat: marker.lat, lng: marker.lng },
        title: marker.label,
        clickable: true,
        optimized: false,
        cursor: "pointer",
        icon: {
          url: marker.iconUrl ?? markerIconSvg(marker.variant, marker.emoji),
          size: new window.google.maps.Size(w, h),
          scaledSize: new window.google.maps.Size(w, h),
          anchor: new window.google.maps.Point(w / 2, h),
        },
        zIndex: marker.selected ? 2000 : marker.showPinLabel ? 800 : 100,
      });
      gMarker.addListener("click", (e) => {
        e?.domEvent?.stopPropagation?.();
        fireMarkerClick(marker);
      });
      return gMarker;
    });

    markersRef.current = gMarkers;

    // Cluster brání spolehlivému kliknutí na špendlík — u hlášení i průvodce vypnout
    const useCluster = false;

    (async () => {
      if (!useCluster) {
        gMarkers.forEach((m) => m.setMap(map));
        return;
      }

      try {
        const { MarkerClusterer } = await loadMarkerClusterer();
        if (cancelled) return;

        const renderer = createPodPlotClusterRenderer(window.google.maps);
        clustererRef.current = new MarkerClusterer({
          map,
          markers: gMarkers,
          renderer,
          onClusterClick: (_event, cluster, clusterMap) => {
            clusterMap.fitBounds(cluster.bounds);
          },
        });
      } catch {
        gMarkers.forEach((m) => m.setMap(map));
      }
    })();

    return () => {
      cancelled = true;
      cleanupMarkers();
    };
  }, [markers, mapReady, pickMode, singleReportMode, mapMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    if (circleRef.current) circleRef.current.setMap(null);
    if (!singleReportMode && !draftPinOnly && mapMode !== "institutions") {
      circleRef.current = new window.google.maps.Circle({
        map,
        center,
        radius: effectiveRadiusKm * 1000,
        fillColor: mapMode === "events" ? "#40916C" : "#2D6A4F",
        fillOpacity: 0.06,
        strokeColor: mapMode === "events" ? "#40916C" : "#2D6A4F",
        strokeOpacity: 0.45,
        strokeWeight: 1.5,
        clickable: false,
      });
    }
  }, [center, effectiveRadiusKm, mapMode, singleReportMode, draftPinOnly, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    if (homeMarkerRef.current) homeMarkerRef.current.setMap(null);
    if (showHomePin && !singleReportMode) {
      homeMarkerRef.current = new window.google.maps.Marker({
        map,
        position: center,
        title: homeLabel,
        icon: {
          url: markerIconSvg("home"),
          scaledSize: new window.google.maps.Size(28, 36),
          anchor: new window.google.maps.Point(14, 36),
        },
        zIndex: 3000,
        clickable: false,
      });
    }
  }, [center, showHomePin, homeLabel, singleReportMode, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    if (draftMarkerRef.current) {
      draftMarkerRef.current.setMap(null);
      draftMarkerRef.current = null;
    }

    const draftLatLng = resolveDraftLatLng(draftPin);

    if (!draftLatLng && !pickMode) return;

    const pos = draftLatLng ?? center;
    draftMarkerRef.current = new window.google.maps.Marker({
      map,
      position: pos,
      draggable: pickMode,
      icon: {
        url: markerIconSvg("draft"),
        scaledSize: new window.google.maps.Size(28, 36),
        anchor: new window.google.maps.Point(14, 36),
      },
      zIndex: 4000,
    });

    if (pickMode) {
      draftMarkerRef.current.addListener("dragend", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onPickPin?.(buildMapPickResult(lat, lng, center, refRadius));
      });
    }
  }, [draftPin, pickMode, center, refRadius, mapReady, onPickPin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusDraftPin || !draftPin || !mapReady) return;

    const draftLatLng = resolveDraftLatLng(draftPin);
    if (!draftLatLng) return;

    viewCenterRef.current = draftLatLng;
    map.panTo(draftLatLng);
    const zoom = map.getZoom() ?? 14;
    if (zoom < 16) map.setZoom(16);
    // Po layoutu modalu ještě jednou — resize jinak vracel střed na Domov
    const t1 = window.setTimeout(() => {
      if (!mapRef.current) return;
      mapRef.current.panTo(viewCenterRef.current);
    }, 120);
    const t2 = window.setTimeout(() => {
      if (!mapRef.current) return;
      mapRef.current.panTo(viewCenterRef.current);
    }, 450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [draftPin, focusDraftPin, center, refRadius, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickMode || !onPickPin) return;

    const listener = map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onPickPin(buildMapPickResult(lat, lng, center, refRadius));
    });
    return () => window.google.maps.event.removeListener(listener);
  }, [pickMode, onPickPin, center, refRadius, mapReady]);

  const zoomBy = (delta) => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom((map.getZoom() ?? 14) + delta);
  };

  const statsTitle =
    mapMode === "institutions"
      ? `Mapa míst · ${areaLabel || "lokalita"}`
      : mapMode === "events"
        ? `Mapa akcí · ${areaLabel || "lokalita"} · okruh ${formatMapRadiusKm(effectiveRadiusKm)}`
        : `Mapa hlášení · ${areaLabel || "lokalita"} · okruh ${formatMapRadiusKm(effectiveRadiusKm)}`;

  return (
    <div
      className={`pp-map-google-wrap w-full ${fluid ? "flex flex-col flex-1 min-h-0" : ""} ${className}`.trim()}
    >
      <div
        className={`pp-map-container pp-map-container--google relative w-full ${
          fluid ? "flex-1 min-h-[240px] h-full" : "h-72"
        } ${pickMode ? "pp-map-container--pick" : ""}`}
      >
        <div
          ref={containerRef}
          className="pp-map-google-canvas absolute inset-0 w-full h-full"
          aria-hidden={!pickMode}
        />
        {pickMode && !hidePickHint && !draftPin && <MapPickHint />}
        <MapZoomControls onZoomIn={() => zoomBy(1)} onZoomOut={() => zoomBy(-1)} />
      </div>
      {!hideStats && (
        <p className="text-xs text-stone-500 mt-2 px-0.5">{statsTitle}</p>
      )}
    </div>
  );
}
