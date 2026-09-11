import { useState } from "react";
import AccountTypeIcon from "./AccountTypeIcon.jsx";
import InfoTip from "./InfoTip.jsx";
import { useApp } from "../context/AppContext.jsx";

/** Kompaktní CTA: většina lidí úřad neřeší — info až po rozbalení / u chipu krátká poznámka. */
export function AddOfficeAccountCard({ className = "", variant = "card" }) {
  const { logoutAndRegisterAs, closeProfile } = useApp();
  const [open, setOpen] = useState(false);

  const startOfficeRegistration = () => {
    closeProfile?.();
    logoutAndRegisterAs?.("urad", {
      notice:
        "Zvol obec a zadej oficiální e-mail úřadu. Soukromý e-mail (Gmail apod.) úřad neumožní.",
    });
  };

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={startOfficeRegistration}
        title="Jen pro zastupitele obce · oficiální e-mail úřadu"
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-[#3D7A68]/50 text-[11px] font-semibold text-[#1B4D3E] bg-[#F1F6F5] ${className}`.trim()}
      >
        <AccountTypeIcon roleId="urad" accountType="urad" className="w-3.5 h-3.5" />
        Úřední účet obce
      </button>
    );
  }

  return (
    <section className={`mt-2 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-6 h-6 rounded-lg bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
          <AccountTypeIcon roleId="urad" accountType="urad" className="w-3.5 h-3.5" />
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex-1 min-w-0 text-left"
        >
          <span className="block text-[11px] font-semibold text-stone-700 truncate">
            Úřední účet obce
          </span>
          <span className="block text-[10px] text-stone-400">
            {open ? "Skrýt podrobnosti" : "Jen pro zastupitele obce · podrobnosti"}
          </span>
        </button>
        <button
          type="button"
          onClick={startOfficeRegistration}
          className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-stone-200 text-[#1B4D3E] bg-white hover:bg-[#F1F6F5]"
        >
          Založit
        </button>
      </div>
      {open ? (
        <p className="mt-1.5 pl-8 text-[10px] text-stone-500 leading-snug">
          Úřad nejde založit na soukromém e-mailu — potřebuješ oficiální mail obce (např.
          @jesenice.cz). Po odhlášení dokončíš samostatnou registraci; pod správou ho budeš mít
          vedle sousedského účtu.
        </p>
      ) : null}
    </section>
  );
}

/** Kompaktní CTA z úřadu na oddělený sousedský účet. */
export function AddNeighborAccountCard({ className = "" }) {
  const { logoutAndRegisterAs, closeProfile } = useApp();

  return (
    <section className={`mt-2 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-6 h-6 rounded-lg bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
          <AccountTypeIcon roleId="soused" accountType="soused" className="w-3.5 h-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <span className="block text-[11px] font-semibold text-stone-700 truncate">
            Sousedský účet
          </span>
        </div>
        <InfoTip title="Sousedský účet">
          <p>Úřad a soused nejsou jeden účet — nejde je přepínat pod stejným přihlášením.</p>
          <p>Osobní účet založíš soukromým e-mailem, nebo oficiálním mailem obce, pokud na něj souseda ještě nemáš.</p>
        </InfoTip>
        <button
          type="button"
          onClick={() => {
            closeProfile?.();
            logoutAndRegisterAs?.("soused", {
              notice:
                "Založ sousedský účet. Doporučujeme soukromý e-mail; oficiální mail obce jde použít, pokud na něj souseda ještě nemáš.",
            });
          }}
          className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-stone-200 text-[#1B4D3E] bg-white hover:bg-[#F1F6F5]"
        >
          Přidat
        </button>
      </div>
    </section>
  );
}
