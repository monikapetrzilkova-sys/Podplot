import { useApp } from "../context/AppContext.jsx";
import { computeServiceRating, getVisibleReviews } from "../data/serviceReviews.js";
import ServiceReviewList from "./entity/ServiceReviewList.jsx";
import { MessageButton } from "./MessagesPage.jsx";
import { canWriteServiceReview } from "../data/serviceReviews.js";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { formatCraftsmanRadiusLabel } from "../data/craftsmanSettings.js";

/** Veřejný profil řemeslníka — z chatů / zájmu o poptávku */
export default function CraftsmanPublicProfileModal() {
  const {
    craftsmanProfileOpen,
    closeCraftsmanPublicProfile,
    servicesCatalog,
    serviceReviews,
    user,
  } = useApp();

  if (!craftsmanProfileOpen) return null;

  const service =
    servicesCatalog.find((s) => s.id === craftsmanProfileOpen.serviceId) ??
    servicesCatalog.find((s) => s.ownerUserId === craftsmanProfileOpen.userId) ??
    null;

  if (!service) {
    return (
      <AppPanelPortal>
        <div className="pp-app-sheet-overlay">
          <div className="absolute inset-0 pointer-events-auto">
            <ModalDoodleBackdrop onClose={closeCraftsmanPublicProfile} />
          </div>
          <div className="pp-app-sheet p-5" role="dialog" aria-label="Profil">
            <h2 className="text-sm font-bold text-stone-900 mb-2">Profil nenalezen</h2>
            <p className="text-xs text-stone-500 mb-4">
              Katalogový profil této služby zatím není k dispozici.
            </p>
            <button
              type="button"
              onClick={closeCraftsmanPublicProfile}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border border-stone-200"
            >
              Zavřít
            </button>
          </div>
        </div>
      </AppPanelPortal>
    );
  }

  const rating = computeServiceRating(serviceReviews, service.id);
  const reviewCount = getVisibleReviews(serviceReviews, service.id).length;
  const shortName = service.name?.split("—")[0]?.trim() ?? service.name;

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={closeCraftsmanPublicProfile} />
        </div>
        <div className="pp-app-sheet" role="dialog" aria-label={service.name}>
          <div className="pp-app-sheet-body p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">
                  Profil služby
                </p>
                <h2 className="text-lg font-bold text-stone-900 leading-snug mt-0.5">
                  {service.name}
                </h2>
                <p className="text-xs text-[#3D7A68] font-medium mt-1">
                  {service.profession ?? service.subcategoryLabel}
                  {service.actionRadius != null
                    ? ` · dojezd ${formatCraftsmanRadiusLabel(service.actionRadius)}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCraftsmanPublicProfile}
                className="text-stone-400 text-xl px-1 shrink-0"
                aria-label="Zavřít"
              >
                ×
              </button>
            </div>

            <div className="rounded-xl border border-[#C5DDD4] bg-[#F7FAF9] px-3 py-2.5">
              <p className="text-sm font-bold text-[#1B4D3E]">
                {rating != null ? `★ ${rating}` : "Zatím bez hodnocení"}
                <span className="font-normal text-stone-500 text-xs ml-2">
                  {reviewCount} {reviewCount === 1 ? "recenze" : "recenzí"}
                </span>
              </p>
            </div>

            {service.serviceDescription && (
              <div>
                <p className="text-[10px] font-bold uppercase text-stone-400 mb-1">Popis služeb</p>
                <p className="text-sm text-stone-700 leading-relaxed">{service.serviceDescription}</p>
              </div>
            )}

            {(service.address || service.defaultAddress) && (
              <p className="text-xs text-stone-500">
                {service.defaultAddress ?? service.address}
              </p>
            )}

            <MessageButton
              participantId={service.ownerUserId ?? service.id}
              participantName={shortName}
              primary
              inactive={!service.ownerUserId}
            />

            <div>
              <p className="text-[10px] font-bold uppercase text-stone-400 mb-2">Recenze</p>
              <ServiceReviewList
                serviceId={service.id}
                showComposer={canWriteServiceReview(user, service)}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
