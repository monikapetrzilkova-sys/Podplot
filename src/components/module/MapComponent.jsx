/** Jednotné mapové API — Google Maps s fallbackem na simulovanou mapu */

import ReportsMap from "../ReportsMap.jsx";
import PodPlotGoogleMap from "../map/PodPlotGoogleMap.jsx";
import MapAddressPicker from "../map/MapAddressPicker.jsx";
import { useGoogleMapsReady } from "../../hooks/useGoogleMapsReady.js";
import { useApp } from "../../context/AppContext.jsx";
import {
  DEFAULT_EVENTS_MAP_RADIUS_KM,
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  DEFAULT_THINGS_MAP_RADIUS_KM,
} from "../../data/mapRadiusSettings.js";

export default function MapComponent(props) {
  const { ready, enabled, loading, error } = useGoogleMapsReady();
  const { activeLocation } = useApp();

  const mapCenter =
    props.mapCenter?.lat != null && props.mapCenter?.lng != null
      ? { lat: Number(props.mapCenter.lat), lng: Number(props.mapCenter.lng) }
      : {
          lat: activeLocation?.lat ?? 49.966,
          lng: activeLocation?.lng ?? 14.512,
        };

  const referenceRadiusKm =
    props.mapMode === "events"
      ? DEFAULT_EVENTS_MAP_RADIUS_KM
      : props.mapMode === "things"
        ? DEFAULT_THINGS_MAP_RADIUS_KM
        : props.mapMode === "institutions"
          ? activeLocation?.radiusKm ?? 7
          : DEFAULT_REPORTS_MAP_RADIUS_KM;

  const wrapClass = [
    props.fluid ? "pp-map-google-wrap flex flex-col flex-1 min-h-0 w-full" : "pp-map-google-wrap w-full",
    props.className ?? "",
  ]
    .join(" ")
    .trim();

  const loadingMessage =
    props.loadingMessage ||
    (props.mapMode === "institutions"
      ? "Načítám mapu míst… chvilku strpení, špendlíky se brzy objeví."
      : "Načítám mapu…");

  if (loading) {
    return (
      <div className={wrapClass}>
        <div
          className={`pp-map-container pp-map-container--google pp-map-container--loading relative w-full ${
            props.fluid ? "flex-1 min-h-[220px] h-full" : props.compact ? "h-56" : "h-72"
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center bg-[#F7FAF9]/90">
            <span
              className="w-6 h-6 rounded-full border-2 border-[#C5DDD4] border-t-[#3D7A68] animate-spin"
              aria-hidden
            />
            <p className="text-xs font-medium text-stone-600 leading-snug max-w-[16rem]">
              {loadingMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const useGoogle = enabled && ready;

  // Musí sedět s poloměrem té mapy, která se opravdu vykreslí — jinak by adresa
  // spadla jinam, než kam ukazuje špendlík. Google si bere referenceRadiusKm,
  // ReportsMap svůj radiusKm (s fallbackem na stejný výchozí).
  const pickRadiusKm = useGoogle ? referenceRadiusKm : props.radiusKm ?? referenceRadiusKm;

  // Psaní adresy je rovnocenná cesta ke klepnutí do mapy — bez ní nemá
  // uživatel na klávesnici jak špendlík umístit.
  const addressPicker =
    props.pickMode && props.onPickPin ? (
      <MapAddressPicker
        center={mapCenter}
        referenceRadiusKm={pickRadiusKm}
        city={activeLocation?.municipality ?? activeLocation?.shortLabel ?? ""}
        psc={activeLocation?.psc ?? activeLocation?.geo?.psc ?? ""}
        onPick={props.onPickPin}
        className="shrink-0 mb-2"
      />
    ) : null;

  if (useGoogle) {
    return (
      <>
        {addressPicker}
        <PodPlotGoogleMap
          {...props}
          mapCenter={mapCenter}
          referenceRadiusKm={referenceRadiusKm}
        />
      </>
    );
  }

  return (
    <>
      {addressPicker}
      {error ? (
        <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-1 shrink-0">
          {error}
        </p>
      ) : null}
      <ReportsMap large legendCollapsible {...props} mapCenter={mapCenter} />
    </>
  );
}
