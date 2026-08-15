import { useState, useEffect, useRef, useCallback } from "react";
import AppPanelPortal from "../AppPanelPortal.jsx";

export default function GalleryLightbox({
  photos,
  initialPhotoId,
  onClose,
  onPhotoViewed,
  formatPersonName,
  queueHint,
  canAddPhotos = false,
  onAddPhotos = null,
  eventTitle = null,
}) {
  const [photo, setPhoto] = useState(() =>
    initialPhotoId ? photos.find((p) => p.id === initialPhotoId) ?? null : null
  );
  const thumbStripRef = useRef(null);
  const fileRef = useRef(null);
  const activeIndex = photos.findIndex((p) => p.id === photo?.id);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex >= 0 && activeIndex < photos.length - 1;

  useEffect(() => {
    if (!initialPhotoId) {
      setPhoto(null);
      return;
    }
    setPhoto(photos.find((p) => p.id === initialPhotoId) ?? photos[0] ?? null);
  }, [initialPhotoId, photos]);

  const goPrev = useCallback(() => {
    if (!canPrev) return;
    setPhoto(photos[activeIndex - 1]);
  }, [canPrev, photos, activeIndex]);

  const goNext = useCallback(() => {
    if (!canNext) return;
    setPhoto(photos[activeIndex + 1]);
  }, [canNext, photos, activeIndex]);

  useEffect(() => {
    if (!photo) return;
    onPhotoViewed?.(photo.id);
  }, [photo?.id, onPhotoViewed]);

  useEffect(() => {
    if (!photo || !thumbStripRef.current) return;
    const el = thumbStripRef.current.querySelector(`[data-photo-id="${photo.id}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [photo?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (!photo) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photo, onClose, goPrev, goNext]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length && onAddPhotos) onAddPhotos(files);
    e.target.value = "";
  };

  const authorLabel = photo
    ? formatPersonName?.({ id: photo.authorId, name: photo.authorName }) ?? photo.authorName
    : "";

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay" style={{ zIndex: 5 }}>
        <div className="pp-app-sheet pp-app-sheet--full flex flex-col bg-black pointer-events-auto relative">
          {/* Horní lišta — vždy viditelný křížek */}
          <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2 shrink-0 safe-pt relative z-20">
            <div className="min-w-0 flex-1 pr-2">
              {eventTitle && (
                <p className="text-[11px] text-white/55 truncate mb-0.5">{eventTitle}</p>
              )}
              {photo ? (
                <>
                  <p className="text-sm font-semibold text-white truncate">{authorLabel}</p>
                  <p className="text-[11px] text-white/60">
                    {photo.time}
                    {photos.length > 1 && (
                      <span className="text-white/40">
                        {" "}
                        · {Math.max(activeIndex, 0) + 1}/{photos.length}
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-white">Fotky z akce</p>
              )}
              {queueHint && <p className="text-[10px] text-white/45 mt-0.5">{queueHint}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white text-stone-900 text-2xl leading-none shrink-0 flex items-center justify-center shadow-lg hover:bg-stone-100"
              aria-label="Zavřít galerii"
            >
              ×
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0 relative px-2">
            {photo ? (
              <>
                {canPrev && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-1 z-10 w-10 h-10 rounded-full bg-black/50 text-white text-xl flex items-center justify-center hover:bg-black/70"
                    aria-label="Předchozí fotka"
                  >
                    ‹
                  </button>
                )}
                <img
                  key={photo.id}
                  src={photo.url}
                  alt=""
                  className="max-w-full max-h-full object-contain rounded-lg select-none"
                  draggable={false}
                />
                {canNext && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-1 z-10 w-10 h-10 rounded-full bg-black/50 text-white text-xl flex items-center justify-center hover:bg-black/70"
                    aria-label="Další fotka"
                  >
                    ›
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-white/60 px-6 text-center">
                Zatím žádné fotky — můžete přidat první.
              </p>
            )}
          </div>

          {photos.length > 1 && (
            <div
              ref={thumbStripRef}
              className="shrink-0 flex gap-2 overflow-x-auto px-3 py-2 border-t border-white/10"
              style={{ scrollbarWidth: "thin" }}
            >
              {photos.map((p) => {
                const active = p.id === photo?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    data-photo-id={p.id}
                    onClick={() => setPhoto(p)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      active
                        ? "border-emerald-400 ring-2 ring-emerald-400/40 opacity-100"
                        : "border-transparent opacity-55 hover:opacity-90"
                    }`}
                    aria-label={`Fotka od ${
                      formatPersonName?.({ id: p.authorId, name: p.authorName })?.split(" · ")[0] ??
                      p.authorName
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Spodní akce — přidání fotek + zavření */}
          <div className="shrink-0 px-3 pb-4 pt-2 border-t border-white/10 space-y-2 z-20 bg-black">
            {canAddPhotos && onAddPhotos && (
              <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-[#1B4D3E] bg-white hover:bg-stone-100 cursor-pointer transition-colors">
                <span>+ Přidat fotky</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
