import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import ModalDoodleBackdrop from "../ModalDoodleBackdrop.jsx";
import AppPanelPortal from "../AppPanelPortal.jsx";

export default function ClaimProfileModal({ place, open, onClose }) {
  const { user, submitInstitutionClaim, showToast } = useApp();
  const [ico, setIco] = useState(user?.ico ?? "");
  const [note, setNote] = useState("");

  if (!open || !place) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ico.trim()) return;
    submitInstitutionClaim({
      placeId: place.id,
      googlePlaceId: place.googlePlaceId ?? null,
      ico: ico.trim(),
      note: note.trim(),
    });
    onClose();
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="pp-app-sheet p-5 space-y-3"
          role="dialog"
          aria-label="Převzít profil"
        >
          <h2 className="text-lg font-bold text-stone-900">Převzít profil</h2>
          <p className="text-xs text-stone-500">
            Profil <strong>{place.name}</strong> si můžete přiřadit po ověření IČO nebo schválení
            administrátorem.
            {place.isGooglePlace ? " Místo je načteno z Google Maps." : ""}
          </p>
          <input
            type="text"
            value={ico}
            onChange={(e) => setIco(e.target.value)}
            placeholder="IČO *"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
            required
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Poznámka pro administrátora (volitelné)"
            rows={2}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm border border-stone-200 rounded-xl">
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-semibold text-white rounded-xl"
              style={{ background: "#1B4332" }}
            >
              Odeslat žádost
            </button>
          </div>
          <button
            type="button"
            onClick={() => showToast("Simulace: admin schválil profil okamžitě.", "info")}
            className="w-full text-[10px] text-stone-400 underline"
          >
            (Dev) Okamžité schválení
          </button>
        </form>
      </div>
    </AppPanelPortal>
  );
}
