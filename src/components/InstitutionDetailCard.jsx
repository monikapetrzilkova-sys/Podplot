import { useState } from "react";
import { MessageButton } from "./MessagesPage.jsx";
import VerifiedBadge from "./VerifiedBadge.jsx";
import ClaimProfileModal from "./entity/ClaimProfileModal.jsx";
import { useApp } from "../context/AppContext.jsx";
import { PostPhotos } from "./PhotoUpload.jsx";
import ReportMenu from "./ReportMenu.jsx";
import { PlaceIcon } from "./module/placeIcons.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { CLAIM_STATUS } from "../data/entityManagement.js";
import PlaceReviewList from "./entity/PlaceReviewList.jsx";
import { canWritePlaceReview } from "../data/placeReviews.js";
import { formatGoogleHours } from "../data/placesApi.js";

function PlaceCommunityEdit({ place, onSaved }) {
  const { updatePlaceCommunityDetails } = useApp();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(place.hours ?? formatGoogleHours(place.weekdayText) ?? "");
  const [phone, setPhone] = useState(place.phone ?? "");
  const [email, setEmail] = useState(place.email ?? "");
  const [website, setWebsite] = useState(place.website ?? "");
  const [address, setAddress] = useState(place.address ?? "");
  const [description, setDescription] = useState(place.extraInfo ?? "");
  const [acceptsPatients, setAcceptsPatients] = useState(
    place.acceptsPatients === true ? "yes" : place.acceptsPatients === false ? "no" : "unknown"
  );

  const save = (e) => {
    e.preventDefault();
    updatePlaceCommunityDetails(place.id, {
      hours: hours.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      address: address.trim(),
      extraInfo: description.trim(),
      acceptsPatients: acceptsPatients === "yes" ? true : acceptsPatients === "no" ? false : null,
    });
    setOpen(false);
    onSaved?.();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full py-2 text-xs font-semibold text-emerald-800 border border-emerald-200 rounded-xl bg-emerald-50/80"
      >
        Upravit údaje (sousedé)
      </button>
    );
  }

  return (
    <form onSubmit={save} className="mt-3 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
      <p className="text-[10px] font-bold uppercase text-emerald-800">Úprava komunitních údajů</p>
      <p className="text-[10px] text-stone-500 leading-snug">
        Profil ještě nemá oficiálního vlastníka — sousedé můžou aktualizovat např. otevírací dobu.
      </p>
      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Adresa</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mt-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm bg-white"
        />
      </label>
      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Telefon</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mt-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm bg-white"
        />
      </label>
      <label className="block text-xs">
        <span className="font-semibold text-stone-700">E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm bg-white"
        />
      </label>
      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Web</span>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
          className="w-full mt-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm bg-white"
        />
      </label>
      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Otevírací doba</span>
        <input
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full mt-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm bg-white"
        />
      </label>
      {(place.category === "zdravi" || place.acceptsPatients != null) && (
        <label className="block text-xs">
          <span className="font-semibold text-stone-700">Noví pacienti</span>
          <select
            value={acceptsPatients}
            onChange={(e) => setAcceptsPatients(e.target.value)}
            className="w-full mt-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm bg-white"
          >
            <option value="unknown">Neuvedeno</option>
            <option value="yes">Přijímá nové pacienty</option>
            <option value="no">Nepřijímá</option>
          </select>
        </label>
      )}
      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Popis (volitelné)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full mt-1 px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm bg-white resize-none"
        />
      </label>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-xl bg-white"
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-xs font-semibold text-white rounded-xl"
          style={{ background: "#1B4332" }}
        >
          Uložit
        </button>
      </div>
    </form>
  );
}

