import { useState } from "react";

import { useApp } from "../context/AppContext.jsx";

import {
  SERVICE_PARENT_CATEGORIES,
  getServicePlaceholder,
  serviceMatchesParentCategory,
  serviceMatchesSearch,
  formatServiceBadgeLabel,
  getPrimaryServiceSubcategoryId,
} from "../data/serviceCategories.js";
import { getServiceReachLabel } from "../utils/serviceReach.js";
import { calcEscrowFee } from "../data/monetization.js";
import { canWriteServiceReview } from "../data/serviceReviews.js";
import SearchField from "../components/SearchField.jsx";
import CategoryPills from "../components/CategoryPills.jsx";
import LiveFeedCard from "../components/LiveFeedCard.jsx";
import { MessageButton } from "../components/MessagesPage.jsx";
import ReportUserButton from "../components/ReportUserButton.jsx";
import ServiceReviewList from "../components/entity/ServiceReviewList.jsx";
import { DoodleCapacityFullIcon, SERVICE_CATEGORY_DOODLE_ICONS } from "../components/doodle/doodleIcons.jsx";

const CAPACITY_FULL_TITLE = "Nepřijímá zakázky · plná kapacita";

function serviceStamp(svc) {
  const subId = getPrimaryServiceSubcategoryId(svc);
  return {
    badge: formatServiceBadgeLabel(svc),
    BadgeIcon: (subId && SERVICE_CATEGORY_DOODLE_ICONS[subId]) || SERVICE_CATEGORY_DOODLE_ICONS.ostatni,
  };
}

function ServiceRow({ svc }) {
  const { user } = useApp();
  const shortName = svc.name.split("—")[0].trim();
  const profession = svc.profession ?? svc.subcategoryLabel;
  const reach = getServiceReachLabel(svc);
  const stamp = serviceStamp(svc);
  const previewParts = [
    profession && profession !== shortName ? profession : null,
    svc.kapacitaPlna ? "Nepřijímá zakázky" : "Volná kapacita",
    reach?.label ?? null,
    `Dojezd ${svc.actionRadius ?? 15} km`,
    svc.isVerified ? "Ověřeno" : null,
    svc.isPremium ? "Boost" : null,
  ].filter(Boolean);

  return (
    <LiveFeedCard
      itemId={`catalog-mod-${svc.id}`}
      badge={stamp.badge}
      badgeClassName={svc.isPremium ? "pp-badge--tip" : ""}
      badgeTone="default"
      BadgeIcon={stamp.BadgeIcon}
      title={shortName}
      preview={previewParts.join(" · ")}
      priceLabel={svc.rating ? `★ ${svc.rating}` : null}
      statusIcon={
        svc.kapacitaPlna ? <DoodleCapacityFullIcon className="w-4 h-4" /> : null
      }
      statusTitle={svc.kapacitaPlna ? CAPACITY_FULL_TITLE : null}
    >
      <div className="space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <MessageButton
              participantId={svc.ownerUserId ?? svc.id}
              participantName={shortName}
              primary
              inactive={!svc.ownerUserId}
            />
          </div>
          <ReportUserButton targetId={svc.id} targetName={svc.name} compact />
        </div>
        {svc.serviceDescription && (
          <div>
            <p className="font-bold text-stone-500 uppercase text-[10px] mb-1">Popis služeb</p>
            <p className="text-stone-700 leading-relaxed">{svc.serviceDescription}</p>
          </div>
        )}
        <p className="text-stone-600">
          {svc.defaultAddress ?? svc.address}
          {svc.defaultAddress && svc.defaultAddress !== svc.address && (
            <span className="text-stone-400"> · výchozí poloha poskytovatele</span>
          )}
        </p>
        <div>
          <p className="font-bold text-stone-500 uppercase text-[10px] mb-2">Recenze</p>
          <ServiceReviewList
            serviceId={svc.id}
            showComposer={canWriteServiceReview(user, svc)}
            compact
          />
        </div>
      </div>
    </LiveFeedCard>
  );
}

