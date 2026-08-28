import { useApp } from "../context/AppContext.jsx";
import { UI_KEYS } from "../data/uiPreferences.js";
import { useUiPref } from "../hooks/useUiPref.js";

/** 2 kroky pro nového souseda — fotka a mapa okolí (adresa je už při registraci) */
export default function NeighborOnboardingChecklist() {
  const { user, openProfile, setActiveTab } = useApp();
  const [dismissed, setDismissed] = useUiPref(UI_KEYS.ONBOARDING_CHECKLIST_DISMISSED, false);
  const [mapVisited, setMapVisited] = useUiPref(UI_KEYS.ONBOARDING_MAP_VISITED, false);

  if (dismissed || !user) return null;

  const hasPhoto = Boolean(user.profilePhoto);

  const steps = [
    {
      id: "photo",
      label: "Přidejte fotku",
      hint: "Sousedé vás snáz poznají",
      done: hasPhoto,
      onClick: () => openProfile?.(),
    },
    {
      id: "map",
      label: "Prohlédněte mapu okolí",
      hint: "Hlášení a tipy v okruhu",
      done: mapVisited,
      onClick: () => {
        setMapVisited(true);
        setActiveTab?.("map");
      },
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount >= steps.length) return null;

  return (
    <section className="mx-4 mt-3 mb-1" aria-label="První kroky">
      <div className="rounded-2xl border border-[#C5DDD4] bg-gradient-to-br from-[#F7FAF9] to-white p-4 relative overflow-hidden">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 text-lg leading-none"
          aria-label="Skrýt checklist"
        >
          ×
        </button>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#3D7A68] mb-0.5">
          Začněte tady
        </p>
        <h2 className="text-sm font-bold text-stone-900 pr-6">
          Dvě drobnosti na začátek
        </h2>
        <p className="text-[11px] text-stone-500 mt-0.5 mb-3">
          Hotovo {doneCount} z {steps.length}
        </p>
        <ul className="space-y-2">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={step.onClick}
                disabled={step.done}
                className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  step.done
                    ? "border-[#C5DDD4] bg-[#E8F3EF]/70 opacity-80"
                    : "border-stone-200 bg-white hover:border-[#3D7A68]/40 hover:bg-[#F7FAF9]"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    step.done
                      ? "bg-[#3D7A68] text-white"
                      : "bg-stone-100 text-stone-500 border border-stone-200"
                  }`}
                >
                  {step.done ? "✓" : steps.indexOf(step) + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-semibold ${
                      step.done ? "text-[#1B4D3E] line-through decoration-[#3D7A68]/40" : "text-stone-900"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block text-[11px] text-stone-500">{step.hint}</span>
                </span>
                {!step.done && (
                  <span className="text-[11px] font-semibold text-[#3D7A68] shrink-0">Otevřít</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
