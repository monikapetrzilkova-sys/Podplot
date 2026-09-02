import { useApp } from "../context/AppContext.jsx";
import { UI_KEYS } from "../data/uiPreferences.js";
import { greetingFirstName } from "../data/czechVocative.js";
import { useUiPref } from "../hooks/useUiPref.js";
import { DoodleNeighborsIntro } from "./doodle/doodleIllustrations.jsx";
import { DoodleStarIcon } from "./doodle/doodleIcons.jsx";

export default function WelcomeCard() {
  const { user, switchFeedMainMode, selectFeedSubFilter, setActiveTab } = useApp();
  const [dismissed, setDismissed] = useUiPref(UI_KEYS.WELCOME_CARD_DISMISSED, false);

  if (dismissed) return null;

  const firstName = greetingFirstName(user?.name);

  return (
    <div className="mx-4 mt-3 mb-1 p-4 bg-gradient-to-br from-teal-700 to-teal-800 text-white rounded-2xl shrink-0 relative overflow-hidden">
      <DoodleNeighborsIntro className="absolute -right-1 top-2 w-20 h-10 opacity-25 text-white pointer-events-none" />
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 text-lg leading-none"
        aria-label="Skrýt uvítací kartu"
        title="Skrýt"
      >
        ×
      </button>
      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-200 mb-1">Testovací verze MVP</p>
      <h2 className="text-base font-bold leading-snug mb-2 pr-6 inline-flex items-start gap-1.5 flex-wrap">
        <span>Ahoj {firstName}, vítej v testovací verzi aplikace Podplot!</span>
        <DoodleStarIcon className="w-4 h-4 shrink-0 mt-0.5 text-teal-100" />
      </h2>
      <p className="text-sm text-teal-100 leading-relaxed mb-3">
        Pomoz mi ji vylepšit. Zkus si půjčit věc, založit klub nebo nahlásit závadu na mapě.
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("market")}
          className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl"
        >
          Tržiště
        </button>
        <button
          type="button"
          onClick={() => {
            switchFeedMainMode("skupiny");
            selectFeedSubFilter("vse");
            setActiveTab("home");
          }}
          className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl"
        >
          Skupiny
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl"
        >
          Hlášení
        </button>
      </div>
    </div>
  );
}
