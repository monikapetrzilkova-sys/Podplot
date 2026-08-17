import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { IconTabHome, IconTabMap, IconTabNeighbors, IconShop } from "../data/icons.jsx";

const STEPS = [
  {
    id: "tabs",
    title: "Tři místa, která budete používat",
    body: "Nic složitého — většina věcí je na těchto třech záložkách.",
    cards: [
      {
        icon: IconTabHome,
        label: "Domů",
        text: "Novinky od sousedů ve vaší obci.",
      },
      {
        icon: IconTabMap,
        label: "Okolí",
        text: "Mapa — hlášení a místa poblíž.",
      },
      {
        icon: IconTabNeighbors,
        label: "Sousedé",
        text: "Věci, výpomoc, skupiny a akce.",
      },
    ],
  },
  {
    id: "plus",
    title: "Plus uprostřed = něco přidat",
    body: "Nabídnout věc, požádat o pomoc, nebo nahlásit problém. Ostatní možnosti jsou pod Další.",
    cards: [
      {
        icon: IconShop,
        label: "Nabídnout",
        text: "Prodej, dar nebo půjčení.",
      },
      {
        icon: IconTabNeighbors,
        label: "Požádat",
        text: "Potřebujete pomoc od sousedů.",
      },
      {
        icon: IconTabMap,
        label: "Nahlásit",
        text: "Závada, ztráta, tip na mapě.",
      },
    ],
  },
  {
    id: "start",
    title: "Hotovo — jdete na Domů",
    body: "Začněte prohlížením novinek. Když budete chtít něco přidat, klepněte na +.",
    cards: [],
  },
];

/** Krátký onboarding po registraci — místo dlouhého brand story. */
export default function NeighborOnboarding({ onContinue }) {
  const { activeLocation, openPlusMenu, setActiveTab } = useApp();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const place = activeLocation?.municipality || activeLocation?.shortLabel || "vaší obci";

  const finish = () => {
    onContinue?.();
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  const tryFirstOffer = () => {
    finish();
    window.setTimeout(() => {
      setActiveTab?.("home");
      openPlusMenu?.();
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F9F9F9] overflow-y-auto">
      <div className="min-h-full max-w-[390px] mx-auto px-4 py-6 pb-10 flex flex-col">
        <p className="text-[11px] font-bold tracking-[0.12em] text-[#3D7A68] uppercase mb-1">
          Vítejte v Podplotu
        </p>
        <p className="text-xs text-stone-500 mb-4">
          Krok {step + 1} / {STEPS.length}
          {step === 0 ? ` · ${place}` : ""}
        </p>

        <div className="flex gap-1.5 mb-5" aria-hidden>
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-[#3D7A68]" : "bg-stone-200"}`}
            />
          ))}
        </div>

        <h1 className="text-xl font-extrabold text-stone-900 leading-snug mb-2">{current.title}</h1>
        <p className="text-sm text-stone-600 leading-relaxed mb-5">{current.body}</p>

        {current.cards.length > 0 ? (
          <div className="space-y-2.5 mb-6">
            {current.cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="flex items-start gap-3 p-3.5 rounded-2xl border border-[#C5DDD4] bg-white"
                >
                  <span className="w-10 h-10 rounded-xl bg-[#E8F3EF] text-[#1B4D3E] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900">{card.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{card.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl bg-[#E8F3EF] border border-[#C5DDD4]">
            <p className="text-sm text-[#1B4D3E] leading-relaxed">
              Tip: reklamní proužek <strong>Partner</strong> uvidíte dole na Domů — je malý a označený,
              aby neotravoval. Podnikatelé ho platí jako propagaci v okolí.
            </p>
          </div>
        )}

        <div className="mt-auto space-y-2 pt-4">
          {step === STEPS.length - 1 ? (
            <>
              <button
                type="button"
                onClick={tryFirstOffer}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white"
                style={{ background: "#1B4332" }}
              >
                Zkusit něco nabídnout
              </button>
              <button
                type="button"
                onClick={finish}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-[#1B4D3E] bg-white border border-[#C5DDD4]"
              >
                Přejít na Domů
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={next}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white"
                style={{ background: "#1B4332" }}
              >
                Pokračovat
              </button>
              <button
                type="button"
                onClick={finish}
                className="w-full py-2.5 text-xs font-semibold text-stone-500"
              >
                Přeskočit úvod
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
