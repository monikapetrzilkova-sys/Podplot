import { useApp } from "./context/AppContext.jsx";
import { useRef, useCallback, useState, useEffect } from "react";

import TopBar from "./components/TopBar.jsx";
import TabBar from "./components/TabBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import MapPage from "./components/MapPage.jsx";
import NeighborsPage from "./components/NeighborsPage.jsx";
import CatalogPage from "./components/CatalogPage.jsx";
import MyProfile from "./components/MyProfile.jsx";
import MessagesPage from "./components/MessagesPage.jsx";
import CalendarPage from "./components/CalendarPage.jsx";
import CraftsmanReviewsPage from "./components/CraftsmanReviewsPage.jsx";
import InstitutionCrisisPage from "./components/InstitutionCrisisPage.jsx";
import InstitutionOfficePage from "./components/InstitutionOfficePage.jsx";
import CreateListingModal from "./components/CreateListingModal.jsx";
import CreateInvoiceModal from "./components/CreateInvoiceModal.jsx";
import CreateEventModal from "./components/CreateEventModal.jsx";
import CreateHelpModal from "./components/CreateHelpModal.jsx";
import CreateGroupModal from "./components/CreateGroupModal.jsx";
import PlusActionMenu from "./components/PlusActionMenu.jsx";
import RegisterScreen from "./components/RegisterScreen.jsx";
import ChatModal from "./components/ChatModal.jsx";
import EventDetailModal from "./components/EventDetailModal.jsx";
import PaymentModal from "./components/PaymentModal.jsx";
import CraftsmanPublicProfileModal from "./components/CraftsmanPublicProfileModal.jsx";
import SosOverlay from "./components/SosOverlay.jsx";
import ProfileHintModal from "./components/ProfileHintModal.jsx";
import PlaceSuggestionModal from "./components/entity/PlaceSuggestionModal.jsx";
import HomeEventGalleryOverlay from "./components/HomeEventGalleryOverlay.jsx";
import LocationAccessPrompt from "./components/LocationAccessPrompt.jsx";
import ReportSubmitSuccessSheet from "./components/ReportSubmitSuccessSheet.jsx";

import BusinessAdsPage from "./components/BusinessAdsPage.jsx";
import GlobalSearchResults from "./components/GlobalSearchResults.jsx";
import SectionBackButton from "./components/SectionBackButton.jsx";

import { LOCATION_DOODLE_ICONS, PROFILE_DOODLE_ICONS } from "./components/doodle/doodleIcons.jsx";
import { APP_ROLES } from "./data/userRoles.js";
import usePullToRefresh, { PullToRefreshIndicator } from "./hooks/usePullToRefresh.jsx";

