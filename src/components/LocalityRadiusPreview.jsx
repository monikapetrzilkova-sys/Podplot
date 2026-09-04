import { useEffect, useState } from "react";
import EventLocationMap from "./EventLocationMap.jsx";
import MapRadiusControl from "./map/MapRadiusControl.jsx";
import { geocodeCzechAddress } from "../data/addressAutocomplete.js";
import { pscDigits } from "../data/addressValidation.js";
import { CZECHIA_BOUNDS, CZECHIA_CENTER } from "../data/czechiaMapView.js";
import {
  MIN_NEIGHBOR_RADIUS_KM,
  MAX_NEIGHBOR_RADIUS_KM,
  clampNeighborRadius,
} from "../data/mapRadiusSettings.js";
import { buildMapPickResult } from "../utils/geoCoordinates.js";

export default function LocalityRadiusPreview({
  street,
  houseNumber,
  psc,
  city,
  radiusKm,
  onRadiusChange,
  pin,
  onPinChange,
}) {
  const [status, setStatus] = useState("idle");

  const streetReady =
    String(street ?? "").trim().length >= 2 && Boolean(String(houseNumber ?? "").trim());
  const localityReady = pscDigits(psc).length === 5 && String(city ?? "").trim().length >= 2;
  const canGeocode = streetReady || localityReady;
  const hasPin = pin?.lat != null && (pin?.lng != null || pin?.lon != null);
  const pinLat = hasPin ? Number(pin.lat) : null;
  const pinLng = hasPin ? Number(pin.lng ?? pin.lon) : null;

  useEffect(() => {
    if (!canGeocode) {
      setStatus("idle");
      if (hasPin) onPinChange?.(null);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus("loading");
      const geo = await geocodeCzechAddress({
        street,
        houseNumber,
        psc: pscDigits(psc),
        city,
        fullAddress: `${street} ${houseNumber}, ${psc} ${city}`.replace(/\s+/g, " ").trim(),
      });
      if (cancelled) return;
      if (geo?.lat != null && geo.lng != null) {
        const center = { lat: geo.lat, lng: geo.lng };
        onPinChange?.(buildMapPickResult(geo.lat, geo.lng, center, radiusKm));
        setStatus("ready");
        return;
      }
      setStatus("missing");
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [street, houseNumber, psc, city, canGeocode]); // eslint-disable-line react-hooks/exhaustive-deps -- geocode from address only

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-stone-600">Tvoje okolí na mapě</p>
      {!canGeocode ? (
        <p className="text-[11px] text-stone-400 leading-relaxed">
          Mapa ukazuje celé Česko. Jakmile doplníš adresu (nebo PSČ a obec), přiblíží se na tvoji lokalitu.
        </p>
      ) : null}
      {canGeocode && status === "loading" && !hasPin ? (
        <p className="text-[11px] text-stone-400">Hledám místo na mapě…</p>
      ) : null}
      <EventLocationMap
        pickMode
        draftPin={hasPin ? pin : null}
        onPickPin={onPinChange}
        address={[street, houseNumber, city].filter(Boolean).join(" ")}
        mapCenter={hasPin ? { lat: pinLat, lng: pinLng } : CZECHIA_CENTER}
        fitBounds={hasPin ? null : CZECHIA_BOUNDS}
        radiusKm={radiusKm}
        compact
        hidePickHint
        showRadiusCircle={hasPin}
        pickUnconstrained
        focusDraftPin={hasPin}
      />
      {status === "missing" && !hasPin ? (
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Adresu jsme zatím nenašli na mapě. Zkontroluj PSČ a ulici — můžeš pokračovat a místo upřesnit později v
          profilu.
        </p>
      ) : null}
      <MapRadiusControl
        id="neighbor-radius"
        label="Nastav si okruh, který tě zajímá."
        hint="Uvidíš příspěvky sousedů v tomto okruhu. Ve velkém městě stačí 1–2 km — nestačí jen název města."
        value={radiusKm}
        min={MIN_NEIGHBOR_RADIUS_KM}
        max={MAX_NEIGHBOR_RADIUS_KM}
        step={0.5}
        onChange={(km) => onRadiusChange?.(clampNeighborRadius(km))}
      />
    </div>
  );
}
