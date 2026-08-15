import ReportsMap from "./ReportsMap.jsx";

/** Mapa místa akce — oddělená od hlášení, jen pro události */
export default function EventLocationMap({
  mapPos = null,
  pickMode = false,
  draftPin = null,
  onPickPin,
  address = "",
  compact = false,
}) {
  const pin = pickMode ? draftPin : mapPos;
  const reports = pin && !pickMode ? [{ id: "event-pin", mapPos: pin, type: "Místo akce", urgent: false }] : [];

  return (
    <div>
      <ReportsMap
        reports={reports}
        pickMode={pickMode}
        draftPin={draftPin}
        onPickPin={onPickPin}
        selectedReportId={!pickMode && pin ? "event-pin" : null}
        singleReportMode={!pickMode && Boolean(pin)}
        showHomePin={!pickMode}
        compact={compact}
        hideLegend
        hideStats={pickMode}
        userAddress={address}
        areaLabel={address ? address.split(",").pop()?.trim() : undefined}
        homeLabel="Vaše okolí"
      />
      {pickMode && (
        <p className="text-[11px] text-stone-500 mt-1.5">
          {draftPin
            ? "Místo se doplnilo z adresy. Klepnutím na mapu ho můžete upřesnit."
            : "Po zadání adresy se místo na mapě doplní samo."}
        </p>
      )}
    </div>
  );
}
