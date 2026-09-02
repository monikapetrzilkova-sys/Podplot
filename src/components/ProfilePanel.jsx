import { useState } from "react";
import { CURRENT_USER, LEND_ASSETS, WANT_ASSETS, MY_GROUPS } from "../data/mockData.js";
import { useApp } from "../context/AppContext.jsx";

export default function ProfilePanel() {
  const { profileOpen, setProfileOpen } = useApp();
  const [lend, setLend] = useState(new Set(["vrtacka", "vozik"]));
  const [want, setWant] = useState(new Set(["vrtacka"]));

  if (!profileOpen) return null;

  const toggle = (set, id, setter) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => setProfileOpen(false)}
        aria-label="Zavřít"
      />
      <aside className="relative w-full max-w-[390px] h-full bg-stone-50 flex flex-col animate-slide-in">
        <div className="bg-white border-b border-stone-200 p-4 shrink-0">
          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-600"
          >
            ✕
          </button>
          <div className="flex items-center gap-4 mt-2">
            <span className="w-14 h-14 rounded-full bg-teal-700 text-white text-lg font-bold flex items-center justify-center">
              {CURRENT_USER.initials}
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{CURRENT_USER.name}</h2>
              {CURRENT_USER.verified && (
                <span className="text-xs font-semibold text-teal-800 bg-teal-200 px-2 py-0.5 rounded-lg">
                  Ověřená sousedka
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <section className="bg-white border border-stone-200 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-1">Platby v Podplotu</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Kartou platíte jen propagaci (TOP, Promo banner, push poptávek). Nákup zboží a služby
              si sousedé domluví osobně — Podplot peníze nedrží.
            </p>
          </section>

          <section className="bg-white border border-stone-200 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-1">Co půjčím sousedům</h3>
            <p className="text-xs text-stone-500 mb-3">Zaškrtni věci, které máš doma.</p>
            <div className="flex flex-wrap gap-2">
              {LEND_ASSETS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggle(lend, a.id, setLend)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${
                    lend.has(a.id)
                      ? "bg-teal-200 border-teal-400 text-teal-800 font-semibold"
                      : "bg-stone-50 border-stone-200 text-stone-600"
                  }`}
                >
                  <span>{a.emoji}</span> {a.label}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-stone-200 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-1">Co občas sháním</h3>
            <p className="text-xs text-stone-500 mb-3">Upozorníme vás, když to někdo nabídne.</p>
            <div className="flex flex-wrap gap-2">
              {WANT_ASSETS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggle(want, a.id, setWant)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${
                    want.has(a.id)
                      ? "bg-teal-200 border-teal-400 text-teal-800 font-semibold"
                      : "bg-stone-50 border-stone-200 text-stone-600"
                  }`}
                >
                  <span>{a.emoji}</span> {a.label}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-stone-200 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">Moje skupiny</h3>
            <div className="space-y-2">
              {MY_GROUPS.map((g) => (
                <div key={g.id} className="flex items-center gap-3 py-2">
                  <span className="text-xl">{g.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{g.name}</p>
                    <p className="text-xs text-stone-500">{g.members} členů</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
