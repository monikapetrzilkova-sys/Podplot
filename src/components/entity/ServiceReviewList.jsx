import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import {
  computeServiceRating,
  getVisibleReviews,
  isReviewPendingModeration,
  REVIEW_REPORT_REASONS,
} from "../../data/serviceReviews.js";
import AppPanelPortal from "../AppPanelPortal.jsx";
import ModalDoodleBackdrop from "../ModalDoodleBackdrop.jsx";

function ReportReviewSheet({ review, onClose, onSubmit }) {
  const [reasonId, setReasonId] = useState("");
  const [comment, setComment] = useState("");

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!reasonId) return;
            onSubmit({ reasonId, comment: comment.trim() });
          }}
          className="pp-app-sheet p-5 space-y-3"
          role="dialog"
          aria-label="Nahlásit recenzi"
        >
          <h3 className="text-sm font-bold text-stone-900">Nahlásit recenzi</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Recenze zůstane viditelná se stavem „Čeká na posouzení“ — nelze ji okamžitě smazat.
          </p>
          <div className="space-y-2">
            {REVIEW_REPORT_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReasonId(r.id)}
                className={`w-full text-left p-3 rounded-xl border text-sm ${
                  reasonId === r.id ? "border-[#3D7A68] bg-[#F1F6F5]" : "border-stone-200"
                }`}
              >
                <span className="font-semibold">{r.label}</span>
                <span className="block text-[11px] text-stone-500 mt-0.5">{r.hint}</span>
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            required={reasonId === "other"}
            placeholder="Komentář pro administrátora…"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none bg-white"
          />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-stone-200 rounded-xl text-sm font-semibold">
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!reasonId || (reasonId === "other" && !comment.trim())}
              className="flex-1 py-2 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold disabled:opacity-40"
            >
              Odeslat
            </button>
          </div>
        </form>
      </div>
    </AppPanelPortal>
  );
}

export default function ServiceReviewList({ serviceId, showComposer = false, compact = false }) {
  const { serviceReviews, addServiceReview, reportServiceReview, user } = useApp();
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [composerOpen, setComposerOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  const visible = getVisibleReviews(serviceReviews, serviceId);
  const rating = computeServiceRating(serviceReviews, serviceId);

  const submit = () => {
    if (!text.trim()) return;
    addServiceReview({ serviceId, text: text.trim(), stars });
    setText("");
    setStars(5);
    setComposerOpen(false);
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {rating != null && (
        <p className="text-sm font-semibold text-[#3D7A68]">
          ★ {rating} · {visible.length} recenzí od ověřených sousedů
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-xs text-stone-500">Zatím žádné ověřené recenze.</p>
      ) : (
        visible.map((r) => {
          const pending = isReviewPendingModeration(r);
          return (
            <div
              key={r.id}
              className={`rounded-lg p-2.5 text-xs ${
                pending ? "bg-amber-50 border border-amber-100" : "bg-stone-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-amber-600 font-semibold mb-0.5">{"★".repeat(r.stars ?? 5)}</p>
                {pending && (
                  <span className="text-[9px] font-bold uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Čeká na posouzení
                  </span>
                )}
              </div>
              <p className="text-stone-700">{r.text}</p>
              <p className="text-[10px] text-stone-400 mt-1 flex flex-wrap items-center gap-2">
                <span>{r.authorName}</span>
                <span className="font-bold text-[#3D7A68] bg-[#F1F6F5] px-1.5 py-0.5 rounded-md border border-[#C5DDD4]">
                  ✓ Ověřený soused
                </span>
                {r.location && <span>{r.location}</span>}
              </p>
              {!pending && user?.id !== r.authorId && (
                <button
                  type="button"
                  onClick={() => setReportTarget(r)}
                  className="mt-1.5 text-[10px] text-[#A85858] font-semibold hover:underline"
                >
                  Nahlásit recenzi
                </button>
              )}
            </div>
          );
        })
      )}

      {showComposer && !composerOpen && (
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="text-[11px] font-medium text-stone-500 hover:text-[#3D7A68] underline-offset-2 hover:underline"
        >
          Napsat recenzi
        </button>
      )}

      {showComposer && composerOpen && (
        <div className="border border-stone-200 rounded-xl p-3 space-y-2 bg-white">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
            Napsat recenzi
          </p>
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
            placeholder="Vaše zkušenost…"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none bg-white"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setComposerOpen(false);
                setText("");
                setStars(5);
              }}
              className="flex-1 py-2 text-xs font-semibold text-stone-600 border border-stone-200 rounded-xl bg-white"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={submit}
              className="flex-1 py-2 text-xs font-semibold text-[#1B4D3E] border border-[#C5DDD4] rounded-xl bg-[#F1F6F5]"
            >
              Odeslat recenzi
            </button>
          </div>
        </div>
      )}

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
