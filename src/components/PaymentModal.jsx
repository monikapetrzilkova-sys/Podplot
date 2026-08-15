import { useEffect, useMemo, useState } from "react";
import { PAYMENT_METHODS } from "../data/monetization.js";
import { useApp } from "../context/AppContext.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

const DEFAULT_TOP_UP_PRESETS = [100, 200, 500, 1000];

function topUpSuggestions(shortfall) {
  if (shortfall <= 0) return [];
  const rounded = Math.ceil(shortfall / 50) * 50;
  return [...new Set([shortfall, rounded, 100, 200, 500].filter((n) => n >= shortfall))]
    .sort((a, b) => a - b)
    .slice(0, 4);
}

function parseAmount(value) {
  const n = Math.floor(Number(String(value).replace(",", ".")));
  return Number.isFinite(n) ? n : 0;
}

export default function PaymentModal({
  open,
  onClose,
  title,
  amount: amountProp = 0,
  onConfirm,
  walletBalance,
  note = null,
  confirmLabel = null,
  /** U dobíjení peněženky nemá smysl platit kredity */
  allowWallet = true,
  /** Uživatel zadá / upraví částku (dobití kreditů) */
  amountEditable = false,
  minAmount = 50,
  amountPresets = DEFAULT_TOP_UP_PRESETS,
}) {
  const { credits, addCredits } = useApp();
  const [method, setMethod] = useState("card");
  const [selectedTopUp, setSelectedTopUp] = useState(null);
  const [customInlineTopUp, setCustomInlineTopUp] = useState("");
  const [draftAmount, setDraftAmount] = useState(String(amountProp || amountPresets[0] || 100));

  const balance = typeof credits === "number" ? credits : walletBalance ?? 0;

  const amount = amountEditable
    ? Math.max(0, parseAmount(draftAmount))
    : amountProp;

  const canWallet = balance >= amount;
  const shortfall = Math.max(0, amount - balance);
  const topUpOptions = useMemo(() => topUpSuggestions(shortfall), [shortfall]);

  useEffect(() => {
    if (!open) return;
    setMethod("card");
    setSelectedTopUp(null);
    setCustomInlineTopUp("");
    setDraftAmount(String(amountProp || amountPresets[0] || 100));
  }, [open, amountProp, amountPresets]);

  if (!open) return null;

  const methods = allowWallet ? PAYMENT_METHODS : PAYMENT_METHODS.filter((m) => m.id !== "wallet");

  const walletSelected = method === "wallet";
  const needsTopUp = allowWallet && walletSelected && !canWallet;

  const inlineCustom = parseAmount(customInlineTopUp);
  const topUpAmount =
    customInlineTopUp !== "" && inlineCustom > 0
      ? inlineCustom
      : selectedTopUp ?? topUpOptions[0] ?? shortfall;

  const amountValid = !amountEditable || amount >= minAmount;
  const inlineTopUpValid = !needsTopUp || (topUpAmount >= shortfall && topUpAmount > 0);

  const handlePay = () => {
    if (amountEditable && !amountValid) return;
    if (walletSelected && needsTopUp) {
      if (!inlineTopUpValid) return;
      addCredits(topUpAmount, { silent: true });
      onConfirm("wallet", amount);
      onClose();
      return;
    }
    if (walletSelected && !canWallet) return;
    onConfirm(method, amount);
    onClose();
  };

  const payLabel = needsTopUp
    ? `Dobít ${topUpAmount} Kč a zaplatit`
    : confirmLabel ||
      (amountEditable ? `Dobít ${amount > 0 ? `${amount} Kč` : "—"}` : `Zaplatit ${amount} Kč`);

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-app-sheet p-5" role="dialog" aria-label={title}>
          <h2 className="text-lg font-bold text-stone-900 mb-1">{title}</h2>

          {amountEditable ? (
            <div className="mb-4 space-y-2">
              <label className="block text-xs font-semibold text-stone-600">
                Částka k dobití (Kč)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={minAmount}
                  step={10}
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value)}
                  className="w-full px-3 py-2.5 pr-12 border border-stone-200 rounded-xl text-lg font-bold text-[#1B4D3E] focus:outline-none focus:border-[#3D7A68] focus:ring-1 focus:ring-[#C5DDD4]"
                  aria-label="Částka k dobití"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-400">
                  Kč
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {amountPresets.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDraftAmount(String(opt))}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      parseAmount(draftAmount) === opt
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                        : "bg-white text-[#3D7A68] border-[#C5DDD4] hover:bg-[#F1F6F5]"
                    }`}
                  >
                    {opt} Kč
                  </button>
                ))}
              </div>
              {!amountValid && (
                <p className="text-[11px] text-amber-800">
                  Minimální dobití je {minAmount} Kč.
                </p>
              )}
            </div>
          ) : (
            <p className="text-2xl font-bold text-emerald-700 mb-1">{amount} Kč</p>
          )}

          <p className="text-xs text-stone-500 mb-4">
            {note ||
              (amountEditable
                ? "Zadejte částku nebo vyberte předvolbu. 1 kredit = 1 Kč."
                : "Cena je v korunách. Zvolte, zda zaplatíte kartou, nebo volitelně kredity z peněženky.")}
          </p>
          <div className="space-y-2 mb-4">
            {methods.map((m) => {
              const isWallet = m.id === "wallet";
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    if (isWallet && !canWallet) {
                      setSelectedTopUp(null);
                      setCustomInlineTopUp("");
                    }
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-sm ${
                    method === m.id
                      ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                      : "border-stone-200"
                  }`}
                >
                  <span className="font-medium text-stone-900">
                    {m.icon} {m.label}
                  </span>
                  {m.hint && <span className="block text-xs text-stone-500 mt-0.5">{m.hint}</span>}
                  {isWallet && (
                    <span className="block text-xs text-stone-500 mt-0.5">
                      Zůstatek: {balance} Kč
                      {!canWallet && amount > 0 && ` — chybí ${shortfall} Kč`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {needsTopUp && (
            <div className="mb-4 rounded-2xl border border-[#C5DDD4] bg-[#F1F6F5] p-3 space-y-2">
              <p className="text-xs font-semibold text-[#1B4D3E]">
                Dobít kredity kartou — nemusíte odcházet jinam
              </p>
              <p className="text-[11px] text-stone-600">
                Doplatíte chybějící částku kartou do peněženky a hned zaplatíte kredity.
              </p>
              <div className="flex flex-wrap gap-2">
                {topUpOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedTopUp(opt);
                      setCustomInlineTopUp("");
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                      customInlineTopUp === "" && topUpAmount === opt
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                        : "bg-white text-[#3D7A68] border-[#C5DDD4] hover:bg-white/80"
                    }`}
                  >
                    +{opt} Kč
                    {opt === shortfall ? " (přesně)" : ""}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={shortfall}
                  placeholder={`Vlastní částka (min. ${shortfall} Kč)`}
                  value={customInlineTopUp}
                  onChange={(e) => {
                    setCustomInlineTopUp(e.target.value);
                    setSelectedTopUp(null);
                  }}
                  className="w-full px-3 py-2 border border-[#C5DDD4] rounded-xl text-xs bg-white text-[#1B4D3E] focus:outline-none focus:border-[#3D7A68]"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-stone-200 rounded-xl"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={!amountValid || !inlineTopUpValid || (amountEditable && amount <= 0)}
              className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
              style={{ background: "#1B4332" }}
            >
              {payLabel}
            </button>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
