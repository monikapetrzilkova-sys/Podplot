import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { INTEREST_OPTIONS } from "../data/ecosystemMock.js";
import { minEventDateValue } from "../data/eventFormatting.js";
import { isValidCzechTime } from "../data/czechDateTime.js";
import { addressToMapPos } from "../data/mapData.js";
import EventLocationMap from "./EventLocationMap.jsx";
import PhotoUpload from "./PhotoUpload.jsx";
import CzechTimeInput from "./CzechTimeInput.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

const EMPTY_FORM = {
  title: "",
  address: "",
  category: "sport",
  eventDate: "",
  eventTime: "",
  timeTbd: false,
  description: "",
  notifyInterested: false,
};

export default function CreateEventModal() {
  const {
    createEventOpen,
    setCreateEventOpen,
    createEvent,
    activeLocation,
    userInterests,
  } = useApp();

  const [form, setForm] = useState(EMPTY_FORM);
  const [draftPin, setDraftPin] = useState(null);
  const [eventPhotos, setEventPhotos] = useState([]);
  const [pinError, setPinError] = useState("");
  const [formError, setFormError] = useState("");
  const manualPinRef = useRef(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setDraftPin(null);
    setEventPhotos([]);
    setPinError("");
    setFormError("");
    manualPinRef.current = false;
  };

  const close = () => {
    setCreateEventOpen(false);
    resetForm();
  };

  useEffect(() => {
    if (!createEventOpen) return;
    resetForm();
    setForm((f) => ({ ...f, address: activeLocation?.address ?? "" }));
  }, [createEventOpen, activeLocation?.address]);

  useEffect(() => {
    if (!createEventOpen || manualPinRef.current) return;
    const addr = form.address.trim();
    if (addr.length < 5) {
      setDraftPin(null);
      return;
    }
    const timer = setTimeout(() => {
      const pos = addressToMapPos(addr);
      if (pos) {
        setDraftPin(pos);
        setPinError("");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [form.address, createEventOpen]);

  const submitEvent = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.address.trim()) {
      setFormError("Zadejte přesnou adresu místa akce.");
      return;
    }
    if (!form.eventDate) {
      setFormError("Vyberte datum akce.");
      return;
    }
    if (!form.timeTbd && !isValidCzechTime(form.eventTime)) {
      setFormError("Zadejte čas ve formátu 24 hodin (např. 17:00), nebo zaškrtněte, že bude upřesněn.");
      return;
    }
    if (!draftPin) {
      const autoPos = addressToMapPos(form.address.trim());
      if (!autoPos) {
        setPinError("Zadejte platnou adresu — místo na mapě se doplní automaticky.");
        return;
      }
      setDraftPin(autoPos);
    }
    setFormError("");
    setPinError("");
    const photo = eventPhotos[0]?.url ?? null;
    createEvent({
      ...form,
      mapPos: draftPin ?? addressToMapPos(form.address.trim()),
      photo,
    });
    close();
  };

  if (!createEventOpen) return null;

  return (
    <AppPanelPortal>
    <div className="pp-app-sheet-overlay">
      <div className="absolute inset-0 pointer-events-auto">
        <ModalDoodleBackdrop onClose={close} />
      </div>

      <div className="pp-app-sheet flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-stone-200 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-stone-900">Nová událost</h2>
            <button type="button" onClick={close} className="text-stone-400 hover:text-stone-600 text-xl px-2">
              ✕
            </button>
          </div>
          <p className="text-xs text-stone-500">
            Místo a mapa patří jen k akci — nepropisují se do hlášení z ulice.
          </p>
        </div>

        <form onSubmit={submitEvent} className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-3 min-w-0">
          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <input
            type="text"
            placeholder="Název akce *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
            required
          />

          <div>
            <label htmlFor="event-category" className="block text-xs font-semibold text-stone-600 mb-1">
              Kategorie *
            </label>
            <select
              id="event-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
            >
              {INTEREST_OPTIONS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.emoji} {i.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="event-date" className="block text-xs font-semibold text-stone-600 mb-1">
                Datum *
              </label>
              <input
                id="event-date"
                type="date"
                lang="cs"
                min={minEventDateValue()}
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="event-time" className="block text-xs font-semibold text-stone-600 mb-1">
                Čas {!form.timeTbd && "*"}
              </label>
              <CzechTimeInput
                id="event-time"
                value={form.eventTime}
                onChange={(eventTime) => setForm({ ...form, eventTime, timeTbd: false })}
                disabled={form.timeTbd}
                required={!form.timeTbd}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm disabled:bg-stone-100 disabled:text-stone-400"
              />
              <p className="text-[10px] text-stone-400 mt-1">24 hodin · např. 17:00</p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700 -mt-1">
            <input
              type="checkbox"
              checked={form.timeTbd}
              onChange={(e) =>
                setForm({
                  ...form,
                  timeTbd: e.target.checked,
                  eventTime: e.target.checked ? "" : form.eventTime,
                })
              }
              className="rounded accent-emerald-600"
            />
            Čas upřesníme později
          </label>

          <div>
            <label htmlFor="event-address" className="block text-xs font-semibold text-stone-600 mb-1">
              Přesná adresa *
            </label>
            <input
              id="event-address"
              type="text"
              placeholder="např. Lípová 12, Jesenice"
              value={form.address}
              onChange={(e) => {
                manualPinRef.current = false;
                setForm({ ...form, address: e.target.value });
              }}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
              required
            />
            {draftPin && form.address.trim().length >= 5 && (
              <p className="text-[11px] text-emerald-700 mt-1">✓ Místo na mapě doplněno z adresy</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-600 mb-1">Mapa místa</p>
            <EventLocationMap
              pickMode
              draftPin={draftPin}
              onPickPin={(pos) => {
                manualPinRef.current = true;
                setDraftPin(pos);
                setPinError("");
              }}
              address={form.address}
              compact
            />
            {pinError && <p className="text-xs text-red-600 mt-1">{pinError}</p>}
          </div>

          <div>
            <label htmlFor="event-description" className="block text-xs font-semibold text-stone-600 mb-1">
              Popis akce
            </label>
            <textarea
              id="event-description"
              placeholder="Co se bude dít, co si vzít, pro koho je akce určená…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm resize-none"
            />
          </div>

          <PhotoUpload
            photos={eventPhotos}
            onChange={setEventPhotos}
            maxPhotos={1}
            label="Fotografie v záhlaví"
            hint="Volitelná fotka — zobrazí se nahoře v detailu akce."
          />

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.notifyInterested}
              onChange={(e) => setForm({ ...form, notifyInterested: e.target.checked })}
              className="rounded accent-emerald-600"
            />
            Upozornit zájemce ({Object.values(userInterests).filter(Boolean).length} vašich zájmů)
          </label>

          <div className="flex gap-2 pt-2 pb-1">
            <button
              type="button"
              onClick={close}
              className="flex-1 py-3 border rounded-2xl text-sm font-semibold"
            >
              Zrušit
            </button>
            <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-semibold">
              Vytvořit
            </button>
          </div>
        </form>
      </div>
    </div>
    </AppPanelPortal>
  );
}
