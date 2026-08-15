import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import MapComponent from "../components/module/MapComponent.jsx";
import { filterReportsForMapView } from "../data/geoFilter.js";

export default function ReportsMapModule({
  reports,
  pickMode = false,
  draftPin = null,
  onPickPin,
  onReportPinClick,
  selectedReportId = null,
  large = true,
  legendCollapsible = true,
  hideLegend = false,
  hideStats = false,
  compact = false,
  singleReportMode = false,
  showHomePin = true,
  focusDraftPin = false,
  draftPinOnly = false,
  className = "",
}) {
  const { user, activeLocation, reportsMapRadiusKm } = useApp();

  const reportsForMap = useMemo(
    () =>
      draftPinOnly
        ? []
        : singleReportMode
          ? reports
          : filterReportsForMapView(reports, reportsMapRadiusKm),
    [reports, reportsMapRadiusKm, singleReportMode, draftPinOnly]
  );

  const urgentCount = useMemo(() => reportsForMap.filter((r) => r.urgent).length, [reportsForMap]);

  return (
    <MapComponent
      mapMode="reports"
      radiusKm={reportsMapRadiusKm}
      reports={reportsForMap}
      pickMode={pickMode}
      draftPin={draftPin}
      onPickPin={onPickPin}
      onReportPinClick={onReportPinClick}
      selectedReportId={selectedReportId}
      singleReportMode={singleReportMode}
      showHomePin={showHomePin}
      compact={compact}
      large={large}
      hideLegend={hideLegend || pickMode}
      legendCollapsible={legendCollapsible && !pickMode}
      hideStats={hideStats}
      userAddress={activeLocation?.address ?? user?.address ?? ""}
      userGeo={user?.geo ?? null}
      areaLabel={activeLocation?.shortLabel}
      homeLabel={activeLocation?.label ?? "Domov"}
      urgentCount={urgentCount}
      totalCount={reportsForMap.length}
      focusDraftPin={focusDraftPin}
      draftPinOnly={draftPinOnly}
      className={className}
    />
  );
}
