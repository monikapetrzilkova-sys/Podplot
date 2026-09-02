import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import EditedBadge from "./EditedBadge.jsx";
import ContentEditModal from "./ContentEditModal.jsx";
import { IconAlert } from "../data/icons.jsx";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";

function ComposeRow({ id, title, summary, open, onToggle, children }) {
  return (
    <section className={`pp-card overflow-hidden ${open ? "ring-1 ring-[#C5DDD4]" : ""}`}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-stone-900">{title}</span>
          <span className="block text-[11px] text-stone-500 mt-0.5 leading-snug">{summary}</span>
        </span>
        <span
          className={`shrink-0 mt-0.5 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-0 space-y-2 border-t border-stone-100">{children}</div>}
    </section>
  );
}

const EDIT_BTN =
  "mt-2 text-xs font-semibold text-[#3D7A68] border border-[#C5DDD4] bg-white px-3 py-1.5 rounded-xl hover:bg-[#F1F6F5]";

/**
 * Oznámení úřadu — accordion (mimořádné / aktualita / podnět) + přehled vydaných.
 * Z [+] se otevře výběr mimořádné vs. běžná aktualita.
 */
export default function InstitutionCrisisPage() {
  const {
    areaNewsTitleDraft,
    setAreaNewsTitleDraft,
    areaNewsBodyDraft,
    setAreaNewsBodyDraft,
    crisisTitleDraft,
    setCrisisTitleDraft,
    crisisBodyDraft,
    setCrisisBodyDraft,
    officePromptTitleDraft,
    setOfficePromptTitleDraft,
    officePromptBodyDraft,
    setOfficePromptBodyDraft,
    publishAreaNews,
    publishCrisisAlert,
    createOfficePrompt,
    pendingOfficeAction,
    clearPendingOfficeAction,
    activeCrisis,
    areaNews,
    municipalityPrompts,
    updateAreaNewsItem,
    updateOfficePrompt,
  } = useApp();

  const [openType, setOpenType] = useState(null);
  const [plusPicker, setPlusPicker] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    if (pendingOfficeAction !== "announce" && pendingOfficeAction !== "crisis") return;
    setPlusPicker(true);
    setOpenType(null);
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

  const toggleType = (id) => {
    setPlusPicker(false);
    setOpenType((prev) => (prev === id ? null : id));
  };

  const pickFromPlus = (id) => {
    setPlusPicker(false);
    setOpenType(id);
  };

  return (
    <div className="pp-page flex flex-col min-h-full px-4 pt-4 pb-8 gap-4">
      <div>
        <p className="text-xs text-stone-500">
          Co vydává úřad — klepni na typ a doplň nadpis s textem
        </p>
      </div>

      {plusPicker && (
        <section className="pp-card p-4 space-y-2 ring-2 ring-[#3D7A68] border-[#3D7A68]">
          <h2 className="text-sm font-bold text-[#1B4D3E]">Nové oznámení</h2>
          <p className="text-[11px] text-stone-500">Vyber typ hlášení úřadu.</p>
          <button
            type="button"
            onClick={() => pickFromPlus("crisis")}
            className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-[#3D7A68] hover:bg-[#F1F6F5] transition-colors"
          >
            <span className="block text-sm font-semibold text-stone-900">Mimořádné oznámení</span>
            <span className="block text-[11px] text-stone-500 mt-0.5">
              Havárie, uzavírky, krizové informace — SOS pruh u sousedů
            </span>
          </button>
          <button
            type="button"
            onClick={() => pickFromPlus("news")}
            className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-[#3D7A68] hover:bg-[#F1F6F5] transition-colors"
          >
            <span className="block text-sm font-semibold text-stone-900">Běžná aktualita obce</span>
            <span className="block text-[11px] text-stone-500 mt-0.5">
              Plánované práce, svozy, úřední informace na Domů
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPlusPicker(false)}
            className="w-full text-[11px] font-semibold text-stone-500 py-1"
          >
            Zrušit
          </button>
        </section>
      )}

      <div className="space-y-2.5">
        <ComposeRow
          id="crisis"
          title="Mimořádné oznámení"
          summary="Krizové hlášení — sousedé uvidí nadpis nahoře, text po rozkliknutí"
          open={openType === "crisis"}
          onToggle={toggleType}
        >
          <p className="text-[11px] text-stone-500 pt-3">
            Občané uvidí nadpis nahoře a po rozkliknutí celý text.
          </p>
          <label className="block">
            <span className="text-[11px] font-semibold text-stone-600">Nadpis</span>
            <input
              type="text"
              value={crisisTitleDraft}
              onChange={(e) => setCrisisTitleDraft(e.target.value)}
              placeholder="Např. Havárie vody v části Jesenice"
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
              autoFocus={openType === "crisis"}
              maxLength={80}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-stone-600">Text hlášení</span>
            <textarea
              value={crisisBodyDraft}
              onChange={(e) => setCrisisBodyDraft(e.target.value)}
              rows={4}
              placeholder="Podrobnosti: očekávaný výpadek, doporučení pro občany…"
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              publishCrisisAlert();
              setOpenType(null);
            }}
            className="w-full py-2.5 bg-[#1B4D3E] text-white rounded-xl text-xs font-semibold"
          >
            Odeslat mimořádné oznámení
          </button>
        </ComposeRow>

        <ComposeRow
          id="news"
          title="Běžná aktualita obce"
          summary="Plánované práce, svozy, úřední informace na domovskou zeď"
          open={openType === "news"}
          onToggle={toggleType}
        >
          <p className="text-[11px] text-stone-500 pt-3">Zobrazí se sousedům jako aktualita obce.</p>
          <label className="block">
            <span className="text-[11px] font-semibold text-stone-600">Nadpis</span>
            <input
              type="text"
              value={areaNewsTitleDraft}
              onChange={(e) => setAreaNewsTitleDraft(e.target.value)}
              placeholder="Např. Blokové čištění ulic ve středu"
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
              autoFocus={openType === "news"}
              maxLength={80}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-stone-600">Text aktuality</span>
            <textarea
              value={areaNewsBodyDraft}
              onChange={(e) => setAreaNewsBodyDraft(e.target.value)}
              rows={3}
              placeholder="Podrobnosti oznámení pro celou obec…"
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              publishAreaNews();
              setOpenType(null);
            }}
            className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
          >
            Publikovat aktualitu
          </button>
        </ComposeRow>

        <ComposeRow
          id="prompt"
          title="Podnět / návrh"
          summary="Interní návrh nebo podnět úřadu do evidence obce"
          open={openType === "prompt"}
          onToggle={toggleType}
        >
          <p className="text-[11px] text-stone-500 pt-3">
            Uloží se do evidence podnětů jako položka od úřadu (ne jako výzva občanům).
          </p>
          <label className="block">
            <span className="text-[11px] font-semibold text-stone-600">Nadpis</span>
            <input
              type="text"
              value={officePromptTitleDraft ?? ""}
              onChange={(e) => setOfficePromptTitleDraft(e.target.value)}
              placeholder="Např. Návrh úpravy přechodu u školy"
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
              autoFocus={openType === "prompt"}
              maxLength={80}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-stone-600">Text</span>
            <textarea
              value={officePromptBodyDraft ?? ""}
              onChange={(e) => setOfficePromptBodyDraft(e.target.value)}
              rows={3}
              placeholder="Popis návrhu nebo podnětu…"
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              createOfficePrompt?.();
              setOpenType(null);
            }}
            className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
          >
            Uložit podnět
          </button>
        </ComposeRow>
      </div>

      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500 px-0.5">
          Aktivní mimořádné
        </h2>
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

      {officeNews.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500 px-0.5">
            Aktuality obce
          </h2>
          {officeNews.map((n) => (
            <article key={n.id} className="pp-card px-3.5 py-3">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">
                {n.author} · {n.time}
              </p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <h3 className="text-sm font-semibold text-stone-900">{n.title}</h3>
                {isSampleContent(n) ? <SampleBadge /> : null}
                <EditedBadge item={n} />
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed whitespace-pre-wrap">{n.body}</p>
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

      {officePrompts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500 px-0.5">
            Podněty úřadu
          </h2>
          {officePrompts.map((p) => (
            <article key={p.id} className="pp-card px-3.5 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-stone-900">{p.title}</h3>
                <EditedBadge item={p} />
              </div>
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
          ))}
        </section>
      )}

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
