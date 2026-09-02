import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CLUB_CATEGORIES } from "../data/clubCategories.js";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { ClubCategoryIcon } from "./communityNavIcons.jsx";

export default function CreateGroupModal({ open, onClose }) {
  const { proposeGroup, updateGroupProposal, editingGroupProposal } = useApp();
  const isEditing = Boolean(editingGroupProposal?.id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [clubCategory, setClubCategory] = useState(CLUB_CATEGORIES[0]?.id ?? "");

  useEffect(() => {
    if (!open) return;
    if (editingGroupProposal) {
      setName(editingGroupProposal.name ?? "");
      setDescription(editingGroupProposal.description ?? "");
      setPurpose(editingGroupProposal.purpose ?? "");
      setClubCategory(
        editingGroupProposal.clubCategory ||
          editingGroupProposal.categoryId ||
          CLUB_CATEGORIES[0]?.id ||
          ""
      );
      return;
    }
    setName("");
    setDescription("");
    setPurpose("");
    setClubCategory(CLUB_CATEGORIES[0]?.id ?? "");
  }, [open, editingGroupProposal]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !purpose.trim() || !clubCategory) return;
    if (isEditing) {
      const ok = updateGroupProposal({
        id: editingGroupProposal.id,
        name: name.trim(),
        description: description.trim(),
        purpose: purpose.trim(),
        clubCategory,
      });
      if (!ok) return;
    } else {
      proposeGroup({
        name: name.trim(),
        description: description.trim(),
        purpose: purpose.trim(),
        clubCategory,
      });
    }
    setName("");
    setDescription("");
    setPurpose("");
    setClubCategory(CLUB_CATEGORIES[0]?.id ?? "");
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
            <h2 className="text-lg font-bold text-stone-900 mb-1">
              {isEditing ? "Upravit návrh skupiny" : "Nová skupina"}
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              {isEditing
                ? "Upravte text návrhu. Počet podpor zůstane zachovaný."
                : "Návrh uvidí sousedé ke podpoře. Skupina se aktivuje po 5 hlasech."}
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Kmenová kategorie *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CLUB_CATEGORIES.map((cat) => {
                    const active = clubCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setClubCategory(cat.id)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left text-[11px] font-semibold transition-colors ${
                          active
                            ? "bg-[#E8F3EF] border-[#3D7A68] text-[#1B4D3E]"
                            : "bg-white border-stone-200 text-stone-600 hover:border-[#64A08D]"
                        }`}
                      >
                        <ClubCategoryIcon id={cat.id} />
                        <span className="leading-snug">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Název skupiny *</label>
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
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Popis *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O čem skupina bude, pro koho je určená…"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Účel skupiny *</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Co chceš v okolí společně řešit?"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm resize-none"
                  required
                />
              </div>
              {!isEditing && (
                <div className="bg-[#E8F3EF] border border-[#C5E0D6] rounded-xl p-3">
                  <p className="text-xs text-[#1B4D3E] leading-relaxed">
                    Po odeslání uvidí návrh sousedé (Domů, Skupiny). Váš hlas se započítá automaticky
                    (1 / 5). Po dosažení 5 podpor se skupina aktivuje.
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-600"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#3D7A68] text-white rounded-2xl text-sm font-semibold"
                >
                  {isEditing ? "Uložit změny" : "Odeslat návrh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