function Toast() {
  const { toast, runToastAction } = useApp();
  if (!toast) return null;

  const bg = {
    success: { background: "#3D7A68" },
    error: { background: "#57534e" },
    info: { background: "#3D7A68" },
  };

  const LocIcon = toast.locationId
    ? LOCATION_DOODLE_ICONS[toast.locationId] ?? LOCATION_DOODLE_ICONS.domov
    : null;

  const hasAction = Boolean(toast.actionLabel && runToastAction);

  return (
    <div
      className={`fixed bottom-24 left-4 right-4 max-w-md mx-auto z-[100] px-4 py-3.5 rounded-2xl text-sm font-medium shadow-lg text-white flex items-center gap-2.5 ${
        hasAction ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={bg[toast.type] ?? bg.info}
      role="status"
      aria-live="polite"
    >
      {LocIcon && (
        <span className="shrink-0 w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
          <LocIcon className="w-4 h-4" />
        </span>
      )}
      <span className="min-w-0 leading-snug flex-1">{toast.message}</span>
      {hasAction ? (
        <button
          type="button"
          onClick={() => runToastAction()}
          className="shrink-0 text-xs font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30"
        >
          {toast.actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function MainScroll({ children, fill = false }) {
  const scrollRef = useRef(null);
  const { softRefreshApp } = useApp();
  const { pull, refreshing, threshold } = usePullToRefresh(scrollRef, {
    enabled: !fill,
    onRefresh: softRefreshApp,
  });

  return (
    <main
      ref={scrollRef}
      id="app-main-scroll"
      className={`min-h-0 min-w-0 scrollbar-thin ${
        fill
          ? "flex-1 flex flex-col overflow-hidden"
          : "flex-1 overflow-y-auto overscroll-y-contain"
      }`}
      style={{ scrollbarWidth: "thin", ...(fill ? { flex: "1 1 0%" } : null) }}
    >
      {!fill && (
        <PullToRefreshIndicator pull={pull} refreshing={refreshing} threshold={threshold} />
      )}
      {children}
    </main>
  );
}

function Screen() {
  const { activeTab, appUserRole, viewAsNeighbor, isB2BWorkMode, globalSearchQuery } = useApp();
  const isOfficeMode = appUserRole === APP_ROLES.OFFICE && !viewAsNeighbor;
  const searching = Boolean(globalSearchQuery?.trim());

  const fillViewport =
    !searching &&
    (activeTab === "map" ||
      activeTab === "reports" ||
      (isOfficeMode && (activeTab === "home" || activeTab === "map")));

  if (searching) {
    return (
      <MainScroll>
        <GlobalSearchResults />
      </MainScroll>
    );
  }

  return (
    <MainScroll fill={fillViewport}>
      {isOfficeMode ? (
        <>
          {activeTab === "reports" && <MapPage lockedSection="reports" officeOverview />}
          {activeTab === "crisis" && <InstitutionCrisisPage />}
          {activeTab === "catalog" && <CatalogPage />}
          {activeTab === "office" && <InstitutionOfficePage />}
          {(activeTab === "home" || activeTab === "map" || activeTab === "neighbors" || activeTab === "messages") && (
            <MapPage lockedSection="reports" officeOverview />
          )}
        </>
      ) : (
        <>
          {activeTab === "home" && <Dashboard />}
          {activeTab === "map" && (isB2BWorkMode ? <Dashboard /> : <MapPage />)}
          {activeTab === "reviews" && isB2BWorkMode && <CraftsmanReviewsPage />}
          {activeTab === "ads" && isB2BWorkMode && <BusinessAdsPage />}
          {activeTab === "neighbors" && <NeighborsPage />}
          {activeTab === "catalog" && <CatalogPage />}
          {activeTab === "calendar" && (
            <div className="pp-page min-h-full">
              <CalendarPage />
            </div>
          )}
        </>
      )}
    </MainScroll>
  );
}

function AppPanelOverlay({ open, title, onClose, headerTrailing = null, children }) {
  if (!open) return null;

  return (
    <div className="pp-profile-overlay" role="dialog" aria-label={title}>
      <div className="pp-profile-overlay-header">
        <SectionBackButton onClick={onClose} ariaLabel="Zpět" />
        <span className="text-sm font-bold text-stone-900 min-w-0 truncate flex-1">{title}</span>
        {headerTrailing}
      </div>
      <div className="pp-profile-overlay-body">{children}</div>
    </div>
  );
}

function ProfileOverlay() {
  const { profileOpen, closeProfile } = useApp();
  const legalBackRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const registerLegalBack = useCallback((fn) => {
    legalBackRef.current = fn;
  }, []);

  useEffect(() => {
    if (!profileOpen) setSettingsOpen(false);
  }, [profileOpen]);

  const handleBack = () => {
    if (legalBackRef.current?.()) return;
    if (settingsOpen) {
      setSettingsOpen(false);
      return;
    }
    closeProfile();
  };

  return (
    <AppPanelOverlay
      open={profileOpen}
      title={settingsOpen ? "Nastavení" : "Profil"}
      onClose={handleBack}
      headerTrailing={
        settingsOpen ? null : (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Nastavení profilu"
            title="Nastavení"
            className="pp-profile-settings-btn shrink-0"
          >
            <PROFILE_DOODLE_ICONS.settings className="w-[1.15rem] h-[1.15rem]" />
            <span>Nastavení</span>
          </button>
        )
      }
    >
      <MyProfile registerLegalBack={registerLegalBack} settingsOpen={settingsOpen} />
    </AppPanelOverlay>
  );
}

function MessagesOverlay() {
  const { messagesOpen, closeMessages, chatModal, closeChat } = useApp();

  const handleBack = () => {
    // Nejdřív zavřít otevřenou konverzaci, pak seznam zpráv
    if (chatModal) {
      closeChat();
      return;
    }
    closeMessages();
  };

  return (
    <AppPanelOverlay open={messagesOpen} title="Zprávy" onClose={handleBack}>
      <MessagesPage embedded />
    </AppPanelOverlay>
  );
}

function GlobalModals() {
  const {
    chatModal,
    closeChat,
    selectedEventId,
    pendingPayment,
    setPendingPayment,
    confirmPendingPayment,
    credits,
    profileHint,
    dismissProfileHint,
    goToProfileFromHint,
    createGroupModalOpen,
    closeCreateGroupModal,
  } = useApp();

  return (
    <>
      {chatModal && (
        <ChatModal
          open
          onClose={closeChat}
          participantName={chatModal.participantName}
          participantId={chatModal.participantId}
          activeTopic={chatModal.activeTopic}
        />
      )}
      <CraftsmanPublicProfileModal />
      {selectedEventId && <EventDetailModal />}
      <HomeEventGalleryOverlay />
      <LocationAccessPrompt />
      <CreateGroupModal
        open={createGroupModalOpen}
        onClose={closeCreateGroupModal}
      />
      <PaymentModal
        open={!!pendingPayment}
        onClose={() => setPendingPayment(null)}
        title={pendingPayment?.title ?? "Platba"}
        amount={pendingPayment?.amount ?? 0}
        walletBalance={credits}
        onConfirm={confirmPendingPayment}
      />
      <SosOverlay />
      <ReportSubmitSuccessSheet />
      <ProfileHintModal
        open={!!profileHint}
        variant={profileHint?.variant}
        onClose={dismissProfileHint}
        onGoToProfile={goToProfileFromHint}
      />
    </>
  );
}

export default function AppShell() {
  const { user, passwordRecovery, openReportOnMapFromHome } = useApp();
  /** Telefonní rámeček jen na desktopu s myší — telefony/touch vždy full-bleed */
  const [desktopFrame, setDesktopFrame] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const sync = () => setDesktopFrame(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    try {
      const params = new URLSearchParams(window.location.search);
      const reportId = params.get("report");
      if (!reportId) return undefined;
      openReportOnMapFromHome?.(reportId);
      params.delete("report");
      const next = params.toString();
      const url = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash || ""}`;
      window.history.replaceState({}, "", url);
    } catch {
      /* ignore */
    }
    return undefined;
  }, [user, openReportOnMapFromHome]);

  if (!user || passwordRecovery) {
    return (
      <div className="min-h-dvh overflow-y-auto w-full">
        <RegisterScreen />
        <Toast />
      </div>
    );
  }

  return (
    <>
      <div
        className={`pp-app-shell-outer${desktopFrame ? " pp-app-shell-outer--desktop" : ""}`}
      >
        <div
          id="app-panel-root"
          className={`pp-app-shell pp-page relative overflow-hidden flex flex-col min-h-0${
            desktopFrame ? " pp-app-shell--desktop" : ""
          }`}
        >
          <TopBar />
          <Screen />
          <TabBar />
          <CreateListingModal />
          <CreateInvoiceModal />
          <CreateEventModal />
          <CreateHelpModal />
          <PlaceSuggestionModal />
          <PlusActionMenu />
          <div id="app-modal-root" className="pp-app-modal-root" />
          <ProfileOverlay />
          <MessagesOverlay />
          <GlobalModals />
        </div>
      </div>
      <Toast />
    </>
  );
}
