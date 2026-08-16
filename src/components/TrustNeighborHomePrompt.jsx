import { useApp } from "../context/AppContext.jsx";
import { Avatar } from "./RoleBadge.jsx";
import PersonLabel from "./PersonLabel.jsx";
import { PROFILE_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

/** Domů — výzva k potvrzení nového souseda v síti důvěry */
export default function TrustNeighborHomePrompt() {
  const {
    neighbors,
    confirmationsGiven,
    trustDismissedIds,
    confirmNeighbor,
    dismissTrustNeighbor,
    getPersonPhoto,
  } = useApp();

  const pending = (neighbors ?? []).filter(
    (n) =>
      n?.id &&
      n.isNew &&
      !(confirmationsGiven ?? []).includes(n.id) &&
      !(trustDismissedIds ?? []).includes(n.id)
  );

  if (pending.length === 0) return null;

  const visible = pending.slice(0, 3);
  const TrustIcon = PROFILE_DOODLE_ICONS.trust;

  return (
    <section className="px-3 pt-2 pb-1 space-y-2" aria-label="Noví sousedé k potvrzení">
      {visible.map((n) => {
        const initials =
          n.initials ||
          String(n.name || "?")
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
        const photo = getPersonPhoto?.(n.id) || n.profilePhoto || null;

        return (
          <article
            key={n.id}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-3 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Avatar initials={initials} roleId="soused" size="md" photo={photo} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                  {TrustIcon ? (
                    <span className="text-emerald-700" aria-hidden>
                      <TrustIcon className="w-3.5 h-3.5" />
                    </span>
                  ) : null}
                  Nový soused v lokalitě
                </p>
                <p className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                  <PersonLabel personId={n.id} name={n.name} />
                </p>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                  Znáte se? Potvrďte sousedství, nebo dejte vědět, že ho neznáte.
                </p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => confirmNeighbor(n.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#3D7A68] border border-[#3D7A68] hover:bg-[#346859]"
                  >
                    Potvrdit sousedství
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissTrustNeighbor(n.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50"
                  >
                    Neznám ho
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
      {pending.length > 3 ? (
        <p className="text-[11px] text-stone-500 px-1">
          Další nové sousedy najdete v profilu · Síť důvěry.
        </p>
      ) : null}
    </section>
  );
}
