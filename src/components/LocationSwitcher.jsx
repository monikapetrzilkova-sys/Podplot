import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { LOCATION_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import HomeAddressForm from "./profile/HomeAddressForm.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";

export default function LocationSwitcher() {
  const { activeLocationId, setActiveLocation, locations, addUserLocation } = useApp();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const rootRef = useRef(null);

  const current = locations.find((l) => l.id === activeLocationId) ?? locations[0];
  const CurrentIcon = LOCATION_DOODLE_ICONS[current?.id] ?? LOCATION_DOODLE_ICONS.domov;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="pp-location-switcher relative flex items-center gap-1.5 min-w-0 mt-2" ref={rootRef}>
      <CurrentIcon className="w-4 h-4 shrink-0 text-[#1B4332]" aria-hidden />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pp-location-label min-w-0 truncate bg-transparent border-none p-0 cursor-pointer focus:outline-none text-left"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Lokalita: ${current?.label} · ${current?.shortLabel}`}
      >
        {current?.label}
        {current?.shortLabel ? ` · ${current.shortLabel}` : ""}
        <span className="ml-1 text-[10px] opacity-60" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 z-50 w-[min(100vw-2rem,18rem)] rounded-xl border border-[#C5DDD4] bg-white shadow-lg py-1 overflow-hidden"
        >
          {locations.map((loc) => {
            const LocIcon = LOCATION_DOODLE_ICONS[loc.id] ?? LOCATION_DOODLE_ICONS.domov;
            const active = loc.id === activeLocationId;
            return (
              <button
                key={loc.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setActiveLocation(loc.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-start gap-2 text-xs hover:bg-[#F1F6F5] ${
                  active ? "bg-[#E8F3EF]" : ""
                }`}
              >
                <LocIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#3D7A68]" aria-hidden />
                <span className="min-w-0">
                  <span className="font-semibold text-stone-900 block">
                    {loc.label}
                    {active ? (
                      <span className="ml-1.5 text-[9px] font-bold uppercase text-[#1B4D3E]">Aktivní</span>
                    ) : null}
                  </span>
                  <span className="text-stone-500 block truncate">{loc.address || loc.shortLabel}</span>
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setAdding(true);
            }}
            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-[#1B4D3E] border-t border-stone-100 hover:bg-[#F1F6F5]"
          >
            + Přidat místo (chata, práce…)
          </button>
        </div>
      )}

      {adding && (
        <AppPanelPortal>
          <div className="pp-app-sheet-overlay">
            <div className="absolute inset-0 pointer-events-auto">
              <ModalDoodleBackdrop onClose={() => setAdding(false)} />
            </div>
            <div className="pp-app-sheet p-4 space-y-3" role="dialog" aria-label="Přidat místo">
              <h3 className="text-sm font-bold text-stone-900">Nové místo</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Např. chata, práce nebo druhý byt — po uložení se na něj přepne feed i mapa.
              </p>
              <HomeAddressForm
                compact
                showLabel
                labelRequired
                labelPlaceholder="Název (např. Chata, Práce)"
                submitLabel="Přidat a přepnout"
                onSave={async (payload) => {
                  const ok = await addUserLocation(payload);
                  if (ok) setAdding(false);
                  return ok;
                }}
                onCancel={() => setAdding(false)}
              />
            </div>
          </div>
        </AppPanelPortal>
      )}
    </div>
  );
}
