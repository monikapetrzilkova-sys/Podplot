import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Avatar } from "./RoleBadge.jsx";
import PersonLabel from "./PersonLabel.jsx";
import { PROFILE_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import { isCurrentUserRef, isSelfNeighborCandidate } from "../data/listingSales.js";
import { TRUST_COPY, trustPendingCountLabel, neighborLocalityCaption } from "../data/trustNetworkCopy.js";

/** Domů — sbalená výzva: noví sousedé k potvrzení (po rozkliknutí) */
export default function TrustNeighborHomePrompt() {
  const {
    user,
    neighbors,
    confirmationsGiven,
    trustDismissedIds,
    trustHomePromptHidden,
    confirmNeighbor,
    dismissTrustNeighbor,
    hideTrustHomePrompt,
    getPersonPhoto,
    activeLocation,
  } = useApp();

  const [expanded, setExpanded] = useState(false);

  const pending = (neighbors ?? []).filter(
    (n) =>
      n?.id &&
      !isSelfNeighborCandidate(n, user) &&
      !isCurrentUserRef(n.id, user) &&
      !(confirmationsGiven ?? []).includes(n.id) &&
      !(trustDismissedIds ?? []).includes(n.id)
  );

  if (trustHomePromptHidden || pending.length === 0) return null;

  const TrustIcon = PROFILE_DOODLE_ICONS.trust;
  const countLabel = trustPendingCountLabel(pending.length);

  return (
    <section className="px-3 pt-2 pb-1" aria-label={TRUST_COPY.sectionTitle}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full pp-card px-3.5 py-3 flex items-center gap-3 text-left hover:bg-[#F7FAF9] transition-colors"
      >
        <span className="relative w-9 h-9 rounded-xl bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
          {TrustIcon ? <TrustIcon className="w-4 h-4" /> : null}
          <span className="absolute -top-1.5 -right-1.5 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-[#3D7A68] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
            {pending.length}
          </span>
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-stone-900">{TRUST_COPY.homeTitle}</span>
          <span className="block text-[11px] text-stone-500 mt-0.5">
            {TRUST_COPY.homeCollapsedHint(countLabel)}
          </span>
        </span>
        <span className="text-[11px] font-semibold text-[#3D7A68] shrink-0">
          {expanded ? "Sbalit ▲" : "Rozbalit ▼"}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          <div className="flex justify-end px-0.5">
            <button
              type="button"
              onClick={() => hideTrustHomePrompt?.()}
              className="text-[11px] font-semibold text-stone-500 hover:text-stone-700 underline underline-offset-2"
            >
              {TRUST_COPY.hideOnHome}
            </button>
          </div>
          <p className="text-[11px] text-stone-600 leading-snug px-0.5 pb-0.5">
            {TRUST_COPY.homeIntro}
          </p>
          {pending.map((n) => {
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
                  <Avatar
                    initials={initials}
                    name={n.name}
                    roleId="soused"
                    size="md"
                    photo={photo}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                      {TRUST_COPY.cardEyebrow}
                    </p>
                    <p className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                      <PersonLabel personId={n.id} name={n.name} />
                    </p>
                    <p className="text-[11px] font-medium text-[#3D7A68] mt-0.5 truncate">
                      {neighborLocalityCaption(n, activeLocation)}
                    </p>
                    <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                      {TRUST_COPY.cardHint}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => confirmNeighbor(n.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#3D7A68] border border-[#3D7A68] hover:bg-[#346859]"
                      >
                        {TRUST_COPY.confirmAction}
                      </button>
                      <button
                        type="button"
                        onClick={() => dismissTrustNeighbor(n.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50"
                      >
                        {TRUST_COPY.skipAction}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
