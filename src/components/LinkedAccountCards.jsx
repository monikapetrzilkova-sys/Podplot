import { useState } from "react";
import AccountTypeIcon from "./AccountTypeIcon.jsx";
import { useApp } from "../context/AppContext.jsx";

/** Kompaktní CTA: většina lidí úřad neřeší — info až po rozbalení. */
export function AddOfficeAccountCard({ className = "" }) {
  const { logoutAndRegisterAs, closeProfile } = useApp();
  const [open, setOpen] = useState(false);

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
          onClick={() => {
            closeProfile?.();
            logoutAndRegisterAs?.("urad", {
              notice:
                "Zvolte obec a zadejte oficiální e-mail úřadu. Soukromý e-mail (Gmail apod.) úřad neumožní.",
            });
          }}
          className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-stone-200 text-[#1B4D3E] bg-white hover:bg-[#F1F6F5]"
        >
          Založit
        </button>
      </div>
      {open ? (
        <p className="mt-1.5 pl-8 text-[10px] text-stone-500 leading-snug">
          Úřad nejde založit na soukromém e-mailu — potřebujete oficiální mail obce (např.
          @jesenice.cz). Po odhlášení dokončíte samostatnou registraci; pod správou ho budete mít
          vedle sousedského účtu.
        </p>
      ) : null}
    </section>
  );
}

/** Kompaktní CTA z úřadu na oddělený sousedský účet. */
export function AddNeighborAccountCard({ className = "" }) {
  const { logoutAndRegisterAs, closeProfile } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <section className={`mt-2 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-6 h-6 rounded-lg bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
          <AccountTypeIcon roleId="soused" accountType="soused" className="w-3.5 h-3.5" />
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex-1 min-w-0 text-left"
        >
          <span className="block text-[11px] font-semibold text-stone-700 truncate">
            Sousedský účet
          </span>
          <span className="block text-[10px] text-stone-400">
            {open ? "Skrýt podrobnosti" : "Oddělené přihlášení · podrobnosti"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            closeProfile?.();
            logoutAndRegisterAs?.("soused", {
              notice:
                "Založte sousedský účet. Doporučujeme soukromý e-mail; oficiální mail obce lze použít, pokud na něj ještě souseda nemáte.",
            });
          }}
          className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-stone-200 text-[#1B4D3E] bg-white hover:bg-[#F1F6F5]"
        >
          Přidat
        </button>
      </div>
      {open ? (
        <p className="mt-1.5 pl-8 text-[10px] text-stone-500 leading-snug">
          Úřad a soused nejsou jeden účet — nelze je přepínat pod stejným přihlášením. Můžete si
          přidat osobní sousedský účet (soukromý e-mail, nebo oficiální mail obce, pokud ještě
          nemáte sousedskou registraci).
        </p>
      ) : null}
    </section>
  );
}
