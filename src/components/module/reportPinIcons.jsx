/** Monochromatické ikony hlášení na mapě — line-art v paletě Podplot */

import { classifyReportType } from "../../utils/reportPinUtils.js";

const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconReportPin({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

export function IconReportSearch({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M15 15l4.5 4.5" />
    </svg>
  );
}

export function IconReportPaw({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <ellipse cx="8" cy="8.5" rx="1.8" ry="2.2" />
      <ellipse cx="12" cy="6.5" rx="1.8" ry="2.2" />
      <ellipse cx="16" cy="8.5" rx="1.8" ry="2.2" />
      <ellipse cx="10" cy="12" rx="1.6" ry="2" />
      <ellipse cx="14" cy="12" rx="1.6" ry="2" />
      <path d="M9 14.5c1 2.5 5 2.5 6 0" />
    </svg>
  );
}

export function IconReportFlame({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 22c4-3 6-6.5 6-10a6 6 0 0 0-10.5-4C8 6 6 7.5 5 10c-1.5 4 2 8.5 7 12z" />
    </svg>
  );
}

export function IconReportAlert({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

export function IconReportBolt({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6z" />
    </svg>
  );
}

export function IconReportWater({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M12 3c3 5 6 8.5 6 12a6 6 0 1 1-12 0c0-3.5 3-7 6-12z" />
    </svg>
  );
}

export function IconReportLight({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-3 11v1h6v-1a6 6 0 0 0-3-11z" />
    </svg>
  );
}

export function IconReportBarrier({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 20h16M6 20V8l6-4 6 4v12" />
      <path d="M9 12h1M14 12h1M9 16h1M14 16h1" />
    </svg>
  );
}

export function IconReportMegaphone({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M4 10v4h4l6 4V6L8 10H4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

export function IconReportTip({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a6 6 0 0 0-3 11v1h6v-1a6 6 0 0 0-3-11z" />
      <path d="M10.5 12.5h3" opacity="0.7" />
    </svg>
  );
}

export function IconReportBike({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...s}>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17 11 8h3l2 3h3M11 8l3 9M14 11h-3" />
    </svg>
  );
}

const REPORT_ICON_BY_CATEGORY = {
  loss: IconReportSearch,
  animal: IconReportPaw,
  fire: IconReportFlame,
  warning: IconReportAlert,
  infrastructure: IconReportAlert,
  tip: IconReportTip,
  damage: IconReportBarrier,
  public: IconReportMegaphone,
  default: IconReportPin,
};

export function getReportPinIconComponent(report) {
  const category = classifyReportType(report?.type, report?.body, report?.reportCategoryId);
  if (category === "warning" || category === "infrastructure") {
    const t = `${report?.type ?? ""} ${report?.body ?? ""}`.toLowerCase();
    if (/voda|vodovod/.test(t)) return IconReportWater;
    if (/osvětlen|lamp/.test(t)) return IconReportLight;
    if (/proud|elektr|výpadek/.test(t)) return IconReportBolt;
    return IconReportAlert;
  }
  if (category === "loss") {
    const t = `${report?.type ?? ""}`.toLowerCase();
    if (/kolo|odcizen|krádež/.test(t)) return IconReportBike;
    return IconReportSearch;
  }
  return REPORT_ICON_BY_CATEGORY[category] ?? IconReportPin;
}

export function ReportPinIcon({ report, className = "w-3.5 h-3.5" }) {
  const Icon = getReportPinIconComponent(report);
  return <Icon className={className} />;
}
