import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { TEST_PERSONAS } from "../data/businessProfiles.js";
import { getDefaultDemoInstitution } from "../data/institutions/index.js";
import { isActiveOfficePrompt } from "../data/municipalityPrompts.js";
import ViewAsNeighborToggle from "./ViewAsNeighborToggle.jsx";
import SmartSectionBar from "./SmartSectionBar.jsx";
import LiveFeedCard from "./LiveFeedCard.jsx";
import OfficePromptCard from "./OfficePromptCard.jsx";
import PrimaryAddButton from "./PrimaryAddButton.jsx";
import AccountTypeIcon from "./AccountTypeIcon.jsx";
import InstitutionPresenceBar from "./InstitutionPresenceBar.jsx";
import { useInstitutionPresence } from "../hooks/useInstitutionPresence.js";
import { AGENDA_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import { isOfficeOrganizedEvent } from "../utils/categoryAccents.js";
import SectionBackButton from "./SectionBackButton.jsx";

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
    showToast,
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
  const officeLabel = user?.name || persona.businessName || demoInst?.name || "Úřad";

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hours, setHours] = useState("Po–Pá 8:00–17:00 · St do 18:00");
  const [hoursNote, setHoursNote] = useState("");
  const [phone, setPhone] = useState("+420 241 940 510");
  const [email, setEmail] = useState(
    demoInst?.allowedEmailDomain ? `podatelna@${demoInst.allowedEmailDomain}` : ""
  );
  const [address, setAddress] = useState(demoInst?.seatAddress || persona.seatAddress || "");
  const [activeSection, setActiveSection] = useState(null);
  const [eventFilter, setEventFilter] = useState("all");

  const editingRecordKey = settingsOpen ? "office-settings" : activeSection ?? "agenda-home";
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

  const saveSettings = () => {
    showToast("Nastavení profilu úřadu uloženo", "success");
    setSettingsOpen(false);
  };

  const handleSelectMain = (id) => {
    setActiveSection(id);
    if (id === "events") setEventFilter("all");
  };

  if (settingsOpen) {
    return (
      <div className="pp-page pp-page--doodle flex flex-col min-h-full px-4 pt-4 pb-8 gap-4 bg-abstract-organic has-deco">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-stone-900">Nastavení profilu</h1>
            <p className="text-xs text-stone-500 mt-0.5">Oficiální údaje a úřední hodiny</p>
          </div>
          <SectionBackButton onClick={() => setSettingsOpen(false)} />
        </div>

        <InstitutionPresenceBar peers={peers} conflictPeers={conflictPeers} />

        <section className="pp-feed-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-stone-800">Oficiální údaje</h2>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">Adresa</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">Telefon</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">E-mail</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            />
          </label>
        </section>

        <section className="pp-feed-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-stone-800">Úřední hodiny</h2>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">Běžná provozní doba</span>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold text-stone-500">Mimořádná úprava</span>
            <textarea
              value={hoursNote}
              onChange={(e) => setHoursNote(e.target.value)}
              rows={2}
              placeholder="Např. 24. 12. zavřeno"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none bg-white"
            />
          </label>
        </section>

        <button
          type="button"
          onClick={saveSettings}
          className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
        >
          Uložit nastavení
        </button>

        <ViewAsNeighborToggle className="mt-2" />
      </div>
    );
  }

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco">
      <div className="px-3 pt-2 pb-1.5 shrink-0">
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

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-8 pt-1 space-y-3">
        {!activeSection && (
          <>
            <div className="flex items-center gap-2.5 px-0.5">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#E8F3EF] border border-[#C5DDD4] text-[#3D7A68]"
                aria-hidden
              >
                <AccountTypeIcon roleId="urad" accountType="urad" className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{officeLabel}</p>
                <p className="text-[11px] text-stone-500">Nejnovější z Agendy</p>
              </div>
            </div>

            <InstitutionPresenceBar peers={peers} conflictPeers={conflictPeers} />

            {latestItems.length === 0 ? (
              <p className="pp-feed-card px-4 py-3 text-xs text-stone-500">
                Zatím žádné položky v Agendě.
              </p>
            ) : (
              <div className="space-y-1.5">
                {latestItems.map((item) => {
                  const badge = agendaBadge(item.kind);
                  if (item.prompt) {
                    return (
                      <LiveFeedCard
                        key={item.id}
                        itemId={item.id}
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
          </>
        )}

        {activeSection === "prompts" && (
          <>
            <div className="flex items-center justify-between gap-2 px-0.5">
              <p className="text-xs text-stone-500">Podněty občanů k řešení</p>
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className="text-[10px] font-semibold text-[#3D7A68]"
              >
                Mapa ›
              </button>
            </div>
            {openPrompts.length === 0 ? (
              <p className="pp-feed-card px-4 py-3 text-xs text-stone-500">Žádná otevřená hlášení.</p>
            ) : (
              <div className="space-y-1.5">
                {openPrompts.map((p) => {
                  const badge = agendaBadge("prompt");
                  return (
                    <LiveFeedCard
                      key={p.id}
                      itemId={`prompt-list-${p.id}`}
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
          </>
        )}

        {activeSection === "events" && (
          <>
            <PrimaryAddButton label="Nová akce" onClick={() => openCreateEvent?.()} />
            <p className="text-xs text-stone-500 px-0.5">
              {eventFilter === "office"
                ? "Akce pořádané úřadem"
                : eventFilter === "neighbors"
                  ? "Akce od sousedů v obci"
                  : "Všechny nadcházející akce"}
            </p>
            {filteredEvents.length === 0 ? (
              <p className="pp-feed-card px-4 py-3 text-xs text-stone-500">
                V tomto filtru zatím žádné akce.
              </p>
            ) : (
              <div className="space-y-1.5">
                {filteredEvents.map(({ event, kind }) => {
                  const badge = agendaBadge(kind);
                  return (
                    <LiveFeedCard
                      key={event.id}
                      itemId={`event-list-${event.id}`}
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
          </>
        )}

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="w-full py-2.5 rounded-xl text-xs font-semibold border border-[#C5DDD4] bg-white text-[#1B4D3E] hover:bg-[#F1F6F5]"
        >
          Nastavení profilu
        </button>
      </div>
    </div>
  );
}
