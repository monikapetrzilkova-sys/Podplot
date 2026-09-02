import { useRef, useState, useEffect, useId, useMemo } from "react";
import { IconMapPin } from "../data/icons.jsx";
import {
  MAP_CENTER,
  GEO_LABELS,
  requestUserGeolocation,
  centerFromAddress,
  eventToMapPos,
} from "../data/mapData.js";
import {
  DEFAULT_EVENTS_MAP_RADIUS_KM,
  DEFAULT_REPORTS_MAP_RADIUS_KM,
  DEFAULT_THINGS_MAP_RADIUS_KM,
  formatMapRadiusKm,
  mapRadiusToEllipsePercent,
} from "../data/mapRadiusSettings.js";
import { institutionPinVariant, INSTITUTION_LEGEND } from "../data/institutionsMapData.js";
import { thingPinVariant, thingPinEmoji } from "../utils/thingsModule.js";
import { servicePinVariant } from "../utils/servicesModule.js";
import { isMunicipalityUrgent } from "../data/reportUrgency.js";
import {
  buildReportDisplayPositions,
  isValidMapPos,
  reportPinShortLabel,
  reportPinVariant,
  shouldShowReportPinLabel,
} from "../utils/reportPinUtils.js";
import { ReportPinIcon } from "./module/reportPinIcons.jsx";
import MapPinPopover from "./module/MapPinPopover.jsx";
import { PlaceIcon, ServicePlaceIcon } from "./module/placeIcons.jsx";
import MapPickHint from "./map/MapPickHint.jsx";
import { MAP_PIN_H, MAP_PIN_W, mapPinDisplaySize, mapPinTeardropPath } from "../utils/mapPinShape.js";

/** Sleduje menší rozměr mapy — okruh radiusu zůstane kruh, ne elipsa. */
function useMapMinDimension(mapRef) {
  const [minSize, setMinSize] = useState(0);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setMinSize(Math.min(width, height));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mapRef]);

  return minSize;
}

