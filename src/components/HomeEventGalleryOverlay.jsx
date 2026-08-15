import { useApp } from "../context/AppContext.jsx";
import GalleryLightbox from "./module/GalleryLightbox.jsx";

export default function HomeEventGalleryOverlay() {
  const {
    homeEventGallery,
    closeHomeEventGallery,
    events,
    formatPersonName,
    markGalleryPhotoRead,
    canUploadEventPhotos,
    addEventGalleryPhoto,
  } = useApp();

  if (!homeEventGallery) return null;

  const event = events.find((e) => e.id === homeEventGallery.eventId);
  if (!event) return null;

  const photos = event.galleryPhotos ?? [];
  const canAdd = canUploadEventPhotos(event);

  const handleAddPhotos = (files) => {
    files.forEach((file) => {
      if (!file.type?.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => addEventGalleryPhoto(event.id, reader.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <GalleryLightbox
      photos={photos}
      initialPhotoId={homeEventGallery.photoId ?? photos[0]?.id}
      onClose={closeHomeEventGallery}
      onPhotoViewed={markGalleryPhotoRead}
      formatPersonName={formatPersonName}
      eventTitle={event.title}
      canAddPhotos={canAdd}
      onAddPhotos={canAdd ? handleAddPhotos : null}
    />
  );
}