export default function ServicesCatalogModule({ showRequestForm = false, hideToolbar = false }) {

  const {

    servicesCatalogReachable,

    serviceRequests,

    addServiceRequest,

    createEscrowOrder,

    serviceOrders,

    releaseEscrowOrder,

    servicesSearchQuery,

    setServicesSearchQuery,

    servicesParentCategory,

    setServicesParentCategory,

  } = useApp();



  const [requestText, setRequestText] = useState("");

  const [useEscrow, setUseEscrow] = useState(false);

  const [escrowAmount, setEscrowAmount] = useState(1000);



  const filtered = servicesCatalogReachable

    .filter((s) => serviceMatchesParentCategory(s, servicesParentCategory))

    .filter((s) => serviceMatchesSearch(s, servicesSearchQuery));



  const placeholder = getServicePlaceholder(

    servicesParentCategory === "vse" ? "default" : servicesParentCategory

  );



  const submitRequest = () => {

    if (!requestText.trim()) return;

    addServiceRequest({

      text: requestText.trim(),

      categoryLabel: SERVICE_PARENT_CATEGORIES.find((c) => c.id === servicesParentCategory)?.label ?? "Katalog",

      categoryId: servicesParentCategory,

      useEscrow,

      amount: escrowAmount,

    });

    if (useEscrow && escrowAmount > 0) {

      createEscrowOrder({ title: requestText.trim().slice(0, 50), amount: escrowAmount });

    }

    setRequestText("");

  };



  const escrowPreview = calcEscrowFee(escrowAmount);



  return (

    <div className="space-y-3">

      <header>

        <h2 className="text-lg font-bold text-stone-900">Katalog sluĹľeb</h2>

        <p className="text-xs text-stone-500 mt-1 leading-relaxed">

          SluĹľby u vĂˇs doma â€” specialistĂ© podle vaĹˇĂ­ polohy a dojezdu.

        </p>

      </header>



      {!hideToolbar && (

        <>

          <SearchField

            value={servicesSearchQuery}

            onChange={setServicesSearchQuery}

            placeholder={placeholder}

          />

          <CategoryPills

            categories={SERVICE_PARENT_CATEGORIES}

            activeId={servicesParentCategory}

            onSelect={setServicesParentCategory}

          />

        </>

      )}



      {showRequestForm && (

        <div className="pp-card p-4 space-y-3">

          <h3 className="text-sm font-bold text-stone-800">RychlĂˇ poptĂˇvka</h3>

          <textarea

            value={requestText}

            onChange={(e) => setRequestText(e.target.value)}

            placeholder="PopiĹˇte, co potĹ™ebujeteâ€¦"

            rows={3}

            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"

          />

          <label className="flex items-center gap-2 text-xs text-stone-600">

            <input type="checkbox" checked={useEscrow} onChange={(e) => setUseEscrow(e.target.checked)} />

            Escrow platba (bezpeÄŤnĂˇ rezervace)

          </label>

          {useEscrow && (

            <div className="text-xs text-stone-500">

              <input

                type="number"

                min={100}

                value={escrowAmount}

                onChange={(e) => setEscrowAmount(Number(e.target.value))}

                className="w-24 px-2 py-1 border rounded-lg mr-2"

              />

              KÄŤ Â· poplatek {escrowPreview.fee} KÄŤ

            </div>

          )}

          <button

            type="button"

            onClick={submitRequest}

            className="w-full py-2 pp-btn pp-btn-primary text-sm font-semibold"

          >

            Odeslat poptĂˇvku

          </button>

        </div>

      )}



      {filtered.length === 0 ? (

        <p className="text-sm text-stone-500 text-center py-8">

          Ve vaĹˇem okolĂ­ nejsou ĹľĂˇdnĂ­ poskytovatelĂ© v tomto filtru.

        </p>

      ) : (

        <div className="space-y-2">

          {filtered.map((svc) => (

            <ServiceRow key={svc.id} svc={svc} />

          ))}

        </div>

      )}



      {serviceOrders?.length > 0 && (

        <div className="mt-4">

          <h3 className="text-sm font-bold text-stone-800 mb-2">AktivnĂ­ escrow objednĂˇvky</h3>

          {serviceOrders.map((o) => (

            <div key={o.id} className="pp-card p-3 mb-2 text-xs">

              <p className="font-semibold">{o.title}</p>

              <p className="text-stone-500">{o.amount} KÄŤ Â· {o.status}</p>

              {o.status === "held" && (

                <button

                  type="button"

                  onClick={() => releaseEscrowOrder(o.id)}

                  className="mt-2 text-emerald-700 font-semibold"

                >

                  Uvolnit platbu

                </button>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );

}