/** Pravidelný kruh okruhu — velikost podle min(w,h), ne roztažená elipsa SVG. */
function MapRadiusRing({ minSize, radiusPercent, className = "", style = {} }) {
  if (!minSize || !radiusPercent) return null;

  const diameter = minSize * (radiusPercent / 100) * 2;
  const size = Math.min(diameter, minSize * 0.96);

  return (
    <div
      aria-hidden
      className={`absolute pointer-events-none rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        ...style,
      }}
    />
  );
}

function mapRadiusPercent(radiusKm, defaultRadiusKm) {
  return mapRadiusToEllipsePercent(radiusKm, defaultRadiusKm);
}

function MapPin({
  x,
  y,
  variant = "default",
  label,
  pulse = false,
  onClick,
  selected,
  iconNode,
  emoji,
  pinLabel,
  showPinLabel = false,
  emphasize = false,
}) {
  const colors = {
    home: { bg: "#1B4332", border: "#40916C" },
    urgent: { bg: "#A85858", border: "#8F4545" },
    urgentMunicipality: { bg: "#8F4545", border: "#6B3333" },
    default: { bg: "#B7E4C7", border: "#2D6A4F" },
    draft: { bg: "#A85858", border: "#D95D39" },
    event: { bg: "#40916C", border: "#1B4332" },
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
    thingDaruji: { bg: "#E9C46A", border: "#F4A261" },
    thingProdam: { bg: "#457B9D", border: "#1D3557" },
    thingShanim: { bg: "#F72585", border: "#B5179E" },
    thingPujcovna: { bg: "#2A9D8F", border: "#1B4332" },
    thingDefault: { bg: "#ADB5BD", border: "#495057" },
    serviceCraft: { bg: "#E76F51", border: "#D95D39" },
    institutionGastro: { bg: "#F4A261", border: "#E76F51" },
    reportDefault: { bg: "#95D5B2", border: "#40916C" },
    reportLoss: { bg: "#74C69D", border: "#2D6A4F" },
    reportAnimal: { bg: "#52B788", border: "#1B4332" },
    reportInfra: { bg: "#40916C", border: "#1B4332" },
    reportDamage: { bg: "#3D7A68", border: "#1B4332" },
    reportPublic: { bg: "#2D6A4F", border: "#1B4332" },
    reportFire: { bg: "#5a9587", border: "#1B4332" },
    reportWarn: { bg: "#4d8b7a", border: "#1B4332" },
    reportTip: { bg: "#C5D97A", border: "#6B8E23" },
  };
  const c = colors[variant] ?? colors.default;

  return (
    <button
      type="button"
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`absolute focus:outline-none ${onClick ? "cursor-pointer" : "cursor-default"} ${
        selected ? "z-[18]" : emphasize ? "z-[16]" : showPinLabel ? "z-[14]" : "z-10"
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <span className="relative flex items-end gap-1">
        {pulse && (
          <span
            className="absolute left-1/2 bottom-1 -translate-x-1/2 w-10 h-10 rounded-full animate-ping pointer-events-none"
            style={{ background: "rgba(64, 145, 108, 0.25)" }}
            aria-hidden
          />
        )}
        <span
          className={`relative shrink-0 overflow-visible transition-transform ${
            selected ? "scale-110" : emphasize ? "scale-105" : ""
          }`}
          style={{
            width: mapPinDisplaySize(selected).w,
            height: mapPinDisplaySize(selected).h,
          }}
        >
          <svg
            viewBox={`0 0 ${MAP_PIN_W} ${MAP_PIN_H}`}
            className="absolute inset-0 w-full h-full overflow-visible drop-shadow-md"
            aria-hidden
          >
            <path
              d={mapPinTeardropPath()}
              fill={c.bg}
              stroke={c.border}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="absolute left-1/2 flex items-center justify-center text-white pointer-events-none"
            style={{ top: "32%", transform: "translate(-50%, -50%)" }}
          >
            {iconNode ?? (emoji ? (
              <span className="text-sm leading-none">{emoji}</span>
            ) : (
              <IconMapPin className="w-3.5 h-3.5" style={{ strokeWidth: 1.5 }} />
            ))}
          </span>
        </span>
        {showPinLabel && pinLabel && (
          <span
            className={`pp-map-pin-label ${selected ? "pp-map-pin-label--selected" : ""} ${
              emphasize ? "pp-map-pin-label--mine" : ""
            } ${
              variant === "urgent" || variant === "urgentMunicipality" ? "pp-map-pin-label--urgent" : ""
            }`}
          >
            {pinLabel}
          </span>
        )}
      </span>
    </button>
  );
}

export default function ReportsMap({
  reports = [],
  events = [],
  institutions = [],
  things = [],
  services = [],
  mapMode = "reports",
  radiusKm,
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
  compact = false,
  userAddress = "",
  userGeo = null,
  areaLabel: areaLabelOverride = "",
  homeLabel = "Domov",
  urgentCount = 0,
  totalCount = 0,
  hideLegend = false,
  legendCollapsible = false,
  hideStats = false,
  large = false,
  fluid = false,
  institutionPopup = null,
  draftPinOnly = false,
  className = "",
}) {
  const isEventsMode = mapMode === "events";
  const isInstitutionsMode = mapMode === "institutions";
  const isThingsMode = mapMode === "things";
  const isServicesMode = mapMode === "services";
  const defaultRadiusKm = isEventsMode
    ? DEFAULT_EVENTS_MAP_RADIUS_KM
    : isThingsMode
      ? DEFAULT_THINGS_MAP_RADIUS_KM
      : DEFAULT_REPORTS_MAP_RADIUS_KM;
  const mapRef = useRef(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const effectiveRadiusKm = radiusKm ?? defaultRadiusKm;
  const radiusPercent = mapRadiusPercent(effectiveRadiusKm, defaultRadiusKm);
  const mapMinSize = useMapMinDimension(mapRef);
  const gridPatternId = useId().replace(/:/g, "");
  const [geoMode, setGeoMode] = useState("loading");
  const [areaLabel, setAreaLabel] = useState("");

  useEffect(() => {
    let cancelled = false;
    requestUserGeolocation().then((result) => {
      if (cancelled) return;
      const fromAddr = centerFromAddress(userAddress, userGeo);
      setAreaLabel(areaLabelOverride || fromAddr.label);
      setGeoMode(result.mode === "gps" ? "gps" : userAddress ? "address" : "default");
    });
    return () => {
      cancelled = true;
    };
  }, [userAddress, userGeo, areaLabelOverride]);

  const handleMapClick = (e) => {
    if (pickMode && onPickPin && mapRef.current) {
      onPickPin(eventToMapPos(e, mapRef.current));
      return;
    }
    if (isInstitutionsMode && institutionPopup?.onClose) {
      institutionPopup.onClose();
    }
  };

  const visibleReports = draftPinOnly
    ? []
    : singleReportMode
      ? selectedReportId
        ? reports.filter((r) => r.id === selectedReportId && isValidMapPos(r.mapPos))
        : []
      : reports.filter((r) => isValidMapPos(r.mapPos));

  const reportDisplayPositions = useMemo(
    () => buildReportDisplayPositions(visibleReports, MAP_CENTER),
    [visibleReports]
  );

  const visibleEvents = events.filter((e) => e.mapPos);
  const visibleInstitutions = institutions.filter(
    (p) => p.mapPos || (p.lat != null && p.lng != null)
  );
  const visibleThings = things.filter((t) => t.mapPos);
  const visibleServices = services.filter((s) => s.mapPos);

  const hasMunicipalityUrgent = visibleReports.some(isMunicipalityUrgent);
  const municipalityUrgentCount = visibleReports.filter(isMunicipalityUrgent).length;
  const localUrgentCount = visibleReports.filter((r) => r.urgent && !isMunicipalityUrgent(r)).length;

  const pinVariant = reportPinVariant;

  const mapAriaLabel = singleReportMode
    ? "Mapa vybraného hlášení"
    : isInstitutionsMode
      ? "Mapa institucí a podniků"
      : isThingsMode
        ? "Mapa nabídek v okolí"
        : isServicesMode
          ? "Mapa řemeslníků a služeb"
          : isEventsMode
        ? "Mapa akcí v okolí"
        : "Mapa hlášení v okolí";

  const statsTitle = singleReportMode
    ? "Místo hlášení"
    : isInstitutionsMode
      ? `Mapa míst · ${areaLabel || "lokalita"}`
      : isThingsMode
        ? `Mapa věcí · ${areaLabel || "lokalita"} · okruh ${formatMapRadiusKm(effectiveRadiusKm)}`
        : isServicesMode
          ? `Mapa služeb · ${areaLabel || "lokalita"}`
          : isEventsMode
        ? `Mapa akcí · ${areaLabel || "lokalita"} · okruh ${formatMapRadiusKm(effectiveRadiusKm)}`
        : `Mapa hlášení · ${areaLabel || "lokalita"} · okruh ${formatMapRadiusKm(effectiveRadiusKm)}`;

  return (
    <div
      className={`${compact ? "mb-0" : large ? "mb-3" : "mb-5"} ${
        fluid ? "pp-map-reports-wrap flex flex-col flex-1 min-h-0" : ""
      } ${className}`.trim()}
    >
      <div
        ref={mapRef}
        role={pickMode ? "button" : "img"}
        tabIndex={pickMode ? 0 : undefined}
        onClick={handleMapClick}
        onKeyDown={(e) => {
          if (pickMode && (e.key === "Enter" || e.key === " ")) {
            onPickPin?.({ x: MAP_CENTER.x, y: MAP_CENTER.y });
          }
        }}
        className={`pp-map-container relative select-none ${
          fluid ? "flex-1 min-h-0" : compact ? "h-36" : large ? "h-72" : "h-52"
        } ${pickMode ? "pp-map-container--pick ring-2 ring-[#A85858]/40 ring-offset-2" : ""}`}
        aria-label={mapAriaLabel}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#D8F3DC] via-[#F4F6F4] to-[#B7E4C7]/60" />
        <svg className="absolute inset-0 w-full h-full opacity-35" aria-hidden>
          <defs>
            <pattern id={gridPatternId} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#40916C" strokeWidth="0.35" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
          {!singleReportMode && !draftPinOnly && !isInstitutionsMode && (
            <ellipse
              cx="50%"
              cy="50%"
              rx={`${radiusPercent}%`}
              ry={`${radiusPercent}%`}
              fill="none"
              stroke={isThingsMode ? "#457B9D" : isServicesMode ? "#E76F51" : isEventsMode ? "#40916C" : "#2D6A4F"}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.55"
            />
          )}
          {!isEventsMode && !isInstitutionsMode && !isThingsMode && !draftPinOnly &&
            (hasMunicipalityUrgent || (singleReportMode && visibleReports.some(isMunicipalityUrgent))) && (
              <ellipse
                cx="50%"
                cy="50%"
                rx="46%"
                ry="46%"
                fill="rgba(168, 88, 88, 0.08)"
                stroke="#A85858"
                strokeWidth="2"
                strokeDasharray="8 5"
                opacity="0.85"
              />
            )}
        </svg>

        {showHomePin && !singleReportMode && (
          <>
            <MapPin
              x={MAP_CENTER.x}
              y={MAP_CENTER.y}
              variant="home"
              label={GEO_LABELS[geoMode] ?? GEO_LABELS.default}
              pulse
            />
            <span
              className="absolute z-10 text-[9px] font-bold px-2 py-0.5 rounded-full pp-badge-pill pp-badge-emerald shadow-sm"
              style={{ left: `${MAP_CENTER.x}%`, top: `${MAP_CENTER.y + 5}%`, transform: "translateX(-50%)" }}
            >
              {homeLabel}
            </span>
          </>
        )}

        {!isEventsMode && !isInstitutionsMode &&
          visibleReports.map((r) => {
            const selected = selectedReportId === r.id;
            const showLabel = shouldShowReportPinLabel(r, selectedReportId);
            const displayPos = reportDisplayPositions.get(r.id) ?? r.mapPos;
            return (
              <MapPin
                key={r.id}
                x={displayPos.x}
                y={displayPos.y}
                variant={pinVariant(r)}
                iconNode={<ReportPinIcon report={r} />}
                pinLabel={reportPinShortLabel(r)}
                showPinLabel={showLabel}
                emphasize={Boolean(r.mine)}
                label={`${r.type}${r.urgent ? (isMunicipalityUrgent(r) ? " · urgentní · celá obec" : " · urgentní · okolí místa") : ""}`}
                selected={selected}
                onClick={onReportPinClick ? () => onReportPinClick(r) : undefined}
              />
            );
          })}

        {isEventsMode &&
          visibleEvents.map((ev) => (
            <MapPin
              key={ev.id}
              x={ev.mapPos.x}
              y={ev.mapPos.y}
              variant="event"
              label={ev.title}
              selected={selectedEventId === ev.id}
              onClick={onEventPinClick ? () => onEventPinClick(ev) : undefined}
            />
          ))}

        {isInstitutionsMode &&
          visibleInstitutions.map((place) => {
            const pos = place.mapPos?.x != null ? place.mapPos : null;
            if (!pos) return null;
            return (
              <MapPin
                key={place.id}
                x={pos.x}
                y={pos.y}
                variant={institutionPinVariant(place)}
                iconNode={<PlaceIcon place={place} className="w-4 h-4" pin />}
                label={place.name}
                selected={selectedInstitutionId === place.id}
                onClick={onInstitutionPinClick ? () => onInstitutionPinClick(place) : undefined}
              />
            );
          })}

        {isThingsMode &&
          visibleThings.map((item) => (
            <MapPin
              key={item.id}
              x={item.mapPos.x}
              y={item.mapPos.y}
              variant={thingPinVariant(item)}
              emoji={thingPinEmoji(item)}
              label={item.label}
              selected={selectedThingId === item.id}
              onClick={onThingPinClick ? () => onThingPinClick(item) : undefined}
            />
          ))}

        {isServicesMode &&
          visibleServices.map((svc) => (
            <MapPin
              key={svc.id}
              x={svc.mapPos.x}
              y={svc.mapPos.y}
              variant={servicePinVariant(svc)}
              iconNode={<ServicePlaceIcon service={svc} className="w-3.5 h-3.5" pin />}
              label={svc.label}
              selected={selectedServiceId === svc.id}
              onClick={onServicePinClick ? () => onServicePinClick(svc) : undefined}
            />
          ))}

        {draftPin && (
          <MapPin
            x={draftPin.x}
            y={draftPin.y}
            variant="draft"
            label="Nové hlášení — vybrané místo"
            selected
          />
        )}

        {pickMode && !draftPin && <MapPickHint className="z-20" />}

        {singleReportMode && visibleReports.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 px-4 text-center">
            K tomuto hlášení není na mapě uvedeno místo.
          </div>
        )}

        {isThingsMode && visibleThings.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 px-4 text-center">
            V okruhu {formatMapRadiusKm(effectiveRadiusKm)} nejsou žádné nabídky.
          </div>
        )}

        {isInstitutionsMode && visibleInstitutions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 px-4 text-center">
            V této kategorii nejsou žádná místa ve tvé lokalitě.
          </div>
        )}

        {isServicesMode && visibleServices.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 px-4 text-center">
            Ve filtru nejsou žádní poskytovatelé služeb.
          </div>
        )}

        {isInstitutionsMode && institutionPopup?.place?.mapPos && (
          <MapPinPopover
            x={institutionPopup.place.mapPos.x}
            y={institutionPopup.place.mapPos.y}
            iconNode={<PlaceIcon place={institutionPopup.place} className="w-6 h-6" />}
            title={institutionPopup.place.name}
            subtitle={institutionPopup.place.tagline}
            meta={[institutionPopup.place.distance, institutionPopup.place.hours].filter(Boolean).join(" · ")}
            onDetail={institutionPopup.onDetail}
            onClose={institutionPopup.onClose}
          />
        )}

        {isEventsMode && !pickMode && visibleEvents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 px-4 text-center">
            V okruhu {formatMapRadiusKm(effectiveRadiusKm)} nejsou žádné nadcházející akce.
          </div>
        )}
      </div>

      {!hideStats && (
        <div className="flex items-start justify-between gap-2 mt-3 px-0.5">
          <div>
            <p className="text-sm font-semibold flex items-center gap-1" style={{ color: "#1B4332" }}>
              <IconMapPin className="w-4 h-4 shrink-0" />
              {statsTitle}
            </p>
            {!singleReportMode && (
              <p className="text-xs text-stone-500 mt-0.5">
                {geoMode === "loading" ? GEO_LABELS.loading : GEO_LABELS[geoMode]}
                {areaLabel ? ` · ${areaLabel}` : ""}
              </p>
            )}
          </div>
          {!singleReportMode && (
            <p className="text-xs font-medium shrink-0 text-right" style={{ color: "#2D6A4F" }}>
              {isThingsMode ? (
                <>
                  {totalCount} {totalCount === 1 ? "nabídka" : totalCount >= 2 && totalCount <= 4 ? "nabídky" : "nabídek"}
                  <br />
                  <span className="text-stone-500">v okruhu</span>
                </>
              ) : isInstitutionsMode ? (
                <>
                  {totalCount} {totalCount === 1 ? "místo" : totalCount >= 2 && totalCount <= 4 ? "místa" : "míst"}
                  <br />
                  <span className="text-stone-500">ve filtru</span>
                </>
              ) : isServicesMode ? (
                <>
                  {totalCount} {totalCount === 1 ? "poskytovatel" : "poskytovatelů"}
                  <br />
                  <span className="text-stone-500">v dosahu</span>
                </>
              ) : isEventsMode ? (
                <>
                  {totalCount} {totalCount === 1 ? "akce" : totalCount >= 2 && totalCount <= 4 ? "akce" : "akcí"}
                  <br />
                  <span className="text-stone-500">v okruhu</span>
                </>
              ) : (
                <>
                  {urgentCount} urgentní
                  {municipalityUrgentCount > 0 && (
                    <>
                      <br />
                      <span className="text-[#A85858]">{municipalityUrgentCount} celá obec</span>
                    </>
                  )}
                  {localUrgentCount > 0 && municipalityUrgentCount > 0 && (
                    <>
                      <br />
                      <span className="text-stone-500">{localUrgentCount} okolí místa</span>
                    </>
                  )}
                  <br />
                  {totalCount} celkem
                </>
              )}
            </p>
          )}
        </div>
      )}

      {!hideLegend && !singleReportMode && (
        legendCollapsible ? (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => setLegendOpen((open) => !open)}
              className="text-xs font-medium text-stone-500 hover:text-stone-700 underline underline-offset-2"
              aria-expanded={legendOpen}
            >
              Legenda {legendOpen ? "▲" : "▼"}
            </button>
            {legendOpen && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-[10px] text-stone-500">
                {isInstitutionsMode ? (
                  INSTITUTION_LEGEND.map((item) => (
                    <span key={item.label} className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />{" "}
                      {item.label}
                    </span>
                  ))
                ) : isEventsMode ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#1B4332" }} /> {homeLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#40916C" }} /> Akce
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-dashed shrink-0"
                        style={{ borderColor: "#40916C" }}
                      />{" "}
                      Okruh {formatMapRadiusKm(effectiveRadiusKm)}
                    </span>
                  </>
                ) : isThingsMode ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#1B4332" }} /> {homeLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#D95D39" }} /> Daruji / Prodám
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#40916C" }} /> Půjčovna
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#F4A261" }} /> Sháním
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#1B4332" }} /> {homeLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#A85858" }} /> Urgentní · okolí
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full ring-2 ring-[#A85858]/40 shrink-0"
                        style={{ background: "#8F4545" }}
                      />{" "}
                      Urgentní · celá obec
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#B7E4C7" }} /> Ostatní
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-stone-500">
            {isInstitutionsMode ? (
              INSTITUTION_LEGEND.map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: item.color }} /> {item.label}
                </span>
              ))
            ) : isEventsMode ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#1B4332" }} /> {homeLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#40916C" }} /> Akce
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#1B4332" }} /> {homeLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#A85858" }} /> Urgentní · okolí
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full ring-2 ring-[#A85858]/40" style={{ background: "#8F4545" }} />{" "}
                  Urgentní · celá obec
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: "#B7E4C7" }} /> Ostatní
                </span>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
