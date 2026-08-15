import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import GalleryLightbox from "./module/GalleryLightbox.jsx";

export default function EventGallery({ event, past = false }) {
  const {
    canUploadEventPhotos,
    addEventGalleryPhoto,
    user,
    isJoinedEvent,
    formatPersonName,
    galleryPreviewRequest,
    galleryPreviewQueue,
    markGalleryPhotoRead,
    consumeGalleryPreview,
  } = useApp();
  const [lightboxPhotoId, setLightboxPhotoId] = useState(null);
  const fileRef = useRef(null);
  const openedPreviewRef = useRef(null);
  const fromQueueRef = useRef(false);
  const photos = event.galleryPhotos ?? [];
  const canUpload = canUploadEventPhotos(event);
  const participated =
    event.organizer === "Vy" ||
    event.organizer === user?.name ||
    isJoinedEvent(event.id) ||
    (event.attendees ?? []).some((a) => a.id === user?.id || a.id === "me" || a.name === user?.name);

  const handlePhotoViewed = useCallback(
    (photoId) => {
      markGalleryPhotoRead(photoId);
    },
    [markGalleryPhotoRead]
  );

  useEffect(() => {
    if (!galleryPreviewRequest || galleryPreviewRequest.eventId !== event.id) return;
    const photo = photos.find((p) => p.id === galleryPreviewRequest.photoId);
    if (!photo || openedPreviewRef.current === photo.id) return;
    openedPreviewRef.current = photo.id;
    fromQueueRef.current = true;
    setLightboxPhotoId(photo.id);
  }, [galleryPreviewRequest, event.id, photos]);

  useEffect(() => {
    if (galleryPreviewRequest?.eventId !== event.id) {
      openedPreviewRef.current = null;
      fromQueueRef.current = false;
      setLightboxPhotoId(null);
    }
  }, [galleryPreviewRequest, event.id]);

  const openPhoto = (photo) => {
    fromQueueRef.current = false;
    setLightboxPhotoId(photo.id);
  };

  const closeLightbox = () => {
    setLightboxPhotoId(null);
    openedPreviewRef.current = null;
    if (fromQueueRef.current) {
      fromQueueRef.current = false;
      consumeGalleryPreview();
    }
  };

  const queueIndex =
    lightboxPhotoId && galleryPreviewQueue.length > 0
      ? galleryPreviewQueue.findIndex((q) => q.eventId === event.id && q.photoId === lightboxPhotoId)
      : -1;
  const queueHint =
    queueIndex >= 0 && galleryPreviewQueue.length > 1
      ? `Fotka ${queueIndex + 1} z ${galleryPreviewQueue.length} nepřečtených`
      : null;

  const handleUpload = (e) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => addEventGalleryPhoto(event.id, reader.result);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleLightboxAddPhotos = (files) => {
    files.forEach((file) => {
      if (!file.type?.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => addEventGalleryPhoto(event.id, reader.result);
      reader.readAsDataURL(file);
    });
  };

  return (
    <section className="mt-5">
      <h3 className="text-sm font-bold text-stone-800 mb-1">📷 Fotky z akce</h3>
      <p className="text-xs text-stone-500 mb-3">
        {past
          ? participated
            ? "Vzpomínky od účastníků a organizátorů — prohlédněte si, jak akce proběhla."
            : "Fotky z akce sdílené sousedy — můžete si je prohlédnout i bez účasti."
          : canUpload
            ? "Sdílejte fotky průběhu nebo příprav — vidí je přihlášení sousedi."
            : "Fotky z akce — prohlédnout může kdokoli z lokality."}
      </p>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {photos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openPhoto(p)}
              className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100"
            >
              <img src={p.url} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1 text-[9px] text-white truncate text-left">
                {formatPersonName({ id: p.authorId, name: p.authorName }).split(" · ")[0]}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-400 bg-stone-50 rounded-xl px-3 py-2.5 mb-3">
          Zatím žádné fotky — buďte první, kdo je nahraje.
        </p>
      )}

      {canUpload && (
        <label className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-stone-300 rounded-xl text-sm font-semibold text-stone-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 cursor-pointer transition-colors">
          <span>+ Nahrát fotku</span>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="sr-only" />
        </label>
      )}

      {!canUpload && photos.length === 0 && (
        <p className="text-[11px] text-stone-400 text-center">Fotky mohou nahrávat účastníci a organizátor akce.</p>
      )}

      {lightboxPhotoId && (
        <GalleryLightbox
          photos={photos}
          initialPhotoId={lightboxPhotoId}
          onClose={closeLightbox}
          onPhotoViewed={handlePhotoViewed}
          formatPersonName={formatPersonName}
          queueHint={queueHint}
          eventTitle={event.title}
          canAddPhotos={canUpload}
          onAddPhotos={canUpload ? handleLightboxAddPhotos : null}
        />
      )}
    </section>
  );
}
