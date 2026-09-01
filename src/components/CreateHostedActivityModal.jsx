import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { INTEREST_OPTIONS } from "../data/ecosystemMock.js";
import { minEventDateValue } from "../data/eventFormatting.js";
import { isValidCzechTime, combineDateAndTime } from "../data/czechDateTime.js";
import { addressToMapPos } from "../data/mapData.js";
import { geocodeCzechAddress } from "../data/addressAutocomplete.js";
import { buildMapPickResult } from "../utils/geoCoordinates.js";
import { DEFAULT_EVENTS_MAP_RADIUS_KM } from "../data/mapRadiusSettings.js";
import { VENUE_KINDS } from "../data/hostedActivities.js";
import EventLocationMap from "./EventLocationMap.jsx";
import PhotoUpload from "./PhotoUpload.jsx";
import CzechTimeInput from "./CzechTimeInput.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

const EMPTY_SLOT = () => ({ eventDate: "", eventTime: "16:00", timeTbd: false });

const EMPTY_FORM = {
  title: "",
  category: "rodina",
  ageRange: "",
  description: "",
  venueKind: "place",
  placeId: "",
  address: "",
};

export default function CreateHostedActivityModal() {
  const {
    createHostedActivityOpen,
    setCreateHostedActivityOpen,
    createHostedActivity,
    activeLocation,
    institutionsSorted,
  } = useApp();

  const [form, setForm] = useState(EMPTY_FORM);
  const [slots, setSlots] = useState([EMPTY_SLOT()]);
  const [draftPin, setDraftPin] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [pinError, setPinError] = useState("");
  const [formError, setFormError] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const manualPinRef = useRef(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSlots([EMPTY_SLOT()]);
    setDraftPin(null);
    setPhotos([]);
    setPinError("");
    setFormError("");
    setPlaceQuery("");
    manualPinRef.current = false;
  };

  const close = () => {
    setCreateHostedActivityOpen(false);
    resetForm();
  };

  useEffect(() => {
    if (!createHostedActivityOpen) return;
    resetForm();
  }, [createHostedActivityOpen]);

  const selectedPlace = useMemo(
    () => (institutionsSorted ?? []).find((p) => p.id === form.placeId) ?? null,
    [institutionsSorted, form.placeId]
  );

  const placeOptions = useMemo(() => {
    const q = placeQuery.trim().toLowerCase();
    const list = institutionsSorted ?? [];
    if (!q) return list.slice(0, 40);
    return list
      .filter((p) =>
        [p.name, p.address, p.tagline].filter(Boolean).join(" ").toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [institutionsSorted, placeQuery]);

  const resolvedAddress =
    form.venueKind === "place"
      ? selectedPlace?.address || form.address
      : form.address;

  useEffect(() => {
    if (!createHostedActivityOpen || form.venueKind === "place") return;
    if (manualPinRef.current) return;
    const addr = form.address.trim();
    if (addr.length < 5) {
      setDraftPin(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const center = {
        lat: activeLocation?.lat ?? 49.966,
        lng: activeLocation?.lng ?? 14.512,
      };
      const geocoded = await geocodeCzechAddress({ fullAddress: addr });
      if (cancelled) return;
      if (geocoded?.lat != null && geocoded?.lng != null) {
        setDraftPin(
          buildMapPickResult(geocoded.lat, geocoded.lng, center, DEFAULT_EVENTS_MAP_RADIUS_KM)
        );
        setPinError("");
        return;
      }
      const pos = addressToMapPos(addr);
      if (pos) {
        setDraftPin(pos);
        setPinError("");
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.address, form.venueKind, createHostedActivityOpen, activeLocation?.lat, activeLocation?.lng]);

  useEffect(() => {
    if (!createHostedActivityOpen || form.venueKind !== "place" || !selectedPlace) return;
    const pos = selectedPlace.mapPos
      ? {
          ...selectedPlace.mapPos,
          lat: selectedPlace.lat ?? selectedPlace.mapPos.lat ?? activeLocation?.lat,
          lng: selectedPlace.lng ?? selectedPlace.mapPos.lng ?? activeLocation?.lng,
        }
      : null;
    setDraftPin(pos);
    if (selectedPlace.address) {
      setForm((f) => ({ ...f, address: selectedPlace.address }));
    }
  }, [createHostedActivityOpen, form.venueKind, selectedPlace, activeLocation?.lat, activeLocation?.lng]);

  const filledSlots = slots.filter((s) => s.eventDate);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError("Zadejte název kroužku nebo lekce.");
      return;
    }
    if (form.venueKind === "place" && !form.placeId) {
      setFormError("Vyberte místo z Průvodce, nebo zvolte adresu.");
      return;
    }
    if (form.venueKind !== "place" && !form.address.trim()) {
      setFormError("Zadejte adresu.");
      return;
    }
    for (const slot of filledSlots) {
      if (!slot.timeTbd && !isValidCzechTime(slot.eventTime)) {
        setFormError("U termínů zadejte čas (např. 16:00), nebo zaškrtněte, že bude upřesněn.");
        return;
      }
      const startsAt = combineDateAndTime(slot.eventDate, slot.eventTime, slot.timeTbd);
      if (startsAt && !slot.timeTbd && new Date(startsAt).getTime() < Date.now()) {
        setFormError("Termíny musí být v budoucnosti.");
        return;
      }
    }
    const center = {
      lat: activeLocation?.lat ?? 49.966,
      lng: activeLocation?.lng ?? 14.512,
    };
    let pin = draftPin;
    if (!pin) {
      const autoPos = addressToMapPos((resolvedAddress || "").trim());
      pin = autoPos
        ? { ...autoPos, lat: center.lat, lng: center.lng }
        : { x: 50, y: 50, lat: center.lat, lng: center.lng };
    }
    setFormError("");
    setPinError("");
    const createdId = createHostedActivity({
      ...form,
      address: resolvedAddress,
      placeName: selectedPlace?.name ?? "",
      mapPos: pin,
      photo: photos[0]?.url ?? null,
      dates: filledSlots,
    });
    if (!createdId) return;
    close();
  };

  if (!createHostedActivityOpen) return null;

  const needsMap = form.venueKind !== "place" || Boolean(selectedPlace);

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={close} />
        </div>
        <div className="pp-app-sheet flex flex-col overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-stone-200 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-stone-900">Kroužek / lekce</h2>
              <button type="button" onClick={close} className="text-stone-400 hover:text-stone-600 text-xl px-2">
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500">
              Kroužek nebo lekce s vlastním rozvrhem. Místo konání může být z Průvodce, nebo adresa.
            </p>
          </div>

          <form onSubmit={submit} className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-3 min-w-0">
            {formError && <p className="text-xs text-red-600">{formError}</p>}

            <input
              type="text"
              placeholder="Název — např. jóga, keramika *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
              required
            />

            <div>
              <label htmlFor="activity-category" className="block text-xs font-semibold text-stone-600 mb-1">
                Kategorie *
              </label>
              <select
                id="activity-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
              >
                {INTEREST_OPTIONS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Pro koho — např. 1–4 roky"
              value={form.ageRange}
              onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
            />

            <div>
              <p className="text-xs font-semibold text-stone-600 mb-1.5">Kde to probíhá *</p>
              <div className="space-y-1.5">
                {VENUE_KINDS.map((kind) => (
                  <label
                    key={kind.id}
                    className={`flex items-start gap-2 px-3 py-2 rounded-xl border text-sm ${
                      form.venueKind === kind.id
                        ? "border-emerald-300 bg-emerald-50/60"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="venueKind"
                      checked={form.venueKind === kind.id}
                      onChange={() => {
                        manualPinRef.current = false;
                        setForm({ ...form, venueKind: kind.id, placeId: kind.id === "place" ? form.placeId : "" });
                      }}
                      className="mt-1 accent-emerald-600"
                    />
                    <span>
                      <span className="block font-semibold text-stone-800">{kind.label}</span>
                      <span className="block text-[11px] text-stone-500">{kind.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {form.venueKind === "place" ? (
              <div>
                <label htmlFor="activity-place-search" className="block text-xs font-semibold text-stone-600 mb-1">
                  Místo z Průvodce *
                </label>
                <input
                  id="activity-place-search"
                  type="search"
                  placeholder="Hledat místo — např. knihovna, kulturní dům"
                  value={placeQuery}
                  onChange={(e) => setPlaceQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm mb-1.5"
                />
                <select
                  value={form.placeId}
                  onChange={(e) => setForm({ ...form, placeId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
                  required
                >
                  <option value="">Vyberte místo</option>
                  {placeOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.address ? ` · ${p.address}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="activity-address" className="block text-xs font-semibold text-stone-600 mb-1">
                  Adresa *
                </label>
                <input
                  id="activity-address"
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
              </div>
            )}

            {needsMap && (
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
                  address={resolvedAddress}
                  compact
                />
                {pinError && <p className="text-xs text-red-600 mt-1">{pinError}</p>}
              </div>
            )}

            <div>
              <label htmlFor="activity-description" className="block text-xs font-semibold text-stone-600 mb-1">
                Popis
              </label>
              <textarea
                id="activity-description"
                placeholder="Pro koho to je, co si vzít, jak se hlásit…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm resize-none"
              />
            </div>

            <PhotoUpload
              photos={photos}
              onChange={setPhotos}
              maxPhotos={1}
              label="Fotografie"
              hint="Volitelná fotka kroužku."
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-stone-600">Termíny na měsíc</p>
                <button
                  type="button"
                  onClick={() => setSlots((prev) => [...prev, EMPTY_SLOT()])}
                  className="text-[11px] font-semibold text-[#3D7A68]"
                >
                  + Přidat termín
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mb-2">
                Můžete je vyplnit teď, nebo vypisovat později z karty kroužku.
              </p>
              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <div key={index} className="rounded-xl border border-stone-200 p-2.5 space-y-2">
                    <div className="pp-datetime-fields">
                      <div className="pp-datetime-fields__item">
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Datum</label>
                        <input
                          type="date"
                          lang="cs-CZ"
                          min={minEventDateValue()}
                          value={slot.eventDate}
                          onChange={(e) =>
                            setSlots((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, eventDate: e.target.value } : s))
                            )
                          }
                          className="pp-datetime-fields__control"
                        />
                      </div>
                      <div className="pp-datetime-fields__item">
                        <label className="block text-[10px] font-semibold text-stone-500 mb-1">Čas</label>
                        <CzechTimeInput
                          value={slot.eventTime}
                          onChange={(eventTime) =>
                            setSlots((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, eventTime, timeTbd: false } : s))
                            )
                          }
                          disabled={slot.timeTbd}
                          className="pp-datetime-fields__control disabled:bg-stone-100 disabled:text-stone-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-stone-600">
                        <input
                          type="checkbox"
                          checked={slot.timeTbd}
                          onChange={(e) =>
                            setSlots((prev) =>
                              prev.map((s, i) =>
                                i === index
                                  ? { ...s, timeTbd: e.target.checked, eventTime: e.target.checked ? "" : s.eventTime }
                                  : s
                              )
                            )
                          }
                          className="rounded accent-emerald-600"
                        />
                        Čas upřesníme
                      </label>
                      {slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSlots((prev) => prev.filter((_, i) => i !== index))}
                          className="text-[11px] text-stone-400"
                        >
                          Odebrat
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 pb-1">
              <button type="button" onClick={close} className="flex-1 py-3 border rounded-2xl text-sm font-semibold">
                Zrušit
              </button>
              <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-semibold">
                Zveřejnit
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppPanelPortal>
  );
}
