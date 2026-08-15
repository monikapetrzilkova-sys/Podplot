import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { GUIDE_GRID_CATEGORIES, REMESLICI_CATEGORY_ID } from "../../data/institutionsMapData.js";
import CategoryGrid from "../module/CategoryGrid.jsx";
import MapComponent from "../module/MapComponent.jsx";
import PhotoUpload from "../PhotoUpload.jsx";
import ModalDoodleBackdrop from "../ModalDoodleBackdrop.jsx";

export default function PlaceSuggestionModal() {
  const { submitPlaceSuggestion, activeLocation, user, placeSuggestionOpen, closePlaceSuggestion } =
    useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("gastro");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [mapPos, setMapPos] = useState(null);
  const [step, setStep] = useState("form");

  if (!placeSuggestionOpen) return null;

  const categories = GUIDE_GRID_CATEGORIES.filter((c) => c.id !== REMESLICI_CATEGORY_ID);

  const resetForm = () => {
    setName("");
    setHours("");
    setDescription("");
    setPhotos([]);
    setMapPos(null);
    setStep("form");
    setCategory("gastro");
  };

  const handleClose = () => {
    closePlaceSuggestion();
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !mapPos) return;
    submitPlaceSuggestion({
      name: name.trim(),
      category,
      hours: hours.trim(),
      description: description.trim(),
      photos,
      mapPos: mapPos.mapPos ?? mapPos,
      lat: mapPos.lat ?? mapPos.mapPos?.lat ?? null,
      lng: mapPos.lng ?? mapPos.mapPos?.lng ?? null,
    });
    handleClose();
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto">
        <ModalDoodleBackdrop onClose={handleClose} />
      </div>

      <div
        className="relative z-10 pointer-events-auto w-full max-w-[390px] max-h-[calc(100%-0.5rem)] bg-white rounded-t-3xl flex flex-col overflow-hidden shadow-xl min-w-0 mx-auto"
        role="dialog"
        aria-label="Návrh na založení místa"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-stone-200 shrink-0 bg-white">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-stone-900 leading-snug">Návrh na založení místa</h2>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug">
              Označte místo na mapě a vyplňte údaje. Návrh bude čekat na schválení administrátorem.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none"
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 min-w-0 bg-white">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3">
            {step === "map" ? (
              <>
                <div className="min-w-0 overflow-hidden rounded-xl border border-stone-200">
                  <MapComponent
                    mapMode="institutions"
                    institutions={[]}
                    pickMode
                    draftPin={mapPos}
                    onPickPin={setMapPos}
                    userAddress={activeLocation?.address ?? user?.address ?? ""}
                    hideLegend
                    hideStats
                    showRadiusControl={false}
                    large={false}
                    compact
                    className="mb-0"
                  />
                </div>
                {mapPos && (
                  <p className="text-xs text-emerald-700 font-medium">Místo označeno na mapě ✓</p>
                )}
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full py-2 text-sm font-semibold border border-stone-200 rounded-xl"
                >
                  ← Zpět k formuláři
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Název podniku / instituce *"
                  className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm"
                  required
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-600 mb-1.5">Kategorie *</p>
                  <CategoryGrid
                    categories={categories}
                    activeId={category}
                    onSelect={setCategory}
                    columns={3}
                    className="min-w-0"
                  />
                </div>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Otevírací doba (např. Po–Ne 8:00–20:00)"
                  className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Krátký popis…"
                  rows={2}
                  className="w-full min-w-0 px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
                />
                <PhotoUpload photos={photos} onChange={setPhotos} label="Fotky (lístek, interiér…)" />
                <button
                  type="button"
                  onClick={() => setStep("map")}
                  className="w-full py-2 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-xl"
                >
                  📍 {mapPos ? "Změnit místo na mapě" : "Označit místo na mapě *"}
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 px-4 py-3 border-t border-stone-200 shrink-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 text-sm font-semibold border border-stone-200 rounded-xl"
            >
              Zrušit
            </button>
            {step === "form" && (
              <button
                type="submit"
                disabled={!name.trim() || !mapPos}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
                style={{ background: "#1B4332" }}
              >
                Odeslat návrh
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
