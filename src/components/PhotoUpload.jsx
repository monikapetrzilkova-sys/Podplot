export default function PhotoUpload({ photos, onChange, disabled, maxPhotos = 4, label = "Fotky", hint }) {
  const limit = maxPhotos;
  const addPhotos = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = limit - photos.length;
    const toRead = files.slice(0, remaining);

    toRead.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        onChange((prev) => {
          if (prev.length >= limit) return prev;
          return [...prev, { id: `${Date.now()}-${Math.random()}`, url: reader.result }];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const remove = (id) => onChange((prev) => prev.filter((p) => p.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-stone-800">{label}</label>
        <span className="text-xs text-stone-500">{photos.length}/{limit}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {photos.map((p) => (
          <div key={p.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p.id)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white text-xs rounded-full"
              aria-label="Smazat fotku"
            >
              ✕
            </button>
          </div>
        ))}

        {photos.length < limit && (
          <label
            className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
              disabled
                ? "border-stone-200 text-stone-300 cursor-not-allowed"
                : "border-stone-300 text-stone-500 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50"
            }`}
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[10px] font-medium mt-0.5">Foto</span>
            <input
              type="file"
              accept="image/*"
              multiple={limit > 1}
              disabled={disabled}
              onChange={addPhotos}
              className="sr-only"
            />
          </label>
        )}
      </div>
      <p className="text-[11px] text-stone-500 mt-1.5">
        {hint ?? "Vyfoťte věc nebo situaci — sousedi lépe pochopí nabídku."}
      </p>
    </div>
  );
}

export function PostPhotos({ photos, compact = false }) {
  if (!photos?.length) return null;

  if (photos.length === 1) {
    return (
      <div className={`${compact ? "px-3 pb-2" : "px-4 pb-3"}`}>
        <img
          src={photos[0]}
          alt=""
          className="w-full h-40 object-cover rounded-xl border border-stone-200"
        />
      </div>
    );
  }

  return (
    <div className={`${compact ? "px-3 pb-2" : "px-4 pb-3"} grid grid-cols-2 gap-2`}>
      {photos.slice(0, 4).map((url, i) => (
        <img
          key={i}
          src={url}
          alt=""
          className={`object-cover rounded-xl border border-stone-200 ${
            photos.length === 3 && i === 0 ? "col-span-2 h-32" : "h-24"
          }`}
        />
      ))}
    </div>
  );
}
