import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { TEST_PERSONAS } from "../data/businessProfiles.js";
import { eventHasPartner, eventPartnersOf } from "../data/eventPartners.js";
import InfoTip from "./InfoTip.jsx";
import SparsePageDoodle from "./doodle/SparsePageDoodle.jsx";
import { DoodleSluzbyScene } from "./doodle/doodleIllustrations.jsx";

/** Dashboard provozovny — dnes otevřeno, sdělení, místní akce. Propagace je zvlášť. */
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
    pendingBusinessAction,
    clearPendingBusinessAction,
    upcomingEvents,
    openEventDetail,
    ownedInstitution,
    joinEventAsPartner,
    setActiveTab,
  } = useApp();

  const persona = TEST_PERSONAS.podnik;
  const businessName = ownedInstitution?.name || user?.name || persona.businessName;
  const partnerRef = {
    id: ownedInstitution?.id || user?.id,
    placeId: ownedInstitution?.id,
    name: businessName,
  };

  const [hoursDraft, setHoursDraft] = useState(businessHours);
  const [hoursNoteDraft, setHoursNoteDraft] = useState(businessHoursNote);
  const [noteDraft, setNoteDraft] = useState(businessNeighborNote);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [highlightNote, setHighlightNote] = useState(false);
  const [highlightHours, setHighlightHours] = useState(false);

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
      setHoursOpen(true);
      setHighlightHours(true);
      const t = setTimeout(() => setHighlightHours(false), 2200);
      clearPendingBusinessAction?.();
      return () => clearTimeout(t);
    }
    if (pendingBusinessAction === "menu") {
      clearPendingBusinessAction?.();
      return undefined;
    }
    setHighlightNote(true);
    const t = setTimeout(() => setHighlightNote(false), 2200);
    clearPendingBusinessAction?.();
    return () => clearTimeout(t);
  }, [pendingBusinessAction, clearPendingBusinessAction]);

  return (
    <div className="flex flex-col min-h-full pp-page px-4 pt-4 pb-8 gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-stone-900 truncate">{businessName}</p>
        <InfoTip title="Provoz">
          <p>Tady nastavíš, jestli máte dnes otevřeno, otevírací dobu a krátké sdělení sousedům.</p>
          <p>Banner a polední menu (i push lidem, co ho mají zapnuté) jsou na záložce Propagace.</p>
        </InfoTip>
      </div>

      <section className="pp-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Teď</p>
            <p className="text-base font-bold text-stone-900 mt-0.5">
              {businessIsOpen ? "Otevřeno" : "Zavřeno"}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
              {businessHours}
              {businessHoursNote ? ` · ${businessHoursNote}` : ""}
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
            {businessIsOpen ? "Zavřít" : "Otevřít"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setHoursOpen((v) => !v)}
          className="mt-2 text-[11px] font-semibold text-[#3D7A68]"
        >
          {hoursOpen ? "Skrýt otevírací dobu" : "Upravit otevírací dobu"}
        </button>
        {hoursOpen ? (
          <div
            className={`mt-3 space-y-2 ${
              highlightHours ? "ring-2 ring-[#3D7A68] rounded-xl p-2" : ""
            }`}
          >
            <label className="block">
              <span className="text-[11px] font-semibold text-stone-600">Běžná doba</span>
              <input
                type="text"
                value={hoursDraft}
                onChange={(e) => setHoursDraft(e.target.value)}
                className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
                placeholder="Po–Pá 8:00–18:00 · So 9:00–12:00"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-stone-600">Mimořádně</span>
              <input
                type="text"
                value={hoursNoteDraft}
                onChange={(e) => setHoursNoteDraft(e.target.value)}
                className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
                placeholder="15.–20. 8. zavřeno — dovolená"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                saveBusinessHours({ hours: hoursDraft, note: hoursNoteDraft });
                setHoursOpen(false);
              }}
              className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
            >
              Uložit
            </button>
          </div>
        ) : null}
      </section>

      <section
        className={`pp-card p-4 space-y-2 ${
          highlightNote ? "ring-2 ring-[#3D7A68] border-[#3D7A68]" : ""
        }`}
      >
        <h2 className="text-sm font-bold text-stone-800">Sdělení sousedům</h2>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={2}
          placeholder="Dnes máme dorty z výměny, přijďte do 17:00…"
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
          Publikovat
        </button>
        {businessNeighborNote ? (
          <p className="text-[11px] text-stone-600 bg-[#F7FAF9] rounded-xl px-3 py-2 border border-[#E8F0ED]">
            {businessNeighborNote}
          </p>
        ) : null}
      </section>

      <section className="pp-card p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-stone-800">Akce v okolí</h2>
          <InfoTip title="Místní akce">
            <p>Vidíš, co se v obci chystá — i akce úřadu, kde mají stánek podniky a kroužky.</p>
            <p>Když se účastníte, klepni Účastníme se. Organizátor vás uvidí na programu.</p>
          </InfoTip>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-stone-500">V okolí teď žádná nadcházející akce.</p>
        ) : (
          <ul className="space-y-1.5">
            {upcomingEvents.slice(0, 6).map((event) => {
              const onProgram = eventHasPartner(event, partnerRef);
              const partners = eventPartnersOf(event);
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => openEventDetail?.(event.id)}
                    className="w-full text-left rounded-xl border border-stone-100 bg-[#F7FAF9] px-3 py-2"
                  >
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-stone-900 truncate">{event.title}</span>
                      {event.fromOffice || event.accountType === "urad" ? (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#E8F3EF] text-[#1B4D3E]">
                          Obec
                        </span>
                      ) : null}
                      {onProgram ? (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800">
                          Na programu
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">
                      {event.date}
                      {event.location ? ` · ${event.location}` : ""}
                    </span>
                    {partners.length > 0 ? (
                      <span className="block text-[10px] text-stone-400 mt-0.5 truncate">
                        {partners
                          .slice(0, 3)
                          .map((p) => p.name)
                          .join(" · ")}
                        {partners.length > 3 ? ` +${partners.length - 3}` : ""}
                      </span>
                    ) : null}
                  </button>
                  {!onProgram ? (
                    <button
                      type="button"
                      onClick={() => joinEventAsPartner?.(event.id)}
                      className="mt-1 text-[11px] font-semibold text-[#3D7A68]"
                    >
                      Účastníme se
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("ads")}
          className="w-full py-2 rounded-xl text-[11px] font-semibold border border-[#C5DDD4] text-[#1B4D3E] bg-white"
        >
          Propagace — banner a menu
        </button>
      </section>

      <SparsePageDoodle Scene={DoodleSluzbyScene} count={upcomingEvents.length} hideFrom={5} />
    </div>
  );
}
