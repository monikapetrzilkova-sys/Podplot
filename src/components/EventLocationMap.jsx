import MapComponent from "./module/MapComponent.jsx";
import { useApp } from "../context/AppContext.jsx";

/** Mapa místa akce — Google Maps (stejně jako hlášení), s fallbackem */
export default function EventLocationMap({
  mapPos = null,
  pickMode = false,
  draftPin = null,
  onPickPin,
  address = "",
  compact = false,
  mapCenter = null,
  radiusKm = null,
  homeLabel = "Tvoje okolí",
  fitBounds = null,
  hidePickHint = false,
  showRadiusCircle = false,
  pickUnconstrained = false,
  focusDraftPin = null,
}) {
  const { activeLocation, user } = useApp();
  const pin = pickMode ? draftPin : mapPos;
  const events =
    pin && !pickMode
      ? [{ id: "event-pin", mapPos: pin, title: "Místo akce", lat: pin.lat, lng: pin.lng }]
      : [];
  const shouldFocusDraft = focusDraftPin ?? (pickMode && Boolean(draftPin));

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-stone-200">
      <MapComponent
        mapMode="events"
        events={events}
        pickMode={pickMode}
        draftPin={draftPin}
        onPickPin={onPickPin}
        selectedEventId={!pickMode && pin ? "event-pin" : null}
        showHomePin={!pickMode}
        compact={compact}
        hideLegend
        hideStats={pickMode}
        hidePickHint={hidePickHint}
        userAddress={address || activeLocation?.address || user?.address || ""}
        areaLabel={
          address
            ? address.split(",").pop()?.trim()
            : activeLocation?.shortLabel
        }
        homeLabel={homeLabel}
        mapCenter={mapCenter}
        fitBounds={fitBounds}
        radiusKm={radiusKm}
        focusDraftPin={shouldFocusDraft}
        draftPinOnly={pickMode}
        showRadiusCircle={showRadiusCircle}
        pickUnconstrained={pickUnconstrained}
        large={false}
        className="mb-0"
      />
      {pickMode && (
        <p className="text-[11px] text-stone-500 px-2.5 py-2 bg-stone-50 border-t border-stone-100">
          {draftPin
            ? "Místo je na mapě — klepnutím nebo posunutím špendlíku ho můžeš upřesnit."
            : "Zadej adresu výše — mapa se sama přiblíží na tvoji lokalitu."}
        </p>
      )}
    </div>
  );
}
