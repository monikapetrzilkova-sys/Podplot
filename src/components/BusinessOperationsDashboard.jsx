import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { TEST_PERSONAS } from "../data/businessProfiles.js";
import PaymentModal from "./PaymentModal.jsx";

/** Dashboard provozovny — stav provozu, otevírací doba, sdělení (bez poptávek) */
export default function BusinessOperationsDashboard() {
  const {
    user,
    businessIsOpen,
    setBusinessIsOpen,
    businessHours,
    businessHoursNote,
    businessNeighborNote,
    setBusinessNeighborNote,
    saveBusinessHours,
    publishBusinessNeighborNote,
    lunchMenuDraft,
    setLunchMenuDraft,
    publishLunchMenu,
    lunchSubscribersCount,
    pendingBusinessAction,
    clearPendingBusinessAction,
  } = useApp();

  const persona = TEST_PERSONAS.podnik;
  const businessName = user?.name ?? persona.businessName;

  const [hoursDraft, setHoursDraft] = useState(businessHours);
  const [hoursNoteDraft, setHoursNoteDraft] = useState(businessHoursNote);
  const [noteDraft, setNoteDraft] = useState(businessNeighborNote);
  const [highlightNote, setHighlightNote] = useState(false);
  const [highlightHours, setHighlightHours] = useState(false);
  const [menuPayOpen, setMenuPayOpen] = useState(false);

  useEffect(() => {
    setHoursDraft(businessHours);
  }, [businessHours]);

  useEffect(() => {
    setHoursNoteDraft(businessHoursNote);
  }, [businessHoursNote]);

  useEffect(() => {
    setNoteDraft(businessNeighborNote);
  }, [businessNeighborNote]);

  useEffect(() => {
    if (!pendingBusinessAction) return;
    if (pendingBusinessAction === "hours") {
      setHighlightHours(true);
      const t = setTimeout(() => setHighlightHours(false), 2200);
      clearPendingBusinessAction?.();
      return () => clearTimeout(t);
    }
    setHighlightNote(true);
    const t = setTimeout(() => setHighlightNote(false), 2200);
    clearPendingBusinessAction?.();
    return () => clearTimeout(t);
  }, [pendingBusinessAction, clearPendingBusinessAction]);

  return (
    <div className="flex flex-col min-h-full pp-page px-4 pt-4 pb-8 gap-4">
      <p className="text-xs text-stone-500">{businessName}</p>

      <section className="pp-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-stone-800">Stav provozu</h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Viditelné pro sousedy v katalogu a na mapě
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBusinessIsOpen((v) => !v)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border ${
              businessIsOpen
                ? "bg-[#E8F0ED] text-[#1B4D3E] border-[#C5DDD4]"
                : "bg-stone-100 text-stone-600 border-stone-200"
            }`}
            aria-pressed={businessIsOpen}
          >
            {businessIsOpen ? "Otevřeno" : "Zavřeno"}
          </button>
        </div>
        <p className="text-xs text-stone-600">
          Běžná doba: <span className="font-semibold text-stone-800">{businessHours}</span>
          {businessHoursNote ? (
            <span className="block mt-1 text-[#3D7A68]">Mimořádně: {businessHoursNote}</span>
          ) : null}
        </p>
      </section>

      <section
        className={`pp-card p-4 space-y-2 ${
          highlightHours ? "ring-2 ring-[#3D7A68] border-[#3D7A68]" : ""
        }`}
      >
        <h2 className="text-sm font-bold text-stone-800">Otevírací doba</h2>
        <p className="text-[11px] text-stone-500">
          Úprava kvůli svátkům, dovolené nebo změně provozu.
        </p>
        <label className="block">
          <span className="text-[11px] font-semibold text-stone-600">Běžná provozní doba</span>
          <input
            type="text"
            value={hoursDraft}
            onChange={(e) => setHoursDraft(e.target.value)}
            className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Po–Pá 8:00–18:00 · So 9:00–12:00"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-stone-600">Mimořádná poznámka</span>
          <input
            type="text"
            value={hoursNoteDraft}
            onChange={(e) => setHoursNoteDraft(e.target.value)}
            className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Např. 15.–20. 8. zavřeno — dovolená"
          />
        </label>
        <button
          type="button"
          onClick={() => saveBusinessHours({ hours: hoursDraft, note: hoursNoteDraft })}
          className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
        >
          Uložit otevírací dobu
        </button>
      </section>

      <section
        className={`pp-card p-4 space-y-2 ${
          highlightNote ? "ring-2 ring-[#3D7A68] border-[#3D7A68]" : ""
        }`}
      >
        <h2 className="text-sm font-bold text-stone-800">Sdělení sousedům</h2>
        <p className="text-[11px] text-stone-500">
          Aktuální poznámka — denní menu, akce, změna provozu.
        </p>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={3}
          placeholder="Např. Dnes polední menu od 145 Kč · polévka kulajda…"
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none bg-white"
          autoFocus={highlightNote}
        />
        <button
          type="button"
          onClick={() => {
            setBusinessNeighborNote(noteDraft);
            publishBusinessNeighborNote(noteDraft);
          }}
          className="w-full py-2.5 bg-[#1B4D3E] text-white rounded-xl text-xs font-semibold"
        >
          Publikovat sdělení
        </button>
        {businessNeighborNote ? (
          <p className="text-[11px] text-stone-500 bg-[#F7FAF9] rounded-xl px-3 py-2 border border-[#E8F0ED]">
            Aktivní: <span className="text-stone-700">{businessNeighborNote}</span>
          </p>
        ) : null}
      </section>

      <section className="pp-card p-4 space-y-2">
        <h2 className="text-sm font-bold text-stone-800">Polední menu</h2>
        <p className="text-[11px] text-stone-500">
          Volitelně do widgetu menu · {lunchSubscribersCount || persona.stats?.subscribers || 0}{" "}
          odběratelů v okolí
        </p>
        <textarea
          value={lunchMenuDraft}
          onChange={(e) => setLunchMenuDraft(e.target.value)}
          rows={3}
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none bg-white"
          placeholder="Polévka, hlavní jídlo, vegetarián…"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => publishLunchMenu("free")}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-[#C5DDD4] text-[#1B4D3E] bg-white"
          >
            Publikovat zdarma
          </button>
          <button
            type="button"
            onClick={() => setMenuPayOpen(true)}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#3D7A68] text-white"
          >
            Push 19 Kč
          </button>
        </div>
      </section>

      <PaymentModal
        open={menuPayOpen}
        onClose={() => setMenuPayOpen(false)}
        title="Push notifikace odběratelům"
        amount={19}
        note="Platba kartou za push dnešního menu odběratelům."
        onConfirm={() => {
          publishLunchMenu("push");
          setMenuPayOpen(false);
        }}
      />
    </div>
  );
}
