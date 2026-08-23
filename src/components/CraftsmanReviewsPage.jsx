import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  computeServiceRating,
  getOwnerReviews,
  getReviewReportReason,
  isReviewPendingModeration,
  REVIEW_REPORT_REASONS,
} from "../data/serviceReviews.js";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";

function ReportReviewSheet({ review, onClose, onSubmit }) {
  const [reasonId, setReasonId] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reasonId) return;
    onSubmit({ reasonId, comment: comment.trim() });
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="pp-app-sheet p-5 space-y-3"
          role="dialog"
          aria-label="Nahlásit recenzi"
        >
          <h3 className="text-sm font-bold text-stone-900">Nahlásit recenzi</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Recenze zůstane na profilu se stavem „Čeká na posouzení“. Moderátor rozhodne — nelze tak
            mazat pravdivé negativní hodnocení.
          </p>
          <p className="text-[11px] text-stone-400 line-clamp-2">„{review.text}“</p>

          <div className="space-y-2">
            {REVIEW_REPORT_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReasonId(r.id)}
                className={`w-full text-left p-3 rounded-xl border text-sm ${
                  reasonId === r.id
                    ? "border-[#3D7A68] bg-[#F1F6F5]"
                    : "border-stone-200 bg-white"
                }`}
              >
                <span className="font-semibold text-stone-900">{r.label}</span>
                <span className="block text-[11px] text-stone-500 mt-0.5">{r.hint}</span>
              </button>
            ))}
          </div>

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">
              Komentář pro administrátora {reasonId === "other" ? "(povinný)" : "(volitelný)"}
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              required={reasonId === "other"}
              placeholder="Stručně popište situaci…"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none bg-white"
            />
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold bg-white"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!reasonId || (reasonId === "other" && !comment.trim())}
              className="flex-1 py-2.5 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold disabled:opacity-40"
            >
              Odeslat hlášení
            </button>
          </div>
        </form>
      </div>
    </AppPanelPortal>
  );
}

/** Záložka Recenze — hodnocení služby / provozovny + nahlášení k moderaci */
export default function CraftsmanReviewsPage() {
  const {
    ownedService,
    ownedInstitution,
    serviceReviews,
    reportServiceReview,
    user,
    isFyzickaWorkMode,
  } = useApp();

  const [reportTarget, setReportTarget] = useState(null);

  const serviceId = ownedService?.id;
  const reviews = useMemo(
    () => (serviceId ? getOwnerReviews(serviceReviews, serviceId) : []),
    [serviceReviews, serviceId]
  );
  const rating = serviceId ? computeServiceRating(serviceReviews, serviceId) : null;
  const pendingCount = reviews.filter(isReviewPendingModeration).length;
  const profileName =
    ownedService?.name ?? ownedInstitution?.name ?? (isFyzickaWorkMode ? "Váš podnik" : null);

  if (!ownedService && !isFyzickaWorkMode) {
    return (
      <div className="pp-page flex flex-col min-h-full px-4 pt-4 pb-8">
        <p className="text-sm text-stone-500 leading-relaxed">
          Zatím nemáte katalogový profil služby. Doplňte obor v Profilu — pak zde uvidíte hodnocení
          od zákazníků.
        </p>
      </div>
    );
  }

  return (
    <div className="pp-page flex flex-col min-h-full">
      <div className="px-4 pt-4 pb-1">
        <p className="text-xs text-stone-500">{profileName}</p>
      </div>

      <div className="px-4 py-3 pb-8 space-y-3 flex-1">
        <section className="rounded-2xl border border-[#C5DDD4] bg-[#F7FAF9] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Průměrné skóre</p>
          <p className="text-2xl font-bold text-[#1B4D3E] mt-1">
            {rating != null ? `★ ${rating}` : "—"}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {reviews.length} {reviews.length === 1 ? "recenze" : "recenzí"} od ověřených sousedů
            {pendingCount > 0 ? ` · ${pendingCount} čeká na moderaci` : ""}
          </p>
        </section>

        {reviews.length === 0 ? (
          <div className="pp-doodle-empty py-10">
            <p className="text-sm text-center font-medium text-[#3D7A68]/80 max-w-xs leading-relaxed mx-auto">
              {isFyzickaWorkMode
                ? "Zatím žádné recenze od zákazníků. Podezřelé hodnocení půjde nahlásit k moderaci."
                : "Zatím žádné recenze. Po dokončených zakázkách se zde objeví hodnocení zákazníků."}
            </p>
          </div>
        ) : (
          reviews.map((r) => {
            const pending = isReviewPendingModeration(r);
            const reason = getReviewReportReason(r.reportReason);
            return (
              <article
                key={r.id}
                className={`pp-card rounded-xl p-3.5 ${
                  pending ? "ring-1 ring-amber-200 bg-amber-50/40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-amber-600">
                    {"★".repeat(r.stars ?? 5)}
                    <span className="text-stone-300">{"★".repeat(5 - (r.stars ?? 5))}</span>
                  </p>
                  {pending && (
                    <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                      Čeká na posouzení
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-700 mt-1.5 leading-relaxed">{r.text}</p>
                <p className="text-[11px] text-stone-400 mt-2 flex flex-wrap gap-x-2 gap-y-1">
                  <span className="font-medium text-stone-600">{r.authorName}</span>
                  <span className="text-[#3D7A68] font-semibold">✓ Ověřený soused</span>
                  {r.location && <span>{r.location}</span>}
                </p>
                {pending && reason && (
                  <p className="text-[11px] text-amber-800/80 mt-2">
                    Nahlášeno: {reason.label}
                    {r.reportComment ? ` — ${r.reportComment}` : ""}
                  </p>
                )}
                {!pending && user?.id !== r.authorId && (
                  <button
                    type="button"
                    onClick={() => setReportTarget(r)}
                    className="mt-2.5 text-[11px] font-semibold text-[#A85858] hover:underline"
                  >
                    Nahlásit recenzi
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>

      {reportTarget && (
        <ReportReviewSheet
          review={reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmit={({ reasonId, comment }) => {
            reportServiceReview(reportTarget.id, { reasonId, comment });
            setReportTarget(null);
          }}
        />
      )}
    </div>
  );
}
