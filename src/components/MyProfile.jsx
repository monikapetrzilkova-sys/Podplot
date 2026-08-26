import { useState, useEffect } from "react";
import PersonLabel from "./PersonLabel.jsx";
import { useApp } from "../context/AppContext.jsx";
import { isSameAppUser, isCurrentUserRef, isSelfNeighborCandidate, LISTING_SALE_STATUS } from "../data/listingSales.js";
import { formatListingQuantity, listingUsesVariablePrice } from "../data/listingPriceUnits.js";
import { getAccountType, ADDRESS_PRIVACY_NOTE, getPodnikatelSubtypeLabel, isBusinessAccount, getRegistrationFields, resolveBusinessSubtype } from "../data/accountTypes.js";
import { isInjectedDemoPersona } from "../data/businessProfiles.js";
import { getVerifiedLabel } from "../data/domainVerification.js";
import { Avatar } from "./RoleBadge.jsx";
import VerifiedBadge from "./VerifiedBadge.jsx";
import AccountTypeIcon from "./AccountTypeIcon.jsx";
import { INTEREST_OPTIONS } from "../data/ecosystemMock.js";
import PromoteSection from "./PromoteSection.jsx";
import ViewAsNeighborToggle from "./ViewAsNeighborToggle.jsx";
import PaymentModal from "./PaymentModal.jsx";
import { ENABLE_DEV_ROLE_SWITCH } from "../data/devConfig.js";
import { PUBLIC_AREA_LABEL_HINT } from "../data/personDisplay.js";
import { getPromptStatusStyle } from "../data/municipalityPrompts.js";
import { MIN_PASSWORD_LENGTH } from "../data/authApi.js";
import { isThingsModuleListing, isCommunityAnnouncementPost } from "../utils/thingsModule.js";
import { MODULE_IDS } from "../data/moduleConfig.js";
import ReportDetailModal from "./ReportDetailModal.jsx";
import { getReportLifecycleBadge, isReportVisibleInOwnerProfile, normalizeReportValidity } from "../data/reportExpiry.js";
import { formatContentAge } from "../data/czechDateTime.js";
import FeedCard from "./FeedCard.jsx";
import GroupProposalCard from "./GroupProposalCard.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import MyProfilesPanel, {
  ProfileTypeTestSwitcher,
  SousedRoleView,
  CraftsmanRoleView,
  BusinessRoleView,
  MunicipalityRoleView,
} from "./RoleProfileScreens.jsx";
import ProfilePhotoEditor from "./ProfilePhotoEditor.jsx";
import LegalPages, { LegalLinksSection } from "./LegalPages.jsx";
import HomeAddressForm from "./profile/HomeAddressForm.jsx";
import {
  LOCATION_DOODLE_ICONS,
  INTEREST_DOODLE_ICONS,
  PROFILE_DOODLE_ICONS,
} from "./doodle/doodleIcons.jsx";
import { formatHelpOfferRemaining } from "../utils/helpOfferExpiry.js";
import { MessageButton } from "./MessagesPage.jsx";
import LendingAvailabilityPanel from "./LendingAvailabilityPanel.jsx";
import {
  CRAFTSMAN_RADIUS_MIN_KM,
  CRAFTSMAN_RADIUS_MAX_KM,
  CRAFTSMAN_RADIUS_NATIONWIDE_KM,
  formatCraftsmanRadiusLabel,
  isNationwideRadius,
} from "../data/craftsmanSettings.js";

function ProfileSectionTitle({ icon: Icon, children, className = "mb-3" }) {
  return (
    <h3 className={`text-sm font-bold text-stone-800 ${className} flex items-center gap-2`}>
      {Icon ? (
        <span className="shrink-0 text-[#3D7A68]" aria-hidden>
          <Icon className="w-4 h-4" />
        </span>
      ) : null}
      <span>{children}</span>
    </h3>
  );
}

function locationChipLabel(loc) {
  if (!loc) return "Místo";
  if (loc.id === "domov") return "Domov";
  if (loc.id === "prace") return "Práce";
  if (loc.id === "chata") return "Chata";
  const label = String(loc.label || "").trim();
  return label || "Místo";
}

function locationIconFor(loc) {
  if (loc?.id && LOCATION_DOODLE_ICONS[loc.id]) return LOCATION_DOODLE_ICONS[loc.id];
  const blob = `${loc?.label || ""} ${loc?.id || ""}`.toLowerCase();
  if (/chat|chalup|zahrad|chata/.test(blob)) return LOCATION_DOODLE_ICONS.chata;
  if (/prác|prac|office|kancelář|kancelar/.test(blob)) return LOCATION_DOODLE_ICONS.prace;
  return LOCATION_DOODLE_ICONS.domov;
}

/** Sekce profilu — ve výchozím stavu sbalená, rozbalí se po klepnutí. */
function ProfileCollapsible({
  id,
  title,
  icon,
  summary = null,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className="pp-card p-4 mb-4 scroll-mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 text-left"
      >
        <ProfileSectionTitle icon={icon} className="mb-0 flex-1 min-w-0">
          {title}
        </ProfileSectionTitle>
        <span className="text-[11px] font-semibold text-[#3D7A68] shrink-0">
          {open ? "Sbalit ▲" : "Rozbalit ▼"}
        </span>
      </button>
      {!open && summary ? (
        <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">{summary}</p>
      ) : null}
      {open ? <div className="mt-3 space-y-2">{children}</div> : null}
    </section>
  );
}

