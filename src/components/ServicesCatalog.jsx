import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  SERVICE_PARENT_CATEGORIES,
  getServicePlaceholder,
  serviceMatchesParentCategory,
  serviceMatchesSearch,
} from "../data/serviceCategories.js";
import SearchField from "./SearchField.jsx";
import CategoryPills from "./CategoryPills.jsx";
import CompactAccordion from "./CompactAccordion.jsx";
import { accordionKey } from "../data/uiPreferences.js";
import { MessageButton } from "./MessagesPage.jsx";
import ReportUserButton from "./ReportUserButton.jsx";

function ServiceRow({ svc }) {
  const shortName = svc.name.split("—")[0].trim();
  const profession = svc.profession ?? svc.subcategoryLabel;

  return (
    <CompactAccordion
      prefKey={accordionKey("service", svc.id)}
      summary={
        <div className="space-y-0.5 min-w-0 w-full text-xs">
          <p className="text-stone-900 leading-snug">
            <span className="font-bold">{shortName}</span>
            <span className="text-stone-500"> · </span>
            <span className="italic text-stone-600">{profession}</span>
            {svc.rating && (
              <span className="text-amber-600 font-semibold ml-1">· ⭐ {svc.rating}</span>
            )}
          </p>
          <p className="text-[11px] text-stone-500 flex flex-wrap items-center gap-x-2 gap-y-0">
            <span>{svc.kapacitaPlna ? "🔴 Plná kapacita" : "🟢 Volná kapacita"}</span>
            <span>🚗 {svc.distanceKm} km</span>
            {svc.isVerified && <span className="text-emerald-700">✓ Ověřeno</span>}
            {svc.isPremium && <span className="text-[#3D7A68] font-semibold">Boost</span>}
          </p>
        </div>
      }
    >
      <div className="space-y-2 text-xs">
        <p className="text-stone-600">{svc.address}</p>
        {svc.reviews?.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-bold text-stone-500 uppercase text-[10px]">Recenze sousedů</p>
            {svc.reviews.map((r, i) => (
              <div key={i} className="bg-stone-50 rounded-lg p-2">
                <p className="text-stone-700">{r.text}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {r.author}
                  {r.verified && ` · Ověřený soused · ${r.location}`}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 flex-wrap pt-1">
          <MessageButton
            participantId={svc.ownerUserId ?? svc.id}
            participantName={shortName}
            inactive={!svc.ownerUserId}
          />
          <ReportUserButton targetId={svc.id} targetName={svc.name} compact />
        </div>
      </div>
    </CompactAccordion>
  );
}

export default function ServicesCatalog({ showRequestForm = false, hideToolbar = false }) {
  const {
    servicesCatalog,
    serviceRequests,
    addServiceRequest,
    serviceOrders,
    releaseEscrowOrder,
    servicesSearchQuery,
    setServicesSearchQuery,
    servicesParentCategory,
    setServicesParentCategory,
  } = useApp();
  const [requestText, setRequestText] = useState("");

  const sorted = [...servicesCatalog].sort((a, b) => {
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return a.distanceKm - b.distanceKm;
  });

  const filtered = sorted
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
      useEscrow: false,
      amount: 0,
    });
    setRequestText("");
  };

  return (
    <div className="space-y-3">
      {!hideToolbar && (
        <>
          <SearchField
            value={servicesSearchQuery}
            onChange={setServicesSearchQuery}
            placeholder="Hledat službu nebo řemeslníka… (např. instalatér)"
          />
          <CategoryPills
            categories={SERVICE_PARENT_CATEGORIES}
            activeId={servicesParentCategory}
            onSelect={setServicesParentCategory}
          />
        </>
      )}

      {showRequestForm && (
        <details className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
          <summary className="font-bold text-emerald-800 cursor-pointer">+ Rychlá poptávka</summary>
          <div className="mt-2 space-y-2">
            <textarea
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder={placeholder}
              rows={2}
              className="w-full px-3 py-2 border border-emerald-200 rounded-xl text-sm resize-none"
            />
            <p className="text-[11px] text-stone-500 leading-snug">
              Domluva a platba probíhá mezi vámi a řemeslníkem osobně — Podplot peníze nedrží.
            </p>
            <button
              type="button"
              onClick={submitRequest}
              className="w-full py-2 font-semibold bg-emerald-600 text-white rounded-xl"
            >
              Odeslat poptávku
            </button>
          </div>
        </details>
      )}

      {serviceOrders.length > 0 && (
        <section className="space-y-1.5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Chráněné platby</h3>
          {serviceOrders.map((o) => (
            <article key={o.id} className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs">
              <p className="font-semibold">{o.title}</p>
              <p className="text-emerald-700">{o.escrowStatusLabel}</p>
              {o.status === "held" && (
                <button type="button" onClick={() => releaseEscrowOrder(o.id)} className="text-emerald-700 font-semibold underline mt-1">
                  Potvrdit dokončení
                </button>
              )}
            </article>
          ))}
        </section>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-6">
          {servicesSearchQuery.trim() ? "Nic nenalezeno — zkuste jiné hledání." : "V kategorii zatím nikdo není."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((svc) => (
            <ServiceRow key={svc.id} svc={svc} />
          ))}
        </div>
      )}
    </div>
  );
}
