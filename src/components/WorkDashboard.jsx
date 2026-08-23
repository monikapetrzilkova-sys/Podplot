import { useApp } from "../context/AppContext.jsx";
import { isMobilniTestRole } from "../data/userRoles.js";
import { resolveBusinessSubtype } from "../data/accountTypes.js";
import { MessageButton } from "./MessagesPage.jsx";
import {
  formatCraftsmanRadiusLabel,
  isNationwideRadius,
} from "../data/craftsmanSettings.js";
import { MOBILNI_PUSH_SUBSCRIPTION } from "../data/notificationPlans.js";

function InquiryRow({ item, onMarkRead, onExpressInterest }) {
  const isDelayed = item.priority === "delayed";
  const isPush = item.priority === "immediate" || item.push;
  const interestSent = Boolean(item.interestSent);

  return (
    <article
      className={`pp-card rounded-xl p-3 text-xs shadow-sm ${
        item.read ? "opacity-80" : isPush ? "ring-1 ring-[#C5DDD4] bg-[#F7FAF9]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase text-stone-400">
          {item.type === "event_outreach" ? "Nabídka spolupráce" : "Poptávka"}
          {isPush && <span className="ml-1 text-[#3D7A68]">· Push</span>}
          {isDelayed && <span className="ml-1 text-stone-500">· Zpožděný náhled</span>}
        </p>
        {!item.read && (
          <button
            type="button"
            onClick={() => onMarkRead(item.id)}
            className="text-[10px] text-[#3D7A68] font-semibold"
          >
            Označit přečtené
          </button>
        )}
      </div>
      <p className="text-sm font-semibold text-stone-900 mt-1">{item.title}</p>
      <p className="text-stone-600 mt-1">{item.text}</p>
      <p className="text-[10px] text-stone-400 mt-1">
        {item.author} · {item.time}
        {item.distanceKm != null && ` · ${item.distanceKm} km`}
        {item.categoryLabel ? ` · ${item.categoryLabel}` : ""}
      </p>
      {item.type === "service_request" && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          <MessageButton participantId={item.authorId} participantName={item.author} />
          {interestSent ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] bg-[#E8F0ED] px-3 py-1.5 rounded-xl border border-[#3D7A68]/35">
              <span aria-hidden>✓</span>
              Mám zájem
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onExpressInterest(item)}
              className="text-xs font-semibold text-[#1B4D3E] bg-white px-3 py-1.5 rounded-xl border border-[#C5DDD4] hover:bg-[#F1F6F5]"
            >
              Mám zájem
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/** Pracovní záložka řemeslníka — jen feed poptávek (správa a přepínač role jsou v Profilu) */
export default function WorkDashboard() {
  const {
    testRoleId,
    user,
    b2bInquiries,
    markB2bInquiryRead,
    expressInterestInInquiry,
    ownedService,
    craftsmanRadius,
    businessNotificationPrefs,
  } = useApp();

  const isMobilni =
    isMobilniTestRole(testRoleId) || resolveBusinessSubtype(user) === "mobilni";

  const unreadInquiries = b2bInquiries.filter((i) => !i.read).length;
  const pushActive = businessNotificationPrefs?.serviceRequestPushEnabled;
  const catalogLabel = ownedService?.name || user?.businessName || null;

  return (
    <div className="flex flex-col min-h-full pp-page">
      <div className="px-4 pt-4 pb-1">
        <p className="text-xs text-stone-500">
          Poptávky
          {catalogLabel ? ` · ${catalogLabel}` : ""}
          {unreadInquiries > 0 ? ` · ${unreadInquiries} nepřečtených` : ""}
        </p>
      </div>

      <div className="px-4 py-3 pb-8 space-y-3 flex-1">
        {isMobilni && (
          <div className="rounded-xl border border-[#C5DDD4] bg-[#F7FAF9] px-3 py-2.5 text-[11px] text-stone-600 leading-relaxed">
            Filtr:{" "}
            <span className="font-semibold text-stone-800">
              {formatCraftsmanRadiusLabel(craftsmanRadius)}
            </span>
            {ownedService?.profession ? (
              <>
                {" "}
                · obor{" "}
                <span className="font-semibold text-stone-800">{ownedService.profession}</span>
              </>
            ) : null}
            {" · "}
            {pushActive ? (
              <span className="text-[#3D7A68] font-semibold">
                Push aktivní — vidíte poptávky jako první
              </span>
            ) : (
              <span>
                bez Push ({MOBILNI_PUSH_SUBSCRIPTION.price} Kč/
                {MOBILNI_PUSH_SUBSCRIPTION.period}) se nové poptávky zobrazí se zpožděním —
                aktivace v Propagaci
              </span>
            )}
            {!isNationwideRadius(craftsmanRadius) && (
              <span className="block mt-1 text-stone-400">
                Dojezd a obor nastavíte v Profilu. Poptávky mimo filtr se nezobrazují.
              </span>
            )}
          </div>
        )}

        {b2bInquiries.length === 0 ? (
          <div className="pp-doodle-empty py-10">
            <p className="text-sm text-center font-medium text-[#3D7A68]/80 max-w-xs leading-relaxed mx-auto">
              V tomto okruhu a oboru zatím žádné poptávky. S push předplatným je uvidíte jako první.
            </p>
          </div>
        ) : (
          b2bInquiries.map((item) => (
            <InquiryRow
              key={item.id}
              item={item}
              onMarkRead={markB2bInquiryRead}
              onExpressInterest={expressInterestInInquiry}
            />
          ))
        )}
      </div>
    </div>
  );
}
