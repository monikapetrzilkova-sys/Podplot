import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";

/** Jednoduchá faktura pro řemeslníka — MVP (bez napojení na účetnictví) */
export default function CreateInvoiceModal() {
  const { invoiceOpen, closeInvoice, createInvoice, user } = useApp();
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  if (!invoiceOpen) return null;

  const reset = () => {
    setClientName("");
    setDescription("");
    setAmount("");
  };

  const handleClose = () => {
    reset();
    closeInvoice();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = createInvoice({
      clientName: clientName.trim(),
      description: description.trim(),
      amount: Number(amount) || 0,
    });
    if (ok) reset();
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={handleClose} />
        </div>
        <form onSubmit={handleSubmit} className="pp-app-sheet p-5 space-y-3" role="dialog" aria-label="Nová faktura">
          <h3 className="text-sm font-bold text-stone-900">Vytvořit fakturu</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Jednoduchá faktura pro sousedskou zakázku. Doklad zůstane u vás v přehledu — nepatří do veřejného feedu.
          </p>
          <p className="text-[11px] text-stone-400">Dodavatel: {user?.name ?? "—"}</p>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">Odběratel</span>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Jméno souseda / firmy"
              required
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">Popis práce</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Např. Oprava kohoutku v kuchyni"
              rows={3}
              required
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none bg-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">Částka (Kč)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
            />
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold bg-white text-stone-700"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold"
            >
              Uložit fakturu
            </button>
          </div>
        </form>
      </div>
    </AppPanelPortal>
  );
}
