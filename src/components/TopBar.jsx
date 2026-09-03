import { useApp } from "../context/AppContext.jsx";
import LocationSwitcher from "./LocationSwitcher.jsx";
import CrisisAlertBar from "./CrisisAlertBar.jsx";
import { DoodleHomeIntro } from "./doodle/doodleIllustrations.jsx";
import { DoodleMessageIcon } from "./doodle/doodleIcons.jsx";
/** Přímo import — nové logo F (dům + plot + ruce), Vite cache-bust */
import logoPodplot from "../assets/logo-podplot.png";

export default function TopBar() {
  const {
    user,
    openProfileActivity,
    openMessages,
    unreadMessagesCount,
    unreadProfileBadgeCount,
    unreadTrustVerifiersCount,
    unreadGroupProposalSupportersCount,
    globalSearchQuery,
    setGlobalSearchQuery,
    goToHomeWall,
    activeTab,
  } = useApp();

  if (!user) return null;

  const profileBadgeLabel = (() => {
    const parts = [];
    if (unreadTrustVerifiersCount > 0) {
      parts.push(`${unreadTrustVerifiersCount} nová potvrzení sousedství`);
    }
    if (unreadGroupProposalSupportersCount > 0) {
      parts.push(`${unreadGroupProposalSupportersCount} nové podpory návrhů`);
    }
    return parts.length ? `Můj profil · ${parts.join(", ")}` : "Můj profil";
  })();

  return (
    <header className="pp-header shrink-0 sticky top-0 z-40">
      <div className="pp-header-brand-bar">
        <button
          type="button"
          onClick={goToHomeWall}
          className="pp-brand-home"
          aria-label="Domů — Podplot"
        >
          <img
            src={logoPodplot}
            alt="Podplot"
            className="pp-brand-logo"
            width={58}
            height={58}
            decoding="async"
          />
          <span className="pp-brand-name">Podplot</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openProfileActivity}
            className="pp-header-avatar-btn relative"
            aria-label={profileBadgeLabel}
          >
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="" className="pp-header-avatar-img" />
            ) : (
              <span className="pp-header-avatar">{user.initials}</span>
            )}
            {unreadProfileBadgeCount > 0 && (
              <span className="pp-header-notify-dot">
                {unreadProfileBadgeCount > 9 ? "9+" : unreadProfileBadgeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={openMessages}
            className="pp-header-icon-btn relative"
            aria-label="Zprávy"
          >
            <DoodleMessageIcon className="w-6 h-6" />
            {unreadMessagesCount > 0 && (
              <span className="pp-header-notify-dot">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="pp-header-sub">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Hledat v okolí — hřiště, jahody, výpadek…"
            className="pp-search-bar flex-1 min-w-0"
            aria-label="Vyhledávání"
          />
          {activeTab === "home" && (
            <DoodleHomeIntro className="shrink-0 w-24 h-10" aria-hidden />
          )}
        </div>
        <LocationSwitcher />
        {activeTab === "home" && <CrisisAlertBar />}
      </div>
    </header>
  );
}
