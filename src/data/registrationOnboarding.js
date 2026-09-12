/** Příznaky po registraci (Příběh Podplotu apod.) */

const PENDING_STORY_KEY = "podplot-pending-story-v1";

export function markPendingPodplotStory() {
  try {
    sessionStorage.setItem(PENDING_STORY_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function hasPendingPodplotStory() {
  try {
    return sessionStorage.getItem(PENDING_STORY_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearPendingPodplotStory() {
  try {
    sessionStorage.removeItem(PENDING_STORY_KEY);
  } catch {
    /* ignore */
  }
}
