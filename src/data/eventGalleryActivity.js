/** Aktivita — nové fotky v galerii akcí */

export function isUserParticipatedInEvent(event, user, joinedEventIds = []) {
  if (!event || !user) return false;
  if (event.organizer === "Vy" || event.organizer === user.name) return true;
  if (joinedEventIds.includes(event.id)) return true;
  return (event.attendees ?? []).some(
    (a) => a.id === user.id || a.id === "me" || a.name === user.name
  );
}

export function createGalleryActivity(event, photo, participated) {
  return {
    id: `ga-${photo.id}`,
    eventId: event.id,
    eventTitle: event.title,
    photoId: photo.id,
    photoUrl: photo.url,
    authorId: photo.authorId,
    authorName: photo.authorName,
    participated,
    calendarRead: false,
    feedDismissed: false,
    time: photo.time ?? "právě teď",
  };
}

/** Nejnovější cizí fotka z každé akce jako ne přečtená aktivita (demo) */
export function buildInitialGalleryActivities(events, user, joinedEventIds = []) {
  const selfIds = new Set([user?.id, "me"].filter(Boolean));
  const selfName = user?.name;
  const activities = [];

  events.forEach((event) => {
    const participated = isUserParticipatedInEvent(event, user, joinedEventIds);
    const foreignPhotos = (event.galleryPhotos ?? []).filter(
      (p) => !selfIds.has(p.authorId) && p.authorName !== selfName
    );
    if (foreignPhotos.length === 0) return;

    const latest = foreignPhotos[foreignPhotos.length - 1];
    activities.push(createGalleryActivity(event, latest, participated));
  });

  return activities.sort((a, b) => {
    if (a.participated !== b.participated) return a.participated ? -1 : 1;
    return 0;
  });
}

export function countUnreadCalendarGallery(activities) {
  return activities.filter((a) => a.participated && !a.calendarRead).length;
}

export function countUnreadGalleryForEvent(activities, eventId) {
  return activities.filter((a) => a.eventId === eventId && a.participated && !a.calendarRead).length;
}

export function getUnreadParticipatedGalleryActivities(activities) {
  return activities.filter((a) => a.participated && !a.calendarRead);
}

export function getFeedGalleryActivities(activities) {
  return activities.filter((a) => !a.feedDismissed);
}
