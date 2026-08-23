import AccountTypeIcon from "./AccountTypeIcon.jsx";
import { useApp } from "../context/AppContext.jsx";

/** CTA: z osobního účtu založit oddělený úřední účet (oficiální e-mail). */
export function AddOfficeAccountCard({ className = "" }) {
  const { logoutAndRegisterAs, closeProfile } = useApp();

  return (
    <section
      className={`rounded-xl border border-dashed border-[#C5DDD4] bg-[#F7FAF9] p-3 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
          <AccountTypeIcon roleId="urad" accountType="urad" className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-stone-900">Úřední účet obce</h4>
          <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
            Úřad nejde založit na soukromém e-mailu. Potřebujete oficiální mail obce (např.
            @jesenice.cz). Po odhlášení dokončíte samostatnou registraci úřadu — pod správou ho
            budete mít vedle sousedského účtu.
          </p>
          <button
            type="button"
            onClick={() => {
              closeProfile?.();
              logoutAndRegisterAs?.("urad", {
                notice:
                  "Zvolte obec a zadejte oficiální e-mail úřadu. Soukromý e-mail (Gmail apod.) úřad neumožní.",
              });
            }}
            className="mt-2.5 inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-[#3D7A68] text-[#1B4D3E] bg-white hover:bg-[#E8F3EF]"
          >
            Založit účet úřadu
          </button>
        </div>
      </div>
    </section>
  );
}

/** CTA: z úřadu přidat oddělený sousedský účet. */
export function AddNeighborAccountCard({ className = "" }) {
  const { logoutAndRegisterAs, closeProfile } = useApp();

  return (
    <section
      className={`rounded-xl border border-dashed border-[#C5DDD4] bg-[#F7FAF9] p-3 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
          <AccountTypeIcon roleId="soused" accountType="soused" className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-stone-900">Sousedský účet</h4>
          <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
            Úřad a soused nejsou jeden účet — nelze je přepínat pod stejným přihlášením. Můžete si
            přidat osobní sousedský účet (soukromý e-mail, nebo oficiální mail obce, pokud ještě
            nemáte sousedskou registraci).
          </p>
          <button
            type="button"
            onClick={() => {
              closeProfile?.();
              logoutAndRegisterAs?.("soused", {
                notice:
                  "Založte sousedský účet. Doporučujeme soukromý e-mail; oficiální mail obce lze použít, pokud na něj ještě souseda nemáte.",
              });
            }}
            className="mt-2.5 inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-[#3D7A68] text-[#1B4D3E] bg-white hover:bg-[#E8F3EF]"
          >
            Přidat sousedský účet
          </button>
        </div>
      </div>
    </section>
  );
}
