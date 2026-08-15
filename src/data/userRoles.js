/** Aplikační role — Soused / Úřad / Podnik·Služba */

export const APP_ROLES = {
  NEIGHBOR: "NEIGHBOR",
  OFFICE: "OFFICE",
  BUSINESS: "BUSINESS",
  /** @deprecated alias */
  INSTITUTION: "OFFICE",
  /** @deprecated alias */
  CRAFTSMAN: "BUSINESS",
};

/** @deprecated aliasy pro starší importy */
export const LEGACY_APP_ROLES = {
  INSTITUTION: APP_ROLES.OFFICE,
  CRAFTSMAN: APP_ROLES.BUSINESS,
  BUSINESS: APP_ROLES.BUSINESS,
};

export const TEST_ROLE_TO_APP = {
  soused: APP_ROLES.NEIGHBOR,
  urad: APP_ROLES.OFFICE,
  instituce: APP_ROLES.OFFICE,
  podnik: APP_ROLES.BUSINESS,
  remeslnik: APP_ROLES.BUSINESS,
  podnik_fyzicka: APP_ROLES.BUSINESS,
  podnik_mobilni: APP_ROLES.BUSINESS,
};

export function getAppRoleFromTestId(testRoleId) {
  return TEST_ROLE_TO_APP[testRoleId] ?? APP_ROLES.NEIGHBOR;
}

export function getAppRoleFromUser(user) {
  if (!user) return APP_ROLES.NEIGHBOR;
  const type = user.accountType;
  if (type === "urad" || type === "instituce") return APP_ROLES.OFFICE;
  if (type === "podnik" || type === "remeslnik") return APP_ROLES.BUSINESS;
  return APP_ROLES.NEIGHBOR;
}

export function isB2BRole(appRole) {
  return appRole !== APP_ROLES.NEIGHBOR;
}

export function isMobilniTestRole(testRoleId) {
  return testRoleId === "remeslnik" || testRoleId === "podnik_mobilni";
}

export function isFyzickaTestRole(testRoleId) {
  return testRoleId === "podnik" || testRoleId === "podnik_fyzicka";
}
