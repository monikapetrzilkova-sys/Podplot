import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { TEST_PERSONAS } from "../data/businessProfiles.js";
import { getDefaultDemoInstitution } from "../data/institutions/index.js";
import { isActiveOfficePrompt } from "../data/municipalityPrompts.js";
import SmartSectionBar from "./SmartSectionBar.jsx";
import LiveFeedCard from "./LiveFeedCard.jsx";
import OfficePromptCard from "./OfficePromptCard.jsx";
import PrimaryAddButton from "./PrimaryAddButton.jsx";
import InstitutionPresenceBar from "./InstitutionPresenceBar.jsx";
import InfoTip from "./InfoTip.jsx";
import { useInstitutionPresence } from "../hooks/useInstitutionPresence.js";
import { AGENDA_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import DoodleEmptyState from "./doodle/DoodleEmptyState.jsx";
import SparsePageDoodle from "./doodle/SparsePageDoodle.jsx";
import { DoodleAgendaScene } from "./doodle/doodleIllustrations.jsx";
import { isOfficeOrganizedEvent } from "../utils/categoryAccents.js";
import { isSampleContent } from "../data/sampleContent.js";

const AGENDA_MAIN = [
  { id: "prompts", label: "K řešení", shortLabel: "K řešení", Icon: AGENDA_DOODLE_ICONS.prompts },
  { id: "events", label: "Akce", shortLabel: "Akce", Icon: AGENDA_DOODLE_ICONS.events },
];

function agendaBadge(kind) {
  if (kind === "prompt") return { label: "K řešení", className: "pp-badge--hlaseni" };
  if (kind === "event-office") return { label: "Vlastní", className: "pp-badge--akce" };
  return { label: "Sousedé", className: "pp-badge--skupina" };
}

/** Agenda úřadu — výchozí K řešení, na akce se přepneš. */
export default function InstitutionOfficePage() {
  const {
    setActiveTab,
    municipalityPrompts,
    upcomingEvents,
    openEventDetail,
    openCreateEvent,
    user,
  } = useApp();
  const persona = TEST_PERSONAS.urad;
  const demoInst = getDefaultDemoInstitution();
  const institutionId = user?.institutionId || persona.institutionId || demoInst?.id;

  const [activeSection, setActiveSection] = useState("prompts");

  const { peers, conflictPeers } = useInstitutionPresence({
    institutionId,
    userId: user?.id,
    displayName: user?.name || "Úředník",
    editingRecordKey: activeSection,
    enabled: Boolean(institutionId && user?.id),
  });

  const openPrompts = useMemo(
    () => municipalityPrompts.filter(isActiveOfficePrompt),
    [municipalityPrompts]
  );

  const eventsWithKind = useMemo(
    () =>
      (upcomingEvents ?? []).map((ev) => ({
        event: ev,
        kind: isOfficeOrganizedEvent(ev, user) ? "event-office" : "event-neighbor",
      })),
    [upcomingEvents, user]
  );

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco">
      <div className="px-3 pt-2 pb-1.5 shrink-0 flex items-start gap-1">
        <div className="flex-1 min-w-0">
          <SmartSectionBar
            mode="main"
            mainItems={AGENDA_MAIN}
            activeId={activeSection}
            onSelectMain={setActiveSection}
            ariaLabel="Agenda — sekce"
            prominent
            fit
          />
        </div>
        <div className="mt-2 shrink-0">
          <InfoTip title="Agenda" inline>
            <p>Tady řešíš podněty od sousedů. Na akce v obci se přepneš nahoře.</p>
            <p>Nové oznámení nebo akci přidáš tlačítkem + dole.</p>
            <p>Tým úřadu spravuješ v profilu — klepni na avatar nahoře.</p>
          </InfoTip>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-8 pt-1 space-y-3 flex flex-col">
        <InstitutionPresenceBar peers={peers} conflictPeers={conflictPeers} />

        {activeSection === "prompts" && (
          <>
            <div className="flex items-center justify-end px-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className="text-[10px] font-semibold text-[#3D7A68]"
              >
                Mapa ›
              </button>
            </div>
            {openPrompts.length === 0 ? (
              <DoodleEmptyState illustration="agenda" message="Zatím nic k řešení." />
            ) : (
              <div className="space-y-1.5">
                {openPrompts.map((p) => {
                  const badge = agendaBadge("prompt");
                  return (
                    <LiveFeedCard
                      key={p.id}
                      itemId={`prompt-list-${p.id}`}
                      sample={isSampleContent(p)}
                      badge={badge.label}
                      badgeClassName={badge.className}
                      title={p.title}
                      preview={p.body}
                      statusLabel={p.statusLabel}
                    >
                      <OfficePromptCard prompt={p} />
                    </LiveFeedCard>
                  );
                })}
              </div>
            )}
            {openPrompts.length > 0 ? (
              <SparsePageDoodle Scene={DoodleAgendaScene} count={openPrompts.length} />
            ) : null}
          </>
        )}

        {activeSection === "events" && (
          <>
            <PrimaryAddButton label="Nová akce" onClick={() => openCreateEvent?.()} />
            {eventsWithKind.length === 0 ? (
              <DoodleEmptyState illustration="agenda" message="Zatím žádné akce v obci." />
            ) : (
              <div className="space-y-1.5">
                {eventsWithKind.map(({ event, kind }) => {
                  const badge = agendaBadge(kind);
                  return (
                    <LiveFeedCard
                      key={event.id}
                      itemId={`event-list-${event.id}`}
                      sample={isSampleContent(event)}
                      badge={badge.label}
                      badgeClassName={badge.className}
                      title={event.title}
                      preview={`${event.date}${event.location ? ` · ${event.location}` : ""}`}
                    >
                      <p className="pp-text-body text-sm">
                        {event.address ?? event.location}
                        {event.categoryLabel ? ` · ${event.categoryLabel}` : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => openEventDetail?.(event.id)}
                        className="py-2 px-4 text-sm font-semibold text-white rounded-xl pp-btn-primary"
                      >
                        Detail akce
                      </button>
                    </LiveFeedCard>
                  );
                })}
              </div>
            )}
            {eventsWithKind.length > 0 ? (
              <SparsePageDoodle Scene={DoodleAgendaScene} count={eventsWithKind.length} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
