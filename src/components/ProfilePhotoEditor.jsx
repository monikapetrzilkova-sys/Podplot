import { useState, useRef, useEffect, useCallback } from "react";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";

const VIEWPORT = 240;
const OUTPUT = 320;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function exportProfilePhotoCrop(src, imgSize, scale, position) {
  return loadImage(src).then((img) => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.clip();

    const ratio = OUTPUT / VIEWPORT;
    const drawW = imgSize.w * scale * ratio;
    const drawH = imgSize.h * scale * ratio;
    const drawX = OUTPUT / 2 - drawW / 2 + position.x * ratio;
    const drawY = OUTPUT / 2 - drawH / 2 + position.y * ratio;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    return canvas.toDataURL("image/jpeg", 0.92);
  });
}

export default function ProfilePhotoEditor({
  open = true,
  onClose,
  initialPhoto = null,
  onSave,
  onRemove,
  title = "Profilová fotka",
}) {
  const [source, setSource] = useState(null);
  const [imgSize, setImgSize] = useState(null);
  const [minScale, setMinScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const fileRef = useRef(null);

  const resetEditor = useCallback((src) => {
    loadImage(src).then((img) => {
      const size = { w: img.naturalWidth, h: img.naturalHeight };
      const cover = Math.max(VIEWPORT / size.w, VIEWPORT / size.h);
      setSource(src);
      setImgSize(size);
      setMinScale(cover);
      setScale(cover);
      setPosition({ x: 0, y: 0 });
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setSource(null);
      setImgSize(null);
      return;
    }
    if (initialPhoto) {
      resetEditor(initialPhoto);
    }
  }, [open, initialPhoto, resetEditor]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => resetEditor(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onPointerDown = (e) => {
    if (!source) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: dragStart.current.posX + (e.clientX - dragStart.current.x),
      y: dragStart.current.posY + (e.clientY - dragStart.current.y),
    });
  };

  const onPointerUp = () => setDragging(false);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  });

  const handleSave = async () => {
    if (!source || !imgSize) return;
    setSaving(true);
    try {
      const cropped = await exportProfilePhotoCrop(source, imgSize, scale, position);
      onSave?.(cropped);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const content = (
    <div className="space-y-4">
      <p className="text-xs text-stone-500 leading-relaxed">
        Posuňte fotku prstem nebo myší a přibližte ji, aby byl obličej vycentrovaný v kroužku.
      </p>

      {!source ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-28 h-28 rounded-full border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-500 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-[11px] font-medium mt-1">Vybrat foto</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
        </div>
      ) : (
        <>
          <div
            className="mx-auto relative rounded-full overflow-hidden bg-stone-200 cursor-grab active:cursor-grabbing touch-none select-none"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={onPointerDown}
          >
            <img
              src={source}
              alt=""
              draggable={false}
              className="absolute max-w-none pointer-events-none"
              style={{
                width: imgSize.w * scale,
                height: imgSize.h * scale,
                left: VIEWPORT / 2 - (imgSize.w * scale) / 2 + position.x,
                top: VIEWPORT / 2 - (imgSize.h * scale) / 2 + position.y,
              }}
            />
            <div className="absolute inset-0 ring-2 ring-inset ring-white/30 rounded-full pointer-events-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Přiblížení</label>
            <input
              type="range"
              min={minScale}
              max={minScale * 3}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Vybrat jinou fotku
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
        </>
      )}

      <div className="flex gap-2 pt-1">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700"
          >
            Zrušit
          </button>
        )}
        {onRemove && initialPhoto && !source && (
          <button
            type="button"
            onClick={() => {
              onRemove();
              onClose?.();
            }}
            className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold"
          >
            Smazat fotku
          </button>
        )}
        <button
          type="button"
          disabled={!source || saving}
          onClick={handleSave}
          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
        >
          {saving ? "Ukládám…" : "Uložit"}
        </button>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        <ModalDoodleBackdrop onClose={onClose} />
        <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto">
          <h3 className="font-bold text-stone-900 mb-3">{title}</h3>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-stone-800 mb-2">{title}</h3>
      {content}
    </div>
  );
}
