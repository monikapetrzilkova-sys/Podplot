import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import PaymentModal from "./PaymentModal.jsx";
import ListingQuantityStepper from "./ListingQuantityStepper.jsx";
import {
  calcListingSaleAmount,
  clampListingQuantity,
  formatListingQuantity,
  formatListingUnitPrice,
  getListingPriceUnit,
  listingUsesVariablePrice,
} from "../data/listingPriceUnits.js";
import { DoodlePackageIcon, DoodleScalesIcon } from "./doodle/doodleIcons.jsx";

export default function ListingBuySheet({ open, post, onClose }) {
  const { buyListing, credits } = useApp();
  const unitId = post?.listingPriceUnit;
  const unit = getListingPriceUnit(unitId);
  const variable = listingUsesVariablePrice(post);
  const [qty, setQty] = useState(1);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    const start = clampListingQuantity(
      Math.min(unit.min ?? 1, post.listingQuantity || unit.min || 1),
      unitId,
      post.listingQuantity
    );
    setQty(start || unit.min || 1);
    setPayOpen(false);
  }, [open, post, unit.min, unitId]);

  if (!open || !post) return null;

  const quantity = clampListingQuantity(qty, unitId, post.listingQuantity) || unit.min || 1;
  const total = calcListingSaleAmount(post.listingPrice, quantity, unitId);
  const UnitIcon = unitId === "kg" ? DoodleScalesIcon : DoodlePackageIcon;

  return (
    <>
      <AppPanelPortal>
        <div className="pp-app-sheet-overlay">
          <div className="absolute inset-0 pointer-events-auto">
            <ModalDoodleBackdrop onClose={onClose} />
          </div>
          <div className="pp-app-sheet p-5" role="dialog" aria-label="Koupit přes Podplot">
            <div className="flex items-start gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-[#E8F3EF] text-[#1B4D3E] flex items-center justify-center shrink-0">
                <UnitIcon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-stone-900 leading-snug">{post.title}</h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  {formatListingUnitPrice(post.listingPrice, unitId)}
                  {post.listingQuantity
                    ? ` · k dispozici ${formatListingQuantity(post.listingQuantity, unitId)}`
                    : ""}
                </p>
              </div>
            </div>

            {variable ? (
              <div className="mb-4">
                <p className="text-xs font-semibold text-stone-600 mb-2">{unit.quantityLabel}</p>
                <ListingQuantityStepper
                  unitId={unitId}
                  value={qty}
                  onChange={setQty}
                  available={post.listingQuantity}
                />
              </div>
            ) : null}

            <div className="rounded-2xl bg-[#E8F3EF] px-4 py-3 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#1B4D3E]">Celkem</p>
              <p className="text-2xl font-bold text-[#1B4D3E] tabular-nums">{total} Kč</p>
              {variable ? (
                <p className="text-xs text-stone-600 mt-0.5">
                  {formatListingQuantity(quantity, unitId)} × {formatListingUnitPrice(post.listingPrice, unitId)}
                </p>
              ) : null}
            </div>

            <p className="text-[11px] text-stone-500 leading-snug mb-4">
              Platba zůstane v úschově Podplotu. Prodávající může navrhnout méně, když už tolik
              nemá — pak to znovu potvrdíte.
            </p>

            <button
              type="button"
              disabled={total <= 0}
              onClick={() => setPayOpen(true)}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white pp-btn-primary disabled:opacity-40"
            >
              Zaplatit přes Podplot · {total} Kč
            </button>
          </div>
        </div>
      </AppPanelPortal>
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={`Koupit: ${post.title}`}
        amount={total}
        walletBalance={credits}
        note="Inzerát se rezervuje a peníze zůstanou v úschově, dokud po osobní kontrole nepotvrdíte „Převzato a zaplaceno“."
        confirmLabel={`Zaplatit a rezervovat · ${total} Kč`}
        onConfirm={(method) => {
          buyListing(post, method, { quantity });
          setPayOpen(false);
          onClose();
        }}
      />
    </>
  );
}
