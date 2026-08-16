import { useState } from "react";
import {
  fileToListingPhotoDataUrl,
  normalizePhotoList,
  normalizePhotoUrl,
} from "../utils/listingPhotos.js";

export default function PhotoUpload({ photos, onChange, disabled, maxPhotos = 4, label = "Fotky", hint }) {
  const limit = maxPhotos;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const addPhotos = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = limit - photos.length;
    const toRead = files.slice(0, remaining);
    if (!toRead.length) return;

    setBusy(true);
    setError(null);
    try {
      for (const file of toRead) {
        try {
          const url = await fileToListingPhotoDataUrl(file);
          onChange((prev) => {
            if (prev.length >= limit) return prev;
            return [...prev, { id: `${Date.now()}-${Math.random()}`, url }];
          });
        } catch (err) {
          setError(err?.message || "Fotku se nepodařilo zpracovat.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = (id) => onChange((prev) => prev.filter((p) => p.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-stone-800">{label}</label>
        <span className="text-xs text-stone-500">
          {busy ? "Zpracovávám…" : `${photos.length}/${limit}`}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {photos.map((p) => {
          const src = normalizePhotoUrl(p);
          return (
            <div key={p.id ?? src} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
              {src ? (
                <img src={src} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-stone-400 px-1 text-center">
                  Nelze načíst
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white text-xs rounded-full"
                aria-label="Smazat fotku"
              >
                ✕
              </button>
            </div>
          );
        })}

        {photos.length < limit && (
          <label
            className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
              disabled || busy
                ? "border-stone-200 text-stone-300 cursor-not-allowed"
                : "border-stone-300 text-stone-500 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50"
            }`}
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[10px] font-medium mt-0.5">Foto</span>
            <input
              type="file"
              accept="image/*,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple={limit > 1}
              disabled={disabled || busy}
              onChange={addPhotos}
              className="sr-only"
            />
          </label>
        )}
      </div>
      {error ? <p className="text-[11px] text-red-600 mt-1.5 leading-snug">{error}</p> : null}
      <p className="text-[11px] text-stone-500 mt-1.5">
        {hint ?? "Vyfoťte věc nebo situaci — sousedi lépe pochopí nabídku. Nejlépe JPG/PNG."}
      </p>
    </div>
  );
}

function PhotoSlot({ src, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`${className} bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400`}
        role="img"
        aria-label="Fotka není k dispozici"
      >
        <svg className="w-8 h-8 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M21 16l-5-5-4 4-3-3-5 5" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function PostPhotos({ photos, compact = false }) {
  const urls = normalizePhotoList(photos);
  if (!urls.length) return null;

  if (urls.length === 1) {
    return (
      <div className={`${compact ? "px-3 pb-2" : "px-4 pb-3"}`}>
        <PhotoSlot
          src={urls[0]}
          className="w-full h-40 object-cover rounded-xl border border-stone-200"
        />
      </div>
    );
  }

  return (
    <div className={`${compact ? "px-3 pb-2" : "px-4 pb-3"} grid grid-cols-2 gap-2`}>
      {urls.slice(0, 4).map((url, i) => (
        <PhotoSlot
          key={`${i}-${url.slice(0, 24)}`}
          src={url}
          className={`object-cover rounded-xl border border-stone-200 ${
            urls.length === 3 && i === 0 ? "col-span-2 h-32" : "h-24"
          }`}
        />
      ))}
    </div>
  );
}
