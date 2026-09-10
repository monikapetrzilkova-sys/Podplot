import { useEffect, useMemo, useState } from "react";
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
  { id: "prompts", label: "Hlášení občanů", shortLabel: "Hlášení", Icon: AGENDA_DOODLE_ICONS.prompts },
  { id: "events", label: "Kalendář akcí", shortLabel: "Akce", Icon: AGENDA_DOODLE_ICONS.events },
];

const PROMPT_SUBS = [{ id: "open", label: "K řešení", shortLabel: "K řešení" }];

const EVENT_SUBS = [
  { id: "all", label: "Všechny akce", shortLabel: "Všechny" },
  { id: "office", label: "Vlastní akce", shortLabel: "Vlastní" },
  { id: "neighbors", label: "Akce od sousedů", shortLabel: "Sousedé" },
];

function agendaBadge(kind) {
  if (kind === "prompt") return { label: "Hlášení", className: "pp-badge--hlaseni" };
  if (kind === "event-office") return { label: "Vlastní", className: "pp-badge--akce" };
  return { label: "Sousedé", className: "pp-badge--skupina" };
}

/** Agenda úřadu — stejný vizuál jako Katalog / Sousedé */
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

  const [activeSection, setActiveSection] = useState(null);
  const [eventFilter, setEventFilter] = useState("all");

  const editingRecordKey = activeSection ?? "agenda-home";
  const { peers, conflictPeers } = useInstitutionPresence({
    institutionId,
    userId: user?.id,
    displayName: user?.name || "Úředník",
    editingRecordKey,
    enabled: Boolean(institutionId && user?.id),
  });

  useEffect(() => {
    setActiveSection(null);
    setEventFilter("all");
  }, []);

  const openPrompts = useMemo(
    () => municipalityPrompts.filter(isActiveOfficePrompt),
    [municipalityPrompts]
  );

  const classifyEvent = (ev) =>
    isOfficeOrganizedEvent(ev, user) ? "event-office" : "event-neighbor";

  const eventsWithKind = useMemo(
    () =>
      (upcomingEvents ?? []).map((ev) => ({
        event: ev,
        kind: classifyEvent(ev),
      })),
    [upcomingEvents, user]
  );

  const filteredEvents = useMemo(() => {
    if (eventFilter === "office") return eventsWithKind.filter((x) => x.kind === "event-office");
    if (eventFilter === "neighbors") return eventsWithKind.filter((x) => x.kind === "event-neighbor");
    return eventsWithKind;
  }, [eventsWithKind, eventFilter]);

  const latestItems = useMemo(() => {
    const prompts = openPrompts.map((p, index) => ({
      id: `prompt-${p.id}`,
      kind: "prompt",
      title: p.title,
      preview: p.body,
      meta: `${p.authorName ?? "Soused"} · ${p.time ?? ""}`,
      prompt: p,
      sort: 1000 - index,
    }));
    const events = eventsWithKind.map((x, index) => ({
      id: `event-${x.event.id}`,
      kind: x.kind,
      title: x.event.title,
      preview: `${x.event.date}${x.event.location ? ` · ${x.event.location}` : ""}`,
      event: x.event,
      sort: 900 - index,
    }));
    return [...prompts, ...events].sort((a, b) => b.sort - a.sort);
  }, [openPrompts, eventsWithKind]);

  const handleSelectMain = (id) => {
    setActiveSection(id);
    if (id === "events") setEventFilter("all");
  };

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco">
      <div className="px-3 pt-2 pb-1.5 shrink-0 flex items-start gap-1">
        <div className="flex-1 min-w-0">
          <SmartSectionBar
            mode={activeSection ? "sub" : "main"}
            mainItems={AGENDA_MAIN}
            subItems={activeSection === "events" ? EVENT_SUBS : activeSection === "prompts" ? PROMPT_SUBS : []}
            activeId={
              activeSection === "events" ? eventFilter : activeSection === "prompts" ? "open" : null
            }
            onSelectMain={handleSelectMain}
            onSelectSub={(id) => {
              if (activeSection === "events") setEventFilter(id);
            }}
            onBack={() => setActiveSection(null)}
            ariaLabel={activeSection ? "Filtr Agendy" : "Agenda — sekce"}
            prominent
            fit={!activeSection}
          />
        </div>
        {!activeSection ? (
          <div className="mt-2 shrink-0">
            <InfoTip title="Agenda" inline>
              <p>Tady jsou podněty občanů a akce v obci.</p>
              <p>Nové oznámení nebo akci přidáš tlačítkem + dole.</p>
              <p>Tým úřadu spravuješ v profilu — klepni na avatar nahoře.</p>
            </InfoTip>
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-8 pt-1 space-y-3 flex flex-col">
        {!activeSection && (
          <>
            <InstitutionPresenceBar peers={peers} conflictPeers={conflictPeers} />

            {latestItems.length === 0 ? (
              <DoodleEmptyState
                illustration="agenda"
                message="Zatím žádné položky v Agendě. Podněty občanů a akce se tu objeví samy."
              />
            ) : (
              <div className="space-y-1.5">
                {latestItems.map((item) => {
                  const badge = agendaBadge(item.kind);
                  if (item.prompt) {
                    return (
                      <LiveFeedCard
                        key={item.id}
                        itemId={item.id}
                        sample={isSampleContent(item.prompt || item)}
                        badge={badge.label}
                        badgeClassName={badge.className}
                        title={item.title}
                        preview={item.preview || item.meta}
                      >
                        <OfficePromptCard prompt={item.prompt} />
                      </LiveFeedCard>
                    );
                  }
                  return (
                    <LiveFeedCard
                      key={item.id}
                      itemId={item.id}
                      sample={isSampleContent(item.event || item)}
                      badge={badge.label}
                      badgeClassName={badge.className}
                      title={item.title}
                      preview={item.preview}
                    >
                      <p className="pp-text-body text-sm">
                        {item.event.address ?? item.event.location}
                        {item.event.categoryLabel ? ` · ${item.event.categoryLabel}` : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => openEventDetail?.(item.event.id)}
                        className="py-2 px-4 text-sm font-semibold text-white rounded-xl pp-btn-primary"
                      >
                        Detail akce
                      </button>
                    </LiveFeedCard>
                  );
                })}
              </div>
            )}
            {latestItems.length > 0 ? (
              <SparsePageDoodle Scene={DoodleAgendaScene} count={latestItems.length} />
            ) : null}
          </>
        )}

        {activeSection === "prompts" && (
          <>
            <div className="flex items-center justify-between gap-2 px-0.5">
              <p className="text-xs font-semibold text-stone-800">Hlášení</p>
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className="text-[10px] font-semibold text-[#3D7A68]"
              >
                Mapa ›
              </button>
            </div>
            {openPrompts.length === 0 ? (
              <DoodleEmptyState illustration="agenda" message="Žádná otevřená hlášení k řešení." />
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
            {filteredEvents.length === 0 ? (
              <DoodleEmptyState
                illustration="agenda"
                message="V tomto filtru zatím žádné akce."
              />
            ) : (
              <div className="space-y-1.5">
                {filteredEvents.map(({ event, kind }) => {
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
            {filteredEvents.length > 0 ? (
              <SparsePageDoodle Scene={DoodleAgendaScene} count={filteredEvents.length} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
