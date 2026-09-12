/** Banner na Domů, když je v obci ještě málo sousedů na Podplotu */

import { useApp } from "../context/AppContext.jsx";
import { UI_KEYS } from "../data/uiPreferences.js";
import { useUiPref } from "../hooks/useUiPref.js";
import { localityShortLabel } from "../data/czechCityDistricts.js";
import { InviteShareRow } from "./InviteToPodplotButton.jsx";

/** Počet ostatních sousedů ve stejné obci (bez tebe) — pod touto hranicí ukážeme výzvu. */
export const SPARSE_LOCALITY_PEER_MAX = 5;

export default function LocalityAwakeningCard() {
  const { activeLocation, user, localityNeighborCount } = useApp();
  const [dismissed, setDismissed] = useUiPref(UI_KEYS.LOCALITY_AWAKENING_DISMISSED, false);

  if (dismissed || !user) return null;
  if (localityNeighborCount == null) return null;
  if (localityNeighborCount >= SPARSE_LOCALITY_PEER_MAX) return null;

  const rawName =
    activeLocation?.municipality ||
    activeLocation?.shortLabel ||
    user?.municipality ||
    "";
  const placeName = localityShortLabel(rawName) || String(rawName).trim();

  return (
    <section className="mx-4 mt-3 mb-1" aria-label="Lokalita se probouzí">
      <div className="rounded-2xl border border-[#C5DDD4] bg-gradient-to-br from-[#E8F3EF] to-white p-4 relative overflow-hidden">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-white/80 text-lg leading-none"
          aria-label="Skrýt"
        >
          ×
        </button>
        <p className="text-sm font-bold text-stone-900 leading-snug pr-6">
          Tvá lokalita se právě probouzí k životu!
        </p>
        <p className="text-sm text-stone-700 leading-relaxed mt-1.5 pr-2">
          Jsi mezi průkopníky
          {placeName ? (
            <>
              {" "}
              v obci <span className="font-semibold">{placeName}</span>
            </>
          ) : null}
          . Udělej první krok, pozvi někoho z tvé ulice a rozjeď Podplot ve své čtvrti.
        </p>
        <InviteShareRow className="mt-3" />
      </div>
    </section>
  );
}
