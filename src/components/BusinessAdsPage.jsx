import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { TEST_PERSONAS } from "../data/businessProfiles.js";
import { CATALOG_PREMIUM_PLANS, SPONSORED_STRIP_PLANS } from "../data/monetization.js";
import { MOBILNI_PUSH_SUBSCRIPTION } from "../data/notificationPlans.js";
import PaymentModal from "./PaymentModal.jsx";
import { PlaceIcon } from "./module/placeIcons.jsx";
import { PROMO_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

function PromoTypeRow({ id, title, summary, status, statusActive, open, onToggle, Icon, children }) {
  return (
    <section className={`pp-card overflow-hidden ${open ? "ring-1 ring-[#C5DDD4]" : ""}`}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
      >
        {Icon && (
          <span className="shrink-0 w-10 h-10 rounded-xl bg-[#F1F6F5] border border-[#C5DDD4] text-[#3D7A68] inline-flex items-center justify-center mt-0.5">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-stone-900">{title}</span>
            {status && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                  statusActive
                    ? "bg-[#E8F0ED] text-[#1B4D3E]"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {status}
              </span>
            )}
          </span>
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
      {open && <div className="px-4 pb-4 pt-0 space-y-3 border-t border-stone-100">{children}</div>}
    </section>
  );
}

/**
 * Záložka Propagace — banner Partner, u řemeslníka navíc topování katalogu a push poptávek.
 */
export default function BusinessAdsPage() {
  const {
    user,
    credits,
    addCredits,
    promoteProfile,
    sponsoredBanners,
    businessHours,
    isMobilniWorkMode,
    ownedService,
    businessNotificationPrefs,
    subscribeMobilniPush,
  } = useApp();

  const isCraftsman = isMobilniWorkMode;
  const persona = isCraftsman ? TEST_PERSONAS.remeslnik : TEST_PERSONAS.podnik;
  const businessName =
    user?.name ?? ownedService?.name ?? persona?.businessName ?? persona?.name ?? "Profil";

  const [headline, setHeadline] = useState(businessName);
  const [tagline, setTagline] = useState(
    isCraftsman ? "Rychlý výjezd · spolehlivá práce" : "Dnešní nabídka · přijďte se podívat"
  );
  const [bannerPlanId, setBannerPlanId] = useState("24h");
  const [catalogPlanId, setCatalogPlanId] = useState("7d");
  const [bannerPayOpen, setBannerPayOpen] = useState(false);
  const [catalogPayOpen, setCatalogPayOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [openPromo, setOpenPromo] = useState(null);

  const selectedBannerPlan =
    SPONSORED_STRIP_PLANS.find((p) => p.id === bannerPlanId) ?? SPONSORED_STRIP_PLANS[0];
  const selectedCatalogPlan =
    CATALOG_PREMIUM_PLANS.find((p) => p.id === catalogPlanId) ?? CATALOG_PREMIUM_PLANS[0];

  const myBanners = useMemo(() => {
    const uid = user?.id ?? "me";
    const today = new Date().toISOString().slice(0, 10);
    return (sponsoredBanners ?? []).filter(
      (b) =>
        (b.ownerUserId === uid || b.name === businessName) &&
        (!b.activeUntil || b.activeUntil >= today)
    );
  }, [sponsoredBanners, user?.id, businessName]);

  const preview = {
    name: headline.trim() || businessName,
    tagline: tagline.trim() || "Sousedská nabídka",
    category: isCraftsman ? "sluzby" : "gastro",
    accountType: isCraftsman ? "remeslnik" : "podnik",
    hours: businessHours,
  };

  const activateBanner = (method) => {
    promoteProfile("sponsored", bannerPlanId, method, {
      name: headline.trim() || businessName,
      tagline: tagline.trim(),
    });
    setBannerPayOpen(false);
  };

  const activateCatalog = (method) => {
    promoteProfile("catalog", catalogPlanId, method);
    setCatalogPayOpen(false);
  };

  const pushActive = businessNotificationPrefs?.serviceRequestPushEnabled;
  const hasActiveBanner = myBanners.length > 0;

  const togglePromo = (id) => {
    setOpenPromo((prev) => (prev === id ? null : id));
  };

  const bannerDetail = (
    <>
      <p className="text-[11px] text-stone-500 pt-3">
        Proužek Partner nahoře na Domů u sousedů v okolí. Platba z kreditů (1 kredit = 1 Kč).
      </p>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-stone-600">Náhled</p>
        <article className="rounded-2xl border border-[#C5DDD4] bg-[#F7FAF9] p-3 relative">
          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-[#E8F0ED] text-[#3D7A68]">
            Partner
          </span>
          <div className="flex items-center gap-2 pt-5">
            <PlaceIcon place={preview} className="w-4 h-4 shrink-0" />
            <p className="flex-1 min-w-0 text-xs text-stone-600 line-clamp-2 leading-snug">
              <span className="font-semibold text-stone-900">{preview.name}</span>
              {preview.tagline ? ` · ${preview.tagline}` : ""}
            </p>
            <span className="text-[10px] text-stone-400 shrink-0">u vás</span>
          </div>
        </article>
      </div>

      <label className="block space-y-1">
        <span className="text-[11px] font-semibold text-stone-600">Nadpis / název</span>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          maxLength={48}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
          placeholder={isCraftsman ? "Jméno / firma" : "Název provozovny"}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-[11px] font-semibold text-stone-600">Text nabídky</span>
        <textarea
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          rows={2}
          maxLength={90}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none bg-white"
          placeholder={
            isCraftsman
              ? "Např. Instalace · výjezd do 24 h"
              : "Např. Polední menu od 145 Kč · dnes čerstvé pečivo"
          }
        />
        <span className="text-[10px] text-stone-400">{tagline.length}/90</span>
      </label>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-stone-600">Délka a cena</p>
        {SPONSORED_STRIP_PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setBannerPlanId(p.id)}
            className={`w-full text-left p-3 rounded-xl border transition-colors ${
              bannerPlanId === p.id
                ? "border-[#3D7A68] bg-[#F1F6F5]"
                : "border-stone-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="text-sm font-semibold text-stone-900">{p.label}</span>
                {p.popular && (
                  <span className="ml-2 text-[9px] font-bold uppercase text-[#3D7A68]">Oblíbené</span>
                )}
                <span className="block text-[11px] text-stone-500 mt-0.5">{p.hint}</span>
                {p.durationLabel && (
                  <span className="block text-[10px] text-stone-400 mt-0.5">
                    Doba zobrazení: {p.durationLabel}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm font-bold text-[#1B4D3E] tabular-nums">
                {p.price} Kč
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setBannerPayOpen(true)}
        className="w-full py-3 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold"
      >
        Aktivovat banner · {selectedBannerPlan.price} Kč
      </button>
    </>
  );

  const creditsBar = (
    <section className="pp-card p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold text-stone-500">Podplot kredity</p>
        <p className="text-xl font-bold text-[#1B4D3E] tabular-nums">{credits} Kč</p>
      </div>
      <button
        type="button"
        onClick={() => setTopUpOpen(true)}
        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#C5DDD4] bg-[#E8F0ED] text-[#1B4D3E]"
      >
        Dobít
      </button>
    </section>
  );

  const activeBannersList =
    myBanners.length > 0 ? (
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500 px-0.5">
          Aktivní bannery
        </h2>
        {myBanners.map((b) => (
          <article key={b.id} className="pp-card p-3.5">
            <p className="text-sm font-semibold text-stone-900">{b.name}</p>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{b.tagline}</p>
            <p className="text-[10px] text-stone-400 mt-1.5">
              {b.planLabel ? `${b.planLabel} · ` : ""}
              do {b.activeUntil}
            </p>
          </article>
        ))}
      </section>
    ) : null;

  const paymentModals = (
    <>
      <PaymentModal
        open={bannerPayOpen}
        onClose={() => setBannerPayOpen(false)}
        title={`Banner Partner — ${selectedBannerPlan.label}`}
        amount={selectedBannerPlan.price}
        walletBalance={credits}
        onConfirm={activateBanner}
      />
      <PaymentModal
        open={catalogPayOpen}
        onClose={() => setCatalogPayOpen(false)}
        title={`Topování katalogu — ${selectedCatalogPlan.label}`}
        amount={selectedCatalogPlan.price}
        walletBalance={credits}
        onConfirm={activateCatalog}
      />
      <PaymentModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Dobít Podplot kredity"
        amount={200}
        amountEditable
        walletBalance={credits}
        allowWallet={false}
        onConfirm={(_method, paid) => {
          addCredits(paid ?? 200);
          setTopUpOpen(false);
        }}
      />
    </>
  );

  if (isCraftsman) {
    return (
      <div className="pp-page flex flex-col min-h-full px-4 pt-4 pb-8 gap-3">
        <p className="text-xs text-stone-500">
          Vyberte typ — detail a aktivace se otevřou po kliknutí
        </p>

        {creditsBar}

        <div className="space-y-2.5">
          <PromoTypeRow
            id="push"
            title="Push poptávek"
            summary={`Okamžité upozornění na nové poptávky · od ${MOBILNI_PUSH_SUBSCRIPTION.price} Kč/${MOBILNI_PUSH_SUBSCRIPTION.period}`}
            status={pushActive ? "Aktivní" : "Neaktivní"}
            statusActive={pushActive}
            open={openPromo === "push"}
            onToggle={togglePromo}
            Icon={PROMO_DOODLE_ICONS.push}
          >
            <p className="text-[11px] text-stone-500 pt-3 leading-relaxed">
              {MOBILNI_PUSH_SUBSCRIPTION.hint} Bez předplatného se nové poptávky ve vašem okruhu
              zobrazí se zpožděním (~15 min).
            </p>
            {pushActive ? (
              <p className="text-xs text-[#1B4D3E] bg-[#F1F6F5] border border-[#C5DDD4] rounded-xl p-3">
                ✓ Předplatné aktivní
                {businessNotificationPrefs.serviceRequestPushUntil
                  ? ` do ${new Date(businessNotificationPrefs.serviceRequestPushUntil).toLocaleDateString("cs-CZ")}`
                  : ""}
                . Dostáváte okamžité upozornění jako první.
              </p>
            ) : (
              <button
                type="button"
                onClick={subscribeMobilniPush}
                className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold"
              >
                Aktivovat · {MOBILNI_PUSH_SUBSCRIPTION.price} Kč / {MOBILNI_PUSH_SUBSCRIPTION.period}
              </button>
            )}
          </PromoTypeRow>

          <PromoTypeRow
            id="banner"
            title="Banner Partner"
            summary={`Proužek na Domů u sousedů · od ${SPONSORED_STRIP_PLANS[0].price} Kč`}
            status={hasActiveBanner ? "Aktivní" : null}
            statusActive={hasActiveBanner}
            open={openPromo === "banner"}
            onToggle={togglePromo}
            Icon={PROMO_DOODLE_ICONS.banner}
          >
            {bannerDetail}
          </PromoTypeRow>

          <PromoTypeRow
            id="catalog"
            title="Topování v katalogu"
            summary={`Přednostní výpis služeb · od ${CATALOG_PREMIUM_PLANS[0].price} Kč`}
            open={openPromo === "catalog"}
            onToggle={togglePromo}
            Icon={PROMO_DOODLE_ICONS.catalog}
          >
            <p className="text-[11px] text-stone-500 pt-3">
              Profil se posune na přední místa ve výpisu služeb v okolí.
            </p>
            <div className="space-y-2">
              {CATALOG_PREMIUM_PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCatalogPlanId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    catalogPlanId === p.id
                      ? "border-[#3D7A68] bg-[#F1F6F5]"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="text-sm font-semibold text-stone-900">{p.label}</span>
                      {p.popular && (
                        <span className="ml-2 text-[9px] font-bold uppercase text-[#3D7A68]">
                          Oblíbené
                        </span>
                      )}
                      <span className="block text-[11px] text-stone-500 mt-0.5">{p.hint}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-[#1B4D3E] tabular-nums">
                      {p.price} Kč
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCatalogPayOpen(true)}
              className="w-full py-3 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold"
            >
              Topovat · {selectedCatalogPlan.price} Kč
            </button>
          </PromoTypeRow>
        </div>

        {activeBannersList}
        {paymentModals}
      </div>
    );
  }

  return (
    <div className="pp-page flex flex-col min-h-full px-4 pt-4 pb-8 gap-4">
      <p className="text-xs text-stone-500">
        Banner Partner na domovské zdi sousedů v okolí
      </p>

      {creditsBar}

      <section className="pp-card p-4 space-y-3">{bannerDetail}</section>

      {activeBannersList}
      {paymentModals}
    </div>
  );
}
