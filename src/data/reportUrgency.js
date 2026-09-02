/** Rozsah urgentního hlášení — lokální bod vs. celá obec */

export const URGENT_SCOPE = {
  LOCAL: "local",
  MUNICIPALITY: "municipality",
};

export const URGENT_LOCAL_RADIUS_M = 300;

export const URGENCY_REACH_COPY = {
  intro:
    "Urgentní hlášení může platit pro konkrétní místo (sousedi v okolí) nebo pro celou obec. Obyčejná hlášení jsou viditelná v mapě v okruhu tvé lokality.",
  local: `Konkrétní místo — nejbližší sousedé v okruhu cca ${URGENT_LOCAL_RADIUS_M} m od špendlíku.`,
  municipality: "Celá obec — varování vidí všichni v aktivní lokalitě (např. celá Jesenice).",
};

export function isMunicipalityUrgent(report) {
  return Boolean(report?.urgent && report?.urgentScope === URGENT_SCOPE.MUNICIPALITY);
}

export function getUrgentReachLabel(report) {
  if (!report?.urgent) return null;
  if (isMunicipalityUrgent(report)) return "Celá obec";
  return `Okolí místa · cca ${URGENT_LOCAL_RADIUS_M} m`;
}

export function resolveReportDistance(report, pointDistance) {
  if (isMunicipalityUrgent(report)) return "celá obec";
  return pointDistance ?? report.distance ?? "—";
}

export function describeUrgentAudience(report, municipalityName = "obec") {
  if (isMunicipalityUrgent(report)) {
    return `Varování pro celou lokalitu (${municipalityName})`;
  }
  return `Varování pro sousedy do ${URGENT_LOCAL_RADIUS_M} m od místa`;
}

export function canSetMunicipalityUrgent({ isInstitution, isAdminMode }) {
  return isInstitution || isAdminMode;
}
