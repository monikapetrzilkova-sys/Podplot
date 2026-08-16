import MiniBusinessMap from "./MiniBusinessMap.jsx";
import { MessageButton } from "./MessagesPage.jsx";
import VerifiedBadge from "./VerifiedBadge.jsx";
import { PlaceIcon } from "./module/placeIcons.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { CLAIM_STATUS } from "../data/entityManagement.js";

function formatWebsiteLabel(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export default function BusinessProfileModal({ business, onClose }) {
  if (!business) return null;

  const messagingActive =
    Boolean(business.claimedByUserId) || business.claimStatus === CLAIM_STATUS.CLAIMED;

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-app-sheet" role="dialog" aria-label={business.name}>
          <div className="pp-app-sheet-body p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <PlaceIcon place={business} className="w-10 h-10 shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-stone-900">{business.name}</h2>
                  <p className="text-xs text-emerald-700 font-medium">{business.distance}</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="text-stone-400 text-xl px-1" aria-label="Zavřít">
                ×
              </button>
            </div>

            {business.accountType && <VerifiedBadge accountType={business.accountType} />}

            {business.tagline && <p className="text-sm text-stone-600 mt-3">{business.tagline}</p>}

            <div className="mt-4 space-y-2 text-sm text-stone-700">
              {business.address && (
                <p>
                  <span className="font-semibold">Adresa:</span> {business.address}
                </p>
              )}
              {business.phone && (
                <p>
                  <span className="font-semibold">Telefon:</span> {business.phone}
                </p>
              )}
              {business.email && (
                <p>
                  <span className="font-semibold">E-mail:</span> {business.email}
                </p>
              )}
              {business.website && (
                <p>
                  <span className="font-semibold">Web:</span>{" "}
                  <a
                    href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 underline-offset-2 hover:underline break-all"
                  >
                    {formatWebsiteLabel(business.website)}
                  </a>
                </p>
              )}
              {business.hours && (
                <p>
                  <span className="font-semibold">Otevírací doba:</span> {business.hours}
                </p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Kde nás najdete</p>
              <MiniBusinessMap mapPos={business.mapPos} label={business.address ?? business.name} />
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <MessageButton
                participantId={business.id}
                participantName={business.name}
                primary
                inactive={!messagingActive}
              />
              {!messagingActive ? (
                <p className="text-[10px] text-stone-500 w-full">
                  Zprávy budou dostupné, až provozovatel převezme správu tohoto profilu.
                </p>
              ) : null}
            </div>

            <p className="text-[10px] text-stone-400 text-center mt-4">Sponzorovaný profil · Podplot</p>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
