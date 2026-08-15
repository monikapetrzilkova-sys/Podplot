import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import {
  computeCommunityPlaceRating,
  computeHybridPlaceRating,
  getVisiblePlaceReviews,
  placeReviewKey,
} from "../../data/placeReviews.js";
export default function PlaceReviewList({ place, showComposer = false, compact = false }) {
  const {
    placeReviews,
    addPlaceReview,
    reportPlaceReview,
    user,
    institutionClaims,
    institutionPlaceOverrides,
  } = useApp();

  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);

  const key = placeReviewKey(place);
  if (!key) return null;

  const community = getVisiblePlaceReviews(placeReviews, key);
  const communityRating = computeCommunityPlaceRating(placeReviews, key);
  const hybrid = computeHybridPlaceRating(
    place.googleRating,
    place.googleReviewCount ?? 0,
    communityRating,
    community.length
  );

  const googleReviews = place.googleReviews ?? [];

  const submit = () => {
    if (!text.trim()) return;
    addPlaceReview({ placeKey: key, placeId: place.id, place, text: text.trim(), stars });
    setText("");
    setStars(5);
  };

  return (
    <div className={compact ? "space-y-2 mt-3" : "space-y-3 mt-4"}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-stone-800">Hodnocení a recenze</p>
        {place.isGooglePlace && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            Google
          </span>
        )}
      </div>

      {hybrid && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
          <p className="text-sm font-semibold text-amber-700">
            ⭐ {hybrid.rating}
            <span className="text-stone-500 font-normal text-xs ml-1">
              · {hybrid.count}{" "}
              {hybrid.source === "hybrid"
                ? `(${hybrid.googleCount} Google · ${hybrid.communityCount} sousedé)`
                : hybrid.source === "google"
                  ? "Google hodnocení"
                  : "recenzí od sousedů"}
            </span>
          </p>
        </div>
      )}

      {googleReviews.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-stone-500">Z Google Maps</p>
          {googleReviews.slice(0, 2).map((r, i) => (
            <div key={`g-${i}`} className="bg-blue-50/60 rounded-lg p-2.5 text-xs border border-blue-100">
              <p className="text-amber-600 font-semibold mb-0.5">{"★".repeat(r.rating ?? 5)}</p>
              <p className="text-stone-700 line-clamp-3">{r.text}</p>
              <p className="text-[10px] text-stone-400 mt-1">{r.author}{r.time ? ` · ${r.time}` : ""}</p>
            </div>
          ))}
        </div>
      )}

      {showComposer && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase text-emerald-800">Komunitní recenze (ověřený soused)</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                className={`text-lg ${n <= stars ? "text-amber-500" : "text-stone-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Vaše zkušenost s tímto místem…"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none bg-white"
          />
          <button
            type="button"
            onClick={submit}
            className="w-full py-2 text-xs font-semibold text-white rounded-xl bg-emerald-700"
          >
            Přidat komunitní recenzi
          </button>
        </div>
      )}

      {community.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-stone-500">Od sousedů z Podplotu</p>
          {community.map((r) => (
            <div key={r.id} className="bg-stone-50 rounded-lg p-2.5 text-xs">
              <p className="text-amber-600 font-semibold mb-0.5">{"★".repeat(r.stars ?? 5)}</p>
              <p className="text-stone-700">{r.text}</p>
              <p className="text-[10px] text-stone-400 mt-1 flex flex-wrap items-center gap-2">
                <span>{r.authorName}</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  ✓ Ověřený soused
                </span>
              </p>
              {user?.id !== r.authorId && (
                <button
                  type="button"
                  onClick={() => reportPlaceReview(r.id)}
                  className="mt-1.5 text-[10px] text-red-600 font-semibold hover:underline"
                >
                  Nahlásit recenzi
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {community.length === 0 && !googleReviews.length && !hybrid && (
        <p className="text-xs text-stone-500">Zatím žádná hodnocení.</p>
      )}
    </div>
  );
}

/** Jen Google rating — otevírací doba patří do základních údajů nahoře (bez duplicit). */
export function PlaceGoogleMeta({ place }) {
  if (place?.googleRating == null) return null;
  return (
    <div className="mt-3 p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs">
      <p className="text-amber-700 font-semibold">
        Google ⭐ {place.googleRating}
        {place.googleReviewCount ? ` · ${place.googleReviewCount} hodnocení` : ""}
      </p>
    </div>
  );
}