/** Sbalený seznam sousedů čekajících na potvrzení (bez už potvrzených). */
function TrustPendingAccordion({ pending, confirmNeighbor, dismissTrustNeighbor, getPersonPhoto }) {
  const [expanded, setExpanded] = useState(false);
  const countLabel =
    pending.length === 1 ? "1 nový soused" : `${pending.length} noví sousedé`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-left hover:bg-emerald-100/70 transition-colors"
      >
        <span className="relative shrink-0 w-8 h-8 rounded-lg bg-white text-[#3D7A68] flex items-center justify-center border border-emerald-100">
          <span className="text-xs font-bold tabular-nums">{pending.length}</span>
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-stone-900">{countLabel} k potvrzení</span>
          <span className="block text-[11px] text-stone-500 mt-0.5">
            Rozbalte a potvrďte sousedství, pokud se znáte.
          </span>
        </span>
        <span className="text-[11px] font-semibold text-[#3D7A68] shrink-0">
          {expanded ? "Sbalit ▲" : "Rozbalit ▼"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 mt-3">
          {pending.map((n) => {
            const photo = getPersonPhoto?.(n.id) || n.profilePhoto || null;
            return (
              <div
                key={n.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    initials={n.initials}
                    name={n.name}
                    roleId="soused"
                    size="sm"
                    photo={photo}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      <PersonLabel personId={n.id} name={n.name} />
                    </p>
                    <p className="text-xs text-stone-500">
                      {(n.confirmations ?? 0) > 0 ? `${n.confirmations} potvrzení · ` : ""}
                      {n.location || "ve vaší lokalitě"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => confirmNeighbor(n.id)}
                    className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200"
                  >
                    Potvrdit
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissTrustNeighbor(n.id)}
                    className="text-[10px] font-semibold text-stone-500 bg-white px-2 py-1 rounded-lg border border-stone-200"
                  >
                    Neznám ho
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PasswordChangeFields() {
  const { changePassword } = useApp();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    setBusy(true);
    try {
      const result = await changePassword(password, passwordConfirm);
      if (result?.ok) {
        setPassword("");
        setPasswordConfirm("");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-500">Změna hesla (min. {MIN_PASSWORD_LENGTH} znaků)</p>
      <input
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nové heslo"
        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
      />
      <input
        type="password"
        autoComplete="new-password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        placeholder="Potvrzení hesla"
        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
      />
      <button
        type="button"
        disabled={busy}
        onClick={onSave}
        className="w-full py-2.5 border border-stone-300 rounded-xl text-sm font-semibold disabled:opacity-60"
      >
        {busy ? "Ukládám…" : "Změnit heslo"}
      </button>
    </div>
  );
}

export default function MyProfile({ registerLegalBack, settingsOpen = false } = {}) {
  const {
    user,
    credits,
    addCredits,
    testRoleId,
    userLendingItems,
    reservations,
    listingSaleOrders,
    confirmListingHandover,
    confirmListingSaleAdjustment,
    rejectListingSaleAdjustment,
    userReports,
    extraReports,
    myMunicipalityPrompts,
    userPosts,
    userGroupPosts,
    reportSecurityReport,
    closeProfile,
    openMessages,
    selectMainTab,
    setPendingNeighborsSection,
    setPendingThingsItemId,
    selectModuleItem,
    userInterests,
    toggleInterest,
    locations,
    setActiveLocation,
    activeLocationId,
    isAdminMode,
    setIsAdminMode,
    adminReports,
    blockUser,
    neighbors,
    confirmNeighbor,
    confirmationsGiven,
    trustDismissedIds,
    dismissTrustNeighbor,
    trustVerifiers,
    unreadTrustVerifiersCount,
    markTrustVerifiersSeen,
    groupProposalSupporters,
    unreadGroupProposalSupportersCount,
    unreadProfileBadgeCount,
    markGroupProposalSupportersSeen,
    triggerSos,
    craftsmanRadius,
    setCraftsmanRadius,
    formatPersonName,
    getPersonPhoto,
    logout,
    profileScrollTarget,
    clearProfileScrollTarget,
    updateProfilePhoto,
    removeProfilePhoto,
    updatePublicDisambiguation,
    confirmLendingReturn,
    notificationPrefs,
    toggleLunchMenuAlerts,
    toggleMessageAlerts,
    trustHomePromptHidden,
    hideTrustHomePrompt,
    showTrustHomePrompt,
    updateHomeAddress,
    updateUserLocation,
    addUserLocation,
    removeUserLocation,
    myHelpOffers,
    lendingAvailability,
    viewAsNeighbor,
    groupProposals,
    setCreateGroupModalOpen,
    openEditGroupProposal,
    openCreateGroupModal,
    citizenProfile,
  } = useApp();

  const isOfficeProfile = testRoleId === "urad";
  const showNeighborProfile = testRoleId === "soused" || viewAsNeighbor;
  const showWorkRoleViews = !viewAsNeighbor;
  /** Stejná horní karta (avatar, peněženka, místa, profily) i u mobilní služby / provozovny */
  const showIdentityHeader =
    testRoleId === "soused" ||
    testRoleId === "remeslnik" ||
    testRoleId === "podnik" ||
    viewAsNeighbor;
  const isWorkProfileMode =
    showWorkRoleViews && (testRoleId === "remeslnik" || testRoleId === "podnik");

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [legalPage, setLegalPage] = useState(null);
  const [editingHomeAddress, setEditingHomeAddress] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [addingLocation, setAddingLocation] = useState(false);
  const [trustInfoOpen, setTrustInfoOpen] = useState(false);
  const [allowPublicAreaLabel, setAllowPublicAreaLabel] = useState(Boolean(user?.allowPublicAreaLabel));
  const [publicAreaLabel, setPublicAreaLabel] = useState(user?.publicAreaLabel ?? "");
  const [detailReport, setDetailReport] = useState(null);
  const [detailListing, setDetailListing] = useState(null);
  const [detailPrompt, setDetailPrompt] = useState(null);
  const [detailLending, setDetailLending] = useState(null);

  useEffect(() => {
    if (!registerLegalBack) return undefined;
    registerLegalBack(() => {
      if (detailReport) {
        setDetailReport(null);
        return true;
      }
      if (detailListing) {
        setDetailListing(null);
        return true;
      }
      if (detailPrompt) {
        setDetailPrompt(null);
        return true;
      }
      if (detailLending) {
        setDetailLending(null);
        return true;
      }
      if (!legalPage) return false;
      setLegalPage(null);
      return true;
    });
    return () => registerLegalBack(null);
  }, [legalPage, registerLegalBack, detailReport, detailListing, detailPrompt, detailLending]);

  useEffect(() => {
    if (!user) return;
    setAllowPublicAreaLabel(Boolean(user.allowPublicAreaLabel));
    setPublicAreaLabel(user.publicAreaLabel ?? "");
  }, [user?.allowPublicAreaLabel, user?.publicAreaLabel, user]);

  useEffect(() => {
    if (
      profileScrollTarget !== "my-lending-offers" &&
      profileScrollTarget !== "trust-network" &&
      profileScrollTarget !== "trust-received" &&
      profileScrollTarget !== "group-supports"
    ) {
      return;
    }
    const targetId =
      profileScrollTarget === "trust-network"
        ? "profile-trust-network"
        : profileScrollTarget === "trust-received"
          ? "profile-trust-received"
          : profileScrollTarget === "group-supports"
            ? "profile-my-group-proposals"
            : "profile-my-lending-offers";
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (profileScrollTarget === "trust-received") {
          setTrustInfoOpen(true);
          markTrustVerifiersSeen?.();
          document
            .getElementById("profile-identity")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          clearProfileScrollTarget();
          return;
        }
        const section = document.getElementById(targetId);
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (profileScrollTarget === "group-supports") {
          markGroupProposalSupportersSeen?.();
        }
        clearProfileScrollTarget();
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [
    profileScrollTarget,
    clearProfileScrollTarget,
    markTrustVerifiersSeen,
    markGroupProposalSupportersSeen,
  ]);

  if (!user) return null;

  if (legalPage) {
    return <LegalPages page={legalPage} />;
  }

  if (settingsOpen) {
    return (
      <div className="px-4 py-4 pb-8">
        <ProfileCollapsible
          title="Moje zájmy"
          icon={PROFILE_DOODLE_ICONS.interests}
          summary={`${Object.values(userInterests || {}).filter(Boolean).length} vybraných · pro lepší tipy v okolí`}
          defaultOpen
        >
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((i) => {
              const InterestIcon = INTEREST_DOODLE_ICONS[i.id];
              const active = !!userInterests[i.id];
              return (
                <label
                  key={i.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                    active ? "border-emerald-600 bg-emerald-50" : "border-stone-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleInterest(i.id)}
                    className="rounded"
                  />
                  {InterestIcon ? (
                    <span className={`shrink-0 ${active ? "text-[#1B4332]" : "text-[#3D7A68]"}`} aria-hidden>
                      <InterestIcon className="w-4 h-4" />
                    </span>
                  ) : null}
                  <span>{i.label}</span>
                </label>
              );
            })}
          </div>
        </ProfileCollapsible>

        <ProfileCollapsible
          title="Upozornění"
          icon={PROFILE_DOODLE_ICONS.alerts}
          summary={[
            notificationPrefs?.messageAlerts !== false ? "Zprávy zapnuté" : "Zprávy vypnuté",
            notificationPrefs?.lunchMenuAlerts || user.notificationPrefs?.lunchMenuAlerts
              ? "Menu zapnuté"
              : "Menu vypnuté",
          ].join(" · ")}
          defaultOpen
        >
          <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(notificationPrefs?.messageAlerts !== false)}
              onChange={(e) => toggleMessageAlerts(e.target.checked)}
              className="mt-0.5 rounded accent-emerald-600"
            />
            <span className="text-xs text-stone-600 leading-relaxed">
              <strong className="text-stone-800">Nové zprávy</strong>
              <span className="block mt-0.5 text-stone-500">
                Systémové upozornění v telefonu, když vám někdo napíše.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(notificationPrefs?.lunchMenuAlerts ?? user.notificationPrefs?.lunchMenuAlerts)}
              onChange={(e) => toggleLunchMenuAlerts(e.target.checked)}
              className="mt-0.5 rounded accent-emerald-600"
            />
            <span className="text-xs text-stone-600 leading-relaxed">
              <strong className="text-stone-800">Polední menu v okolí</strong>
              <span className="block mt-0.5 text-stone-500">
                Push, když místní gastro zveřejní denní menu.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer">
            <input
              type="checkbox"
              checked={!trustHomePromptHidden}
              onChange={(e) =>
                e.target.checked ? showTrustHomePrompt?.() : hideTrustHomePrompt?.()
              }
              className="mt-0.5 rounded accent-emerald-600"
            />
            <span className="text-xs text-stone-600 leading-relaxed">
              <strong className="text-stone-800">Noví sousedé na Domů</strong>
              <span className="block mt-0.5 text-stone-500">
                Karty k potvrzení nahoře na Domů. Jinak jen v Síti důvěry.
              </span>
            </span>
          </label>
        </ProfileCollapsible>

        <ProfileCollapsible
          title="Rozlišení u stejného jména"
          icon={PROFILE_DOODLE_ICONS.nameTag}
          summary={
            allowPublicAreaLabel && publicAreaLabel.trim()
              ? `Popisek: ${publicAreaLabel.trim()}`
              : "Volitelné · nikdy neukazuje plnou adresu"
          }
        >
          <p className="text-xs text-stone-500 leading-relaxed">
            Pokud v obci žije někdo stejnojmenný, ostatní uvidí u vašeho jména jen obecný popisek (se souhlasem)
            nebo hrubou vzdálenost — nikdy plnou adresu bydliště.
          </p>
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-stone-200 bg-stone-50/50">
            <input
              type="checkbox"
              checked={allowPublicAreaLabel}
              onChange={(e) => {
                const next = e.target.checked;
                setAllowPublicAreaLabel(next);
                if (!next) {
                  setPublicAreaLabel("");
                  updatePublicDisambiguation({ allowPublicAreaLabel: false, publicAreaLabel: "" });
                }
              }}
              className="mt-0.5 rounded accent-emerald-600"
            />
            <span className="text-xs text-stone-600 leading-relaxed">
              Zobrazovat u mého jména obecný popisek oblasti (ulice bez čísla, čtvrť…)
            </span>
          </label>
          {allowPublicAreaLabel && (
            <div className="space-y-2">
              <input
                type="text"
                value={publicAreaLabel}
                onChange={(e) => setPublicAreaLabel(e.target.value)}
                placeholder="např. ulice, čtvrť"
                maxLength={48}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <p className="text-[11px] text-stone-400 leading-relaxed">{PUBLIC_AREA_LABEL_HINT}</p>
              <button
                type="button"
                onClick={() =>
                  updatePublicDisambiguation({ allowPublicAreaLabel: true, publicAreaLabel })
                }
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-100"
              >
                Uložit popisek
              </button>
            </div>
          )}
        </ProfileCollapsible>

        <div className="mt-2 mb-4">
          <LegalLinksSection onOpen={setLegalPage} />
        </div>

        <ProfileCollapsible title="Heslo a odhlášení" summary="Změna hesla · odhlásit se" defaultOpen>
          <PasswordChangeFields />
          <button
            type="button"
            onClick={logout}
            className="w-full py-3 text-sm font-semibold text-stone-600 border border-stone-200 rounded-2xl hover:bg-stone-50"
          >
            Odhlásit se
          </button>
        </ProfileCollapsible>
      </div>
    );
  }

  const acc = getAccountType(user.accountType);
  const displayName =
    (citizenProfile?.name && (testRoleId === "soused" || isInjectedDemoPersona(user))
      ? citizenProfile.name
      : null) || user.name;
  const displayInitials =
    (citizenProfile?.initials && (testRoleId === "soused" || isInjectedDemoPersona(user))
      ? citizenProfile.initials
      : null) || user.initials;
  const podnikatelSubtype = getPodnikatelSubtypeLabel(user);
  const registrationFields = getRegistrationFields(user.accountType, resolveBusinessSubtype(user));
  const myOffers = userLendingItems.filter((i) => i.mine);
  // Jen skutečné inzeráty / půjčovna — hlášení z mapy sem nepatří
  const myListings = [...userPosts, ...userGroupPosts].filter(
    (p) => p.mine && isThingsModuleListing(p)
  );
  const myReportItems = (() => {
    const byId = new Map();
    const remember = (id, item) => {
      if (!id || byId.has(id)) return;
      byId.set(id, item);
    };
    for (const r of userReports) {
      remember(r.id, {
        id: r.id,
        type: r.type,
        body: r.body,
        time: r.time ?? "—",
        report: normalizeReportValidity(r),
      });
    }
    for (const r of extraReports ?? []) {
      if (!r?.mine) continue;
      remember(r.id, {
        id: r.id,
        type: r.type,
        body: r.body,
        time: r.time ?? "—",
        report: normalizeReportValidity(r),
      });
    }
    for (const p of userPosts) {
      if (!p.mine) continue;
      const isReport =
        Boolean(p.fromSecurityReportId) ||
        p.feedSubtype === "hlaseni" ||
        isCommunityAnnouncementPost(p);
      if (!isReport) continue;
      const id = p.fromSecurityReportId || p.id;
      if (byId.has(id) || byId.has(p.id)) continue;
      const report = normalizeReportValidity({
        id,
        type: p.title || p.type || "Hlášení",
        body: p.body || "",
        time: "Právě teď",
        createdAt: p.createdAt,
        distance: p.meta ?? null,
        mapPos: p.mapPos ?? null,
        lat: p.lat ?? null,
        lng: p.lng ?? null,
        photos: p.photos ?? [],
        mine: true,
        author: p.author,
        authorInitials: p.initials,
        accountType: p.accountType,
        reportCategoryId: p.reportCategoryId ?? null,
        urgent: Boolean(p.urgent),
        expiresAt: p.expiresAt ?? null,
        untilResolved: p.untilResolved ?? false,
        status: p.status ?? null,
        validUntil: p.validUntil ?? null,
        resolvedAt: p.resolvedAt ?? null,
      });
      remember(id, {
        id,
        type: report.type,
        body: report.body,
        time: p.meta || "uloženo",
        report,
      });
    }
    return [...byId.values()].filter((item) => isReportVisibleInOwnerProfile(item.report));
  })();

  const openListingOnMap = (post) => {
    if (!post?.id) return;
    closeProfile?.();
    selectMainTab?.("neighbors");
    setPendingNeighborsSection?.("veci");
    setPendingThingsItemId?.(post.id);
    selectModuleItem?.(MODULE_IDS.THINGS, post.id);
  };

  const addressLabel = registrationFields.addressLabel;

  const isCommunityVerified = (user.neighborhoodConfirmations ?? 0) >= 3;

  return (
    <div className="px-4 py-4 pb-8">
      {showNeighborProfile && viewAsNeighbor && testRoleId !== "soused" ? (
        <p className="mb-3 text-[11px] font-semibold text-[#3D7A68] bg-[#E8F3EF] border border-[#C5DDD4] rounded-xl px-3 py-2">
          Prohlížíte sousedský profil — pracovní účet zůstává v pozadí.
        </p>
      ) : null}

      {isWorkProfileMode ? (
        <p className="mb-3 text-[11px] font-semibold text-stone-700 bg-[#F7FAF9] border border-[#C5DDD4] rounded-xl px-3 py-2">
          {testRoleId === "podnik"
            ? "Pracovní profil podniku — provoz, nabídky a nastavení podniku."
            : "Pracovní profil mobilní služby — zakázky, katalog a nastavení služby."}
        </p>
      ) : null}

      {/* Identita nahoře: kompaktní řádek + adresy + peněženka + profily */}
      {showIdentityHeader && (
        <div id="profile-identity" className="pp-card p-3 mb-3 scroll-mt-4">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <button
                type="button"
                className="pp-avatar-ring relative block"
                onClick={() => setPhotoEditorOpen(true)}
                aria-label={user.profilePhoto ? "Změnit profilovou fotku" : "Přidat profilovou fotku"}
              >
                <Avatar
                  initials={displayInitials}
                  roleId={acc.role}
                  size="md"
                  photo={user.profilePhoto}
                />
                {unreadProfileBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm border-2 border-white">
                    {unreadProfileBadgeCount > 9 ? "9+" : unreadProfileBadgeCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrustInfoOpen((v) => !v);
                  markTrustVerifiersSeen?.();
                }}
                title={
                  trustVerifiers.length === 0
                    ? "Zatím bez ověření od sousedů"
                    : `${trustVerifiers.length} ověření od sousedů — klepněte pro detail`
                }
                aria-expanded={trustInfoOpen}
                aria-label={`${trustVerifiers.length} ověření od sousedů`}
                className={`absolute -bottom-1 -right-1 min-w-[1.35rem] h-[1.35rem] px-1 rounded-full text-[10px] font-bold tabular-nums flex items-center justify-center border-2 border-white shadow-sm ${
                  isCommunityVerified
                    ? "bg-[#1B4D3E] text-white"
                    : trustVerifiers.length > 0
                      ? "bg-[#3D7A68] text-white"
                      : "bg-stone-200 text-stone-600"
                }`}
              >
                {trustVerifiers.length}
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <h2 className="text-sm font-bold text-stone-900 truncate">{displayName}</h2>
                {user.isVerified && <VerifiedBadge accountType={user.accountType} compact />}
                {isCommunityVerified ? (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    Ověřený
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">{user.email}</p>
              <p className="text-[11px] text-[#3D7A68] mt-1 leading-snug">
                {user.isVerified || isCommunityVerified
                  ? "Ověřený soused — ostatní vám snáz důvěřují."
                  : "Ověření od 3 sousedů zvyšuje důvěru. Přichází od lidí, kteří vás znají z okolí — nejde o přátelství."}
              </p>
              {!(user.isVerified || isCommunityVerified) ? (
                <button
                  type="button"
                  onClick={() => {
                    closeProfile?.();
                    openMessages?.();
                  }}
                  className="mt-1 text-[10px] font-semibold text-[#3D7A68] hover:underline"
                >
                  Znáte někoho z okolí? Napsat zprávu
                </button>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setPhotoEditorOpen(true)}
                  className="text-[10px] font-semibold text-[#3D7A68]"
                >
                  {user.profilePhoto ? "Fotka" : "+ Fotka"}
                </button>
                {user.profilePhoto ? (
                  <button
                    type="button"
                    onClick={removeProfilePhoto}
                    className="text-[10px] font-semibold text-stone-400"
                  >
                    Smazat
                  </button>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-gradient-to-br from-[#40916C] to-[#1B4332] text-white px-2.5 py-2 min-w-[5.5rem] text-right">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-100/90 flex items-center justify-end gap-1">
                <PROFILE_DOODLE_ICONS.wallet className="w-3 h-3" />
                Peněženka
              </p>
              <p className="text-base font-bold tabular-nums leading-tight mt-0.5">{credits} Kč</p>
              <button
                type="button"
                onClick={() => setTopUpOpen(true)}
                className="mt-1 text-[10px] font-semibold text-white/95 underline-offset-2 hover:underline"
              >
                Dobít
              </button>
            </div>
          </div>

          {trustInfoOpen ? (
            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 text-left">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="text-[11px] font-bold text-stone-800">Kdo mě ověřil</p>
                <button
                  type="button"
                  onClick={() => setTrustInfoOpen(false)}
                  className="text-[10px] font-semibold text-[#3D7A68]"
                >
                  Zavřít
                </button>
              </div>
              {trustVerifiers.length === 0 ? (
                <p className="text-[11px] text-stone-500 leading-snug">
                  Zatím 0 potvrzení. Do ověření komunitou zbývá 3.
                </p>
              ) : (
                <ul className="space-y-1">
                  <p className="text-[10px] text-stone-500 mb-1">
                    {isCommunityVerified
                      ? "Komunitou ověřený soused (alespoň 3)."
                      : `Do ověření zbývá ${Math.max(0, 3 - trustVerifiers.length)}.`}
                  </p>
                  {trustVerifiers.map((v) => (
                    <li
                      key={v.confirmerId}
                      className="flex items-center gap-2 py-1 px-1.5 rounded-lg bg-white/80"
                    >
                      <Avatar initials={v.initials || "??"} roleId="soused" size="sm" />
                      <span className="text-[11px] font-semibold text-stone-800 truncate flex-1 min-w-0">
                        <PersonLabel personId={v.confirmerId} name={v.name} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <div id="profile-home-address" className="scroll-mt-4 mt-3">
            <div className="pp-profile-sec-head">
              <p className="pp-profile-sec-title">Místa</p>
              {!addingLocation && !editingLocationId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLocationId(null);
                    setEditingHomeAddress(false);
                    setAddingLocation(true);
                  }}
                  className="pp-profile-sec-btn"
                >
                  + Přidat
                </button>
              ) : null}
            </div>

            {!addingLocation && !editingLocationId ? (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {locations.map((loc) => {
                    const LocIcon = locationIconFor(loc);
                    const isActive = activeLocationId === loc.id;
                    const label = locationChipLabel(loc);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setActiveLocation(loc.id)}
                        title={loc.shortLabel || loc.address || label}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${
                          isActive
                            ? "border-[#3D7A68] bg-[#E8F3EF] text-[#1B4D3E]"
                            : "border-stone-200 bg-white text-stone-600 hover:border-[#C5DDD4]"
                        }`}
                      >
                        <LocIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = activeLocationId || locations[0]?.id;
                    if (!targetId) return;
                    setAddingLocation(false);
                    setEditingLocationId(targetId);
                    if (targetId === "domov") setEditingHomeAddress(true);
                  }}
                  className="pp-profile-sec-edit"
                >
                  Upravit vybrané místo
                </button>
              </div>
            ) : null}

            {editingLocationId
              ? (() => {
                  const loc = locations.find((l) => l.id === editingLocationId);
                  if (!loc) return null;
                  const isHome = loc.id === "domov";
                  const LocIcon = locationIconFor(loc);
                  return (
                    <div className="rounded-xl border border-[#C5DDD4] bg-[#F7FAF9] p-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <LocIcon className="w-4 h-4 text-[#3D7A68] shrink-0" aria-hidden />
                        <p className="text-[11px] font-semibold text-stone-800 flex-1 min-w-0">
                          {isHome ? addressLabel : `Upravit · ${loc.label}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLocationId(null);
                            setEditingHomeAddress(false);
                          }}
                          className="text-[10px] font-semibold text-stone-500"
                        >
                          Zavřít
                        </button>
                      </div>
                      <HomeAddressForm
                        key={`edit-${loc.id}`}
                        compact
                        initialAddress={loc.address}
                        initialLabel={loc.label}
                        showLabel={!isHome}
                        labelRequired={!isHome}
                        submitLabel="Uložit"
                        onSave={async (payload) => {
                          const ok = await updateUserLocation(loc.id, payload);
                          if (ok) {
                            setEditingLocationId(null);
                            if (isHome) setEditingHomeAddress(false);
                          }
                          return ok;
                        }}
                        onCancel={() => {
                          setEditingLocationId(null);
                          if (isHome) setEditingHomeAddress(false);
                        }}
                      />
                      {!isHome ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Odstranit místo „${loc.label}“?`)) {
                              removeUserLocation(loc.id);
                              setEditingLocationId(null);
                            }
                          }}
                          className="text-[11px] font-semibold text-red-600"
                        >
                          Odstranit místo
                        </button>
                      ) : null}
                    </div>
                  );
                })()
              : null}

            {addingLocation ? (
              <div className="rounded-xl border border-[#C5DDD4] bg-[#F7FAF9] p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-stone-800">Nové místo</p>
                  <button
                    type="button"
                    onClick={() => setAddingLocation(false)}
                    className="text-[10px] font-semibold text-stone-500"
                  >
                    Zavřít
                  </button>
                </div>
                <HomeAddressForm
                  key="add-location"
                  compact
                  showLabel
                  labelRequired
                  labelPlaceholder="Název (např. Chata, Práce)"
                  submitLabel="Přidat a přepnout"
                  onSave={async (payload) => {
                    const ok = await addUserLocation(payload);
                    if (ok) setAddingLocation(false);
                    return ok;
                  }}
                  onCancel={() => setAddingLocation(false)}
                />
              </div>
            ) : null}
          </div>

          {!ENABLE_DEV_ROLE_SWITCH && !isOfficeProfile ? (
            <MyProfilesPanel embedded />
          ) : null}
        </div>
      )}

      {ENABLE_DEV_ROLE_SWITCH ? <ProfileTypeTestSwitcher /> : null}

      <PaymentModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Dobití peněženky"
        amount={topUpAmount}
        amountEditable
        walletBalance={credits}
        allowWallet={false}
        onConfirm={(_method, paid) => addCredits(paid ?? topUpAmount)}
      />

      {isOfficeProfile && showWorkRoleViews ? (
        <>
          <MunicipalityRoleView />
          <ViewAsNeighborToggle className="mb-4" />
        </>
      ) : !isOfficeProfile ? (
        <ViewAsNeighborToggle className="mb-3" />
      ) : null}

      {showWorkRoleViews && testRoleId === "remeslnik" && <CraftsmanRoleView />}
      {showWorkRoleViews && testRoleId === "podnik" && <BusinessRoleView />}

      {showNeighborProfile && (
        <>
      <section id="profile-trust-network" className="pp-card p-4 mb-4 scroll-mt-4">
        <ProfileSectionTitle icon={PROFILE_DOODLE_ICONS.trust}>Potvrzení sousedů</ProfileSectionTitle>
        <p className="text-[10px] text-stone-500 mb-2 leading-snug">
          Potvrďte lidi, které znáte z okolí. Není to seznam přátel ani počet známostí — jen důvěra v lokalitě.
        </p>
        {(() => {
          const dismissed = trustDismissedIds ?? [];
          const pending = neighbors.filter(
            (n) =>
              n?.id &&
              !isSelfNeighborCandidate(n, user) &&
              !isCurrentUserRef(n.id, user) &&
              !confirmationsGiven.includes(n.id) &&
              !dismissed.includes(n.id)
          );
          if (pending.length === 0) {
            return (
              <p className="text-xs text-stone-500 leading-relaxed">
                Teď nemáte nikoho nového k potvrzení. Až se v lokalitě objeví nový soused, ukáže se tady.
                Znáte někoho jménem?{" "}
                <button
                  type="button"
                  onClick={() => {
                    closeProfile?.();
                    openMessages?.();
                  }}
                  className="font-semibold text-[#3D7A68] hover:underline"
                >
                  Napište mu ve Zprávách
                </button>
                .
              </p>
            );
          }
          return (
            <TrustPendingAccordion
              pending={pending}
              confirmNeighbor={confirmNeighbor}
              dismissTrustNeighbor={dismissTrustNeighbor}
              getPersonPhoto={getPersonPhoto}
            />
          );
        })()}
      </section>

      <section id="profile-my-group-proposals" className="pp-card p-4 mb-4 scroll-mt-4">
        <ProfileSectionTitle icon={PROFILE_DOODLE_ICONS.groups}>Moje návrhy skupin</ProfileSectionTitle>
        {(() => {
          const mine = (groupProposals ?? []).filter((p) => {
            if (p.active) return false;
            if (user?.id && (p.proposerId === user.id || p.proposer_id === user.id)) return true;
            if (user?.name && p.proposer && String(p.proposer).trim() === String(user.name).trim()) {
              return true;
            }
            return false;
          });
          if (mine.length === 0) {
            return (
              <div className="space-y-3">
                <p className="text-xs text-stone-500 leading-relaxed">
                  Zatím jste nenavrhli žádnou skupinu. Návrh uvidíte tady s počtem podpor od sousedů.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeProfile?.();
                    openCreateGroupModal?.();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#E8F3EF] text-[#1B4D3E] border border-[#C5E0D6]"
                >
                  Navrhnout novou skupinu
                </button>
              </div>
            );
          }
          return (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 leading-relaxed">
                Sousedé návrh vidí na Domů a ve Skupinách. Po {mine[0]?.required ?? 5} podporách se skupina
                aktivuje. Podpory uvidíte po rozbalení u konkrétního návrhu.
              </p>
              {mine.map((p) => (
                <GroupProposalCard
                  key={p.id}
                  proposal={p}
                  mine
                  onEdit={openEditGroupProposal}
                  supporters={groupProposalSupporters.filter((s) => s.proposalId === p.id)}
                  onExpandSupporters={() => markGroupProposalSupportersSeen?.()}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  closeProfile?.();
                  selectMainTab?.("neighbors");
                  setPendingNeighborsSection?.("skupiny");
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-[#3D7A68]"
              >
                Zobrazit ve Skupinách ›
              </button>
            </div>
          );
        })()}
      </section>

      <section id="profile-my-help-offers" className="pp-card p-4 mb-4 scroll-mt-4">
        <ProfileSectionTitle>Moje nabídky pomoci</ProfileSectionTitle>
        <p className="text-[11px] text-stone-500 mb-3 -mt-1">
          Po kliknutí na „Nabízím pomoc“ se žadateli otevře konverzace ve zprávách. Nabídka tu zůstane 48 hodin.
        </p>
        {myHelpOffers.length === 0 ? (
          <p className="text-sm text-stone-500 leading-relaxed">
            Zatím žádná aktivní nabídka. Když u souseda kliknete „Nabízím pomoc“, objeví se tady.
          </p>
        ) : (
          <div className="space-y-2">
            {myHelpOffers.map((offer) => (
              <div key={`${offer.postId}-${offer.createdAt}`} className="rounded-xl border border-stone-200 bg-[#FAFCFB] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 mb-0.5">Nabízím pomoc</p>
                    <p className="text-sm font-medium text-stone-800 leading-snug">{offer.postTitle}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Pro: {offer.authorName}
                      {offer.expiresAt ? ` · ${formatHelpOfferRemaining(offer.expiresAt)}` : ""}
                    </p>
                  </div>
                  {offer.authorId && (
                    <MessageButton
                      participantId={offer.authorId}
                      participantName={offer.authorName}
                      className="shrink-0"
                      topic={{
                        kind: "help",
                        refId: offer.postId,
                        title: offer.postTitle,
                        label: "Výpomoc",
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="profile-my-lending-offers" className="pp-card p-4 mb-4 scroll-mt-4">
        <ProfileSectionTitle>Moje výpůjčky a nabídky</ProfileSectionTitle>
        {myOffers.length === 0 &&
        reservations.length === 0 &&
        myListings.length === 0 &&
        listingSaleOrders.length === 0 ? (
          <p className="text-sm text-stone-500 leading-relaxed">
            Zatím nic — zkuste přidat inzerát nebo půjčit věc na tržišti.
          </p>
        ) : (
          <div className="space-y-2">
            {listingSaleOrders
              .filter((o) => isSameAppUser(o.buyerId, user?.id ?? "me"))
              .filter((o) => o.status !== LISTING_SALE_STATUS.cancelled)
              .map((order) => {
                const qtyHint =
                  listingUsesVariablePrice({ listingPriceUnit: order.priceUnit }) && order.quantity
                    ? ` · ${formatListingQuantity(order.quantity, order.priceUnit)}`
                    : "";
                const pending = order.status === LISTING_SALE_STATUS.adjust_pending;
                const proposedLabel = pending
                  ? formatListingQuantity(order.adjustProposedQuantity, order.priceUnit)
                  : null;
                return (
                <div key={order.id} className="rounded-xl border border-stone-200 bg-[#FAFCFB] p-3">
                  <p className="text-xs font-semibold text-amber-800 mb-0.5">
                    {order.status === LISTING_SALE_STATUS.held
                      ? "Nákup v rezervaci"
                      : pending
                        ? "Čeká na vaše potvrzení množství"
                        : "Nákup uzavřen"}
                  </p>
                  <p className="text-sm font-medium text-stone-800 leading-snug">{order.title}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    {order.amount} Kč{qtyHint} · úschova Podplotu
                    {order.fee != null ? ` · poplatek ${order.fee} Kč` : ""}
                    {order.sellerName ? ` · ${order.sellerName}` : ""}
                  </p>
                  {pending ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-amber-900 leading-snug">
                        Prodejce nabízí {proposedLabel}
                        {order.adjustProposedAmount != null
                          ? ` za ${order.adjustProposedAmount} Kč`
                          : ""}
                        {order.adjustMessage ? ` — ${order.adjustMessage}` : "."}
                      </p>
                      <button
                        type="button"
                        onClick={() => confirmListingSaleAdjustment(order.id)}
                        className="w-full py-2 rounded-xl text-xs font-semibold text-white pp-btn-primary"
                      >
                        Souhlasím · {proposedLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectListingSaleAdjustment(order.id)}
                        className="w-full py-2 rounded-xl text-xs font-semibold border border-stone-200 text-stone-700"
                      >
                        Ne, zrušit nákup
                      </button>
                    </div>
                  ) : order.status === LISTING_SALE_STATUS.held ? (
                    <button
                      type="button"
                      onClick={() => confirmListingHandover(order.id)}
                      className="mt-2 w-full py-2 rounded-xl text-xs font-semibold text-white pp-btn-primary"
                    >
                      Převzato a zaplaceno
                    </button>
                  ) : (
                    <p className="text-xs font-semibold text-[#3D7A68] mt-2">
                      Převzato · prodejci uvolněno {order.sellerGets} Kč
                    </p>
                  )}
                </div>
                );
              })}
            {myOffers.length > 0 && <LendingAvailabilityPanel offerCount={myOffers.length} />}
            {myOffers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDetailLending(item)}
                className="rounded-xl border border-stone-200 bg-[#FAFCFB] p-3 w-full text-left hover:bg-stone-50 transition-colors"
              >
                <p className="text-xs font-semibold text-emerald-700 mb-0.5">Nabízím k půjčení · klepněte pro detail</p>
                <p className="text-sm font-medium text-stone-800">{item.item}</p>
                <p className="text-xs text-stone-500">
                  {item.credits} Kč / {item.period}
                </p>
                {lendingAvailability.onVacation && (
                  <p className="text-[11px] font-semibold text-amber-800 mt-1.5">⏸ Dovolená — platí u této nabídky</p>
                )}
                {lendingAvailability.availabilityMessage?.trim() && (
                  <p className="text-[11px] text-stone-500 mt-1">
                    Předání: {lendingAvailability.availabilityMessage.trim()}
                  </p>
                )}
              </button>
            ))}
            {reservations.map((item, i) => {
              const dateLabel =
                item.startDate &&
                (() => {
                  const fmt = (key) => {
                    const [y, m, d] = key.split("-");
                    return `${Number(d)}.${Number(m)}.${y}`;
                  };
                  if (!item.endDate || item.endDate === item.startDate) return fmt(item.startDate);
                  return `${fmt(item.startDate)} – ${fmt(item.endDate)}`;
                })();
              return (
              <div key={`res-${i}`} className="rounded-xl border border-stone-200 bg-[#FAFCFB] p-3">
                <p className="text-xs font-semibold text-emerald-800 mb-0.5">Rezervováno</p>
                <p className="text-sm font-medium text-stone-800 leading-snug">{item.item}</p>
                <p className="text-xs text-stone-500 mt-1">
                  Od {item.author} · {item.totalPaid ?? item.credits} Kč
                  {item.days > 1 ? ` · ${item.days} dní` : ""}
                  {item.fee != null && ` · poplatek ${item.fee} Kč`}
                </p>
                {dateLabel && (
                  <p className="text-xs text-stone-600 mt-0.5">Termín: {dateLabel}</p>
                )}
                <div className="mt-2">
                  <MessageButton
                    participantId={item.ownerId ?? item.authorId ?? item.id}
                    participantName={item.author}
                    topic={{
                      kind: "lending",
                      refId: item.id,
                      title: item.item,
                      label: "Půjčovna",
                    }}
                  />
                </div>
                {item.returnedAt ? (
                  <p className="text-xs font-semibold text-[#3D7A68] mt-2 flex items-center gap-1">
                    ✓ Vrácení potvrzeno
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => confirmLendingReturn(`${item.id}${item.reservedAt}`)}
                    className="mt-2 w-full py-2 rounded-xl text-xs font-semibold border border-[#3D7A68] text-[#3D7A68] hover:bg-[#F1F6F5] transition-colors"
                  >
                    Potvrdit vrácení
                  </button>
                )}
              </div>
              );
            })}
            {myListings
              .filter((p) => !myOffers.some((o) => o.id === p.id))
              .map((post) => {
                const sale = listingSaleOrders.find(
                  (o) =>
                    o.listingId === post.id &&
                    (o.status === "held" || o.status === "adjust_pending")
                );
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setDetailListing(post)}
                    className="rounded-xl border border-stone-200 bg-[#FAFCFB] p-3 w-full text-left hover:bg-stone-50 transition-colors"
                  >
                    <p className="text-xs font-semibold text-stone-500 mb-0.5">
                      {sale ? "Inzerát · V rezervaci · klepněte pro detail" : "Inzerát · klepněte pro detail"}
                    </p>
                    <p className="text-sm font-medium text-stone-800">{post.title}</p>
                    {sale && (
                      <p className="text-[11px] text-amber-800 mt-1">
                        Kupující zaplatil přes Podplot — po předání potvrdí převzetí sám.
                      </p>
                    )}
                  </button>
                );
              })}
          </div>
        )}
      </section>

      <section id="profile-my-reports" className="pp-card p-4 mb-4 scroll-mt-4">
        <ProfileSectionTitle>Moje hlášení</ProfileSectionTitle>
        {myReportItems.length === 0 ? (
          <p className="text-sm text-stone-500 leading-relaxed">
            Zatím jste neodeslala žádné hlášení na mapu.
          </p>
        ) : (
          <div className="space-y-2">
            {myReportItems.map((r) => {
              const badge = getReportLifecycleBadge(r.report);
              const badgeClass =
                badge.tone === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : badge.tone === "active"
                    ? "border-[#C5DDD4] bg-[#E8F3EF] text-[#1B4D3E]"
                    : "border-stone-200 bg-stone-50 text-stone-500";
              return (
              <button
                key={r.id}
                type="button"
                onClick={() => setDetailReport(r.report)}
                className="rounded-xl border border-stone-200 bg-[#FAFCFB] p-3 w-full text-left hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-[#3D7A68]">Hlášení · klepněte pro detail</p>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${badgeClass}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-800">{r.type}</p>
                <p className="text-sm text-stone-600 mt-1">{r.body}</p>
                <p className="text-xs text-stone-400 mt-2">
                  {formatContentAge(r.report) || r.time}
                </p>
              </button>
              );
            })}
          </div>
        )}
      </section>

      <section id="profile-my-prompts" className="pp-card p-4 mb-4 scroll-mt-4">
        <ProfileSectionTitle>Moje podněty úřadu</ProfileSectionTitle>
        {myMunicipalityPrompts.length === 0 ? (
          <p className="text-sm text-stone-500 leading-relaxed">
            Zatím jste neodeslala žádný podnět. Najdete je v záložce{" "}
            <strong>Mapa → Podat podnět úřadu</strong>.
          </p>
        ) : (
          <div className="space-y-2">
            {myMunicipalityPrompts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDetailPrompt(p)}
                className="rounded-xl border border-stone-200 bg-[#FAFCFB] p-3 w-full text-left hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-stone-800">{p.title}</p>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${getPromptStatusStyle(p.status)}`}
                  >
                    {p.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">{p.body}</p>
                {p.callTitle && (
                  <p className="text-[10px] text-blue-700 mt-1">Výzva: {p.callTitle}</p>
                )}
                <p className="text-xs text-stone-400 mt-2">{p.time} · klepněte pro detail</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <PromoteSection />

      {(isBusinessAccount(user) && resolveBusinessSubtype(user) === "mobilni") && (
        <ProfileCollapsible
          title="Dojezd služby"
          icon={PROFILE_DOODLE_ICONS.car}
          summary={formatCraftsmanRadiusLabel(craftsmanRadius)}
        >
          <p className="text-xs text-stone-500 leading-relaxed">
            V katalogu a ve feedu poptávek se zobrazíte sousedům ve vašem dojezdu. Výchozí poloha odpovídá
            aktivnímu místu ({locations.find((l) => l.id === activeLocationId)?.label ?? "Domov"}).
          </p>
          <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 bg-[#F7FAF9] cursor-pointer">
            <input
              type="checkbox"
              checked={isNationwideRadius(craftsmanRadius)}
              onChange={(e) =>
                setCraftsmanRadius(
                  e.target.checked ? CRAFTSMAN_RADIUS_NATIONWIDE_KM : CRAFTSMAN_RADIUS_MAX_KM
                )
              }
              className="mt-0.5 rounded accent-[#3D7A68]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-stone-800">Celá republika</span>
              <span className="block text-[11px] text-stone-500 mt-0.5">
                Bez omezení vzdálenosti
              </span>
            </span>
          </label>
          {!isNationwideRadius(craftsmanRadius) && (
            <>
              <input
                type="range"
                min={CRAFTSMAN_RADIUS_MIN_KM}
                max={CRAFTSMAN_RADIUS_MAX_KM}
                value={Math.min(
                  CRAFTSMAN_RADIUS_MAX_KM,
                  Math.max(CRAFTSMAN_RADIUS_MIN_KM, Number(craftsmanRadius) || 15)
                )}
                onChange={(e) => setCraftsmanRadius(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-xs text-stone-500 mt-1">
                Dojíždím do {formatCraftsmanRadiusLabel(craftsmanRadius)}
              </p>
            </>
          )}
          {isNationwideRadius(craftsmanRadius) && (
            <p className="text-xs text-[#3D7A68] font-medium">
              {formatCraftsmanRadiusLabel(craftsmanRadius)}
            </p>
          )}
        </ProfileCollapsible>
      )}

      {photoEditorOpen && (
        <ProfilePhotoEditor
          open
          initialPhoto={user.profilePhoto}
          onClose={() => setPhotoEditorOpen(false)}
          onSave={updateProfilePhoto}
          onRemove={removeProfilePhoto}
          title="Profilová fotka"
        />
      )}
        </>
      )}

      {ENABLE_DEV_ROLE_SWITCH && showWorkRoleViews && testRoleId !== "soused" && testRoleId !== "urad" && (
        <section className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-4 mt-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-bold text-stone-800">Režim admin (vývoj)</p>
              <p className="text-xs text-stone-500">Moderace nahlášení</p>
            </div>
            <input
              type="checkbox"
              checked={isAdminMode}
              onChange={(e) => setIsAdminMode(e.target.checked)}
              className="w-5 h-5 accent-emerald-600"
            />
          </label>
          {isAdminMode &&
            adminReports.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-3 border mt-2">
                <p className="text-sm font-semibold">{r.targetName}</p>
                <button type="button" onClick={() => blockUser(r.targetId)} className="text-[10px] font-bold text-red-600 mt-1">
                  🚫 Zablokovat účet
                </button>
              </div>
            ))}
        </section>
      )}

      {showWorkRoleViews && testRoleId === "urad" && (
        <section className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-stone-500">Obecní úřad nemá peněženku — všechny služby jsou zdarma.</p>
        </section>
      )}

      {detailReport && (
        <ReportDetailModal
          report={detailReport}
          onClose={() => setDetailReport(null)}
          onReport={(reason) => {
            reportSecurityReport?.(detailReport.id, reason);
            setDetailReport(null);
          }}
        />
      )}

      {detailListing && (
        <AppPanelPortal>
          <div className="pp-app-sheet-overlay">
            <div className="absolute inset-0 pointer-events-auto">
              <ModalDoodleBackdrop onClose={() => setDetailListing(null)} />
            </div>
            <div className="pp-app-sheet flex flex-col overflow-hidden" role="dialog" aria-label="Detail inzerátu">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 shrink-0">
                <h2 className="text-base font-bold text-stone-900">Detail inzerátu</h2>
                <button
                  type="button"
                  onClick={() => setDetailListing(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 text-xl leading-none"
                  aria-label="Zavřít"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FeedCard post={detailListing} detailsOnly />
                <button
                  type="button"
                  onClick={() => {
                    const post = detailListing;
                    setDetailListing(null);
                    openListingOnMap(post);
                  }}
                  className="mt-3 w-full py-2.5 text-sm font-semibold rounded-xl border border-[#C5DDD4] text-[#3D7A68]"
                >
                  Otevřít v sekci Věci
                </button>
              </div>
            </div>
          </div>
        </AppPanelPortal>
      )}

      {detailLending && (
        <AppPanelPortal>
          <div className="pp-app-sheet-overlay">
            <div className="absolute inset-0 pointer-events-auto">
              <ModalDoodleBackdrop onClose={() => setDetailLending(null)} />
            </div>
            <div className="pp-app-sheet p-5" role="dialog" aria-label="Detail půjčení">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs font-semibold text-emerald-700">Nabízím k půjčení</p>
                  <h2 className="text-lg font-bold text-stone-900 mt-0.5">{detailLending.item}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailLending(null)}
                  className="text-stone-400 text-xl px-1"
                  aria-label="Zavřít"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-stone-600">
                {detailLending.credits} Kč / {detailLending.period}
              </p>
              {detailLending.description && (
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">{detailLending.description}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  const item = detailLending;
                  setDetailLending(null);
                  openListingOnMap(item);
                }}
                className="mt-4 w-full py-2.5 text-sm font-semibold rounded-xl border border-[#C5DDD4] text-[#3D7A68]"
              >
                Otevřít v sekci Věci
              </button>
            </div>
          </div>
        </AppPanelPortal>
      )}

      {detailPrompt && (
        <AppPanelPortal>
          <div className="pp-app-sheet-overlay">
            <div className="absolute inset-0 pointer-events-auto">
              <ModalDoodleBackdrop onClose={() => setDetailPrompt(null)} />
            </div>
            <div className="pp-app-sheet p-5" role="dialog" aria-label="Detail podnětu">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-500">Podnět úřadu</p>
                  <h2 className="text-lg font-bold text-stone-900 mt-0.5">{detailPrompt.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailPrompt(null)}
                  className="text-stone-400 text-xl px-1"
                  aria-label="Zavřít"
                >
                  ×
                </button>
              </div>
              <span
                className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border mb-3 ${getPromptStatusStyle(detailPrompt.status)}`}
              >
                {detailPrompt.statusLabel}
              </span>
              <p className="text-sm text-stone-600 leading-relaxed">{detailPrompt.body}</p>
              {detailPrompt.callTitle && (
                <p className="text-xs text-blue-700 mt-3">Výzva: {detailPrompt.callTitle}</p>
              )}
              <p className="text-xs text-stone-400 mt-3">{detailPrompt.time}</p>
            </div>
          </div>
        </AppPanelPortal>
      )}
    </div>
  );
}
