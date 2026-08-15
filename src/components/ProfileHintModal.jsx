/** Informace po rezervaci / nabídce k půjčení — kde najít položky v profilu */

import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

export default function ProfileHintModal({ open, onClose, onGoToProfile, variant = "default" }) {
  if (!open) return null;

  const title =
    variant === "reservation"
      ? "Rezervace je uložena"
      : variant === "lending_offer"
        ? "Nabídka k půjčení je zveřejněna"
        : "Uloženo do profilu";

  const body =
    variant === "reservation"
      ? "Rezervaci i všechny další výpůjčky a nabídky najdete kdykoli v záložce Profil v sekci „Moje výpůjčky a nabídky“."
      : "Všechny vaše nabídky k půjčení, rezervace i inzeráty najdete v záložce Profil v sekci „Moje výpůjčky a nabídky“.";

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay pp-app-sheet-overlay--center">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div
          className="pp-app-sheet p-5"
          style={{ background: "#FAF9F6", border: "1px solid #D8F3DC" }}
          role="dialog"
          aria-labelledby="profile-hint-title"
        >
          <p className="text-2xl mb-2" aria-hidden="true">
            👤
          </p>
          <h2 id="profile-hint-title" className="text-lg font-bold mb-2" style={{ color: "#1B4332" }}>
            {title}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-5">{body}</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onGoToProfile}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "#1B4332" }}
            >
              Přejít do profilu
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold border border-stone-200 text-stone-700 bg-white"
            >
              Rozumím, zavřít
            </button>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
