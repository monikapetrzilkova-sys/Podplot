import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import EditedBadge from "./EditedBadge.jsx";
import ContentEditModal from "./ContentEditModal.jsx";
import OfficeAnnouncementForm from "./OfficeAnnouncementForm.jsx";
import { IconAlert } from "../data/icons.jsx";
import { IconNavPlus } from "./communityNavIcons.jsx";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";
import InfoTip from "./InfoTip.jsx";
import { formatAnnouncementScope } from "../data/officeAnnouncementScope.js";
import SparsePageDoodle from "./doodle/SparsePageDoodle.jsx";
import { DoodleOznameniScene } from "./doodle/doodleIllustrations.jsx";

const EDIT_BTN =
  "mt-2 text-xs font-semibold text-[#3D7A68] border border-[#C5DDD4] bg-white px-3 py-1.5 rounded-xl hover:bg-[#F1F6F5]";

function SectionAddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pp-map-add-fab-btn shrink-0"
      aria-label={label}
      title={label}
    >
      <IconNavPlus className="w-4 h-4" />
    </button>
  );
}

/**
 * Oznámení úřadu — přehled vydaných. Nové se přidá + vpravo nebo z dolního plus.
 */
export default function InstitutionCrisisPage() {
  const {
    pendingOfficeAction,
    clearPendingOfficeAction,
    activeCrisis,
    areaNews,
    municipalityPrompts,
    updateAreaNewsItem,
    updateOfficePrompt,
    activeLocation,
  } = useApp();

  const [composeType, setComposeType] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const municipality = activeLocation?.municipality || "obec";

  useEffect(() => {
    if (pendingOfficeAction !== "announce" && pendingOfficeAction !== "crisis") return;
    setComposeType(pendingOfficeAction === "crisis" ? "crisis" : "news");
    clearPendingOfficeAction?.();
  }, [pendingOfficeAction, clearPendingOfficeAction]);

  const officeNews = useMemo(
    () => areaNews.filter((n) => n.type !== "crisis").slice(0, 8),
    [areaNews]
  );

  const inactiveCrisis = useMemo(
    () => areaNews.filter((n) => n.type === "crisis" && n.active === false).slice(0, 3),
    [areaNews]
  );

  const officePrompts = useMemo(
    () =>
      municipalityPrompts
        .filter((p) => p.fromOffice || p.authorRole === "urad")
        .slice(0, 6),
    [municipalityPrompts]
  );

  return (
    <div className="pp-page flex flex-col min-h-full px-4 pt-4 pb-8 gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-stone-900">Oznámení</p>
        <InfoTip title="Oznámení úřadu">
          <p>Nové přidáš plusem vpravo u typu, nebo tlačítkem + dole.</p>
          <p>Může platit pro celou obec, konkrétní místo, nebo vybrané ulice — třeba u blokového čištění.</p>
          <p>Mimořádné se sousedům ukáže v SOS pruhu.</p>
        </InfoTip>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Mimořádné</h2>
          <SectionAddButton label="Nové mimořádné oznámení" onClick={() => setComposeType("crisis")} />
        </div>
        {activeCrisis ? (
          <article className="rounded-2xl border border-[#C5DDD4] bg-[#F1F6F5] p-4">
            <div className="flex items-start gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center shrink-0">
                <IconAlert className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-stone-900">{activeCrisis.title}</h3>
                  <EditedBadge item={activeCrisis} />
                </div>
                <p className="text-[11px] text-[#3D7A68] mt-0.5">
                  {formatAnnouncementScope(activeCrisis, municipality)}
                </p>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed whitespace-pre-wrap">
                  {activeCrisis.body}
                </p>
                <p className="text-[10px] text-stone-400 mt-2">
                  {activeCrisis.author}
                  {activeCrisis.time ? ` · ${activeCrisis.time}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => setEditTarget({ kind: "news", item: activeCrisis })}
                  className={EDIT_BTN}
                >
                  Upravit
                </button>
              </div>
            </div>
          </article>
        ) : (
          <p className="pp-card px-4 py-3 text-xs text-stone-500">Žádné aktivní mimořádné oznámení.</p>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Běžné aktuality</h2>
          <SectionAddButton label="Nová aktualita obce" onClick={() => setComposeType("news")} />
        </div>
        {officeNews.length === 0 ? (
          <p className="pp-card px-4 py-3 text-xs text-stone-500">Zatím žádná aktualita.</p>
        ) : (
          officeNews.map((n) => (
            <article key={n.id} className="pp-card px-3.5 py-3">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">
                {n.author} · {n.time}
              </p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <h3 className="text-sm font-semibold text-stone-900">{n.title}</h3>
                {isSampleContent(n) ? <SampleBadge /> : null}
                <EditedBadge item={n} />
              </div>
              <p className="text-[11px] text-[#3D7A68] mt-0.5">
                {formatAnnouncementScope(n, municipality)}
              </p>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed whitespace-pre-wrap">{n.body}</p>
              <button
                type="button"
                onClick={() => setEditTarget({ kind: "news", item: n })}
                className={EDIT_BTN}
              >
                Upravit
              </button>
            </article>
          ))
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Podněty úřadu</h2>
          <SectionAddButton label="Nový podnět" onClick={() => setComposeType("prompt")} />
        </div>
        {officePrompts.length === 0 ? (
          <p className="pp-card px-4 py-3 text-xs text-stone-500">Zatím žádný podnět v evidenci.</p>
        ) : (
          officePrompts.map((p) => (
            <article key={p.id} className="pp-card px-3.5 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-stone-900">{p.title}</h3>
                <EditedBadge item={p} />
              </div>
              <p className="text-[11px] text-[#3D7A68] mt-0.5">
                {formatAnnouncementScope(p, municipality)}
              </p>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{p.body}</p>
              <p className="text-[10px] text-stone-400 mt-1.5">
                {p.statusLabel}
                {p.time ? ` · ${p.time}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setEditTarget({ kind: "prompt", item: p })}
                className={EDIT_BTN}
              >
                Upravit
              </button>
            </article>
          ))
        )}
      </section>

      {inactiveCrisis.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500 px-0.5">
            Archiv mimořádných
          </h2>
          {inactiveCrisis.map((n) => (
            <article key={n.id} className="pp-card px-3.5 py-3 opacity-80">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-stone-800">{n.title}</h3>
                {isSampleContent(n) ? <SampleBadge /> : null}
                <EditedBadge item={n} />
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {formatAnnouncementScope(n, municipality)}
              </p>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{n.body}</p>
              <button
                type="button"
                onClick={() => setEditTarget({ kind: "news", item: n })}
                className={EDIT_BTN}
              >
                Upravit
              </button>
            </article>
          ))}
        </section>
      )}

      <SparsePageDoodle
        Scene={DoodleOznameniScene}
        count={(activeCrisis ? 1 : 0) + officeNews.length + officePrompts.length}
        hideFrom={6}
      />

      <OfficeAnnouncementForm
        open={Boolean(composeType)}
        initialType={composeType || "news"}
        onClose={() => setComposeType(null)}
      />

      <ContentEditModal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={editTarget?.kind === "prompt" ? "Upravit podnět" : "Upravit oznámení"}
        initialTitle={editTarget?.item?.title ?? ""}
        initialBody={editTarget?.item?.body ?? ""}
        onSave={({ title, body }) => {
          if (!editTarget?.item?.id) return false;
          if (editTarget.kind === "prompt") {
            return updateOfficePrompt(editTarget.item.id, { title, body });
          }
          return updateAreaNewsItem(editTarget.item.id, { title, body });
        }}
      />
    </div>
  );
}
