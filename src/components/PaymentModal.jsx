import { useEffect, useState } from "react";
import { PAYMENT_METHODS } from "../data/monetization.js";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

export default function PaymentModal({
  open,
  onClose,
  title,
  amount = 0,
  onConfirm,
  note = null,
  confirmLabel = null,
  /** @deprecated kredity zrušeny — prop se ignoruje */
  walletBalance: _walletBalance,
  /** @deprecated kredity zrušeny — vždy jen karta */
  allowWallet: _allowWallet,
  /** @deprecated dobíjení zrušeno */
  amountEditable: _amountEditable,
  minAmount: _minAmount,
  amountPresets: _amountPresets,
}) {
  const [method, setMethod] = useState("card");

  useEffect(() => {
    if (!open) return;
    setMethod("card");
  }, [open]);

  if (!open) return null;

  const payAmount = Math.max(0, Math.round(Number(amount) || 0));
  const payLabel = confirmLabel || `Zaplatit ${payAmount} Kč`;

  const handlePay = () => {
    if (payAmount <= 0) return;
    onConfirm(method, payAmount);
    onClose();
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-app-sheet p-5" role="dialog" aria-label={title}>
          <h2 className="text-lg font-bold text-stone-900 mb-1">{title}</h2>
          <p className="text-2xl font-bold text-emerald-700 mb-1">{payAmount} Kč</p>
          <p className="text-xs text-stone-500 mb-4 leading-snug">
            {note || "Platba kartou přes bránu Podplotu."}
          </p>
          <div className="space-y-2 mb-4">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`w-full text-left p-3 rounded-2xl border text-sm ${
                  method === m.id
                    ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                    : "border-stone-200"
                }`}
              >
                <span className="font-medium text-stone-900">
                  {m.icon} {m.label}
                </span>
                {m.hint ? <span className="block text-xs text-stone-500 mt-0.5">{m.hint}</span> : null}
              </button>
            ))}
          </div>

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
              disabled={payAmount <= 0}
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