function formatWebsiteLabel(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export default function InstitutionDetailCard({ place, onClose }) {
  const { user, institutionClaims, institutionPlaceOverrides } = useApp();
  const [claimOpen, setClaimOpen] = useState(false);

  if (!place) return null;

  const uid = user?.id ?? "me";
  const claims = institutionClaims ?? [];
  const isOwner =
    place.claimedByUserId === uid ||
    claims.some((c) => c.placeId === place.id && c.userId === uid && c.status === "approved");

  const isOfficiallyClaimed =
    place.claimStatus === CLAIM_STATUS.CLAIMED || Boolean(place.claimedByUserId);

  const canClaim = !place.isPendingSuggestion && !isOfficiallyClaimed && !isOwner;

  const canCommunityEdit = !place.isPendingSuggestion && !isOfficiallyClaimed && !isOwner;

  const canReview = canWritePlaceReview(user, place, institutionClaims, institutionPlaceOverrides);

  const hours = place.hours ?? formatGoogleHours(place.weekdayText);
  const description = (place.extraInfo ?? "").trim();

  return (
    <>
      <AppPanelPortal>
        <div className="pp-app-sheet-overlay">
          <div className="absolute inset-0 pointer-events-auto">
            <ModalDoodleBackdrop onClose={onClose} />
          </div>

          <div className="pp-app-sheet" role="dialog" aria-label={place.name}>
            <div className="pp-app-sheet-body p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <PlaceIcon place={place} className="w-10 h-10 shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-stone-900 leading-tight flex flex-wrap items-center gap-2">
                      {place.name}
                      {place.isVerified && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Ověřeno
                        </span>
                      )}
                      {place.isPendingSuggestion && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-600">
                          Čeká na schválení
                        </span>
                      )}
                      {place.isGooglePlace && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          Google Maps
                        </span>
                      )}
                    </h2>
                    {place.distance && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">{place.distance}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <ReportMenu compact onReport={() => {}} />
                  <button type="button" onClick={onClose} className="text-stone-400 text-xl px-1" aria-label="Zavřít">
                    ×
                  </button>
                </div>
              </div>

              {place.accountType && <VerifiedBadge accountType={place.accountType} />}

              {place.tagline && (
                <p className="text-sm text-stone-600 mt-3 leading-relaxed">{place.tagline}</p>
              )}

              {place.photos?.length > 0 && (
                <div className="mt-3">
                  <PostPhotos photos={place.photos} compact />
                </div>
              )}

              {place.acceptsPatients != null && (
                <p
                  className={`mt-3 text-xs font-semibold px-3 py-2 rounded-xl inline-block ${
                    place.acceptsPatients
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                >
                  {place.acceptsPatients ? "✓ Přijímá nové pacienty" : "Nové pacienty momentálně nepřijímá"}
                </p>
              )}

              <div className="mt-4 space-y-2 text-sm text-stone-700">
                {place.address && (
                  <p>
                    <span className="font-semibold">Adresa:</span> {place.address}
                  </p>
                )}
                {place.phone && (
                  <p>
                    <span className="font-semibold">Telefon:</span>{" "}
                    <a href={`tel:${place.phone.replace(/\s/g, "")}`} className="text-emerald-800 underline-offset-2 hover:underline">
                      {place.phone}
                    </a>
                  </p>
                )}
                {place.email && (
                  <p>
                    <span className="font-semibold">E-mail:</span>{" "}
                    <a href={`mailto:${place.email}`} className="text-emerald-800 underline-offset-2 hover:underline">
                      {place.email}
                    </a>
                  </p>
                )}
                {place.website && (
                  <p>
                    <span className="font-semibold">Web:</span>{" "}
                    <a
                      href={place.website.startsWith("http") ? place.website : `https://${place.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-800 underline-offset-2 hover:underline break-all"
                    >
                      {formatWebsiteLabel(place.website)}
                    </a>
                  </p>
                )}
                {hours && (
                  <p>
                    <span className="font-semibold">Otevírací doba:</span> {hours}
                  </p>
                )}
              </div>

              {description ? (
                <p className="mt-4 text-stone-600 bg-stone-50 rounded-xl p-3 text-xs leading-relaxed">{description}</p>
              ) : null}

              {canCommunityEdit && <PlaceCommunityEdit place={place} />}

              <PlaceReviewList place={place} showComposer={canReview} compact />

              <div className="mt-4 flex gap-2 flex-wrap">
                <MessageButton
                  participantId={place.id}
                  participantName={place.name}
                  inactive={!isOfficiallyClaimed}
                />
                {canClaim && (
                  <button
                    type="button"
                    onClick={() => setClaimOpen(true)}
                    className="px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-300 rounded-xl bg-emerald-50"
                  >
                    Převzít profil
                  </button>
                )}
                {!isOfficiallyClaimed && !place.isPendingSuggestion && (
                  <p className="text-[10px] text-stone-500 w-full">
                    Zprávy budou dostupné, až provozovatel převezme správu tohoto profilu.
                  </p>
                )}
                {canClaim && place.isGooglePlace && (
                  <p className="text-[10px] text-stone-500 w-full">
                    Toto místo pochází z Google Maps. Po ověření IČO můžete spravovat komunitní akce a nabídky.
                  </p>
                )}
                {isOwner && (
                  <span className="text-xs text-emerald-700 font-semibold px-3 py-2 bg-emerald-50 rounded-xl">
                    ✓ Váš profil
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppPanelPortal>

      <ClaimProfileModal place={place} open={claimOpen} onClose={() => setClaimOpen(false)} />
    </>
  );
}
