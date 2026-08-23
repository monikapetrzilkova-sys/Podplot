import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { canWriteServiceReview } from "../../data/serviceReviews.js";
import ServiceReviewList from "./ServiceReviewList.jsx";

export default function ServiceProfileEditor({ service, showReviews = true }) {
  const { updateServiceDescription, user } = useApp();
  const [description, setDescription] = useState(service.serviceDescription ?? "");

  if (!service) return null;

  const save = () => {
    updateServiceDescription(service.id, description.trim());
  };

  return (
    <div className="space-y-4">
      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-stone-800 mb-1">Popis služeb</h3>
        <p className="text-xs text-stone-500 mb-2">
          Krátce popište, co nabízíte — text uvidí sousedé v katalogu.
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Např. Dělám rozvody vody, opravy kohoutků, instalace bojlerů…"
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
        />
        <button
          type="button"
          onClick={save}
          className="mt-2 w-full py-2 text-sm font-semibold text-white rounded-xl"
          style={{ background: "#1B4332" }}
        >
          Uložit popis
        </button>
      </section>

      {showReviews && (
        <section className="bg-white border border-stone-200 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-stone-800 mb-2">
            {canWriteServiceReview(user, service) ? "Reference / Recenze" : "Obdržené recenze"}
          </h3>
          {!canWriteServiceReview(user, service) && (
            <p className="text-xs text-stone-500 mb-2">Recenze od ověřených sousedů — nelze psát sám sobě.</p>
          )}
          <ServiceReviewList serviceId={service.id} showComposer={canWriteServiceReview(user, service)} />
        </section>
      )}
    </div>
  );
}
