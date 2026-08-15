import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { PlaceIcon } from "../module/placeIcons.jsx";

export default function BusinessEntityManagement() {
  const {
    ownedInstitution,
    updateOwnedInstitution,
    publishLunchMenu,
    lunchMenuDraft,
    setLunchMenuDraft,
    lunchSubscribersCount,
    showToast,
  } = useApp();

  const [hours, setHours] = useState(ownedInstitution?.hours ?? "");
  const [phone, setPhone] = useState(ownedInstitution?.phone ?? "");
  const [email, setEmail] = useState(ownedInstitution?.email ?? "");
  const [website, setWebsite] = useState(ownedInstitution?.website ?? "");
  const [description, setDescription] = useState(ownedInstitution?.tagline ?? "");
  const [extraInfo, setExtraInfo] = useState(ownedInstitution?.extraInfo ?? "");

  if (!ownedInstitution) {
    return (
      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-stone-800 mb-1">Správa mého podniku</h3>
        <p className="text-xs text-stone-500">
          Zatím nemáte přiřazený profil podniku. V modulu Instituce použijte „Převzít profil“ u vašeho místa.
        </p>
      </section>
    );
  }

  const saveProfile = () => {
    updateOwnedInstitution({
      hours: hours.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      tagline: description.trim(),
      extraInfo: extraInfo.trim(),
    });
    showToast("Profil podniku uložen.", "success");
  };

  return (
    <section className="bg-white border border-emerald-200 ring-1 ring-emerald-50 rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-stone-800">Správa mého podniku</h3>
        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
          <PlaceIcon place={ownedInstitution} className="w-4 h-4" />
          <span>{ownedInstitution.name} · pouze váš profil</span>
        </p>
      </div>

      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Telefon</span>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
        />
      </label>

      <label className="block text-xs">
        <span className="font-semibold text-stone-700">E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
        />
      </label>

      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Web</span>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
          className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
        />
      </label>

      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Otevírací doba</span>
        <input
          type="text"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
        />
      </label>

      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Popis podniku</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
        />
      </label>

      <label className="block text-xs">
        <span className="font-semibold text-stone-700">Doplňující info</span>
        <textarea
          value={extraInfo}
          onChange={(e) => setExtraInfo(e.target.value)}
          rows={2}
          className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
        />
      </label>

      <button
        type="button"
        onClick={saveProfile}
        className="w-full py-2 text-sm font-semibold text-white rounded-xl"
        style={{ background: "#1B4332" }}
      >
        Uložit profil
      </button>

      {ownedInstitution.accountType === "podnik" && (
        <div className="border-t border-stone-100 pt-3">
          <h4 className="text-xs font-bold text-stone-700 mb-2">🍴 Polední menu</h4>
          <textarea
            value={lunchMenuDraft}
            onChange={(e) => setLunchMenuDraft(e.target.value)}
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm mb-2"
          />
          <button
            type="button"
            onClick={() => publishLunchMenu("free")}
            className="w-full py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl"
          >
            Publikovat menu · {lunchSubscribersCount} odběratelů
          </button>
        </div>
      )}
    </section>
  );
}
