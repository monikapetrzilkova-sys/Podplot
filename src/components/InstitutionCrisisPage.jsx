import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import EditedBadge from "./EditedBadge.jsx";
import ContentEditModal from "./ContentEditModal.jsx";
import OfficeAnnouncementForm from "./OfficeAnnouncementForm.jsx";
import { IconAlert } from "../data/icons.jsx";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";
import InfoTip from "./InfoTip.jsx";
import { formatAnnouncementScope } from "../data/officeAnnouncementScope.js";
import { activePostsLabel } from "../data/officeAnnouncementCopy.js";
import SparsePageDoodle from "./doodle/SparsePageDoodle.jsx";
import { DoodleOznameniScene } from "./doodle/doodleIllustrations.jsx";
import CollapsibleCategoryCard from "./CollapsibleCategoryCard.jsx";

const EDIT_BTN =
  "mt-2 text-xs font-semibold text-[#3D7A68] border border-[#C5DDD4] bg-white px-3 py-1.5 rounded-xl hover:bg-[#F1F6F5]";

/**
 * Oznámení úřadu — tři kategorie hned, seznam až po rozbalení.
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
  const [openSection, setOpenSection] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const municipality = activeLocation?.municipality || "obec";

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const startCompose = (type) => {
    setOpenSection(type);
    setComposeType(type);
  };

  useEffect(() => {
    if (pendingOfficeAction !== "announce" && pendingOfficeAction !== "crisis") return;
    const type = pendingOfficeAction === "crisis" ? "crisis" : "news";
    setOpenSection(type);
    setComposeType(type);
    clearPendingOfficeAction?.();
  }, [pendingOfficeAction, clearPendingOfficeAction]);

  const officeNews = useMemo(
    () => areaNews.filter((n) => n.type !== "crisis" && (n.role === "urad" || n.fromOffice)),
    [areaNews]
  );

  const inactiveCrisis = useMemo(
    () => areaNews.filter((n) => n.type === "crisis" && n.active === false),
    [areaNews]
  );

  const officePrompts = useMemo(
    () => municipalityPrompts.filter((p) => p.fromOffice || p.authorRole === "urad"),
    [municipalityPrompts]
  );

  const crisisCount = activeCrisis ? 1 : 0;

  return (
    <div className="pp-page flex flex-col min-h-full px-4 pt-4 pb-8 gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-stone-900">Oznámení</p>
        <InfoTip title="Oznámení úřadu">
          <p>Nejdřív vyber kategorii. Seznam příspěvků se otevře po klepnutí.</p>
          <p>Nové přidáš plusem u kategorie, nebo tlačítkem + dole.</p>
          <p>Může platit pro celou obec, konkrétní místo, nebo vybrané ulice.</p>
          <p>Mimořádné se sousedům ukáže v SOS pruhu.</p>
        </InfoTip>
      </div>

      <CollapsibleCategoryCard
        id="crisis"
        title="Mimořádné"
        countLabel={activePostsLabel(crisisCount)}
        open={openSection === "crisis"}
        onToggle={() => toggleSection("crisis")}
        onAdd={() => startCompose("crisis")}
        addLabel="Nové mimořádné oznámení"
      >
        {activeCrisis ? (
          <article className="rounded-2xl border border-[#C5DDD4] bg-[#F1F6F5] p-3.5">
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
          <p className="px-1 py-2 text-xs text-stone-500">Žádné aktivní mimořádné oznámení.</p>
        )}
        {inactiveCrisis.length > 0 ? (
          <div className="space-y-2 pt-1">
            <p className="px-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-400">
              Archiv mimořádných
            </p>
            {inactiveCrisis.map((n) => (
              <article key={n.id} className="rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3 opacity-80">
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
          </div>
        ) : null}
      </CollapsibleCategoryCard>

      <CollapsibleCategoryCard
        id="news"
        title="Běžné aktuality"
        countLabel={activePostsLabel(officeNews.length)}
        open={openSection === "news"}
        onToggle={() => toggleSection("news")}
        onAdd={() => startCompose("news")}
        addLabel="Nová aktualita obce"
      >
        {officeNews.length === 0 ? (
          <p className="px-1 py-2 text-xs text-stone-500">Zatím žádná aktualita.</p>
        ) : (
          officeNews.map((n) => (
            <article key={n.id} className="rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3">
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
      </CollapsibleCategoryCard>

      <CollapsibleCategoryCard
        id="prompt"
        title="Podněty úřadu"
        countLabel={activePostsLabel(officePrompts.length)}
        open={openSection === "prompt"}
        onToggle={() => toggleSection("prompt")}
        onAdd={() => startCompose("prompt")}
        addLabel="Nový podnět"
      >
        {officePrompts.length === 0 ? (
          <p className="px-1 py-2 text-xs text-stone-500">Zatím žádný podnět v evidenci.</p>
        ) : (
          officePrompts.map((p) => (
            <article key={p.id} className="rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-3">
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
      </CollapsibleCategoryCard>

      <SparsePageDoodle
        Scene={DoodleOznameniScene}
        count={crisisCount + officeNews.length + officePrompts.length}
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
