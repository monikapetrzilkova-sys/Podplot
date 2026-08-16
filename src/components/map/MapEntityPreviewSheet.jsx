import { PlaceIcon } from "../module/placeIcons.jsx";
import { formatGoogleHours } from "../../data/placesApi.js";
import { displayCreatorLabel } from "../../data/accountTypes.js";

function Stars({ rating }) {
  if (rating == null) return null;
  const full = Math.round(rating);
  return (
    <p className="text-xs text-amber-600 font-semibold mt-1">
      {"★".repeat(Math.min(5, full))}
      <span className="text-stone-500 font-normal ml-1">
        {rating} · Google
      </span>
    </p>
  );
}

/** Spodní náhled místa po kliknutí na špendlík v Průvodci. */
export default function MapInstitutionPreviewSheet({ place, loading = false, onDetail, onClose }) {
  if (!place) return null;

  const hours = place.hours ?? formatGoogleHours(place.weekdayText);
  const meta = [place.address, place.distance, hours].filter(Boolean).join(" · ");
  const reviewSnippet = place.googleReviews?.[0]?.text;

  return (
    <div className="pp-map-preview-sheet" role="dialog" aria-label={`Náhled: ${place.name}`}>
      <div className="pp-map-preview-sheet-inner">
        <div className="flex items-start gap-3 min-w-0">
          <span className="pp-map-preview-sheet-icon flex items-center justify-center shrink-0">
            <PlaceIcon place={place} className="w-6 h-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-stone-900 leading-snug">{place.name}</p>
              {place.isGooglePlace && (
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  Google
                </span>
              )}
            </div>
            {place.tagline && (
              <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">{place.tagline}</p>
            )}
            {meta && <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{meta}</p>}
            {place.googleRating != null && <Stars rating={place.googleRating} />}
            {place.acceptsPatients != null && (
              <p className="text-[10px] font-semibold mt-1 text-emerald-700">
                {place.acceptsPatients ? "✓ Přijímá nové pacienty" : "Nové pacienty momentálně nepřijímá"}
              </p>
            )}
            {reviewSnippet && (
              <p className="text-[10px] text-stone-500 mt-1 line-clamp-2 italic">„{reviewSnippet}"</p>
            )}
            {loading && <p className="text-[10px] text-stone-400 mt-1">Načítám detail…</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 text-lg leading-none"
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>
        <button
          type="button"
          onClick={onDetail}
          className="mt-2.5 w-full py-2 text-xs font-bold text-white rounded-xl"
          style={{ background: "#1B4332" }}
        >
          Zobrazit detail
        </button>
      </div>
    </div>
  );
}

export function MapEventPreviewSheet({ event, onDetail, onClose }) {
  if (!event) return null;

  const creator = displayCreatorLabel(event.organizer, event.accountType, {
    mine: event.organizer === "Vy",
  });
  const meta = [
    creator,
    event.date,
    event.address ?? event.location,
    `${event.participants ?? 0} účastníků`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="pp-map-preview-sheet" role="dialog" aria-label={`Náhled: ${event.title}`}>
      <div className="pp-map-preview-sheet-inner">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="pp-map-preview-sheet-icon flex items-center justify-center shrink-0 text-emerald-700"
            aria-hidden
          >
            📅
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-stone-900 leading-snug">{event.title}</p>
            {meta && <p className="text-[10px] text-stone-400 mt-1">{meta}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 text-lg leading-none"
            aria-label="Zavřít"
          >
            ×
          </button>
        </div>
        <button
          type="button"
          onClick={onDetail}
          className="mt-2.5 w-full py-2 text-xs font-bold text-white rounded-xl"
          style={{ background: "#1B4332" }}
        >
          Zobrazit detail
        </button>
      </div>
    </div>
  );
}
