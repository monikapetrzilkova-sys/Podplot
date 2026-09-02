import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import ListingQuantityStepper from "./ListingQuantityStepper.jsx";
import {
  calcListingSaleAmount,
  clampListingQuantity,
  formatListingQuantity,
  formatListingUnitPrice,
  getListingPriceUnit,
  listingQuantityStep,
} from "../data/listingPriceUnits.js";
import { DoodleChatIcon } from "./doodle/doodleIcons.jsx";

export default function ListingSaleAdjustSheet({ open, order, onClose }) {
  const { proposeListingSaleAdjustment } = useApp();
  const unitId = order?.priceUnit;
  const unit = getListingPriceUnit(unitId);
  const step = listingQuantityStep(unitId);
  const currentQty = Number(order?.quantity) || 0;
  const maxLess = Math.max(unit.min, clampListingQuantity(currentQty - step, unitId, currentQty - step));
  const [qty, setQty] = useState(maxLess);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open || !order) return;
    const start = clampListingQuantity(currentQty - step, unitId, currentQty - step) || unit.min;
    setQty(start);
    setMessage("");
  }, [open, order, currentQty, step, unit.min, unitId]);

  if (!open || !order) return null;

  const proposed = clampListingQuantity(qty, unitId, currentQty - step) || unit.min;
  const newAmount = calcListingSaleAmount(order.unitPrice, proposed, unitId);
  const canSubmit = proposed > 0 && proposed < currentQty && message.trim().length >= 4;

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-app-sheet p-5" role="dialog" aria-label="Navrhnout jiné množství">
          <div className="flex items-start gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center shrink-0">
              <DoodleChatIcon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-stone-900 leading-snug">Nemám tolik</h2>
              <p className="text-sm text-stone-500 mt-0.5">
                Kupující chce {formatListingQuantity(currentQty, unitId)} za {order.amount} Kč.
              </p>
            </div>
          </div>

          <p className="text-xs font-semibold text-stone-600 mb-2">Kolik můžeš dát?</p>
          <ListingQuantityStepper
            unitId={unitId}
            value={qty}
            onChange={setQty}
            available={currentQty - step}
          />

          <div className="rounded-2xl bg-[#E8F3EF] px-4 py-3 mt-3 mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#1B4D3E]">Nová cena</p>
            <p className="text-xl font-bold text-[#1B4D3E] tabular-nums">{newAmount} Kč</p>
            <p className="text-xs text-stone-600 mt-0.5">
              {formatListingQuantity(proposed, unitId)} × {formatListingUnitPrice(order.unitPrice, unitId)}
              {order.amount > newAmount ? ` · vrátí se ${order.amount - newAmount} Kč` : ""}
            </p>
          </div>

          <label htmlFor="sale-adjust-msg" className="block text-sm font-semibold text-stone-800 mb-1.5">
            Zpráva kupujícímu
          </label>
          <textarea
            id="sale-adjust-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Např. dnes jich mám jen tolik — stačilo by ti to?"
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm resize-none focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#D8F3DC]"
          />

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              if (
                proposeListingSaleAdjustment(order.id, {
                  quantity: proposed,
                  message: message.trim(),
                })
              ) {
                onClose();
              }
            }}
            className="mt-4 w-full py-3.5 rounded-2xl text-sm font-semibold text-white pp-btn-primary disabled:opacity-40 disabled:bg-stone-200 disabled:text-stone-400"
          >
            Navrhnout {formatListingQuantity(proposed, unitId)} · {newAmount} Kč
          </button>
        </div>
      </div>
    </AppPanelPortal>
  );
}
