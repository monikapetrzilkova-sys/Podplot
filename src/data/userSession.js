/** Perzistence účtu testera v prohlížeči (přežije refresh i deploy na Vercelu). */

export const USER_SESSION_KEY = "podplot-user-session-v1";

const empty = () => null;

export function loadUserSession() {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (!data?.user?.id || !data?.user?.name) return empty();
    return {
      user: data.user,
      locations: Array.isArray(data.locations) ? data.locations : null,
      activeLocationId: data.activeLocationId || "domov",
      credits: typeof data.credits === "number" ? data.credits : null,
      userProfileIds: Array.isArray(data.userProfileIds) ? data.userProfileIds : ["soused"],
      testRoleId: data.testRoleId ?? "soused",
      ownedService: data.ownedService ?? null,
      /** Záloha registrované identity (jméno/e-mail) — nesmí ji přepsat demo role */
      citizenProfile: data.citizenProfile ?? null,
      savedAt: data.savedAt ?? null,
    };
  } catch {
    return empty();
  }
}

export function persistUserSession(session) {
  try {
    if (!session?.user) {
      localStorage.removeItem(USER_SESSION_KEY);
      return;
    }
    localStorage.setItem(
      USER_SESSION_KEY,
      JSON.stringify({
        user: session.user,
        locations: session.locations ?? null,
        activeLocationId: session.activeLocationId ?? "domov",
        credits: session.credits ?? 0,
        userProfileIds: session.userProfileIds ?? ["soused"],
        testRoleId: session.testRoleId ?? "soused",
        ownedService: session.ownedService ?? null,
        citizenProfile: session.citizenProfile ?? null,
        savedAt: Date.now(),
      })
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearUserSession() {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function createUserId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
