import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  TOP_BAZAR_PLANS,
  CATALOG_PREMIUM_PLANS,
  SPONSORED_STRIP_PLANS,
} from "../data/monetization.js";
import PaymentModal from "./PaymentModal.jsx";
import { PROFILE_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

export default function PromoteSection() {
  const { user, promoteProfile, credits } = useApp();
  const [promoType, setPromoType] = useState("catalog");
  const [planId, setPlanId] = useState("7d");
  const [payOpen, setPayOpen] = useState(false);

  if (!user || (user.accountType !== "remeslnik" && user.accountType !== "podnik")) return null;

  const plans =
    promoType === "top"
      ? TOP_BAZAR_PLANS
      : promoType === "catalog"
        ? CATALOG_PREMIUM_PLANS
        : SPONSORED_STRIP_PLANS;

  const selectedPlan = plans.find((p) => p.id === planId) ?? plans[0];
  const amount = selectedPlan?.price ?? 0;

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-4 mb-4">
      <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
        <span className="shrink-0 text-[#3D7A68]" aria-hidden>
          <PROFILE_DOODLE_ICONS.promote className="w-4 h-4" />
        </span>
        Boost a propagace
      </h3>
      <p className="text-xs text-stone-500 mb-3 leading-relaxed">
        Boost posune váš profil na přední místa v katalogu. Proužek je krátká viditelnost na domovské zdi
        sousedů — ne reklamní inzerát ve feedu.
      </p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {[
          { id: "catalog", label: "Boost katalogu" },
          { id: "sponsored", label: "Proužek" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setPromoType(t.id);
              setPlanId(t.id === "catalog" ? "7d" : "24h");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              promoType === t.id ? "bg-[#3D7A68] text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-2 mb-4">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlanId(p.id)}
            className={`w-full text-left p-3 rounded-xl border text-sm ${
              planId === p.id ? "border-[#3D7A68] bg-[#F1F6F5]" : "border-stone-200"
            }`}
          >
            <span className="font-semibold">{p.label}</span>
            <span className="float-right font-bold text-[#3D7A68]">{p.price} Kč</span>
            <p className="text-xs text-stone-500 mt-0.5">{p.hint}</p>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPayOpen(true)}
        className="w-full py-3 bg-[#3D7A68] text-white rounded-2xl text-sm font-semibold"
      >
        Zaplatit {amount} Kč
      </button>
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={`Propagace — ${selectedPlan?.label}`}
        amount={amount}
        walletBalance={credits}
        onConfirm={(method) => promoteProfile(promoType, planId, method)}
      />
    </section>
  );
}
