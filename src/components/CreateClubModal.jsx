import { useState } from "react";
import { CLUB_CATEGORIES } from "../data/clubCategories.js";
import { useApp } from "../context/AppContext.jsx";
import { ClubCategoryIcon, GROUP_ICON_CLASS } from "./communityNavIcons.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

export default function CreateClubModal({ open, onClose }) {
  const { proposeClub } = useApp();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    proposeClub({ name: name.trim(), categoryId });
    setName("");
    setCategoryId("");
    onClose();
  };

  return (
    <AppPanelPortal>
    <div className="pp-app-sheet-overlay">
      <div className="absolute inset-0 pointer-events-auto">
        <ModalDoodleBackdrop onClose={onClose} />
      </div>
      <div className="pp-app-sheet">
        <div className="pp-app-sheet-body p-5">
        <h2 className="text-lg font-bold text-stone-900 mb-1">Navrhnout nový klub</h2>
        <p className="text-sm text-stone-500 mb-4">Po 5 hlasech sousede se klub aktivuje a odemkne chat.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Název klubu</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Např. Sousedské pečení"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">Kategorie *</label>
            <div className="space-y-2">
              {CLUB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm ${
                    categoryId === cat.id
                      ? "border-[#1B4D3E] bg-[#A8D5C8]/40 font-semibold"
                      : "border-[#1B4D3E]/20 hover:border-[#4D8B7A]"
                  }`}
                >
                  <ClubCategoryIcon id={cat.id} className={`w-4 h-4 shrink-0 ${GROUP_ICON_CLASS}`} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-stone-200 rounded-2xl text-sm font-semibold">
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!categoryId}
              className="flex-1 py-3 bg-[#1B4D3E] text-white rounded-2xl text-sm font-semibold disabled:opacity-50"
            >
              Navrhnout (1/5 hlasů)
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
    </AppPanelPortal>
  );
}
