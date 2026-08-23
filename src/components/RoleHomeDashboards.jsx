import { useApp } from "../context/AppContext.jsx";
import { TEST_PERSONAS, CRAFTSMAN_NEARBY_REQUESTS } from "../data/businessProfiles.js";
import { MessageButton } from "./MessagesPage.jsx";
import PaymentModal from "./PaymentModal.jsx";
import { useState } from "react";

function DashShell({ title, subtitle, children }) {
  return (
    <div className="px-4 py-4 pb-8 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-stone-900">{title}</h1>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function CraftsmanHomeDashboard() {
  const {
    craftsmanRadius,
    craftsmanAcceptsOrders,
    setCraftsmanAcceptsOrders,
    promoteProfile,
    openCreate,
    showToast,
    openChat,
  } = useApp();
  const persona = TEST_PERSONAS.remeslnik;
  const [topPay, setTopPay] = useState(false);
  const nearby = CRAFTSMAN_NEARBY_REQUESTS.filter((r) => r.distanceKm <= craftsmanRadius);

  return (
    <DashShell title={persona.businessName} subtitle={`IČO ${persona.ico} · ★ ${persona.rating}`}>
      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-stone-800 mb-3">Statistiky profilu (30 dní)</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-stone-50 rounded-xl p-2">
            <p className="text-lg font-bold text-emerald-700">{persona.stats.views}</p>
            <p className="text-[10px] text-stone-500">Zobrazení</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-2">
            <p className="text-lg font-bold text-emerald-700">{persona.stats.phoneClicks}</p>
            <p className="text-[10px] text-stone-500">Klik na tel.</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-2">
            <p className="text-lg font-bold text-emerald-700">{persona.stats.webClicks}</p>
            <p className="text-[10px] text-stone-500">Klik na web</p>
          </div>
        </div>
        <label className="flex items-center justify-between mt-3 p-2 bg-stone-50 rounded-xl text-xs">
          <span>{craftsmanAcceptsOrders ? "Přijímám zakázky" : "Kapacita plná"}</span>
          <button
            type="button"
            onClick={() => setCraftsmanAcceptsOrders(!craftsmanAcceptsOrders)}
            className="text-emerald-700 font-semibold"
          >
            Přepnout
          </button>
        </label>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-stone-800 mb-1">Aktivní poptávky v okolí</h2>
        <p className="text-[10px] text-stone-500 mb-3">Rádius {craftsmanRadius} km</p>
        <div className="space-y-2">
          {nearby.map((r) => (
            <article key={r.id} className="border border-stone-200 rounded-xl p-3">
              <p className="text-sm font-semibold text-stone-900">{r.title}</p>
              <p className="text-xs text-stone-600 mt-1">{r.text}</p>
              <p className="text-[10px] text-stone-400 mt-1">
                {r.author} · {r.distanceKm} km · {r.time}
              </p>
              <div className="flex gap-2 mt-2">
                <MessageButton
                  participantId={r.authorId}
                  participantName={r.author}
                  topic={{
                    kind: "inquiry",
                    refId: r.id,
                    title: r.title,
                    label: "Poptávka",
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    openChat(r.authorId, r.author, {
                      kind: "inquiry",
                      refId: r.id,
                      title: r.title,
                      label: "Poptávka",
                    })
                  }
                  className="text-xs font-semibold text-emerald-700"
                >
                  Rychlá odpověď
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-stone-800 mb-2">Rychlé akce</h2>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => showToast("Editor vizitky (simulace)", "info")}
            className="py-2.5 rounded-xl text-xs font-semibold border border-stone-200"
          >
            Upravit vizitku
          </button>
          <button
            type="button"
            onClick={() => setTopPay(true)}
            className="py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
          >
            Topovat profil na 7 dní
          </button>
          <button
            type="button"
            onClick={() => openCreate("prodam")}
            className="py-2.5 rounded-xl text-xs font-semibold border border-emerald-300 text-emerald-800"
          >
            Nahrát fotku realizace
          </button>
        </div>
      </section>

      <PaymentModal
        open={topPay}
        onClose={() => setTopPay(false)}
        title="Topování v katalogu — 7 dní"
        amount={149}
        walletBalance={999}
        onConfirm={() => {
          promoteProfile("catalog", "7d", "wallet");
          setTopPay(false);
        }}
      />
    </DashShell>
  );
}

/** Legacy — dashboard provozovny je BusinessOperationsDashboard (záložka Provoz). */
export { default as BusinessHomeDashboard } from "./BusinessOperationsDashboard.jsx";

/** Legacy export — agenda je InstitutionOfficePage (záložka Agenda). */
export function InstitutionHomeDashboard() {
  const { municipalityPrompts, updatePromptStatus, activeCrisis, upcomingEvents, setActiveTab } =
    useApp();
  const persona = TEST_PERSONAS.urad;
  const openPrompts = municipalityPrompts.filter((p) => p.status !== "done");

  return (
    <DashShell title={persona.businessName} subtitle="Přehled obce — bez duplicitních formulářů">
      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-stone-800 mb-2">Hlášení občanů k řešení</h2>
        {openPrompts.length === 0 ? (
          <p className="text-xs text-stone-500">Žádná otevřená hlášení.</p>
        ) : (
          openPrompts.map((p) => (
            <article key={p.id} className="p-3 bg-stone-50 rounded-xl mb-2 text-xs">
              <p className="font-semibold">{p.title}</p>
              <p className="text-stone-600 mt-1">{p.body}</p>
              <p className="text-stone-400 mt-1">
                {p.authorName} · {p.statusLabel}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {p.authorId && (
                  <MessageButton
                    participantId={p.authorId}
                    participantName={p.authorName}
                    topic={{
                      kind: "prompt",
                      refId: p.id,
                      title: p.title,
                      label: "Podnět",
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => updatePromptStatus(p.id, "progress")}
                  className="px-2 py-1 bg-[#E8F0ED] text-[#1B4D3E] rounded-lg font-semibold"
                >
                  V řešení
                </button>
                <button
                  type="button"
                  onClick={() => updatePromptStatus(p.id, "done")}
                  className="px-2 py-1 bg-[#F1F6F5] text-[#3D7A68] border border-[#C5DDD4] rounded-lg font-semibold"
                >
                  Vyřešeno
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-stone-800 mb-2">Aktivní krizová varování</h2>
        {activeCrisis ? (
          <div className="text-xs">
            <p className="font-semibold text-stone-900">{activeCrisis.title}</p>
            <p className="text-stone-600 mt-1">{activeCrisis.body}</p>
          </div>
        ) : (
          <p className="text-xs text-stone-500">Žádné aktivní varování.</p>
        )}
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-stone-800 mb-2">Kalendář akcí</h2>
        {(upcomingEvents ?? []).slice(0, 3).map((ev) => (
          <p key={ev.id} className="text-xs text-stone-700 mb-1.5">
            <span className="font-semibold">{ev.title}</span>
            <span className="text-stone-400"> · {ev.date}</span>
          </p>
        ))}
        {(upcomingEvents ?? []).length === 0 && (
          <p className="text-xs text-stone-500">Žádné nadcházející akce.</p>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("office")}
          className="mt-2 w-full py-2 rounded-xl text-xs font-semibold border border-[#C5DDD4] text-[#1B4D3E]"
        >
          Otevřít Agendu
        </button>
      </section>
    </DashShell>
  );
}
