import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { CURRENT_USER } from "../data/mockData.js";
import { getCategory } from "../data/listingCategories.js";
import { getGroup } from "../data/groups.js";
import { calculateTopCost, getTopPlan, canTopCategory } from "../data/pricing.js";
import { getAccountType, normalizeAccountType, resolveBusinessSubtype } from "../data/accountTypes.js";
import { CLUB_VOTES_REQUIRED, getClubCategory } from "../data/clubCategories.js";
import { inferFeedClassification, getDefaultSubfilter } from "../data/feedNavigation.js";
import { USER_LOCATIONS, getGroupsForLocation, DEFAULT_RADIUS_KM } from "../data/locations.js";
import { filterByRadius, filterByMunicipality, filterByActiveLocation, municipalitiesMatch } from "../data/geoFilter.js";
import { FEED_POSTS, LENDING_ITEMS } from "../data/mockData.js";
import { AREA_NEWS, getAreaNewsForLocation, getActiveCrisis } from "../data/areaNews.js";
import { LUNCH_MENUS, sortLunchMenus } from "../data/lunchMenus.js";
import { getTestRole } from "../data/testRoles.js";
import { calcEscrowFee, ESCROW_STATUSES, LISTING_SALE_STATUSES } from "../data/monetization.js";
import {
  applyListingSaleVisibility,
  getActiveListingSale,
  isSameAppUser,
  isCurrentUserRef,
  isSelfNeighborCandidate,
  LISTING_SALE_STATUS,
} from "../data/listingSales.js";
import {
  INITIAL_GROUP_PROPOSALS,
} from "../data/communityGroups.js";
import { clampMapPos, posToDistanceLabel } from "../data/mapData.js";
import { pscDigits } from "../data/addressValidation.js";
import { fetchAddressSuggestions } from "../data/addressAutocomplete.js";
import { isValidMapPos } from "../utils/reportPinUtils.js";
import { latLngToMapPos } from "../utils/geoCoordinates.js";
import {
  loadMapRadiusSettings,
  persistMapRadiusSettings,
  clampReportsMapRadius,
  clampEventsMapRadius,
  clampThingsMapRadius,
} from "../data/mapRadiusSettings.js";
import { MODULE_IDS, DEFAULT_MODULE_VIEW, DEFAULT_EVENTS_MODULE_VIEW } from "../data/moduleConfig.js";
import { INSTITUTIONS_MAP_PLACES } from "../data/institutionsMapData.js";
import { filterServicesByReach } from "../utils/serviceReach.js";
import {
  getServiceCategory,
  formatServiceSubcategoryLabels,
  serviceHasSubcategory,
} from "../data/serviceCategories.js";
import {
  normalizeFeedPostToThing,
  normalizeLendingToThing,
  filterThingsItems,
  isThingsModuleListing,
  sortInstitutionsByPriority,
} from "../utils/thingsModule.js";
import { computeExpiresAt } from "../data/reportExpiry.js";
import { URGENT_SCOPE, URGENT_LOCAL_RADIUS_M, resolveReportDistance, describeUrgentAudience } from "../data/reportUrgency.js";
import {
  loadUiPreferences,
  persistUiPreferences,
  readPref,
  UI_KEYS,
} from "../data/uiPreferences.js";
import { verifyEmailDomain, extractEmailDomain } from "../data/domainVerification.js";
import {
  buildMessageContactDirectory,
  getSuggestedMessageContacts,
} from "../data/messageContacts.js";
import {
  buildInitialGalleryActivities,
  countUnreadCalendarGallery,
  createGalleryActivity,
  getFeedGalleryActivities,
  getUnreadParticipatedGalleryActivities,
  isUserParticipatedInEvent,
} from "../data/eventGalleryActivity.js";
import {
  buildPersonNameIndex,
  collectLocalPeople,
  getDisplayNameForPerson,
  getPersonPhoto as getPersonPhotoFromIndex,
} from "../data/personDisplay.js";
import {
  formatCzechEventSchedule,
  eventDateSortValue,
  isEventPast,
  nowCzechTime,
  normalizeCzechTime,
} from "../data/czechDateTime.js";
import { EVENT_REPORT_DELETE_THRESHOLD } from "../data/eventFormatting.js";
import { calcServiceFee, getMonetizationPlan } from "../data/monetization.js";
import {
  INTEREST_OPTIONS,
  EVENTS as INITIAL_EVENTS,
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  MOCK_NEIGHBORS,
  ADMIN_REPORTS,
  SERVICES_CATALOG,
  NEIGHBOR_HELP,
  SPONSORED_BUSINESSES,
} from "../data/ecosystemMock.js";
import { inferLendingMeta } from "../data/lendingCategories.js";
import { lendingCategoryToMarket } from "../data/marketCategories.js";
import { SKIP_REGISTRATION, getDevTestUser } from "../data/devConfig.js";
import {
  loadUserSession,
  persistUserSession,
  clearUserSession,
  createUserId,
} from "../data/userSession.js";
import {
  upsertRemoteProfile,
  publishRemotePost,
  fetchRemotePosts,
  subscribeRemotePosts,
  rowToFeedPost,
  fetchRemoteProfile,
  profileToAppUser,
  fetchRemoteNeighbors,
  subscribeRemoteProfiles,
  profileRowToNeighbor,
  fetchMyNeighborConfirmations,
  fetchNeighborConfirmationCounts,
  fetchReceivedNeighborConfirmations,
  subscribeReceivedNeighborConfirmations,
  publishNeighborConfirmation,
} from "../data/communityApi.js";
import {
  fetchRemoteMessages,
  publishRemoteMessage,
  subscribeRemoteMessages,
  rowsToChats,
  markRemoteMessagesRead,
  locationIdFromChatMessages,
} from "../data/messagesApi.js";
import {
  normalizeChatTopic,
  topicToMessageMeta,
  topicFromMessageMeta,
} from "../data/chatTopics.js";
import {
  showMessageNotification,
  requestNotificationPermission,
  getStoredMessageAlertsPref,
  setStoredMessageAlertsPref,
} from "../lib/browserNotifications.js";
import {
  authSignUp,
  authSignIn,
  authSignOut,
  authResetPassword,
  authUpdatePassword,
  validatePassword,
  subscribeAuth,
} from "../data/authApi.js";
import { ensureSupabase } from "../lib/supabaseClient.js";
import { getAppRoleFromTestId, APP_ROLES, isB2BRole, isMobilniTestRole, isFyzickaTestRole } from "../data/userRoles.js";
import { filterCraftsmanInquiries, isNationwideRadius } from "../data/craftsmanSettings.js";
import {
  DEFAULT_NOTIFICATION_PREFS,
  DEFAULT_BUSINESS_NOTIFICATION_PREFS,
  MOBILNI_PUSH_SUBSCRIPTION,
  LUNCH_MENU_PUSH_PRICE,
  SERVICE_REQUEST_FREE_DELAY_MS,
} from "../data/notificationPlans.js";
import { TEST_PERSONAS, CRAFTSMAN_NEARBY_REQUESTS } from "../data/businessProfiles.js";
import {
  SUGGESTION_STATUS,
  CLAIM_STATUS,
  suggestionToPlace,
  mergeInstitutionPlace,
} from "../data/entityManagement.js";
import {
  initReviewsFromCatalog,
  computeServiceRating,
  isVerifiedNeighbor,
} from "../data/serviceReviews.js";
import { isPlaceOwner } from "../data/placeReviews.js";
import {
  INITIAL_MUNICIPALITY_PROMPTS,
  INITIAL_PROMPT_CALLS,
  getPromptStatusLabel,
  PROMPT_STATUS_AUTO_MESSAGE,
} from "../data/municipalityPrompts.js";

const AppContext = createContext(null);

function applyTop(post, planId) {
  const plan = getTopPlan(planId);
  const until = new Date();
  until.setDate(until.getDate() + plan.days);
  return {
    ...post,
    topped: true,
    topPlanId: planId,
    topDays: plan.days,
    toppedUntil: until.toISOString(),
  };
}

function updatePostInList(list, postId, updater) {
  return list.map((p) => (p.id === postId ? updater(p) : p));
}

function initialsFromName(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function nowTime() {
  return nowCzechTime();
}

const DEFAULT_LOCATIONS = USER_LOCATIONS;

const INITIAL_SERVICE_ORDERS = [
  {
    id: "so1",
    title: "Oprava kohoutku v kuchyni",
    amount: 800,
    escrow: true,
    status: "held",
    providerRole: "remeslnik",
    escrowStatusLabel: ESCROW_STATUSES.held,
  },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (SKIP_REGISTRATION) return getDevTestUser();
    return loadUserSession()?.user ?? null;
  });
  const [credits, setCredits] = useState(() => {
    if (SKIP_REGISTRATION) return CURRENT_USER.credits;
    const saved = loadUserSession()?.credits;
    return typeof saved === "number" ? saved : CURRENT_USER.credits;
  });
  const creditsRef = useRef(credits);
  creditsRef.current = credits;
  const [activeTab, setActiveTab] = useState("home");
  const [toast, setToast] = useState(null);
  const [reservations, setReservations] = useState([]);
  /** Prodeje bazaru: platba v úschově (held) → po „Převzato a zaplaceno“ released */
  const [listingSaleOrders, setListingSaleOrders] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userGroupPosts, setUserGroupPosts] = useState([]);
  const [userLendingItems, setUserLendingItems] = useState([]);
  const [lendingAvailability, setLendingAvailability] = useState({
    onVacation: false,
    availabilityMessage: "",
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState(null);
  /** Úprava vlastního inzerátu / příspěvku — CreateListingModal */
  const [editingPost, setEditingPost] = useState(null);
  const [createGroupId, setCreateGroupId] = useState(null);
  const [feedMainMode, setFeedMainMode] = useState("komunita");
  const [feedSubFilter, setFeedSubFilter] = useState("veci");
  const [showDiscoveryWall, setShowDiscoveryWall] = useState(true);
  const [showPodplotStory, setShowPodplotStory] = useState(() => {
    try {
      return sessionStorage.getItem("pp-show-podplot-story") === "1";
    } catch {
      return false;
    }
  });
  /** Po odkazu z e-mailu „zapomenuté heslo“ — vynutí obrazovku nového hesla */
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [mapFocus, setMapFocus] = useState(null);
  const [pendingMapReportsCategory, setPendingMapReportsCategory] = useState(null);
  const [pendingNeighborsSection, setPendingNeighborsSection] = useState(null);
  const [pendingHelpFormOpen, setPendingHelpFormOpen] = useState(false);
  const [pendingThingsItemId, setPendingThingsItemId] = useState(null);
  const [homeEventGallery, setHomeEventGallery] = useState(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [placeSuggestionOpen, setPlaceSuggestionOpen] = useState(false);
  const [testRoleId, setTestRoleId] = useState(() => {
    if (SKIP_REGISTRATION) return "soused";
    return loadUserSession()?.testRoleId ?? "soused";
  });
  /** Osobní profily uživatele (bez úřadu) — pro sekci Moje profily */
  const [userProfileIds, setUserProfileIds] = useState(() => {
    if (SKIP_REGISTRATION) return ["soused"];
    return loadUserSession()?.userProfileIds ?? ["soused"];
  });
  const [viewAsNeighbor, setViewAsNeighbor] = useState(false);
  /** Záloha pracovního uživatele při „Přepnout na sousedský profil“ */
  const workUserBackupRef = useRef(null);
  /** Po [+] u úřadu: otevřít formulář výzvy / krizovou stránku */
  const [pendingOfficeAction, setPendingOfficeAction] = useState(null);
  const [usefulCounts, setUsefulCounts] = useState({ f2: 3, f4: 1, f12: 5 });
  const [myUsefulPosts, setMyUsefulPosts] = useState(["f2"]);
  const [helpOffersByPost, setHelpOffersByPost] = useState({
    nh1: [
      {
        helperId: "petr-d",
        helperName: "Petr Dvořák",
        time: "před 1 h",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 47 * 60 * 60 * 1000).toISOString(),
        authorId: "nh1",
        authorName: "Jana Svobodová",
        postTitle: "Hlídání kočky o víkendu",
      },
      {
        helperId: "alena-v",
        helperName: "Alena Vítová",
        time: "před 40 min",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 47 * 60 * 60 * 1000).toISOString(),
        authorId: "nh1",
        authorName: "Jana Svobodová",
        postTitle: "Hlídání kočky o víkendu",
      },
    ],
  });
  const [searchHelpCounts, setSearchHelpCounts] = useState({ f11: 4 });
  const [mySearchHelpPosts, setMySearchHelpPosts] = useState(["f11"]);
  const [searchHighlightedPosts, setSearchHighlightedPosts] = useState(["f11"]);
  const [areaNewsList, setAreaNewsList] = useState(AREA_NEWS);
  const [acknowledgedNewsIds, setAcknowledgedNewsIds] = useState([]);
  const [lunchMenus, setLunchMenus] = useState(LUNCH_MENUS);
  const [lunchSubscriptions, setLunchSubscriptions] = useState(["sp1"]);
  const [notificationPrefs, setNotificationPrefs] = useState(() => ({
    ...DEFAULT_NOTIFICATION_PREFS,
    messageAlerts: getStoredMessageAlertsPref(),
  }));
  const [businessNotificationPrefs, setBusinessNotificationPrefs] = useState(() => ({
    ...DEFAULT_BUSINESS_NOTIFICATION_PREFS,
  }));
  const [lunchMenuDraft, setLunchMenuDraft] = useState(
    "Polévka: kulajda · Hlavní: řízek · Vegetarián: těstoviny"
  );
  /** Provozovna (fyzická) — stav otevření, hodiny, sdělení sousedům */
  const [businessIsOpen, setBusinessIsOpen] = useState(true);
  const [businessHours, setBusinessHours] = useState("Po–Ne 11:00–23:00");
  const [businessHoursNote, setBusinessHoursNote] = useState("");
  const [businessNeighborNote, setBusinessNeighborNote] = useState("");
  const [pendingBusinessAction, setPendingBusinessAction] = useState(null);
  const [areaNewsTitleDraft, setAreaNewsTitleDraft] = useState("");
  const [areaNewsBodyDraft, setAreaNewsBodyDraft] = useState("");
  const [crisisTitleDraft, setCrisisTitleDraft] = useState("");
  const [crisisBodyDraft, setCrisisBodyDraft] = useState("");
  const [officePromptTitleDraft, setOfficePromptTitleDraft] = useState("");
  const [officePromptBodyDraft, setOfficePromptBodyDraft] = useState("");
  const [craftsmanWallet, setCraftsmanWallet] = useState(1240);
  const [businessWallet, setBusinessWallet] = useState(3680);
  const [craftsmanAcceptsOrders, setCraftsmanAcceptsOrders] = useState(true);
  const [serviceOrders, setServiceOrders] = useState(INITIAL_SERVICE_ORDERS);
  const [municipalityPrompts, setMunicipalityPrompts] = useState(INITIAL_MUNICIPALITY_PROMPTS);
  const [promptCalls, setPromptCalls] = useState(INITIAL_PROMPT_CALLS);
  const [uiPreferences, setUiPreferences] = useState(() => loadUiPreferences());
  const [dismissedPromptCallIds, setDismissedPromptCallIds] = useState(() =>
    readPref(loadUiPreferences(), UI_KEYS.DISMISSED_PROMPT_CALLS, [])
  );
  const [dismissedGroupProposalIds, setDismissedGroupProposalIds] = useState(() =>
    readPref(loadUiPreferences(), UI_KEYS.DISMISSED_GROUP_PROPOSALS, [])
  );
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groupFilter, setGroupFilter] = useState(null);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedReports, setReportedReports] = useState([]);
  /** eventId → pole id nahlásivších (po 3 se akce smaže) */
  const [eventReporterIds, setEventReporterIds] = useState({});
  const [userReports, setUserReports] = useState([]);
  const [extraReports, setExtraReports] = useState([]);
  const [communityGroups, setCommunityGroups] = useState(() => {
    const locId = SKIP_REGISTRATION
      ? "domov"
      : loadUserSession()?.activeLocationId ?? "domov";
    return getGroupsForLocation(locId);
  });
  const [groupProposals, setGroupProposals] = useState(INITIAL_GROUP_PROPOSALS);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  // Ecosystem state
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [joinedEventIds, setJoinedEventIds] = useState(["ev-past2"]);
  const [eventGalleryActivity, setEventGalleryActivity] = useState(() => {
    if (!SKIP_REGISTRATION) return [];
    return buildInitialGalleryActivities(INITIAL_EVENTS, getDevTestUser(), ["ev-past2"]);
  });
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [neighbors, setNeighbors] = useState(MOCK_NEIGHBORS);
  const [adminReports, setAdminReports] = useState(ADMIN_REPORTS);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [userInterests, setUserInterests] = useState({ rodina: true, sport: false, zahrada: true, kultura: false });
  const [locations, setLocations] = useState(() => {
    if (SKIP_REGISTRATION) return DEFAULT_LOCATIONS;
    const saved = loadUserSession()?.locations;
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_LOCATIONS;
  });
  const [activeLocationId, setActiveLocationId] = useState(() => {
    if (SKIP_REGISTRATION) return "domov";
    return loadUserSession()?.activeLocationId ?? "domov";
  });
  const [servicesCatalog, setServicesCatalog] = useState(() => {
    if (SKIP_REGISTRATION) return SERVICES_CATALOG;
    const owned = loadUserSession()?.ownedService;
    if (!owned?.id) return SERVICES_CATALOG;
    return [
      owned,
      ...SERVICES_CATALOG.filter(
        (s) => s.id !== owned.id && s.ownerUserId !== owned.ownerUserId
      ),
    ];
  });
  const [serviceReviews, setServiceReviews] = useState(() => initReviewsFromCatalog(SERVICES_CATALOG));
  const [placeReviews, setPlaceReviews] = useState([]);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [institutionPlaceOverrides, setInstitutionPlaceOverrides] = useState({});
  const [institutionClaims, setInstitutionClaims] = useState([]);
  const [b2bInquiries, setB2bInquiries] = useState([]);
  const [workDashboardTab, setWorkDashboardTab] = useState("poptavky");
  const [neighborHelp, setNeighborHelp] = useState(NEIGHBOR_HELP);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [neighborHelpFilter, setNeighborHelpFilter] = useState("vse");
  const [sosAlert, setSosAlert] = useState(null);
  const [chatModal, setChatModal] = useState(null);
  const chatModalRef = useRef(null);
  chatModalRef.current = chatModal;
  const toastClearRef = useRef(null);
  const notificationPrefsRef = useRef(notificationPrefs);
  notificationPrefsRef.current = notificationPrefs;
  const [craftsmanProfileOpen, setCraftsmanProfileOpen] = useState(null);
  const [helpOfferChatKickoff, setHelpOfferChatKickoff] = useState(null);
  const [galleryPreviewQueue, setGalleryPreviewQueue] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [calendarFilter, setCalendarFilter] = useState("all");
  const [confirmationsGiven, setConfirmationsGiven] = useState([]);
  const confirmationsGivenRef = useRef(confirmationsGiven);
  confirmationsGivenRef.current = confirmationsGiven;
  /** Kdo potvrdil mě — [{ confirmerId, name, initials, createdAt }] */
  const [trustVerifiers, setTrustVerifiers] = useState([]);
  const [trustVerifiersSeenIds, setTrustVerifiersSeenIds] = useState([]);
  const trustVerifiersRef = useRef(trustVerifiers);
  trustVerifiersRef.current = trustVerifiers;
  /** Sousedi označení „Neznám ho“ — už nepřipomínat na Domů */
  const [trustDismissedIds, setTrustDismissedIds] = useState([]);
  const trustDismissedIdsRef = useRef(trustDismissedIds);
  trustDismissedIdsRef.current = trustDismissedIds;
  /** Celý widget „nový soused“ na Domů schovaný */
  const [trustHomePromptHidden, setTrustHomePromptHidden] = useState(false);
  const [craftsmanRadius, setCraftsmanRadiusState] = useState(15);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [craftsmanInvoices, setCraftsmanInvoices] = useState([]);
  const [inquiryClock, setInquiryClock] = useState(() => Date.now());
  const [mapRadiusSettings, setMapRadiusSettings] = useState(() => loadMapRadiusSettings());
  const reportsMapRadiusKm = mapRadiusSettings.reports;
  const eventsMapRadiusKm = mapRadiusSettings.events;
  const thingsMapRadiusKm = mapRadiusSettings.things;

  // Účet testera v prohlížeči — přežije refresh i nový deploy na Vercelu
  useEffect(() => {
    if (SKIP_REGISTRATION) return;
    if (!user) {
      clearUserSession();
      return;
    }
    const ownedService =
      servicesCatalog.find(
        (s) => s.id === "svc-mine" || (user.id && s.ownerUserId === user.id)
      ) ?? null;
    persistUserSession({
      user,
      locations,
      activeLocationId,
      credits,
      userProfileIds,
      testRoleId,
      ownedService,
    });
  }, [user, locations, activeLocationId, credits, userProfileIds, testRoleId, servicesCatalog]);

  // Obnova hesla z e-mailového odkazu (Supabase Auth)
  useEffect(() => {
    if (SKIP_REGISTRATION) return undefined;
    return subscribeAuth((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }
    });
  }, []);

  const [moduleViewModes, setModuleViewModes] = useState({
    [MODULE_IDS.REPORTS]: DEFAULT_MODULE_VIEW,
    [MODULE_IDS.EVENTS]: DEFAULT_EVENTS_MODULE_VIEW,
    [MODULE_IDS.LOCAL_GUIDE]: DEFAULT_MODULE_VIEW,
    [MODULE_IDS.THINGS]: "list",
    [MODULE_IDS.SERVICES]: "list",
  });
  const [moduleSelection, setModuleSelection] = useState(null);
  const [homeModule, setHomeModule] = useState(null);
  const [thingsCategory, setThingsCategory] = useState("vse");
  const [thingsLendingSubCategory, setThingsLendingSubCategory] = useState(null);
  const [thingsSearchQuery, setThingsSearchQuery] = useState("");

  const setReportsMapRadiusKm = useCallback((km) => {
    setMapRadiusSettings((prev) => {
      const next = { ...prev, reports: clampReportsMapRadius(km) };
      persistMapRadiusSettings(next);
      return next;
    });
  }, []);

  const setEventsMapRadiusKm = useCallback((km) => {
    setMapRadiusSettings((prev) => {
      const next = { ...prev, events: clampEventsMapRadius(km) };
      persistMapRadiusSettings(next);
      return next;
    });
  }, []);

  const setThingsMapRadiusKm = useCallback((km) => {
    setMapRadiusSettings((prev) => {
      const next = { ...prev, things: clampThingsMapRadius(km) };
      persistMapRadiusSettings(next);
      return next;
    });
  }, []);

  const setModuleViewMode = useCallback((moduleId, mode) => {
    setModuleViewModes((prev) => ({ ...prev, [moduleId]: mode }));
  }, []);

  const selectModuleItem = useCallback((moduleId, id) => {
    setModuleSelection({ module: moduleId, id });
  }, []);

  const clearModuleSelection = useCallback(() => {
    setModuleSelection(null);
  }, []);

  const openModuleItemDetail = useCallback(
    (moduleId, id) => {
      setModuleSelection({ module: moduleId, id });
      setModuleViewModes((prev) => ({ ...prev, [moduleId]: "list" }));
      requestAnimationFrame(() => {
        const scrollId =
          moduleId === "reports" ? `report-${id}` : `module-item-${id}`;
        document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    []
  );

  const showModuleItemOnMap = useCallback((moduleId, id) => {
    setModuleSelection({ module: moduleId, id });
    setModuleViewModes((prev) => ({ ...prev, [moduleId]: "map" }));
  }, []);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [profileHint, setProfileHint] = useState(null);
  const [profileScrollTarget, setProfileScrollTarget] = useState(null);
  const [sponsoredBanners, setSponsoredBanners] = useState(SPONSORED_BUSINESSES);
  const [zboziSearchQuery, setZboziSearchQuery] = useState("");
  const [zboziMarketCategory, setZboziMarketCategory] = useState("vse");
  const [servicesSearchQuery, setServicesSearchQuery] = useState("");
  const [servicesParentCategory, setServicesParentCategory] = useState("vse");
  const [institutionMapCategory, setInstitutionMapCategory] = useState("gastro");
  const [localGuideSearchQuery, setLocalGuideSearchQuery] = useState("");

  const activeSponsoredBanners = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sponsoredBanners.filter((b) => !b.activeUntil || b.activeUntil >= today);
  }, [sponsoredBanners]);

  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? locations[0];

  // Síť důvěry: sousedi z lokality + výzva při novém sousedovi
  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    let unsubscribe = () => {};

    const municipality =
      activeLocation?.municipality ?? user.geo?.city ?? user.location ?? null;

    const persistLocalConfirmations = (ids) => {
      try {
        localStorage.setItem(`podplot-confirmations-v1-${user.id}`, JSON.stringify(ids));
      } catch {
        /* ignore */
      }
    };

    const loadLocalConfirmations = () => {
      try {
        const raw = localStorage.getItem(`podplot-confirmations-v1-${user.id}`);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        return [];
      }
    };

    const isSelfNeighbor = (neighborOrId) => isSelfNeighborCandidate(neighborOrId, user);

    const mergeNeighborLists = (base, remote) => {
      const map = new Map();
      (base ?? []).forEach((n) => {
        if (!n?.id || isSelfNeighbor(n)) return;
        map.set(n.id, n);
      });
      (remote ?? []).forEach((n) => {
        if (!n?.id || isSelfNeighbor(n)) return;
        const prev = map.get(n.id);
        map.set(
          n.id,
          prev
            ? {
                ...prev,
                ...n,
                confirmations: Math.max(prev.confirmations ?? 0, n.confirmations ?? 0),
                // Už známý soused — při přepnutí lokality znovu neoznačovat jako nového
                isNew: Boolean(prev.isNew),
              }
            : n
        );
      });
      return Array.from(map.values()).sort((a, b) => {
        const aPending = a.isNew && !confirmationsGivenRef.current.includes(a.id) ? 1 : 0;
        const bPending = b.isNew && !confirmationsGivenRef.current.includes(b.id) ? 1 : 0;
        if (bPending !== aPending) return bPending - aPending;
        return (b.joinedAt ?? 0) - (a.joinedAt ?? 0);
      });
    };

    const loadSeenTrustIds = () => {
      try {
        const raw = localStorage.getItem(`podplot-trust-seen-v1-${user.id}`);
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
      } catch {
        return new Set();
      }
    };

    const markTrustSeen = (neighborId, seenSet) => {
      if (!neighborId) return;
      seenSet.add(neighborId);
      try {
        localStorage.setItem(
          `podplot-trust-seen-v1-${user.id}`,
          JSON.stringify([...seenSet])
        );
      } catch {
        /* ignore */
      }
    };

    const notifyNewNeighbor = (neighbor, { toast = true, seenSet = null } = {}) => {
      if (!neighbor?.id || isSelfNeighbor(neighbor)) return;
      if (confirmationsGivenRef.current.includes(neighbor.id)) return;
      if (trustDismissedIdsRef.current.includes(neighbor.id)) return;
      if (seenSet?.has(neighbor.id)) return;
      setNotifications((prev) => {
        const id = `n-trust-${neighbor.id}`;
        if (prev.some((n) => n.id === id)) return prev;
        return [
          {
            id,
            type: "blue",
            title: `Nový soused: ${neighbor.name?.split(/\s+/)[0] ?? "Soused"}`,
            body: "Potvrďte sousedství na Domů, pokud se znáte — nebo zvolte Neznám ho.",
            read: false,
            time: "právě teď",
            actionType: "trust_network",
            neighborId: neighbor.id,
          },
          ...prev.filter((n) => n.id !== id),
        ];
      });
      if (seenSet) markTrustSeen(neighbor.id, seenSet);
      if (toast) {
        setToast({
          message: `${neighbor.name?.split(/\s+/)[0] ?? "Nový soused"} je ve vaší lokalitě — potvrďte sousedství na Domů.`,
          type: "info",
          locationId: null,
        });
        window.setTimeout(() => setToast(null), 3500);
      }
    };

    (async () => {
      await ensureSupabase();
      if (cancelled) return;

      // Synchronizuj obec v profilu s aktivním místem — bez sebe jako „nového souseda“
      void upsertRemoteProfile({
        ...user,
        geo: {
          ...(user.geo ?? {}),
          city: municipality ?? user.geo?.city ?? user.location,
        },
        location: municipality ?? user.location,
      });

      const localGiven = loadLocalConfirmations();
      const remoteGiven = await fetchMyNeighborConfirmations(user.id);
      if (cancelled) return;
      const given = [...new Set([...localGiven, ...remoteGiven])];
      setConfirmationsGiven(given);
      persistLocalConfirmations(given);
      confirmationsGivenRef.current = given;

      try {
        const rawDismissed = localStorage.getItem(`podplot-trust-dismissed-v1-${user.id}`);
        const parsedDismissed = rawDismissed ? JSON.parse(rawDismissed) : [];
        const dismissed = Array.isArray(parsedDismissed) ? parsedDismissed.filter(Boolean) : [];
        setTrustDismissedIds(dismissed);
        trustDismissedIdsRef.current = dismissed;
      } catch {
        setTrustDismissedIds([]);
        trustDismissedIdsRef.current = [];
      }

      try {
        setTrustHomePromptHidden(
          localStorage.getItem(`podplot-trust-home-hidden-v1-${user.id}`) === "1"
        );
      } catch {
        setTrustHomePromptHidden(false);
      }

      const remoteNeighbors = await fetchRemoteNeighbors({
        municipality,
        excludeId: user.id,
        excludeEmail: user.email,
        excludeName: user.name,
      });
      if (cancelled) return;

      const counts = await fetchNeighborConfirmationCounts(remoteNeighbors.map((n) => n.id));
      if (cancelled) return;

      const withCounts = remoteNeighbors.map((n) => {
        let profilePhoto = n.profilePhoto ?? null;
        try {
          const raw = localStorage.getItem("podplot-public-photos-v1");
          const map = raw ? JSON.parse(raw) : {};
          if (!profilePhoto && map[n.id]) profilePhoto = map[n.id];
        } catch {
          /* ignore */
        }
        return {
          ...n,
          profilePhoto,
          confirmations: Math.max(n.confirmations ?? 0, counts[n.id] ?? 0),
        };
      });

      setNeighbors((prev) =>
        mergeNeighborLists(
          prev.filter((n) => !isSelfNeighbor(n)),
          withCounts
        )
      );

      // Jednou upozornit na nedávno přidané sousedy (ne při každém refreshi)
      const seen = loadSeenTrustIds();
      const threeDays = 1000 * 60 * 60 * 24 * 3;
      withCounts.forEach((n) => {
        if (isSelfNeighbor(n)) return;
        if (
          n.isNew &&
          !given.includes(n.id) &&
          !trustDismissedIdsRef.current.includes(n.id) &&
          !seen.has(n.id) &&
          Date.now() - (n.joinedAt ?? 0) < threeDays
        ) {
          notifyNewNeighbor(n, { toast: false, seenSet: seen });
        }
      });

      // Dismissnutí / potvrzení / já sama → už ne „Nový“
      setNeighbors((prev) =>
        prev
          .filter((n) => !isSelfNeighbor(n))
          .map((n) =>
            trustDismissedIdsRef.current.includes(n.id) || given.includes(n.id)
              ? { ...n, isNew: false }
              : n
          )
      );

      // Zruš případné notifikace o sobě samé
      setNotifications((prev) =>
        prev.filter(
          (n) =>
            !(
              n.actionType === "trust_network" &&
              (isSelfNeighborCandidate(n.neighborId, user) ||
                isSelfNeighborCandidate({ id: n.neighborId, name: n.title }, user))
            )
        )
      );

      unsubscribe = await subscribeRemoteProfiles((row) => {
        if (!row?.id || isSelfNeighbor(row)) return;
        const type = String(row.account_type ?? "soused").toLowerCase();
        if (type && type !== "soused") return;
        if (municipality) {
          const left = String(row.municipality ?? "").trim().toLowerCase();
          const right = String(municipality).trim().toLowerCase();
          if (left && right && !(left === right || left.includes(right) || right.includes(left))) {
            return;
          }
        }
        const neighbor = profileRowToNeighbor(row, { isNew: true, confirmationCount: 0 });
        if (!neighbor || isSelfNeighbor(neighbor)) return;
        setNeighbors((prev) => {
          const cleaned = prev.filter((p) => !isSelfNeighbor(p));
          if (cleaned.some((p) => p.id === neighbor.id)) return cleaned;
          return mergeNeighborLists(cleaned, [neighbor]);
        });
        const liveSeen = loadSeenTrustIds();
        notifyNewNeighbor(neighbor, { toast: true, seenSet: liveSeen });
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user?.id, activeLocation?.municipality, user?.geo?.city, user?.location]);

  // Síť důvěry: kdo potvrdil mě + badge na avataru
  useEffect(() => {
    if (!user?.id) {
      setTrustVerifiers([]);
      setTrustVerifiersSeenIds([]);
      return undefined;
    }

    let cancelled = false;
    let unsubscribe = () => {};
    const myId = user.id;

    const loadSeen = () => {
      try {
        const raw = localStorage.getItem(`podplot-trust-verifiers-seen-v1-${myId}`);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        return [];
      }
    };

    const persistSeen = (ids) => {
      try {
        localStorage.setItem(`podplot-trust-verifiers-seen-v1-${myId}`, JSON.stringify(ids));
      } catch {
        /* ignore */
      }
    };

    const applyReceived = (list, { notifyNew = false } = {}) => {
      if (cancelled) return;
      const seen = new Set(loadSeen());
      setTrustVerifiersSeenIds([...seen]);
      setTrustVerifiers(list);
      setUser((u) =>
        u && u.id === myId ? { ...u, neighborhoodConfirmations: list.length } : u
      );

      if (!notifyNew) return;
      list.forEach((v) => {
        if (!v?.confirmerId || seen.has(v.confirmerId)) return;
        const notifId = `n-trust-received-${v.confirmerId}`;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notifId)) return prev;
          return [
            {
              id: notifId,
              type: "green",
              title: `${(v.name || "Soused").split(/\s+/)[0]} vás potvrdil/a`,
              body: "Nové potvrzení v síti důvěry — podívejte se v profilu, kdo vás ověřil.",
              read: false,
              time: "právě teď",
              actionType: "trust_received",
              confirmerId: v.confirmerId,
            },
            ...prev,
          ];
        });
      });
    };

    (async () => {
      await ensureSupabase();
      if (cancelled) return;
      const seen = loadSeen();
      setTrustVerifiersSeenIds(seen);
      const received = await fetchReceivedNeighborConfirmations(myId);
      if (cancelled) return;
      applyReceived(received, { notifyNew: false });

      unsubscribe = await subscribeReceivedNeighborConfirmations(myId, async (row) => {
        const confirmerId = row?.confirmer_id;
        if (!confirmerId) return;
        let name = "Soused";
        let initials = "??";
        try {
          const profile = await fetchRemoteProfile(confirmerId);
          if (profile?.name) name = profile.name;
          if (profile?.initials) initials = profile.initials;
        } catch {
          /* ignore */
        }
        const entry = {
          confirmerId,
          name,
          initials,
          createdAt: row.created_at || new Date().toISOString(),
        };
        setTrustVerifiers((prev) => {
          if (prev.some((p) => p.confirmerId === confirmerId)) return prev;
          const next = [entry, ...prev];
          setUser((u) =>
            u && u.id === myId ? { ...u, neighborhoodConfirmations: next.length } : u
          );
          return next;
        });
        const seenNow = new Set(loadSeen());
        if (!seenNow.has(confirmerId)) {
          const notifId = `n-trust-received-${confirmerId}`;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;
            return [
              {
                id: notifId,
                type: "green",
                title: `${name.split(/\s+/)[0]} vás potvrdil/a`,
                body: "Nové potvrzení v síti důvěry — podívejte se v profilu, kdo vás ověřil.",
                read: false,
                time: "právě teď",
                actionType: "trust_received",
                confirmerId,
              },
              ...prev,
            ];
          });
          setToast({
            message: `${name.split(/\s+/)[0]} potvrdil/a vaše sousedství.`,
            type: "success",
            locationId: null,
          });
          window.setTimeout(() => setToast(null), 3500);
        }
      });
    })();

    // Poll lokálního mostu (stejné zařízení, druhý účet)
    const poll = window.setInterval(async () => {
      if (cancelled) return;
      const received = await fetchReceivedNeighborConfirmations(myId);
      if (cancelled) return;
      const prev = trustVerifiersRef.current;
      const prevIds = new Set(prev.map((p) => p.confirmerId));
      const newer = received.filter((r) => !prevIds.has(r.confirmerId));
      if (newer.length === 0 && received.length === prev.length) return;
      applyReceived(received, { notifyNew: newer.length > 0 });
    }, 4000);

    return () => {
      cancelled = true;
      unsubscribe?.();
      window.clearInterval(poll);
    };
  }, [user?.id]);

  const markTrustVerifiersSeen = useCallback(() => {
    if (!user?.id) return;
    const ids = trustVerifiersRef.current.map((v) => v.confirmerId).filter(Boolean);
    setTrustVerifiersSeenIds(ids);
    try {
      localStorage.setItem(`podplot-trust-verifiers-seen-v1-${user.id}`, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
    setNotifications((prev) =>
      prev.map((n) => (n.actionType === "trust_received" ? { ...n, read: true } : n))
    );
  }, [user?.id]);

  // Sdílené příspěvky ze Supabase (kamarádi na Vercelu)
  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    let unsubscribe = () => {};

    (async () => {
      await ensureSupabase();
      if (cancelled) return;
      void upsertRemoteProfile(user);
      const remote = await fetchRemotePosts({
        municipality: activeLocation?.municipality ?? user.geo?.city ?? null,
        currentUserId: user.id,
      });
      if (cancelled || remote.length === 0) return;
      setUserPosts((prev) => {
        const byId = new Map(prev.map((p) => [p.id, p]));
        for (const p of remote) {
          if (!byId.has(p.id)) byId.set(p.id, p);
        }
        return [...byId.values()].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      });

      unsubscribe = await subscribeRemotePosts((row) => {
        const post = rowToFeedPost(row, user.id);
        const activeMun = activeLocation?.municipality ?? user.geo?.city ?? null;
        if (activeMun && post.municipality && !municipalitiesMatch(post.municipality, activeMun)) {
          return;
        }
        setUserPosts((prev) => {
          if (prev.some((p) => p.id === post.id)) return prev;
          return [post, ...prev];
        });
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user?.id, activeLocation?.municipality, user?.geo?.city, user]);

  // Sdílené zprávy mezi testery (odpověď na inzerát / hlášení)
  useEffect(() => {
    if (!user?.id || SKIP_REGISTRATION) return undefined;
    let cancelled = false;
    let unsubscribe = () => {};

    const mergeRemoteChats = (remoteChats) => {
      setChats((prev) => {
        const byPeer = new Map();
        for (const c of prev) {
          if (c.sharedRemote || !["marie", "tomas"].includes(c.participantId)) {
            byPeer.set(c.participantId, c);
          }
        }
        for (const c of remoteChats) {
          const existing = byPeer.get(c.participantId);
          if (!existing) {
            byPeer.set(c.participantId, {
              ...c,
              locationId:
                c.locationId || locationIdFromChatMessages(c.messages) || null,
            });
            continue;
          }
          const msgById = new Map((existing.messages ?? []).map((m) => [m.id, m]));
          for (const m of c.messages ?? []) {
            if (m.id) msgById.set(m.id, m);
            else msgById.set(`${m.sender}-${m.time}-${m.text}`, m);
          }
          const messages = [...msgById.values()].sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return ta - tb;
          });
          const last = messages[messages.length - 1];
          byPeer.set(c.participantId, {
            ...existing,
            ...c,
            participantName: c.participantName || existing.participantName,
            messages,
            lastMessage: last?.text ?? c.lastMessage,
            lastTime: last?.time ?? c.lastTime,
            unread: c.unread ?? existing.unread ?? 0,
            sharedRemote: true,
            locationId:
              existing.locationId ||
              c.locationId ||
              locationIdFromChatMessages(messages) ||
              null,
          });
        }
        return [...byPeer.values()].map((chat) => ({
          ...chat,
          locationId:
            chat.locationId ||
            locationIdFromChatMessages(chat.messages) ||
            null,
        }));
      });
    };

    (async () => {
      await ensureSupabase();
      if (cancelled) return;
      const rows = await fetchRemoteMessages(user.id);
      if (cancelled) return;
      if (rows.length) mergeRemoteChats(rowsToChats(rows, user.id));

      unsubscribe = await subscribeRemoteMessages(user.id, (row) => {
        const incomingForMe = row.recipient_id === user.id;
        const mini = rowsToChats([row], user.id);
        if (mini.length) mergeRemoteChats(mini);
        if (incomingForMe) {
          const peerName = row.sender_name || "Soused";
          setNotifications((prev) => [
            {
              id: `n-msg-${row.id}`,
              type: "blue",
              title: `${peerName} vám napsal/a`,
              body: row.body?.slice(0, 80) || "Nová zpráva",
              read: false,
              time: "právě teď",
              participantId: row.sender_id,
              participantName: peerName,
            },
            ...prev.filter((n) => n.id !== `n-msg-${row.id}`),
          ]);

          const alertsOn = notificationPrefsRef.current?.messageAlerts !== false;
          const viewingChat =
            typeof document !== "undefined" &&
            document.visibilityState === "visible" &&
            chatModalRef.current?.participantId === row.sender_id;
          if (alertsOn && !viewingChat) {
            void showMessageNotification({
              title: `${peerName} · Podplot`,
              body: row.body?.slice(0, 120) || "Nová zpráva",
              peerId: row.sender_id,
              peerName,
              tag: `podplot-msg-${row.sender_id}`,
            });
          }
        }
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    setEventGalleryActivity((prev) => {
      if (prev.length > 0) return prev;
      return buildInitialGalleryActivities(events, user, joinedEventIds);
    });
  }, [user, events, joinedEventIds]);

  const areaNews = useMemo(
    () => filterByMunicipality(getAreaNewsForLocation(activeLocation, areaNewsList), activeLocation?.municipality),
    [activeLocation, areaNewsList]
  );

  const activeCrisis = useMemo(() => getActiveCrisis(areaNews), [areaNews]);

  const lunchMenusForLocation = useMemo(() => {
    const filtered = lunchMenus.filter(
      (m) => m.locationId === activeLocationId || m.locationId === activeLocation?.id
    );
    return sortLunchMenus(filterByRadius(filtered, activeLocation));
  }, [lunchMenus, activeLocationId, activeLocation]);

  const lunchSubscribersCount = 47;

  const showToast = useCallback((message, type = "success", options = null) => {
    setToast({
      message,
      type,
      locationId: options?.locationId ?? null,
    });
    const ms = options?.durationMs ?? 3500;
    if (toastClearRef.current) window.clearTimeout(toastClearRef.current);
    toastClearRef.current = window.setTimeout(() => setToast(null), ms);
  }, []);

  const notifyLocationRemap = useCallback(
    (locationId, loc) => {
      const place =
        loc?.shortLabel ||
        loc?.municipality ||
        loc?.label ||
        "zvolené místo";
      const label = loc?.label && loc.label !== place ? loc.label : null;
      const where = label ? `${label} · ${place}` : place;
      showToast(
        `Vše je přemapováno na ${where} — příspěvky, mapa, akce i okolí.`,
        "info",
        { locationId, durationMs: 4500 }
      );
    },
    [showToast]
  );

  const showProfileHint = useCallback((variant = "default") => {
    setProfileHint({ variant });
  }, []);

  const dismissProfileHint = useCallback(() => setProfileHint(null), []);

  const goToProfileFromHint = useCallback(() => {
    setProfileHint(null);
    setProfileScrollTarget("my-lending-offers");
    setProfileOpen(true);
  }, []);

  const openProfile = useCallback(() => setProfileOpen(true), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const openMessages = useCallback(() => setMessagesOpen(true), []);
  const closeMessages = useCallback(() => setMessagesOpen(false), []);
  const openPlusMenu = useCallback(() => setPlusMenuOpen(true), []);
  const closePlusMenu = useCallback(() => setPlusMenuOpen(false), []);
  const openInvoice = useCallback(() => setInvoiceOpen(true), []);
  const closeInvoice = useCallback(() => setInvoiceOpen(false), []);
  const openMapReport = useCallback(() => {
    setActiveTab("map");
    setReportFormOpen(true);
  }, []);
  const openPlaceSuggestion = useCallback(() => setPlaceSuggestionOpen(true), []);
  const closePlaceSuggestion = useCallback(() => setPlaceSuggestionOpen(false), []);
  const openCreateEvent = useCallback(() => {
    setCreateEventOpen(true);
  }, []);
  const clearMapFocus = useCallback(() => setMapFocus(null), []);

  const clearPendingMapReportsCategory = useCallback(() => {
    setPendingMapReportsCategory(null);
  }, []);

  const openReportOnMapFromHome = useCallback(
    (reportId, { category = "all" } = {}) => {
      if (!reportId) return;
      setActiveTab("map");
      setPendingMapReportsCategory(category);
      setMapFocus("reports");
      showModuleItemOnMap(MODULE_IDS.REPORTS, reportId);
    },
    [showModuleItemOnMap]
  );

  const confirmLendingReturn = useCallback(
    (reservationKey) => {
      setReservations((prev) =>
        prev.map((r) =>
          `${r.id}${r.reservedAt}` === reservationKey ? { ...r, returnedAt: new Date().toISOString() } : r
        )
      );
      showToast("Vrácení potvrzeno — děkujeme za důvěru.", "success");
    },
    [showToast]
  );

  const clearProfileScrollTarget = useCallback(() => setProfileScrollTarget(null), []);

  const payAmount = useCallback(
    (amount, method, { silent = false } = {}) => {
      if (method === "wallet") {
        if (creditsRef.current < amount) {
          showToast(
            `V peněžence není dost kreditů. Potřebujete ${amount} Kč — nebo dobijte kredity u platby.`,
            "error"
          );
          return false;
        }
        creditsRef.current -= amount;
        setCredits(creditsRef.current);
        return true;
      }
      if (!silent) showToast(`Platba ${amount} Kč kartou proběhla.`, "success");
      return true;
    },
    [showToast]
  );

  const register = useCallback(
    async ({
      name,
      email,
      password,
      address,
      accountType,
      businessSubtype = null,
      geo = null,
      profilePhoto = null,
      allowPublicAreaLabel = false,
      publicAreaLabel = "",
      serviceHomeGroup = null,
      serviceSubcategory = null,
      serviceSubcategories = null,
      serviceKeywords = [],
      institutionId = null,
      institutionRole = null,
    }) => {
      const pwdCheck = validatePassword(password, null);
      if (!pwdCheck.ok) {
        showToast(pwdCheck.error, "error");
        return { ok: false, error: pwdCheck.error };
      }

      const normalizedType = normalizeAccountType(accountType);
      const acc = getAccountType(normalizedType);
      let { isVerified, domain } = verifyEmailDomain(email, normalizedType);
      if (normalizedType === "urad" && institutionId) {
        // Doména se ověřuje vůči číselníku instituce (RegisterScreen); zde důvěřujeme matchi.
        isVerified = true;
        domain = extractEmailDomain(email);
      }
      const cityFromGeo = geo?.city || address.split(",").pop()?.trim() || address;
      const municipality = String(cityFromGeo).trim();
      const shortLabel =
        municipality.split("—")[0].split("–")[0].trim() || municipality;
      const resolvedSubtype =
        normalizedType === "podnik" ? businessSubtype ?? resolveBusinessSubtype(accountType) : null;

      let userId = createUserId();
      const auth = await authSignUp({
        email,
        password,
        metadata: {
          name,
          address,
          account_type: normalizedType,
          municipality,
        },
      });
      if (!auth.ok && !auth.localOnly) {
        showToast(auth.error, "error");
        return { ok: false, error: auth.error };
      }
      if (auth.ok && auth.needsEmailConfirm) {
        showToast(
          "Poslali jsme potvrzovací e-mail. Po kliknutí na odkaz se přihlaste heslem.",
          "info"
        );
        return { ok: false, needsEmailConfirm: true };
      }
      if (auth.ok && auth.user?.id) {
        userId = auth.user.id;
      }

      const subIds =
        resolvedSubtype === "mobilni"
          ? [
              ...new Set(
                (Array.isArray(serviceSubcategories) && serviceSubcategories.length
                  ? serviceSubcategories
                  : serviceSubcategory
                    ? [serviceSubcategory]
                    : []
                ).filter(Boolean)
              ),
            ]
          : [];
      const primarySub = subIds[0] ?? null;
      const labelsJoined = formatServiceSubcategoryLabels(subIds);

      let nextLat = geo?.lat ?? null;
      let nextLng = geo?.lng ?? null;
      if (nextLat == null || nextLng == null) {
        try {
          const results = await fetchAddressSuggestions(address);
          const hit = results.find((r) => r?.lat != null && r?.lon != null) ?? results[0];
          if (hit?.lat != null && hit?.lon != null) {
            nextLat = hit.lat;
            nextLng = hit.lon;
          }
        } catch {
          /* výchozí souřadnice Domova */
        }
      }
      const homeLat = nextLat ?? USER_LOCATIONS[0].lat;
      const homeLng = nextLng ?? USER_LOCATIONS[0].lng;

      const nextUser = {
        id: userId,
        name,
        email,
        address,
        accountType: normalizedType,
        businessSubtype: resolvedSubtype,
        initials: initialsFromName(name),
        role: acc.role,
        location: shortLabel,
        radius: normalizedType === "podnik" && resolvedSubtype === "mobilni" ? "15 km" : "1,2 km",
        isVerified,
        verifiedDomain: isVerified ? domain : null,
        geo: { ...(geo ?? {}), city: municipality, lat: homeLat, lng: homeLng },
        geolocVerified: true,
        neighborhoodConfirmations: 0,
        isPremium: false,
        profilePhoto,
        allowPublicAreaLabel: Boolean(allowPublicAreaLabel),
        publicAreaLabel: allowPublicAreaLabel ? publicAreaLabel.trim() : "",
        notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
        serviceHomeGroup: resolvedSubtype === "mobilni" ? serviceHomeGroup : null,
        serviceSubcategory: primarySub,
        serviceSubcategories: resolvedSubtype === "mobilni" ? subIds : [],
        serviceKeywords: resolvedSubtype === "mobilni" ? serviceKeywords : [],
        institutionId: normalizedType === "urad" ? institutionId : null,
        institutionRole: normalizedType === "urad" ? institutionRole ?? "editor" : null,
      };
      setUser(nextUser);
      void upsertRemoteProfile(nextUser);
      if (normalizedType === "urad") {
        setTestRoleId("urad");
        setUserProfileIds(["urad"]);
      } else {
        setTestRoleId("soused");
        setUserProfileIds(["soused"]);
      }
      setLocations([
        {
          ...USER_LOCATIONS[0],
          address,
          municipality,
          shortLabel,
          lat: homeLat,
          lng: homeLng,
        },
        USER_LOCATIONS[1],
        USER_LOCATIONS[2],
      ]);
      setActiveLocationId("domov");
      setCommunityGroups(getGroupsForLocation("domov"));
      setCredits(CURRENT_USER.credits);

      if (normalizedType === "podnik" && resolvedSubtype === "mobilni") {
        const catLabels = subIds.map((id) => getServiceCategory(id)?.label).filter(Boolean);
        const homeGroup = serviceHomeGroup || "domov-zahrada";
        const keywords = [
          ...catLabels,
          ...(Array.isArray(serviceKeywords) ? serviceKeywords : []),
        ]
          .map((k) => String(k).trim())
          .filter(Boolean);
        const uniqueKw = [...new Set(keywords.map((k) => k.toLowerCase()))].map(
          (k) => keywords.find((x) => x.toLowerCase() === k) ?? k
        );
        setServicesCatalog((prev) => {
          const withoutMine = prev.filter((s) => s.ownerUserId !== userId && s.id !== "svc-mine");
          return [
            {
              id: "svc-mine",
              name,
              profession: labelsJoined || "Služba",
              keywords: uniqueKw,
              subcategory: primarySub || "ostatni",
              subcategories: subIds.length ? subIds : ["ostatni"],
              subcategoryLabel: labelsJoined || "Ostatní služby",
              homeGroupId: homeGroup,
              address: cityFromGeo,
              locationId: "domov",
              defaultAddress: cityFromGeo,
              actionRadius: 15,
              isVerified: Boolean(isVerified),
              isPremium: false,
              kapacitaPlna: false,
              distanceKm: 0.1,
              rating: null,
              serviceDescription: "",
              ownerUserId: userId,
              reviews: [],
              ico: true,
              accountType: "podnik",
              businessSubtype: "mobilni",
              pushPoptavkyEnabled: false,
            },
            ...withoutMine,
          ];
        });
        if (subIds.length) {
          setTestRoleId("remeslnik");
        }
      }

      showToast(buildWelcomeToast(name, { isVerified, domain: isVerified ? domain : null }));
      setActiveTab("home");
      setFeedMainMode("komunita");
      setFeedSubFilter("veci");
      setShowDiscoveryWall(true);
      setHomeModule(null);
      setExpandedPillar(null);
      try {
        sessionStorage.setItem("pp-show-podplot-story", "1");
      } catch {
        /* ignore */
      }
      setShowPodplotStory(true);
      return { ok: true };
    },
    [showToast]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const result = await authSignIn(email, password);
      if (!result.ok) {
        showToast(result.error, "error");
        return { ok: false, error: result.error };
      }

      const authUser = result.user;
      const remote = await fetchRemoteProfile(authUser.id);
      const saved = loadUserSession();
      const base =
        saved?.user?.id === authUser.id ||
        (saved?.user?.email &&
          saved.user.email.toLowerCase() === String(email).trim().toLowerCase())
          ? saved.user
          : {};
      const nextUser = profileToAppUser(remote, authUser, {
        ...base,
        role: base.role ?? getAccountType(remote?.account_type || base.accountType || "soused").role,
        radius: base.radius ?? "1,2 km",
        isVerified: base.isVerified ?? false,
        geolocVerified: base.geolocVerified ?? true,
        neighborhoodConfirmations: base.neighborhoodConfirmations ?? 0,
        notificationPrefs: base.notificationPrefs ?? { ...DEFAULT_NOTIFICATION_PREFS },
      });

      setUser(nextUser);
      if (saved?.user?.id === nextUser.id && Array.isArray(saved.locations) && saved.locations.length) {
        setLocations(saved.locations);
        setActiveLocationId(saved.activeLocationId || "domov");
        setCommunityGroups(getGroupsForLocation(saved.activeLocationId || "domov"));
        if (typeof saved.credits === "number") setCredits(saved.credits);
        if (Array.isArray(saved.userProfileIds)) setUserProfileIds(saved.userProfileIds);
        if (saved.testRoleId) setTestRoleId(saved.testRoleId);
      } else {
        const municipality = nextUser.geo?.city || nextUser.location || "Jesenice";
        setLocations([
          {
            ...USER_LOCATIONS[0],
            address: nextUser.address || USER_LOCATIONS[0].address,
            municipality,
            shortLabel: municipality,
            lat: nextUser.geo?.lat ?? USER_LOCATIONS[0].lat,
            lng: nextUser.geo?.lng ?? USER_LOCATIONS[0].lng,
          },
          USER_LOCATIONS[1],
          USER_LOCATIONS[2],
        ]);
        setActiveLocationId("domov");
        setCommunityGroups(getGroupsForLocation("domov"));
      }
      void upsertRemoteProfile(nextUser);
      showToast(`Vítejte zpět, ${nextUser.name}.`, "success");
      return { ok: true };
    },
    [showToast]
  );

  const requestPasswordReset = useCallback(
    async (email) => {
      const result = await authResetPassword(email);
      if (!result.ok) {
        showToast(result.error, "error");
        return result;
      }
      showToast("Pokud účet existuje, poslali jsme odkaz pro obnovu hesla na e-mail.", "success");
      return result;
    },
    [showToast]
  );

  const completePasswordRecovery = useCallback(
    async (password, passwordConfirm) => {
      const check = validatePassword(password, passwordConfirm);
      if (!check.ok) {
        showToast(check.error, "error");
        return { ok: false, error: check.error };
      }
      const result = await authUpdatePassword(password);
      if (!result.ok) {
        showToast(result.error, "error");
        return result;
      }
      setPasswordRecovery(false);
      showToast("Heslo je nastavené. Můžete se přihlásit.", "success");
      await authSignOut();
      clearUserSession();
      setUser(null);
      return { ok: true };
    },
    [showToast]
  );

  const changePassword = useCallback(
    async (password, passwordConfirm) => {
      const check = validatePassword(password, passwordConfirm);
      if (!check.ok) {
        showToast(check.error, "error");
        return { ok: false, error: check.error };
      }
      const result = await authUpdatePassword(password);
      if (!result.ok) {
        showToast(result.error, "error");
        return result;
      }
      showToast("Heslo bylo změněno.", "success");
      return { ok: true };
    },
    [showToast]
  );

  const dismissPodplotStory = useCallback(() => {
    try {
      sessionStorage.removeItem("pp-show-podplot-story");
    } catch {
      /* ignore */
    }
    setShowPodplotStory(false);
    setActiveTab("home");
    setFeedMainMode("komunita");
    setFeedSubFilter("veci");
    setShowDiscoveryWall(true);
    setHomeModule(null);
    setExpandedPillar(null);
  }, []);

  const logout = useCallback(async () => {
    await authSignOut();
    clearUserSession();
    setUser(null);
    setPasswordRecovery(false);
    setLocations(DEFAULT_LOCATIONS);
    setActiveLocationId("domov");
    setCommunityGroups(getGroupsForLocation("domov"));
    setCredits(CURRENT_USER.credits);
    setTestRoleId("soused");
    setUserProfileIds(["soused"]);
    setServicesCatalog(SERVICES_CATALOG);
    setShowDiscoveryWall(true);
    setShowPodplotStory(false);
    try {
      sessionStorage.removeItem("pp-show-podplot-story");
    } catch {
      /* ignore */
    }
    setViewAsNeighbor(false);
    workUserBackupRef.current = null;
    setActiveTab("home");
    showToast("Odhlášeno. Pro vstup se znovu přihlaste nebo zaregistrujte.", "info");
  }, [showToast]);

  const setActiveLocation = useCallback(
    (id) => {
      if (id === activeLocationId) return;
      setActiveLocationId(id);
      const loc = locations.find((l) => l.id === id);
      setCommunityGroups(getGroupsForLocation(id));
      setFeedSubFilter(getDefaultSubfilter(feedMainMode));
      setMapRootKey((k) => k + 1);
      setNeighborsRootKey((k) => k + 1);
      clearModuleSelection();
      // Nikdy neukazovat sebe jako nového souseda po přepnutí místa
      setNeighbors((prev) => prev.filter((n) => !isSelfNeighborCandidate(n, user)));
      setNotifications((prev) =>
        prev.filter(
          (n) =>
            !(
              n.actionType === "trust_network" &&
              isSelfNeighborCandidate(n.neighborId, user)
            )
        )
      );
      notifyLocationRemap(id, loc);
    },
    [activeLocationId, locations, notifyLocationRemap, feedMainMode, clearModuleSelection, user]
  );

  const reportPost = useCallback(
    (postId, reason) => {
      setReportedPosts((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
      const label = reason === "spam" ? "Spam" : "Urážlivé";
      showToast(`Příspěvek nahlášen (${label}) — pro vás je skrytý.`, "info");
    },
    [showToast]
  );

  const reportEvent = useCallback(
    (eventId, reason) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) {
        showToast("Akce už neexistuje.", "info");
        return false;
      }
      if (ev.organizer === "Vy" || ev.organizer === user?.name) {
        showToast("Vlastní akci nelze nahlásit.", "info");
        return false;
      }

      const viewerId = user?.id ?? "me";
      const existing = eventReporterIds[eventId] ?? [];
      const already = existing.some((id) => isSameAppUser(id, viewerId));

      // Demo (SKIP_REGISTRATION): další nahlášení z téhož účtu počítáme jako další hlasy
      let reporterKey = viewerId;
      if (already) {
        if (!SKIP_REGISTRATION) {
          showToast("Tuto akci jste už nahlásili.", "info");
          return false;
        }
        reporterKey = `demo-${existing.length}-${Date.now()}`;
      }

      const nextReporters = [...existing, reporterKey];
      const count = nextReporters.length;
      const reasonLabel =
        reason === "inappropriate"
          ? "Nevhodná"
          : reason === "spam"
            ? "Spam"
            : reason === "offensive"
              ? "Urážlivé"
              : "Zavádějící";

      setEventReporterIds((prev) => ({ ...prev, [eventId]: nextReporters }));

      if (count >= EVENT_REPORT_DELETE_THRESHOLD) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        setJoinedEventIds((prev) => prev.filter((id) => id !== eventId));
        setEventReporterIds((prev) => {
          const { [eventId]: _, ...rest } = prev;
          return rest;
        });
        if (selectedEventId === eventId) setSelectedEventId(null);
        showToast(
          `Akce „${ev.title}“ byla smazána po ${EVENT_REPORT_DELETE_THRESHOLD} nahlášeních.`,
          "success"
        );
        return true;
      }

      showToast(
        `Akce nahlášena (${reasonLabel}) — ${count}/${EVENT_REPORT_DELETE_THRESHOLD}. Po ${EVENT_REPORT_DELETE_THRESHOLD} nahlášeních bude smazána.`,
        "info"
      );
      return true;
    },
    [events, eventReporterIds, user, showToast, selectedEventId]
  );

  const reportSecurityReport = useCallback(
    (reportId, reason) => {
      setReportedReports((prev) => (prev.includes(reportId) ? prev : [...prev, reportId]));
      const label = reason === "spam" ? "Spam" : "Urážlivé";
      showToast(`Hlášení nahlášeno (${label}).`, "info");
    },
    [showToast]
  );

  const reportUser = useCallback(
    (targetId, targetName, reason) => {
      const labels = { podvod: "Podvod", nevhodne: "Nevhodné chování", spam: "Spam" };
      setAdminReports((prev) => [
        { id: `ar-${Date.now()}`, targetId, targetName, reason, reporter: user?.name ?? "Anonym", time: "právě teď" },
        ...prev,
      ]);
      showToast(`Nahlášeno: ${targetName} (${labels[reason] ?? reason}).`, "info");
    },
    [showToast, user]
  );

  const blockUser = useCallback(
    (targetId) => {
      setBlockedUserIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
      showToast("Účet zablokován — obsah se nebude zobrazovat.", "info");
    },
    [showToast]
  );

  const confirmNeighbor = useCallback(
    (neighborId) => {
      if (!neighborId || isSelfNeighborCandidate(neighborId, user) || isCurrentUserRef(neighborId, user)) {
        showToast("Sama sebe jako souseda potvrdit nemůžete.", "info");
        return;
      }
      if (confirmationsGiven.includes(neighborId)) {
        showToast("Totoho souseda jste už potvrdili.", "info");
        return;
      }
      const nextGiven = [...confirmationsGiven, neighborId];
      setConfirmationsGiven(nextGiven);
      try {
        if (user?.id) {
          localStorage.setItem(`podplot-confirmations-v1-${user.id}`, JSON.stringify(nextGiven));
        }
      } catch {
        /* ignore */
      }
      void publishNeighborConfirmation(user?.id, neighborId, {
        name: user?.name,
        initials: user?.initials,
      });
      setNeighbors((prev) =>
        prev.map((n) =>
          n.id === neighborId
            ? { ...n, confirmations: (n.confirmations ?? 0) + 1, isNew: false }
            : n
        )
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.neighborId === neighborId || n.id === `n-trust-${neighborId}`
            ? { ...n, read: true }
            : n
        )
      );
      showToast("Potvrzení přidáno — děkujeme za budování důvěry.", "success");
    },
    [confirmationsGiven, showToast, user]
  );

  const dismissTrustNeighbor = useCallback(
    (neighborId) => {
      if (!neighborId) return;
      const next = [...new Set([...trustDismissedIdsRef.current, neighborId])];
      setTrustDismissedIds(next);
      trustDismissedIdsRef.current = next;
      try {
        if (user?.id) {
          localStorage.setItem(`podplot-trust-dismissed-v1-${user.id}`, JSON.stringify(next));
        }
      } catch {
        /* ignore */
      }
      setNeighbors((prev) =>
        prev.map((n) => (n.id === neighborId ? { ...n, isNew: false } : n))
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.neighborId === neighborId || n.id === `n-trust-${neighborId}`
            ? { ...n, read: true }
            : n
        )
      );
      showToast("V pořádku — tohoto souseda už nebudeme připomínat.", "info");
    },
    [showToast, user?.id]
  );

  const hideTrustHomePrompt = useCallback(() => {
    setTrustHomePromptHidden(true);
    try {
      if (user?.id) {
        localStorage.setItem(`podplot-trust-home-hidden-v1-${user.id}`, "1");
      }
    } catch {
      /* ignore */
    }
    showToast("Připomínky nových sousedů na Domů jsou skryté. Zapnete je znovu v profilu.", "info");
  }, [showToast, user?.id]);

  const showTrustHomePrompt = useCallback(() => {
    setTrustHomePromptHidden(false);
    try {
      if (user?.id) {
        localStorage.removeItem(`podplot-trust-home-hidden-v1-${user.id}`);
      }
    } catch {
      /* ignore */
    }
    showToast("Připomínky nových sousedů na Domů jsou znovu zapnuté.", "success");
  }, [showToast, user?.id]);

  const switchFeedMainMode = useCallback((mode) => {
    setFeedMainMode(mode);
    setFeedSubFilter(getDefaultSubfilter(mode));
    setShowDiscoveryWall(false);
    setExpandedPillar(mode);
  }, []);

  const togglePillar = useCallback((mode) => {
    const worldId =
      mode === "komunita" || mode === "sousede" || mode === "zbozi" || mode === "skupiny"
        ? "komunita"
        : mode === "sluzby"
          ? "pruvodce"
          : mode;
    setExpandedPillar((current) => {
      if (current === worldId) {
        setFeedMainMode("komunita");
        setFeedSubFilter("veci");
        setShowDiscoveryWall(true);
        return null;
      }
      setFeedMainMode(worldId);
      setFeedSubFilter(getDefaultSubfilter(worldId));
      setShowDiscoveryWall(false);
      return worldId;
    });
  }, []);

  const selectFeedSubFilter = useCallback((id) => {
    setFeedSubFilter(id);
    setShowDiscoveryWall(false);
  }, []);

  const setZboziSearch = useCallback((query) => {
    setZboziSearchQuery(query);
    if (query.trim()) setShowDiscoveryWall(false);
  }, []);

  const setZboziMarketCat = useCallback((catId) => {
    setZboziMarketCategory(catId);
    if (catId !== "vse") setShowDiscoveryWall(false);
  }, []);

  const setServicesSearch = useCallback((query) => {
    setServicesSearchQuery(query);
  }, []);

  const setServicesParentCat = useCallback((catId) => {
    setServicesParentCategory(catId);
  }, []);

  const getUiPref = useCallback(
    (key, defaultValue) => readPref(uiPreferences, key, defaultValue),
    [uiPreferences]
  );

  const setUiPref = useCallback((key, value) => {
    setUiPreferences((prev) => {
      const next = { ...prev, [key]: value };
      persistUiPreferences(next);
      return next;
    });
  }, []);

  const toggleUiPref = useCallback((key, defaultValue = false) => {
    setUiPreferences((prev) => {
      const current = readPref(prev, key, defaultValue);
      const next = { ...prev, [key]: !current };
      persistUiPreferences(next);
      return next;
    });
  }, []);

  const persistDismissedList = useCallback((key, ids) => {
    setUiPreferences((prev) => {
      const next = { ...prev, [key]: ids };
      persistUiPreferences(next);
      return next;
    });
  }, []);

  const goToHomeWall = useCallback(() => {
    setHomeModule(null);
    const officeHome =
      testRoleId === "urad" ||
      user?.accountType === "urad" ||
      user?.accountType === "instituce";
    setActiveTab(officeHome && !viewAsNeighbor ? "reports" : "home");
    setFeedMainMode("komunita");
    setFeedSubFilter("veci");
    setShowDiscoveryWall(true);
    setExpandedPillar(null);
    setZboziSearchQuery("");
    setZboziMarketCategory("vse");
    setLocalGuideSearchQuery("");
  }, [testRoleId, user?.accountType, viewAsNeighbor]);

  /** Tokeny pro návrat na úvod sekce při opětovném klepnutí na spodní ikonu */
  const [neighborsRootKey, setNeighborsRootKey] = useState(0);
  const [mapRootKey, setMapRootKey] = useState(0);
  const [catalogRootKey, setCatalogRootKey] = useState(0);

  const selectMainTab = useCallback(
    (tabId) => {
      if (tabId === "home") {
        goToHomeWall();
        return;
      }
      if (tabId === "neighbors") {
        setPendingNeighborsSection(null);
        setNeighborsRootKey((k) => k + 1);
      }
      if (tabId === "map") {
        clearMapFocus();
        setMapRootKey((k) => k + 1);
      }
      if (tabId === "catalog") {
        setCatalogRootKey((k) => k + 1);
      }
      setActiveTab(tabId);
    },
    [goToHomeWall, clearMapFocus]
  );

  const proposeGroup = useCallback(
    ({ name, description, purpose, clubCategory = null }) => {
      const id = `prop-${Date.now()}`;
      const cat = clubCategory ? getClubCategory(clubCategory) : null;
      setGroupProposals((prev) => [
        {
          id,
          name,
          description,
          purpose,
          clubCategory: clubCategory || null,
          categoryId: clubCategory || null,
          tag: cat?.label ?? "Skupiny",
          votes: 1,
          required: CLUB_VOTES_REQUIRED,
          voted: true,
          active: false,
          proposer: user?.name ?? "Vy",
          status: "v-priprave",
        },
        ...prev,
      ]);
      showToast(`Skupina „${name}" je V přípravě — 1 / ${CLUB_VOTES_REQUIRED} podpor.`);
    },
    [showToast, user]
  );

  const voteGroupProposal = useCallback(
    (id) => {
      setGroupProposals((prev) => {
        let activated = null;
        const updated = prev.map((p) => {
          if (p.id !== id || p.voted || p.votes >= p.required) return p;
          const votes = p.votes + 1;
          const active = votes >= p.required;
          if (active) activated = { ...p, votes, voted: true, active: true };
          return { ...p, votes, voted: true, active: active || p.active };
        });

        if (activated) {
          const groupId = activated.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 24) || `skupina-${Date.now()}`;

          setCommunityGroups((groups) => {
            if (groups.some((g) => g.id === groupId)) return groups;
            return [
              ...groups,
              {
                id: groupId,
                name: activated.name,
                emoji: "👥",
                members: 1,
                clubCategory: activated.clubCategory || activated.categoryId || null,
                description: activated.description,
              },
            ];
          });

          setTimeout(
            () =>
              showToast(
                `Skupina „${activated.name}" je aktivní — objevila se v příslušné kategorii.`
              ),
            0
          );

          return updated.filter((p) => p.id !== id);
        }

        const proposal = prev.find((p) => p.id === id);
        if (proposal && !proposal.voted && proposal.votes < proposal.required) {
          showToast(`Podpora přičtena — ${proposal.votes + 1} / ${proposal.required}.`);
        }
        return updated;
      });
    },
    [showToast]
  );

  const addSecurityReport = useCallback(
    ({ type, body, urgent = false, urgentScope = URGENT_SCOPE.LOCAL, mapPos = null, alsoAsPrompt = false, photos = [], validUntil = null, reportCategoryId = null, lossKind = null }) => {
      if (!user) return;
      const isMunicipalityWide = urgent && urgentScope === URGENT_SCOPE.MUNICIPALITY;
      const rawMapPos = isMunicipalityWide ? mapPos ?? { x: 50, y: 50 } : mapPos;
      let normalizedMapPos;
      if (isValidMapPos(rawMapPos)) {
        normalizedMapPos = clampMapPos(Number(rawMapPos.x), Number(rawMapPos.y));
      } else if (rawMapPos?.lat != null && rawMapPos?.lng != null && activeLocation) {
        normalizedMapPos = latLngToMapPos(
          rawMapPos.lat,
          rawMapPos.lng,
          activeLocation,
          reportsMapRadiusKm
        );
      } else {
        normalizedMapPos = clampMapPos(52, 47);
      }
      const gpsLat = rawMapPos?.lat ?? rawMapPos?.mapPos?.lat ?? null;
      const gpsLng = rawMapPos?.lng ?? rawMapPos?.mapPos?.lng ?? null;
      const pointDistance = mapPos
        ? posToDistanceLabel(normalizedMapPos.x, normalizedMapPos.y, undefined, undefined, reportsMapRadiusKm)
        : "0 m · vaše hlášení";
      const distance = resolveReportDistance({ urgent, urgentScope }, pointDistance);
      const photoUrls = photos.map((p) => (typeof p === "string" ? p : p.url)).filter(Boolean);
      const createdAt = new Date().toISOString();
      const validUntilIso = validUntil ? new Date(validUntil).toISOString() : null;
      const expiresAt = computeExpiresAt(createdAt, validUntilIso);
      const report = {
        id: `rep-${Date.now()}`,
        role: user.role,
        author: user.name,
        authorInitials: user.initials,
        accountType: user.accountType,
        type,
        body,
        reportCategoryId,
        lossKind: reportCategoryId === "loss" ? lossKind || null : null,
        distance,
        time: "Právě teď",
        createdAt,
        validUntil: validUntilIso,
        expiresAt,
        confirmations: 0,
        urgent,
        urgentScope: urgent ? urgentScope : null,
        mine: true,
        mapPos:
          gpsLat != null && gpsLng != null
            ? { ...normalizedMapPos, lat: gpsLat, lng: gpsLng }
            : normalizedMapPos,
        lat: gpsLat,
        lng: gpsLng,
        photos: photoUrls,
        locationId: activeLocationId,
        municipality: activeLocation?.municipality ?? null,
      };
      setUserReports((prev) => [report, ...prev]);
      setExtraReports((prev) => [report, ...prev]);

      // Živé sousedské dění — hlášení (vč. tipů) hned nahoře ve feedu
      const isTip = reportCategoryId === "tip";
      const feedPost = {
        id: `feed-${report.id}`,
        role: user.role,
        accountType: user.accountType,
        author: user.name,
        authorId: user.id ?? "me",
        initials: user.initials,
        title: type,
        body,
        meta: `${distance} · Právě teď`,
        type: isTip ? "Tip" : "Hlášení",
        feedType: "komunita",
        feedSubtype: "hlaseni",
        reportCategoryId,
        interactionType: isTip ? "tip" : undefined,
        mine: true,
        photos: photoUrls,
        isVerified: user.isVerified ?? false,
        locationId: activeLocationId,
        municipality: activeLocation?.municipality ?? null,
        fromSecurityReportId: report.id,
        mapPos: report.mapPos,
        placeLabel: report.placeLabel ?? null,
        createdAt,
        lat: report.lat ?? null,
        lng: report.lng ?? null,
      };
      setUserPosts((prev) => [feedPost, ...prev]);
      void publishRemotePost(feedPost, user);

      if (alsoAsPrompt) {
        const prompt = {
          id: `mp-${Date.now()}`,
          title: type,
          body,
          status: "new",
          statusLabel: getPromptStatusLabel("new"),
          authorId: user.id ?? "me",
          authorName: user.name,
          time: "Právě teď",
          callId: null,
          callTitle: null,
          mapPos: normalizedMapPos,
          distance: mapPos ? distance : null,
          mine: true,
          fromReportId: report.id,
        };
        setMunicipalityPrompts((prev) => [prompt, ...prev]);
        setExtraReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  alsoAsPrompt: true,
                  officeStatus: "new",
                  officeStatusLabel: getPromptStatusLabel("new"),
                  publicOfficeNotes: [],
                }
              : r
          )
        );
        setUserReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  alsoAsPrompt: true,
                  officeStatus: "new",
                  officeStatusLabel: getPromptStatusLabel("new"),
                  publicOfficeNotes: [],
                }
              : r
          )
        );
      }

      if (urgent && (isAdminMode || user?.accountType === "urad" || user?.accountType === "instituce")) {
        const audience = describeUrgentAudience(report, activeLocation?.municipality ?? "obec");
        setSosAlert({
          title: type,
          body,
          locationId: activeLocationId,
          municipality: activeLocation?.municipality,
          location: isMunicipalityWide
            ? `${activeLocation?.municipality ?? activeLocation?.shortLabel} · celá obec`
            : activeLocation?.shortLabel ?? user.location,
          urgentScope: report.urgentScope,
        });
        setNotifications((prev) => [
          {
            id: `n-${Date.now()}`,
            type: "red",
            title: type,
            body: `${body} · ${audience}`,
            read: false,
            time: "právě teď",
          },
          ...prev,
        ]);
        showToast(`${audience} — SOS varování odesláno.`, "error");
      } else if (urgent) {
        showToast(
          `Urgentní hlášení v okolí místa (cca ${URGENT_LOCAL_RADIUS_M} m). Plné SOS mohou vydat úřad nebo admin.`,
          "info"
        );
      } else if (alsoAsPrompt) {
        showToast("Hlášení je na mapě, v živém dění a u úřadu jako podnět.");
      } else {
        showToast("Hlášení je na mapě a nahoře v živém sousedském dění.");
      }
      goToHomeWall();
    },
    [user, showToast, isAdminMode, activeLocation, activeLocationId, reportsMapRadiusKm, goToHomeWall]
  );

  const submitMunicipalityPrompt = useCallback(
    ({ title, body, mapPos = null, callId = null }) => {
      if (!user || !title.trim() || !body.trim()) return;
      const distance = mapPos
        ? posToDistanceLabel(mapPos.x, mapPos.y, undefined, undefined, reportsMapRadiusKm)
        : null;
      const call = callId ? promptCalls.find((c) => c.id === callId) : null;
      const prompt = {
        id: `mp-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        status: "new",
        statusLabel: getPromptStatusLabel("new"),
        authorId: user.id ?? "me",
        authorName: user.name,
        time: "Právě teď",
        callId: call?.id ?? null,
        callTitle: call?.title ?? null,
        mapPos,
        distance,
        mine: true,
      };
      setMunicipalityPrompts((prev) => [prompt, ...prev]);
      showToast(
        call ? `Podnět odeslán v rámci výzvy „${call.title}".` : "Podnět odeslán obecnímu úřadu.",
        "success"
      );
    },
    [user, showToast, promptCalls, reportsMapRadiusKm]
  );

  const createPromptCall = useCallback(
    ({ title, body, deadline = "" }) => {
      if (!title.trim() || !body.trim()) return;
      const call = {
        id: `pc-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        deadline: deadline.trim() || null,
        author: user?.name ?? "Městský úřad Jesenice",
        active: true,
        createdAt: "právě teď",
      };
      setPromptCalls((prev) => [call, ...prev]);
      showToast("Výzva zveřejněna — sousedé ji najdou v kategorii Výzvy.", "success");
    },
    [user, showToast]
  );

  const dismissPromptCall = useCallback(
    (callId) => {
      setDismissedPromptCallIds((prev) => {
        if (prev.includes(callId)) return prev;
        const next = [...prev, callId];
        persistDismissedList(UI_KEYS.DISMISSED_PROMPT_CALLS, next);
        return next;
      });
      showToast("Výzva skryta — najdete ji v kategorii Výzvy.", "info");
    },
    [showToast, persistDismissedList]
  );

  const restorePromptCall = useCallback(
    (callId) => {
      setDismissedPromptCallIds((prev) => {
        const next = prev.filter((id) => id !== callId);
        persistDismissedList(UI_KEYS.DISMISSED_PROMPT_CALLS, next);
        return next;
      });
      showToast("Výzva je znovu nahoře v Hlášeních.", "info");
    },
    [showToast, persistDismissedList]
  );

  const dismissGroupProposal = useCallback(
    (proposalId) => {
      setDismissedGroupProposalIds((prev) => {
        if (prev.includes(proposalId)) return prev;
        const next = [...prev, proposalId];
        persistDismissedList(UI_KEYS.DISMISSED_GROUP_PROPOSALS, next);
        return next;
      });
      showToast("Návrh skupiny skryt — obnovíte ho v archivu níže.", "info");
    },
    [showToast, persistDismissedList]
  );

  const restoreGroupProposal = useCallback(
    (proposalId) => {
      setDismissedGroupProposalIds((prev) => {
        const next = prev.filter((id) => id !== proposalId);
        persistDismissedList(UI_KEYS.DISMISSED_GROUP_PROPOSALS, next);
        return next;
      });
      showToast("Návrh skupiny je znovu v přehledu.", "info");
    },
    [showToast, persistDismissedList]
  );

  const triggerSos = useCallback(
    ({ title, body }) => {
      setSosAlert({ title, body, location: activeLocation?.shortLabel ?? "Lokalita" });
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, type: "red", title, body, read: false, time: "právě teď" },
        ...prev,
      ]);
    },
    [activeLocation]
  );

  const dismissSos = useCallback(() => setSosAlert(null), []);

  const appUserRole = useMemo(() => getAppRoleFromTestId(testRoleId), [testRoleId]);
  const isB2BWorkMode = isB2BRole(appUserRole) && !viewAsNeighbor;
  const isMobilniWorkMode =
    isB2BWorkMode &&
    (isMobilniTestRole(testRoleId) || resolveBusinessSubtype(user) === "mobilni");
  const isFyzickaWorkMode =
    isB2BWorkMode &&
    !isMobilniWorkMode &&
    (isFyzickaTestRole(testRoleId) ||
      resolveBusinessSubtype(user) === "fyzicka" ||
      (appUserRole === APP_ROLES.BUSINESS && !isMobilniTestRole(testRoleId)));

  const setCraftsmanRadius = useCallback(
    (km) => {
      const next = Number(km);
      setCraftsmanRadiusState(next);
      setServicesCatalog((prev) =>
        prev.map((s) => {
          const mine =
            (user?.id && s.ownerUserId === user.id) ||
            (testRoleId === "remeslnik" && s.id === "svc1");
          if (!mine) return s;
          return {
            ...s,
            actionRadius: isNationwideRadius(next) ? 999 : next,
          };
        })
      );
    },
    [user?.id, testRoleId]
  );

  useEffect(() => {
    const timer = setInterval(() => setInquiryClock(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const createInvoice = useCallback(
    ({ clientName, description, amount }) => {
      if (!clientName?.trim() || !description?.trim() || !(Number(amount) > 0)) {
        showToast("Vyplňte odběratele, popis práce a částku.", "error");
        return false;
      }
      setCraftsmanInvoices((prev) => [
        {
          id: `inv-${Date.now()}`,
          clientName: clientName.trim(),
          description: description.trim(),
          amount: Number(amount),
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      setInvoiceOpen(false);
      showToast(`Faktura pro ${clientName.trim()} · ${Number(amount)} Kč uložena.`, "success");
      return true;
    },
    [showToast]
  );

  const toggleViewAsNeighbor = useCallback(() => {
    if (!viewAsNeighbor) {
      if (user) workUserBackupRef.current = { ...user };
      setViewAsNeighbor(true);
      setUser({
        ...getDevTestUser(),
        notificationPrefs: {
          ...(user?.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS),
        },
      });
      setActiveTab("home");
      showToast("Přepnuto na sousedský profil.", "info");
      return;
    }
    setViewAsNeighbor(false);
    if (workUserBackupRef.current) {
      setUser(workUserBackupRef.current);
      workUserBackupRef.current = null;
    }
    showToast(
      appUserRole === APP_ROLES.OFFICE
        ? "Přepnuto na účet úřadu."
        : "Přepnuto na pracovní profil.",
      "info"
    );
  }, [viewAsNeighbor, user, showToast, appUserRole]);

  const markPostUseful = useCallback(
    (postId) => {
      if (myUsefulPosts.includes(postId)) return;
      setMyUsefulPosts((prev) => [...prev, postId]);
      setUsefulCounts((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
      showToast("Označeno jako užitečné — díky za zpětnou vazbu!", "success");
    },
    [myUsefulPosts, showToast]
  );

  const getUsefulCount = useCallback((postId) => usefulCounts[postId] ?? 0, [usefulCounts]);
  const hasMarkedUseful = useCallback((postId) => myUsefulPosts.includes(postId), [myUsefulPosts]);

  const isHelpOfferActive = useCallback((offer, now = Date.now()) => {
    if (!offer) return false;
    if (offer.expiresAt) return new Date(offer.expiresAt).getTime() > now;
    if (offer.createdAt) return new Date(offer.createdAt).getTime() + 48 * 60 * 60 * 1000 > now;
    return true;
  }, []);

  const offerHelpOnPost = useCallback(
    ({ postId, authorId, authorName, postTitle }) => {
      if (!postId) return;
      const helperId = user?.id ?? "me";
      const helperName = user?.name ?? "Vy";
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const helpPost = neighborHelp.find((h) => h.id === postId);
      const resolvedTitle =
        postTitle?.trim() ||
        helpPost?.title ||
        userPosts.find((p) => p.id === postId)?.title ||
        userGroupPosts.find((p) => p.id === postId)?.title ||
        "Žádost o pomoc";
      const participantId = authorId || helpPost?.authorId || postId;
      const participantName = authorName || helpPost?.author || "Soused";

      let already = false;
      setHelpOffersByPost((prev) => {
        const list = prev[postId] ?? [];
        if (list.some((o) => (o.helperId === helperId || o.helperId === "me") && isHelpOfferActive(o))) {
          already = true;
          return prev;
        }
        return {
          ...prev,
          [postId]: [
            ...list,
            {
              helperId,
              helperName,
              time: nowTime(),
              createdAt,
              expiresAt,
              authorId: participantId,
              authorName: participantName,
              postTitle: resolvedTitle,
            },
          ],
        };
      });
      if (already) {
        showToast("Tuto nabídku pomoci už máte aktivní (platí 48 hodin).", "info");
        return;
      }

      const offerMessage = `Nabízím pomoc u „${resolvedTitle}“. Domluvíme detaily?`;
      setHelpOfferChatKickoff({
        participantId,
        participantName,
        message: offerMessage,
        topic: {
          kind: "help",
          refId: postId,
          title: resolvedTitle,
          label: "Výpomoc",
        },
      });

      setNotifications((prev) => [
        {
          id: `n-help-${Date.now()}`,
          type: "green",
          title: `${helperName} nabízí pomoc`,
          body: `U „${resolvedTitle}" — nová konverzace ve zprávách.`,
          read: false,
          time: "právě teď",
          postId,
          participantId,
          participantName,
        },
        ...prev,
      ]);
      showToast("Nabídka odeslána ve zprávách — můžete domluvit detaily.", "success");
    },
    [user, showToast, neighborHelp, userPosts, userGroupPosts, isHelpOfferActive]
  );

  const getHelpOffers = useCallback(
    (postId) => (helpOffersByPost[postId] ?? []).filter((o) => isHelpOfferActive(o)),
    [helpOffersByPost, isHelpOfferActive]
  );

  const hasOfferedHelp = useCallback(
    (postId) => {
      const uid = user?.id ?? "me";
      return (helpOffersByPost[postId] ?? []).some(
        (o) => (o.helperId === uid || o.helperId === "me") && isHelpOfferActive(o)
      );
    },
    [helpOffersByPost, user, isHelpOfferActive]
  );

  const myHelpOffers = useMemo(() => {
    const uid = user?.id ?? "me";
    const now = Date.now();
    const list = [];
    for (const [postId, offers] of Object.entries(helpOffersByPost)) {
      for (const o of offers) {
        if ((o.helperId === uid || o.helperId === "me") && isHelpOfferActive(o, now)) {
          list.push({ ...o, postId });
        }
      }
    }
    return list.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
  }, [helpOffersByPost, user, isHelpOfferActive]);

  const helpSearchOnPost = useCallback(
    (postId) => {
      if (mySearchHelpPosts.includes(postId)) return;
      setMySearchHelpPosts((prev) => [...prev, postId]);
      setSearchHelpCounts((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
      setSearchHighlightedPosts((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
      showToast("Pomáháte hledat — příspěvek zůstane zvýrazněný v okolí.", "success");
    },
    [mySearchHelpPosts, showToast]
  );

  const getSearchHelpCount = useCallback((postId) => searchHelpCounts[postId] ?? 0, [searchHelpCounts]);
  const hasHelpedSearch = useCallback((postId) => mySearchHelpPosts.includes(postId), [mySearchHelpPosts]);
  const isSearchHighlighted = useCallback(
    (postId) => searchHighlightedPosts.includes(postId),
    [searchHighlightedPosts]
  );

  const addUserProfile = useCallback((roleId) => {
    if (roleId === "urad") return;
    setUserProfileIds((prev) => (prev.includes(roleId) ? prev : [...prev, roleId]));
  }, []);

  const openOfficePromptCall = useCallback(() => {
    setPendingOfficeAction("call");
    setActiveTab("reports");
    setPlusMenuOpen(false);
  }, []);

  const openOfficeAnnouncementComposer = useCallback(() => {
    setPendingOfficeAction("announce");
    setActiveTab("crisis");
    setPlusMenuOpen(false);
  }, []);

  /** @deprecated použijte openOfficeAnnouncementComposer */
  const openOfficeCrisisComposer = openOfficeAnnouncementComposer;

  const clearPendingOfficeAction = useCallback(() => {
    setPendingOfficeAction(null);
  }, []);

  const switchTestRole = useCallback(
    (roleId) => {
      const role = getTestRole(roleId);
      if (!role || !user) return;
      setTestRoleId(roleId);
      setViewAsNeighbor(false);
      workUserBackupRef.current = null;
      setWorkDashboardTab("poptavky");
      if (roleId !== "urad" && role.accountType !== "urad" && role.accountType !== "instituce") {
        setUserProfileIds((prev) => (prev.includes(roleId) ? prev : [...prev, roleId]));
      }
      if (roleId === "soused") {
        // Soused nemá B2B personu — vždy obnovit výchozí testovací profil (jméno, adresa, …)
        setUser(getDevTestUser());
      } else {
        const personaKey = role.personaKey ?? roleId;
        const persona = TEST_PERSONAS[personaKey];
        setUser((u) => ({
          ...u,
          id: persona?.id ?? u.id,
          name: persona?.name ?? u.name,
          initials: persona?.initials ?? u.initials,
          accountType: role.accountType,
          businessSubtype: role.businessSubtype ?? null,
          role: role.role,
          ico: persona?.ico ?? null,
          isVerified: persona?.isVerified ?? u.isVerified,
          verifiedDomain: persona?.verifiedDomain ?? persona?.allowedEmailDomain ?? null,
          businessName: persona?.businessName ?? null,
          institutionId: roleId === "urad" ? persona?.institutionId ?? persona?.id ?? null : null,
          institutionRole: roleId === "urad" ? "admin" : null,
        }));
      }
      if (roleId === "urad" || role.accountType === "urad" || role.accountType === "instituce") {
        setActiveTab("reports");
        setProfileOpen(false);
        setMessagesOpen(false);
      } else if (roleId === "soused") {
        setActiveTab("home");
      } else {
        setActiveTab("home");
      }
      if (roleId === "podnik" || role.businessSubtype === "fyzicka") {
        const hours = TEST_PERSONAS.podnik?.hours;
        if (hours) setBusinessHours(hours);
        setBusinessIsOpen(true);
      }
      if (isMobilniTestRole(roleId)) {
        setB2bInquiries(
          CRAFTSMAN_NEARBY_REQUESTS.map((r) => ({
            id: `bi-seed-${r.id}`,
            type: "service_request",
            title: r.title,
            text: r.text,
            author: r.author,
            authorId: r.authorId,
            time: r.time,
            distanceKm: r.distanceKm,
            categoryLabel: r.categoryLabel,
            profession: r.profession,
            read: false,
            priority: "immediate",
            visibleAt: Date.now(),
          }))
        );
      } else if (roleId === "podnik" || roleId === "urad") {
        setB2bInquiries([]);
      }
      showToast(`Přepnuto: ${role.label}`, "info");
    },
    [user, showToast]
  );

  const acknowledgeNews = useCallback((id) => {
    setAcknowledgedNewsIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const updateNotificationPrefs = useCallback((patch) => {
    setNotificationPrefs((prev) => ({ ...prev, ...patch }));
    setUser((u) =>
      u ? { ...u, notificationPrefs: { ...(u.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS), ...patch } } : u
    );
  }, []);

  const toggleLunchMenuAlerts = useCallback(
    (enabled) => {
      updateNotificationPrefs({ lunchMenuAlerts: enabled });
      showToast(
        enabled
          ? "Zapnuto — budete dostávat upozornění na polední menu v okolí."
          : "Vypnuto — upozornění na polední menu nebudete dostávat.",
        "info"
      );
    },
    [updateNotificationPrefs, showToast]
  );

  const toggleMessageAlerts = useCallback(
    async (enabled) => {
      if (enabled) {
        const result = await requestNotificationPermission();
        if (!result.ok) {
          setStoredMessageAlertsPref(false);
          updateNotificationPrefs({ messageAlerts: false });
          if (result.permission === "denied") {
            showToast(
              "Prohlížeč blokuje upozornění. Povolte je v nastavení webu / telefonu.",
              "error"
            );
          } else if (result.permission === "unsupported") {
            showToast("Tento prohlížeč systémová upozornění nepodporuje.", "error");
          } else {
            showToast("Bez povolení upozornění se zprávy neozvou venku z appky.", "info");
          }
          return;
        }
        setStoredMessageAlertsPref(true);
        updateNotificationPrefs({ messageAlerts: true });
        showToast("Zapnuto — při nové zprávě vyskočí upozornění v telefonu.", "success");
        void showMessageNotification({
          title: "Podplot",
          body: "Upozornění na zprávy jsou zapnutá.",
          tag: "podplot-msg-test",
        });
        return;
      }
      setStoredMessageAlertsPref(false);
      updateNotificationPrefs({ messageAlerts: false });
      showToast("Vypnuto — systémová upozornění na zprávy nebudete dostávat.", "info");
    },
    [updateNotificationPrefs, showToast]
  );

  const subscribeMobilniPush = useCallback(() => {
    const cost = MOBILNI_PUSH_SUBSCRIPTION.price;
    if (!payAmount(cost, "wallet")) return false;
    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    setBusinessNotificationPrefs({
      serviceRequestPushEnabled: true,
      serviceRequestPushUntil: until.toISOString().slice(0, 10),
    });
    setServicesCatalog((prev) =>
      prev.map((s) => {
        const mine =
          (user?.id && s.ownerUserId === user.id) ||
          (testRoleId === "remeslnik" && s.id === "svc1");
        return mine ? { ...s, pushPoptavkyEnabled: true } : s;
      })
    );
    showToast(
      `Push poptávky aktivní do ${until.toLocaleDateString("cs-CZ")} — budete upozorněni jako první.`,
      "success"
    );
    return true;
  }, [payAmount, showToast, user?.id, testRoleId]);

  const toggleLunchSubscription = useCallback(
    (businessId, businessName) => {
      setLunchSubscriptions((prev) => {
        if (prev.includes(businessId)) {
          showToast(`Odhlášeno odběru menu — ${businessName}`, "info");
          return prev.filter((id) => id !== businessId);
        }
        showToast(`Odebíráte polední menu — ${businessName}`, "success");
        return [...prev, businessId];
      });
    },
    [showToast]
  );

  const openBusinessComposer = useCallback((action = "note") => {
    setPendingBusinessAction(action);
    setActiveTab("home");
    setPlusMenuOpen(false);
  }, []);

  const clearPendingBusinessAction = useCallback(() => {
    setPendingBusinessAction(null);
  }, []);

  const publishBusinessNeighborNote = useCallback(
    (text) => {
      const note = (text ?? businessNeighborNote).trim();
      if (!note) {
        showToast("Napište text sdělení pro sousedy.", "error");
        return false;
      }
      setBusinessNeighborNote(note);
      setNotifications((prev) => [
        {
          id: `n-biz-note-${Date.now()}`,
          type: "green",
          title: `${user?.name ?? "Provozovna"} — aktualita`,
          body: note.slice(0, 90),
          read: false,
          time: "právě teď",
        },
        ...prev,
      ]);
      showToast("Sdělení pro sousedy je aktivní.", "success");
      return true;
    },
    [businessNeighborNote, showToast, user?.name]
  );

  const publishLunchMenu = useCallback(
    (planId) => {
      const plans = { free: 0, push: LUNCH_MENU_PUSH_PRICE, top: 49 };
      const cost = plans[planId] ?? 0;
      if (cost && !payAmount(cost, "wallet")) return;
      const isTop = planId === "top";
      const withPush = planId === "push";
      const businessName = user?.name ?? "Restaurace U Ráje";
      setLunchMenus((prev) =>
        prev.map((m) =>
          m.businessId === "sp1"
            ? {
                ...m,
                menuText: lunchMenuDraft,
                isTop: isTop || (planId === "top" ? true : m.isTop),
                publishedPlan: planId,
                date: new Date().toISOString().slice(0, 10),
              }
            : m
        )
      );
      if (withPush) {
        const prefs = user?.notificationPrefs ?? notificationPrefs;
        const subscriberCount =
          lunchSubscribersCount +
          (prefs.lunchMenuAlerts ? 1 : 0) +
          lunchSubscriptions.length;
        setNotifications((prev) => [
          {
            id: `n-lunch-${Date.now()}`,
            type: "green",
            title: `${businessName} právě publikovala dnešní polední menu!`,
            body: lunchMenuDraft.slice(0, 80),
            read: false,
            time: "právě teď",
          },
          ...prev,
        ]);
        showToast(
          `Menu publikováno + push odeslán ${subscriberCount} sousedům v okolí (zájem o polední menu).`,
          "success"
        );
        return;
      }
      showToast(
        planId === "free"
          ? "Menu publikováno ve widgetu (bez notifikace)."
          : "Menu topováno na první pozici dne."
      );
    },
    [lunchMenuDraft, payAmount, showToast, lunchSubscriptions.length, lunchSubscribersCount, user, notificationPrefs]
  );

  const publishAreaNews = useCallback(() => {
    const title = areaNewsTitleDraft.trim();
    const body = areaNewsBodyDraft.trim();
    if (!title || !body) {
      showToast("Vyplňte nadpis i text aktuality.", "error");
      return;
    }
    const item = {
      id: `an-${Date.now()}`,
      type: "info",
      municipality: activeLocation?.municipality ?? "Jesenice",
      locationIds: [activeLocationId],
      title,
      body,
      author: "Obec Jesenice",
      time: "právě teď",
      role: "urad",
    };
    setAreaNewsList((prev) => [item, ...prev]);
    setAreaNewsTitleDraft("");
    setAreaNewsBodyDraft("");
    showToast("Plošná aktualita publikována na domovskou zeď.", "success");
  }, [areaNewsTitleDraft, areaNewsBodyDraft, activeLocation, activeLocationId, showToast]);

  const publishCrisisAlert = useCallback(() => {
    const title = crisisTitleDraft.trim();
    const body = crisisBodyDraft.trim();
    if (!title || !body) {
      showToast("Vyplňte nadpis i text krizového hlášení.", "error");
      return;
    }
    const item = {
      id: `cr-${Date.now()}`,
      type: "crisis",
      municipality: activeLocation?.municipality ?? "Jesenice",
      locationIds: [activeLocationId],
      title,
      body,
      author: "Obec Jesenice · SOS",
      time: "právě teď",
      role: "urad",
      active: true,
    };
    setAreaNewsList((prev) => [item, ...prev.map((n) => (n.type === "crisis" ? { ...n, active: false } : n))]);
    setCrisisTitleDraft("");
    setCrisisBodyDraft("");
    triggerSos({ title: item.title, body: item.body });
    showToast("Krizové SOS aktivováno — zobrazeno nad domovskou obrazovkou.", "error");
  }, [crisisTitleDraft, crisisBodyDraft, activeLocation, activeLocationId, showToast, triggerSos]);

  const createOfficePrompt = useCallback(() => {
    const title = officePromptTitleDraft.trim();
    const body = officePromptBodyDraft.trim();
    if (!title || !body) {
      showToast("Vyplňte nadpis i text podnětu.", "error");
      return;
    }
    const prompt = {
      id: `mp-office-${Date.now()}`,
      title,
      body,
      status: "new",
      statusLabel: getPromptStatusLabel("new"),
      authorId: user?.id ?? "urad",
      authorName: user?.name ?? "Městský úřad Jesenice",
      authorRole: "urad",
      fromOffice: true,
      time: "právě teď",
      callId: null,
      mapPos: null,
      distance: null,
    };
    setMunicipalityPrompts((prev) => [prompt, ...prev]);
    setOfficePromptTitleDraft("");
    setOfficePromptBodyDraft("");
    showToast("Podnět úřadu uložen do evidence.", "success");
  }, [officePromptTitleDraft, officePromptBodyDraft, user, showToast]);

  const patchReportLinkedToPrompt = useCallback((fromReportId, patchFn) => {
    if (!fromReportId) return;
    const apply = (prev) =>
      prev.map((r) => (r.id === fromReportId ? { ...r, ...patchFn(r) } : r));
    setExtraReports(apply);
    setUserReports(apply);
  }, []);

  const myMunicipalityPrompts = useMemo(
    () =>
      municipalityPrompts.filter(
        (p) => p.mine || p.authorId === user?.id || p.authorName === user?.name
      ),
    [municipalityPrompts, user?.id, user?.name]
  );

  const withdrawToBank = useCallback(
    (amount, account) => {
      if (!account?.trim()) {
        showToast("Zadejte číslo účtu.", "error");
        return;
      }
      showToast(`Převod ${amount} Kč na účet ${account} odeslán (simulace).`, "success");
      if (testRoleId === "remeslnik") setCraftsmanWallet((w) => Math.max(0, w - amount));
      if (testRoleId === "podnik") setBusinessWallet((w) => Math.max(0, w - amount));
    },
    [showToast, testRoleId]
  );

  const createEscrowOrder = useCallback(
    ({ title, amount, method = "wallet" }) => {
      if (!payAmount(amount, method)) return;
      const { providerGets } = calcEscrowFee(amount);
      setServiceOrders((prev) => [
        {
          id: `so-${Date.now()}`,
          title,
          amount,
          escrow: true,
          status: "held",
          providerRole: "remeslnik",
          escrowStatusLabel: ESCROW_STATUSES.held,
          providerGets,
        },
        ...prev,
      ]);
      showToast(`Platba ${amount} Kč v bezpečné úschově Podplotu (poplatek 3 %).`, "success");
    },
    [payAmount, showToast]
  );

  const releaseEscrowOrder = useCallback(
    (orderId) => {
      setServiceOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const payout = o.providerGets ?? calcEscrowFee(o.amount).providerGets;
          setCraftsmanWallet((w) => w + payout);
          return { ...o, status: "released", escrowStatusLabel: ESCROW_STATUSES.released };
        })
      );
      showToast("Práce potvrzena — řemeslníkovi připsáno do peněženky.", "success");
    },
    [showToast]
  );

  const openCreate = useCallback(
    (categoryId = null, groupId = null) => {
      if (isB2BWorkMode) {
        showToast(
          "Reklamní nabídky a akce nepatří do sousedského feedu. Služby a ceník spravujte v katalogovém profilu.",
          "error"
        );
        return;
      }
      let resolvedCategory = categoryId;
      if (!resolvedCategory && !groupId && feedMainMode === "zbozi") {
        if (feedSubFilter && feedSubFilter !== "vse") {
          resolvedCategory = feedSubFilter;
        }
      }
      setEditingPost(null);
      setCreateCategory(resolvedCategory);
      setCreateGroupId(groupId);
      setCreateOpen(true);
    },
    [feedMainMode, feedSubFilter, isB2BWorkMode, showToast]
  );

  const openEditListing = useCallback(
    (post) => {
      if (!post?.mine) {
        showToast("Upravit můžete jen vlastní příspěvek.", "info");
        return;
      }
      setEditingPost(post);
      setCreateCategory(post.categoryId ?? null);
      setCreateGroupId(post.groupId ?? null);
      setCreateOpen(true);
    },
    [showToast]
  );

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    setCreateCategory(null);
    setCreateGroupId(null);
    setEditingPost(null);
  }, []);

  const updateUserPost = useCallback(
    (postId, patch) => {
      if (!postId || !patch) return false;
      const updatedAt = Date.now();
      const apply = (p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          ...patch,
          title: patch.title != null ? String(patch.title).trim() : p.title,
          body: patch.body != null ? String(patch.body).trim() : p.body,
          updatedAt,
        };
      };
      setUserPosts((prev) => prev.map(apply));
      setUserGroupPosts((prev) => prev.map(apply));
      setUserLendingItems((prev) =>
        prev.map((item) => {
          if (item.id !== postId && item.fromPostId !== postId) return item;
          return {
            ...item,
            ...(patch.title != null ? { item: String(patch.title).trim(), itemTypeLabel: String(patch.title).trim() } : {}),
            ...(patch.body != null ? { description: String(patch.body).trim() } : {}),
            ...(patch.listingPrice != null || patch.credits != null
              ? { credits: Number(patch.listingPrice ?? patch.credits) || item.credits }
              : {}),
            updatedAt,
          };
        })
      );
      showToast("Příspěvek byl upraven.", "success");
      return true;
    },
    [showToast]
  );

  const updateSecurityReport = useCallback(
    (reportId, { type, body } = {}) => {
      if (!reportId) return false;
      const nextType = type != null ? String(type).trim() : null;
      const nextBody = body != null ? String(body).trim() : null;
      if ((nextType != null && !nextType) || (nextBody != null && !nextBody)) {
        showToast("Vyplňte typ i text hlášení.", "error");
        return false;
      }
      const updatedAt = new Date().toISOString();
      const patchReport = (r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          ...(nextType != null ? { type: nextType } : {}),
          ...(nextBody != null ? { body: nextBody } : {}),
          updatedAt,
        };
      };
      setUserReports((prev) => prev.map(patchReport));
      setExtraReports((prev) => prev.map(patchReport));
      setUserPosts((prev) =>
        prev.map((p) => {
          if (p.fromSecurityReportId !== reportId && p.id !== `feed-${reportId}`) return p;
          return {
            ...p,
            ...(nextType != null ? { title: nextType } : {}),
            ...(nextBody != null ? { body: nextBody } : {}),
            updatedAt,
          };
        })
      );
      showToast("Hlášení bylo upraveno.", "success");
      return true;
    },
    [showToast]
  );

  const updateAreaNewsItem = useCallback(
    (newsId, { title, body } = {}) => {
      if (!newsId) return false;
      const nextTitle = title != null ? String(title).trim() : null;
      const nextBody = body != null ? String(body).trim() : null;
      if ((nextTitle != null && !nextTitle) || (nextBody != null && !nextBody)) {
        showToast("Vyplňte nadpis i text.", "error");
        return false;
      }
      const updatedAt = new Date().toISOString();
      let patched = null;
      setAreaNewsList((prev) =>
        prev.map((n) => {
          if (n.id !== newsId) return n;
          patched = {
            ...n,
            ...(nextTitle != null ? { title: nextTitle } : {}),
            ...(nextBody != null ? { body: nextBody } : {}),
            updatedAt,
          };
          return patched;
        })
      );
      if (patched?.type === "crisis" && patched.active) {
        setSosAlert((prev) =>
          prev
            ? {
                ...prev,
                title: patched.title,
                body: patched.body,
              }
            : prev
        );
      }
      showToast("Oznámení bylo upraveno. Sousedé uvidí označení „upraveno“.", "success");
      return true;
    },
    [showToast]
  );

  const updateOfficePrompt = useCallback(
    (promptId, { title, body } = {}) => {
      if (!promptId) return false;
      const nextTitle = title != null ? String(title).trim() : null;
      const nextBody = body != null ? String(body).trim() : null;
      if ((nextTitle != null && !nextTitle) || (nextBody != null && !nextBody)) {
        showToast("Vyplňte nadpis i text.", "error");
        return false;
      }
      const updatedAt = new Date().toISOString();
      setMunicipalityPrompts((prev) =>
        prev.map((p) => {
          if (p.id !== promptId) return p;
          return {
            ...p,
            ...(nextTitle != null ? { title: nextTitle } : {}),
            ...(nextBody != null ? { body: nextBody } : {}),
            updatedAt,
          };
        })
      );
      showToast("Podnět byl upraven.", "success");
      return true;
    },
    [showToast]
  );

  const openGroup = useCallback((groupId) => {
    setActiveGroupId(null);
    setGroupFilter(null);
    setFeedMainMode("skupiny");
    setFeedSubFilter(groupId);
    setShowDiscoveryWall(false);
    setActiveTab("home");
  }, []);

  const closeGroup = useCallback(() => {
    setActiveGroupId(null);
    setGroupFilter(null);
  }, []);

  const topPost = useCallback(
    (postId, planId = "3d", method = "wallet") => {
      const post = userPosts.find((p) => p.id === postId) ?? userGroupPosts.find((p) => p.id === postId);
      if (!post) return false;
      if (post.topped) {
        showToast("Tento inzerát je už TOPovaný.", "info");
        return false;
      }
      if (!canTopCategory(post.categoryId)) {
        showToast("Tuto kategorii nelze TOPovat.", "info");
        return false;
      }
      const cost = calculateTopCost(planId);
      if (!payAmount(cost, method)) return false;
      const plan = getTopPlan(planId);
      const topped = applyTop(post, planId);
      setUserPosts((prev) => updatePostInList(prev, postId, () => topped));
      setUserGroupPosts((prev) => updatePostInList(prev, postId, () => topped));
      showToast(`TOP boost ${plan.days} dní za ${cost} Kč — inzerát je nahoře.`);
      return true;
    },
    [userPosts, userGroupPosts, showToast, payAmount]
  );

  const requestTopPayment = useCallback((postId, planId) => {
    const cost = calculateTopCost(planId);
    setPendingPayment({ type: "top", postId, planId, amount: cost, title: `TOP inzerát — ${getTopPlan(planId).label}` });
  }, []);

  const promoteProfileInternal = useCallback(
    (promoType, planId, method, options = {}) => {
      const plan = getMonetizationPlan(promoType === "top" ? "top" : promoType, planId);
      const cost = plan?.price ?? 0;
      if (!payAmount(cost, method)) return;
      if (promoType === "catalog") {
        const until = new Date();
        until.setDate(until.getDate() + (plan.days ?? 7));
        const untilIso = until.toISOString().slice(0, 10);
        const boostRank = Date.now();
        setUser((u) =>
          u ? { ...u, isPremium: true, catalogBoostUntil: untilIso } : u
        );
        setServicesCatalog((prev) =>
          prev.map((s) => {
            const mine =
              (user?.id && s.ownerUserId === user.id) ||
              (testRoleId === "remeslnik" && s.id === "svc1") ||
              s.name.includes(user?.name?.split("—")[0]?.trim()?.split(" ")[0] ?? "___") ||
              s.name.includes(user?.name?.split(" ")[0] ?? "___");
            if (!mine) return s;
            return {
              ...s,
              isPremium: true,
              catalogBoostUntil: untilIso,
              catalogBoostRank: boostRank,
            };
          })
        );
        showToast(
          `Boost katalogu aktivní (${plan.label}) — váš profil je na předních pozicích u sousedů.`
        );
      } else if (promoType === "sponsored") {
        const until = new Date();
        if (plan.hours) until.setHours(until.getHours() + plan.hours);
        else until.setDate(until.getDate() + (plan.days ?? 1));
        const banner = {
          id: `sp-user-${Date.now()}`,
          name: (options.name ?? user?.name ?? "Váš podnik").trim() || "Váš podnik",
          tagline:
            (options.tagline ?? user?.tagline ?? "Sousedská nabídka · Podplot").trim() ||
            "Sousedská nabídka · Podplot",
          emoji: user?.accountType === "podnik" ? "🏪" : "🛠️",
          distance: "ve vaší lokalitě",
          address: user?.address ?? activeLocation?.address ?? "",
          phone: user?.phone ?? "",
          hours: businessHours || user?.hours || "Dle domluvy",
          mapPos: user?.mapPos ?? { x: 50, y: 50 },
          activeUntil: until.toISOString().slice(0, 10),
          accountType: user?.accountType ?? "podnik",
          locationId: activeLocationId,
          ownerUserId: user?.id ?? "me",
          planId: plan.id,
          planLabel: plan.label,
        };
        setSponsoredBanners((prev) => [banner, ...prev.filter((b) => b.ownerUserId !== (user?.id ?? "me"))]);
        showToast(`Reklamní banner aktivní (${plan.label}). Uvidíte ho na domovské zdi sousedů.`);
      }
    },
    [payAmount, showToast, user, activeLocation, activeLocationId, testRoleId, businessHours]
  );

  const promoteProfile = useCallback(
    (promoType, planId, method, options) => {
      promoteProfileInternal(promoType, planId, method, options);
    },
    [promoteProfileInternal]
  );

  const confirmPendingPayment = useCallback(
    (method) => {
      if (!pendingPayment) return;
      const { type, postId, planId, amount } = pendingPayment;
      if (type === "top") {
        const post = userPosts.find((p) => p.id === postId) ?? userGroupPosts.find((p) => p.id === postId);
        if (!post || post.topped) {
          setPendingPayment(null);
          return;
        }
        if (!payAmount(amount, method)) return;
        const plan = getTopPlan(planId);
        const topped = applyTop(post, planId);
        setUserPosts((prev) => updatePostInList(prev, postId, () => topped));
        setUserGroupPosts((prev) => updatePostInList(prev, postId, () => topped));
        showToast(`TOP boost ${plan.days} dní za ${amount} Kč — inzerát je nahoře.`);
      }
      setPendingPayment(null);
    },
    [pendingPayment, payAmount, userPosts, userGroupPosts, showToast]
  );

  const publishListing = useCallback(
    ({
      categoryId,
      marketCategory = null,
      lendingCategory = null,
      title,
      body,
      price,
      groupId,
      photos = [],
      topPlanId = null,
      topPaymentMethod = "wallet",
    }) => {
      if (!user) return;
      if (isB2BWorkMode) {
        showToast(
          "Reklamní nabídky nepatří do hlavního feedu. Prezentujte služby v katalogovém profilu.",
          "error"
        );
        return;
      }
      const acc = getAccountType(user.accountType);
      const cat = getCategory(categoryId, groupId);
      const id = `user-${Date.now()}`;
      const group = groupId ? getGroup(groupId) : null;
      const metaParts = ["Právě teď", "0 m"];
      if (group) metaParts.push(group.name);

      const listingPrice = cat?.priceField ? Number(price) || 0 : 0;
      if (cat?.priceField && price) {
        metaParts.unshift(cat?.isLending ? `${price} Kč/den` : `${price} Kč`);
      }

      let topCost = 0;
      if (topPlanId && canTopCategory(categoryId)) {
        topCost = calculateTopCost(topPlanId);
        if (!payAmount(topCost, topPaymentMethod)) {
          showToast(`Na TOP chybí prostředků. Potřebujete ${topCost} Kč.`, "error");
          return;
        }
      }

      const { feedType, feedSubtype } = inferFeedClassification(categoryId, user.accountType);

      const lendingMeta = cat?.isLending ? inferLendingMeta(title.trim()) : null;
      const resolvedLending = cat?.isLending
        ? lendingCategory || lendingMeta.lendingCategory
        : null;
      const displayTitle =
        cat?.isLending && lendingMeta?.itemTypeLabel
          ? lendingMeta.itemTypeLabel
          : title.trim();

      let post = {
        id,
        role: acc.role,
        accountType: user.accountType,
        author: user.name,
        authorId: user.id ?? "me",
        initials: user.initials,
        title: displayTitle,
        body: body.trim(),
        meta: metaParts.join(" · "),
        type: cat.type,
        categoryId,
        marketCategory: marketCategory || null,
        lendingCategory: resolvedLending,
        itemType: lendingMeta?.itemType ?? null,
        itemTypeLabel: lendingMeta?.itemTypeLabel ?? null,
        feedType,
        feedSubtype,
        listingPrice,
        groupId: groupId ?? null,
        groupName: group?.name,
        mine: true,
        createdAt: Date.now(),
        photos: photos.map((p) => p.url ?? p),
        isVerified: user.isVerified ?? false,
        verifiedDomain: user.verifiedDomain ?? null,
        locationId: activeLocationId,
        municipality: activeLocation?.municipality,
      };

      if (topPlanId && canTopCategory(categoryId)) {
        post = applyTop(post, topPlanId);
      }

      // Vždy na domovský feed; při skupině i na nástěnku skupiny
      setUserPosts((prev) => [post, ...prev]);
      void publishRemotePost(post, user);
      if (groupId) {
        setUserGroupPosts((prev) => [post, ...prev]);
      }

      if (cat?.isLending) {
        setUserLendingItems((prev) => [
          {
            id,
            role: acc.role,
            accountType: user.accountType,
            author: user.name,
            authorId: user.id ?? "me",
            initials: user.initials,
            item: displayTitle,
            description: body.trim(),
            credits: Number(price) || 0,
            period: "den",
            distance: group ? `${group.name} · vaše nabídka` : "Právě teď · 0 m",
            mine: true,
            groupId,
            photos: post.photos,
            lendingCategory: resolvedLending,
            itemType: lendingMeta.itemType,
            itemTypeLabel: lendingMeta.itemTypeLabel,
            marketCategory: marketCategory || lendingCategoryToMarket(resolvedLending),
            locationId: activeLocationId,
            municipality: activeLocation?.municipality,
            createdAt: Date.now(),
          },
          ...prev,
        ]);
      }

      if (cat?.isLending) {
        showProfileHint("lending_offer");
      }

      closeCreate();
      const plan = topPlanId ? getTopPlan(topPlanId) : null;
      const topMsg = plan ? ` Boost ${plan.days} dní (${topCost} Kč).` : "";
      if (groupId) {
        showToast(`Příspěvek je na nástěnce ${group.name}.${topMsg}`);
        setFeedMainMode("skupiny");
        setFeedSubFilter(groupId);
        setShowDiscoveryWall(false);
        setActiveTab("home");
      } else {
        showToast((cat?.isLending ? "Nabídka ve zdi i půjčovně." : "Inzerát zveřejněn.") + topMsg);
        setFeedMainMode("zbozi");
        setFeedSubFilter(categoryId);
        setShowDiscoveryWall(false);
        setActiveTab("home");
      }
    },
    [closeCreate, showToast, payAmount, user, activeLocationId, activeLocation, showProfileHint, isB2BWorkMode]
  );

  const rentItem = useCallback(
    (item, method = "wallet", booking = {}) => {
      if (item.mine) {
        showToast("Toto je vaše vlastní nabídka.", "info");
        return false;
      }
      if (item.onVacation) {
        showToast("Majitel je na dovolené — rezervace teď není možná.", "info");
        return false;
      }
      const days = Math.max(1, Number(booking.days) || 1);
      const amount = (item.credits ?? 0) * days;
      if (!payAmount(amount, method)) return false;
      const { fee, sellerGets } = calcServiceFee(amount);
      setReservations((r) => [
        ...r,
        {
          ...item,
          reservedAt: new Date().toISOString(),
          fee,
          sellerGets,
          startDate: booking.startDate ?? null,
          endDate: booking.endDate ?? null,
          days,
          totalPaid: amount,
          ownerId: item.authorId ?? item.id,
          bookingNote: booking.note?.trim() || "",
        },
      ]);
      const dateHint =
        booking.startDate && booking.endDate
          ? ` (${booking.startDate === booking.endDate ? booking.startDate : `${booking.startDate} – ${booking.endDate}`})`
          : "";
      showToast(
        `Rezervováno: ${item.item ?? item.label ?? item.title} za ${amount} Kč${dateHint}. Prodejci ${sellerGets} Kč, servisní poplatek ${fee} Kč (10 %).`
      );
      showProfileHint("reservation");
      return true;
    },
    [payAmount, showToast, showProfileHint]
  );

  const buyListing = useCallback(
    (post, method = "card") => {
      if (post.mine) {
        showToast("Toto je váš inzerát.", "info");
        return false;
      }
      if (post.saleStatus === LISTING_SALE_STATUS.held || getActiveListingSale(listingSaleOrders, post.id)) {
        showToast("Tento inzerát je už v rezervaci.", "info");
        return false;
      }
      const amount = Number(post.listingPrice) || 0;
      if (amount <= 0) {
        showToast("Kontaktujte prodejce — cena není uvedena.", "info");
        return false;
      }
      if (!payAmount(amount, method, { silent: true })) return false;
      const { fee, sellerGets } = calcServiceFee(amount);
      const buyerId = user?.id ?? "me";
      const order = {
        id: `ls-${Date.now()}`,
        listingId: post.id,
        title: post.title,
        amount,
        fee,
        sellerGets,
        status: LISTING_SALE_STATUS.held,
        statusLabel: LISTING_SALE_STATUSES.held,
        buyerId,
        sellerId: post.authorId ?? post.id,
        sellerName: post.author,
        paymentMethod: method,
        reservedAt: new Date().toISOString(),
        photos: post.photos ?? [],
      };
      setListingSaleOrders((prev) => [order, ...prev]);
      showToast(
        `Platba ${amount} Kč je v úschově Podplotu. Inzerát je „V rezervaci“. Po osobní kontrole klepněte na „Převzato a zaplaceno“.`,
        "success"
      );
      return true;
    },
    [payAmount, showToast, listingSaleOrders, user?.id]
  );

  /** Kupující potvrdí osobní převzetí → uvolnění platby, inzerát zmizí. Prodávající nic nepotvrzuje. */
  const confirmListingHandover = useCallback(
    (orderId) => {
      const order = listingSaleOrders.find((o) => o.id === orderId);
      if (!order || order.status !== LISTING_SALE_STATUS.held) {
        showToast("Rezervaci nelze potvrdit.", "error");
        return false;
      }
      if (!isSameAppUser(order.buyerId, user?.id ?? "me")) {
        showToast("Převzetí potvrzuje jen kupující.", "info");
        return false;
      }
      setListingSaleOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: LISTING_SALE_STATUS.released,
                statusLabel: LISTING_SALE_STATUSES.released,
                releasedAt: new Date().toISOString(),
              }
            : o
        )
      );
      setUserPosts((prev) => prev.filter((p) => p.id !== order.listingId));
      setUserGroupPosts((prev) => prev.filter((p) => p.id !== order.listingId));
      showToast(
        `Převzato a zaplaceno — prodejci uvolněno ${order.sellerGets} Kč (poplatek ${order.fee} Kč). Inzerát je uzavřen.`,
        "success"
      );
      return true;
    },
    [listingSaleOrders, showToast, user?.id]
  );

  const addNeighborHelpPost = useCallback(
    ({ type, title, body }) => {
      if (!user || !title.trim() || !body.trim()) return;
      setNeighborHelp((prev) => [
        {
          id: `nh-${Date.now()}`,
          type,
          title: title.trim(),
          body: body.trim(),
          author: user.name,
          initials: user.initials,
          distance: "Právě teď · 0 m",
          time: "Právě teď",
          locationId: activeLocationId,
          mine: true,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      showToast("Příspěvek zveřejněn ve sousedské výpomoci.");
      setActiveTab("home");
    },
    [user, showToast, activeLocationId]
  );

  const addGroupBoardPost = useCallback(
    ({ groupId, title, body, photos = [] }) => {
      if (!user || !groupId || !title.trim() || !body.trim()) return;
      const group =
        communityGroups.find((g) => g.id === groupId) || getGroup(groupId);
      const groupName = group?.name ?? "Skupina";
      const id = `gp-user-${Date.now()}`;
      const photoUrls = (photos ?? []).map((p) => p?.url ?? p).filter(Boolean);
      const post = {
        id,
        groupId,
        groupName,
        categoryId: "diskuse",
        role: getAccountType(user.accountType)?.role ?? "soused",
        accountType: user.accountType,
        author: user.name,
        authorId: "me",
        initials: user.initials,
        title: title.trim(),
        body: body.trim(),
        meta: `Právě teď · ${groupName}`,
        type: "Příspěvek",
        mine: true,
        createdAt: Date.now(),
        locationId: activeLocationId,
        photos: photoUrls,
      };
      setUserGroupPosts((prev) => [post, ...prev]);
      setUserPosts((prev) => [post, ...prev]);
      showToast(`Příspěvek je na nástěnce ${groupName}.`);
    },
    [user, showToast, activeLocationId, communityGroups]
  );

  const addServiceRequest = useCallback(
    ({ text, categoryLabel = "Katalog", categoryId = "vse", broadcastPush = true }) => {
      if (!user || !text.trim()) return;
      const reqId = `sr-${Date.now()}`;
      setServiceRequests((prev) => [
        {
          id: reqId,
          text: text.trim(),
          categoryLabel,
          author: user.name,
          authorId: user.id ?? "me",
          time: "Právě teď",
          mine: true,
        },
        ...prev,
      ]);

      const isMobilniService = (s) => {
        const subtype = s.businessSubtype ?? resolveBusinessSubtype(s.accountType);
        return normalizeAccountType(s.accountType) === "podnik" && subtype === "mobilni";
      };

      const matching = servicesCatalog.filter((s) => {
        if (s.kapacitaPlna) return false;
        const inReach =
          isNationwideRadius(s.actionRadius) ||
          (s.distanceKm ?? 99) <= (s.actionRadius ?? 15);
        if (!inReach) return false;
        if (!isMobilniService(s)) return false;
        if (categoryId !== "vse" && !serviceHasSubcategory(s, categoryId) && s.profession?.toLowerCase() !== categoryId) {
          const hay = `${s.profession} ${s.keywords?.join(" ")}`.toLowerCase();
          if (!hay.includes(categoryLabel.toLowerCase().slice(0, 4))) return false;
        }
        return s.pushPoptavkyEnabled !== false;
      });

      const pushEligible = matching.filter((svc) => svc.pushPoptavkyEnabled === true);
      const delayedEligible = matching.filter((svc) => !svc.pushPoptavkyEnabled);

      const now = Date.now();

      pushEligible.forEach((svc) => {
        setB2bInquiries((prev) => [
          {
            id: `bi-${reqId}-${svc.id}`,
            type: "service_request",
            title: text.trim().slice(0, 60),
            text: text.trim(),
            author: user.name,
            authorId: user.id ?? "me",
            time: "Právě teď",
            distanceKm: svc.distanceKm,
            targetServiceId: svc.id,
            read: false,
            push: true,
            priority: "immediate",
            visibleAt: now,
          },
          ...prev,
        ]);
      });

      delayedEligible.forEach((svc) => {
        setB2bInquiries((prev) => [
          {
            id: `bi-${reqId}-${svc.id}-delayed`,
            type: "service_request",
            title: text.trim().slice(0, 60),
            text: text.trim(),
            author: user.name,
            authorId: user.id ?? "me",
            time: "Za ~15 min",
            distanceKm: svc.distanceKm,
            targetServiceId: svc.id,
            read: false,
            push: false,
            priority: "delayed",
            visibleAt: now + SERVICE_REQUEST_FREE_DELAY_MS,
          },
          ...prev,
        ]);
      });

      const myMobilniWithPush =
        isMobilniTestRole(testRoleId) && businessNotificationPrefs.serviceRequestPushEnabled;

      if (broadcastPush && (pushEligible.length > 0 || myMobilniWithPush)) {
        setNotifications((prev) => [
          {
            id: `n-req-${Date.now()}`,
            type: "green",
            title: "Nová poptávka v okolí (push)",
            body: `${text.trim().slice(0, 80)} · ${categoryLabel}`,
            read: false,
            time: "právě teď",
          },
          ...prev,
        ]);
      }

      showToast(
        pushEligible.length > 0
          ? `Poptávka odeslána — okamžitý push ${pushEligible.length} předplatitelům, ${delayedEligible.length} službám s prodlevou.`
          : delayedEligible.length > 0
            ? `Poptávka zveřejněna — mobilní služby bez push uvidí poptávku s prodlevou ~15 min.`
            : "Poptávka zveřejněna — v okruhu nejsou mobilní služby v této kategorii."
      );
    },
    [user, showToast, servicesCatalog, testRoleId, businessNotificationPrefs.serviceRequestPushEnabled]
  );

  const addCredits = useCallback(
    (amount, { silent = false } = {}) => {
      const add = Math.max(0, Number(amount) || 0);
      if (add <= 0) return 0;
      creditsRef.current += add;
      setCredits(creditsRef.current);
      if (!silent) showToast(`Přidáno ${add} kreditů do peněženky.`);
      return add;
    },
    [showToast]
  );

  const submitPlaceSuggestion = useCallback(
    ({ name, category, hours, description, photos, mapPos, lat, lng }) => {
      if (!user || !name?.trim() || !mapPos) return;
      setPlaceSuggestions((prev) => [
        ...prev,
        {
          id: `ps-${Date.now()}`,
          name: name.trim(),
          category,
          hours: hours ?? "",
          description: description ?? "",
          photos: photos ?? [],
          mapPos: lat != null && lng != null ? { ...mapPos, lat, lng } : mapPos,
          lat: lat ?? mapPos?.lat ?? null,
          lng: lng ?? mapPos?.lng ?? null,
          locationId: activeLocationId,
          status: SUGGESTION_STATUS.PENDING,
          suggestedBy: user.id ?? "me",
          suggestedByName: user.name,
          createdAt: new Date().toISOString(),
        },
      ]);
      showToast("Návrh odeslán ke schválení administrátorem.", "success");
    },
    [user, activeLocationId, showToast]
  );

  const approvePlaceSuggestion = useCallback(
    (suggestionId) => {
      setPlaceSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, status: SUGGESTION_STATUS.APPROVED } : s))
      );
      showToast("Návrh schválen — místo je viditelné v katalogu.", "success");
    },
    [showToast]
  );

  const submitInstitutionClaim = useCallback(
    ({ placeId, googlePlaceId, ico, note = "" }) => {
      if (!user || !ico?.trim()) return;
      const effectivePlaceId = placeId ?? (googlePlaceId ? `google-${googlePlaceId}` : null);
      if (!effectivePlaceId) return;
      const claimId = `cl-${Date.now()}`;
      const autoApprove = ico.trim() === TEST_PERSONAS.podnik.ico || ico.trim() === "12345678";
      setInstitutionClaims((prev) => [
        ...prev,
        {
          id: claimId,
          placeId: effectivePlaceId,
          googlePlaceId: googlePlaceId ?? null,
          userId: user.id ?? "me",
          ico: ico.trim(),
          note,
          status: autoApprove ? SUGGESTION_STATUS.APPROVED : SUGGESTION_STATUS.PENDING,
          createdAt: new Date().toISOString(),
        },
      ]);
      if (autoApprove) {
        setInstitutionPlaceOverrides((prev) => ({
          ...prev,
          [effectivePlaceId]: {
            ...(prev[effectivePlaceId] ?? {}),
            claimedByUserId: user.id ?? "me",
            googlePlaceId: googlePlaceId ?? prev[effectivePlaceId]?.googlePlaceId ?? null,
            isVerified: true,
            claimStatus: CLAIM_STATUS.CLAIMED,
          },
        }));
        showToast("Profil přiřazen k vašemu účtu.", "success");
      } else {
        showToast("Žádost o převzetí profilu odeslána ke schválení.", "info");
      }
    },
    [user, showToast]
  );

  const updateOwnedInstitution = useCallback(
    (patch) => {
      if (!user) return;
      const claim = institutionClaims.find(
        (c) => c.userId === (user.id ?? "me") && c.status === SUGGESTION_STATUS.APPROVED
      );
      const placeId = claim?.placeId ?? Object.entries(institutionPlaceOverrides).find(
        ([, o]) => o.claimedByUserId === (user.id ?? "me")
      )?.[0];
      if (!placeId) return;
      setInstitutionPlaceOverrides((prev) => ({
        ...prev,
        [placeId]: { ...(prev[placeId] ?? {}), ...patch, claimedByUserId: user.id ?? "me" },
      }));
    },
    [user, institutionClaims, institutionPlaceOverrides]
  );

  /** Úprava údajů místa sousedy — jen pokud profil není oficiálně převzatý. */
  const updatePlaceCommunityDetails = useCallback(
    (placeId, patch) => {
      if (!user || !placeId) return;
      const existing = institutionPlaceOverrides[placeId] ?? {};
      const hasOfficialOwner =
        Boolean(existing.claimedByUserId) ||
        existing.claimStatus === CLAIM_STATUS.CLAIMED ||
        institutionClaims.some(
          (c) => c.placeId === placeId && c.status === SUGGESTION_STATUS.APPROVED
        );
      if (hasOfficialOwner) {
        showToast("Profil už má oficiálního vlastníka — údaje může měnit jen on.", "error");
        return;
      }
      setInstitutionPlaceOverrides((prev) => ({
        ...prev,
        [placeId]: {
          ...(prev[placeId] ?? {}),
          ...patch,
          communityEditedAt: new Date().toISOString(),
          communityEditedBy: user.id ?? "me",
        },
      }));
      showToast("Údaje aktualizovány. Děkujeme!", "success");
    },
    [user, institutionPlaceOverrides, institutionClaims, showToast]
  );

  const updateServiceDescription = useCallback((serviceId, serviceDescription) => {
    setServicesCatalog((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, serviceDescription } : s))
    );
    showToast("Popis služeb uložen.", "success");
  }, [showToast]);

  const updateServiceFocus = useCallback(
    ({ serviceId, homeGroupId, subcategory, subcategories = null, keywords = [] }) => {
      const subIds = [
        ...new Set(
          (Array.isArray(subcategories) && subcategories.length
            ? subcategories
            : subcategory
              ? [subcategory]
              : []
          ).filter(Boolean)
        ),
      ];
      const primary = subIds[0];
      const labelsJoined = formatServiceSubcategoryLabels(subIds);
      const catLabels = subIds.map((id) => getServiceCategory(id)?.label).filter(Boolean);
      const kw = [...catLabels, ...(Array.isArray(keywords) ? keywords : [])]
        .map((k) => String(k).trim())
        .filter(Boolean);
      const unique = [...new Set(kw.map((k) => k.toLowerCase()))].map(
        (k) => kw.find((x) => x.toLowerCase() === k) ?? k
      );
      setServicesCatalog((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                homeGroupId: homeGroupId || s.homeGroupId,
                subcategory: primary || s.subcategory,
                subcategories: subIds.length ? subIds : s.subcategories ?? [s.subcategory].filter(Boolean),
                subcategoryLabel: labelsJoined || s.subcategoryLabel,
                profession: labelsJoined || s.profession,
                keywords: unique.length ? unique : s.keywords,
              }
            : s
        )
      );
      setUser((u) =>
        u
          ? {
              ...u,
              serviceHomeGroup: homeGroupId ?? u.serviceHomeGroup,
              serviceSubcategory: primary ?? u.serviceSubcategory,
              serviceSubcategories: subIds.length ? subIds : u.serviceSubcategories,
              serviceKeywords: unique,
            }
          : u
      );
      showToast("Zaměření služby uloženo — párování poptávek aktualizováno.", "success");
    },
    [showToast]
  );

  const addServiceReview = useCallback(
    ({ serviceId, text, stars = 5 }) => {
      if (!user || !isVerifiedNeighbor(user)) {
        showToast("Recenzi mohou psát pouze ověření sousedé.", "error");
        return;
      }
      const owned = servicesCatalog.find((s) => s.id === serviceId);
      if (owned?.ownerUserId === (user.id ?? "me")) {
        showToast("Na vlastní profil nelze psát recenzi.", "error");
        return;
      }
      setServiceReviews((prev) => [
        ...prev,
        {
          id: `rev-${Date.now()}`,
          serviceId,
          authorId: user.id ?? "me",
          authorName: user.name,
          text: text.trim(),
          stars,
          verified: true,
          location: activeLocation?.shortLabel ?? "",
          reported: false,
          moderationStatus: "none",
          reportReason: null,
          reportComment: "",
          reportedAt: null,
          hiddenPendingReview: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      showToast("Recenze zveřejněna.", "success");
    },
    [user, activeLocation, showToast, servicesCatalog]
  );

  const reportServiceReview = useCallback(
    (reviewId, { reasonId, comment = "" } = {}) => {
      if (!reasonId) {
        showToast("Zvolte důvod nahlášení.", "error");
        return false;
      }
      setServiceReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                reported: true,
                moderationStatus: "pending",
                reportReason: reasonId,
                reportComment: comment,
                reportedAt: new Date().toISOString(),
                hiddenPendingReview: false,
              }
            : r
        )
      );
      showToast(
        "Recenze nahlášena — zůstává viditelná se stavem „Čeká na posouzení moderátorem“.",
        "info"
      );
      return true;
    },
    [showToast]
  );

  const addPlaceReview = useCallback(
    ({ placeKey, placeId, place, text, stars = 5 }) => {
      if (!user || !placeKey || !text?.trim()) return;
      const target = place ?? { id: placeId };
      if (isPlaceOwner(user, target, institutionClaims, institutionPlaceOverrides)) {
        showToast("Na vlastní profil nelze psát recenzi.", "error");
        return;
      }
      const verified = isVerifiedNeighbor(user);
      setPlaceReviews((prev) => [
        ...prev,
        {
          id: `prev-${Date.now()}`,
          placeKey,
          placeId: placeId ?? null,
          authorId: user.id ?? "me",
          authorName: user.name,
          text: text.trim(),
          stars,
          verified,
          reported: false,
          hiddenPendingReview: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      showToast("Recenze zveřejněna.", "success");
    },
    [user, institutionClaims, institutionPlaceOverrides, showToast]
  );

  const reportPlaceReview = useCallback(
    (reviewId) => {
      setPlaceReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, reported: true, hiddenPendingReview: true } : r
        )
      );
      showToast("Recenze nahlášena a dočasně skryta.", "info");
    },
    [showToast]
  );

  const markB2bInquiryRead = useCallback((id) => {
    setB2bInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  }, []);

  const sendMessage = useCallback(
    (participantId, participantName, text, meta = null) => {
      if (!participantId || !text?.trim()) return;
      const time = nowTime();
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const body = text.trim();
      const createdAt = new Date().toISOString();
      const myLocationId = activeLocationId || "domov";

      let finalMeta = meta;
      if (meta) {
        const special =
          meta.kind === "interest" || String(meta.kind || "").startsWith("office_");
        if (special) {
          const t = topicFromMessageMeta(meta);
          finalMeta = t ? { ...meta, topic: t } : meta;
        } else if (meta.topic || meta.kind || meta.refId || meta.title) {
          finalMeta = topicToMessageMeta(meta.topic || meta);
        }
      }
      finalMeta = { ...(finalMeta && typeof finalMeta === "object" ? finalMeta : {}), myLocationId };

      setChats((prev) => {
        const idx = prev.findIndex((c) => c.participantId === participantId);
        const msg = {
          id: msgId,
          sender: "me",
          text: body,
          time,
          status: "sent",
          createdAt,
          meta: finalMeta,
        };
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lastMessage: body,
            lastTime: time,
            locationId: updated[idx].locationId || myLocationId,
            messages: [...updated[idx].messages, msg],
            sharedRemote: true,
          };
          return updated;
        }
        return [
          {
            chatId: `chat-${participantId}`,
            participantId,
            participantName: participantName || "Soused",
            locationId: myLocationId,
            lastMessage: body,
            lastTime: time,
            unread: 0,
            messages: [msg],
            sharedRemote: true,
          },
          ...prev,
        ];
      });

      if (user?.id && participantId !== user.id && participantId !== "me") {
        void publishRemoteMessage({
          id: msgId,
          senderId: user.id,
          senderName: user.name,
          recipientId: participantId,
          recipientName: participantName || "Soused",
          text: body,
          meta: finalMeta,
        });
      }

      window.setTimeout(() => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.participantId !== participantId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId && m.status === "sent" ? { ...m, status: "delivered" } : m
              ),
            };
          })
        );
      }, 900);
    },
    [user?.id, user?.name, activeLocationId]
  );

  const updatePromptStatus = useCallback(
    (id, status) => {
      const prompt = municipalityPrompts.find((p) => p.id === id);
      if (!prompt) return;
      const statusLabel = getPromptStatusLabel(status);
      setMunicipalityPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status, statusLabel } : p))
      );
      const autoMsg = PROMPT_STATUS_AUTO_MESSAGE[status]?.(prompt.title);
      if (autoMsg && prompt.authorId) {
        sendMessage(prompt.authorId, prompt.authorName ?? "Soused", autoMsg, {
          kind: "office_prompt_status",
          promptId: prompt.id,
          status,
        });
      }
      if (prompt.fromReportId) {
        patchReportLinkedToPrompt(prompt.fromReportId, () => ({
          officeStatus: status,
          officeStatusLabel: statusLabel,
        }));
      }
      showToast(
        `Podnět: ${statusLabel}${autoMsg ? " · zpráva odeslána autorovi" : ""}`,
        "success"
      );
    },
    [municipalityPrompts, showToast, sendMessage, patchReportLinkedToPrompt]
  );

  const sendOfficePromptReply = useCallback(
    (promptId, text, { publish = false } = {}) => {
      const body = text.trim();
      if (!body) {
        showToast("Napište text zprávy.", "error");
        return false;
      }
      const prompt = municipalityPrompts.find((p) => p.id === promptId);
      if (!prompt?.authorId) {
        showToast("U podnětu chybí autor.", "error");
        return false;
      }
      const officeLabel = user?.name ?? "Městský úřad Jesenice";
      sendMessage(prompt.authorId, prompt.authorName ?? "Soused", body, {
        kind: "office_prompt_reply",
        promptId,
        published: Boolean(publish),
      });
      if (publish && prompt.fromReportId) {
        const note = {
          id: `on-${Date.now()}`,
          text: body,
          time: "právě teď",
          author: officeLabel,
        };
        patchReportLinkedToPrompt(prompt.fromReportId, (r) => ({
          publicOfficeNotes: [...(r.publicOfficeNotes ?? []), note],
        }));
        showToast("Zpráva odeslána autorovi a zveřejněna u hlášení.", "success");
      } else {
        showToast("Zpráva odeslána autorovi podnětu.", "success");
      }
      return true;
    },
    [municipalityPrompts, user, sendMessage, patchReportLinkedToPrompt, showToast]
  );

  const declineOfficePrompt = useCallback(
    (promptId, text) => {
      const body = text.trim();
      if (!body) {
        showToast("Před odložením napište občanovi důvod (zprávu).", "error");
        return false;
      }
      const prompt = municipalityPrompts.find((p) => p.id === promptId);
      if (!prompt) return false;
      const officeLabel = user?.name ?? "Městský úřad Jesenice";
      if (prompt.authorId) {
        sendMessage(prompt.authorId, prompt.authorName ?? "Soused", body, {
          kind: "office_prompt_declined",
          promptId,
        });
      }
      setMunicipalityPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId
            ? {
                ...p,
                status: "declined",
                statusLabel: getPromptStatusLabel("declined"),
                declineMessage: body,
              }
            : p
        )
      );
      if (prompt.fromReportId) {
        patchReportLinkedToPrompt(prompt.fromReportId, (r) => ({
          officeStatus: "declined",
          officeStatusLabel: getPromptStatusLabel("declined"),
          publicOfficeNotes: [
            ...(r.publicOfficeNotes ?? []),
            {
              id: `on-${Date.now()}`,
              text: body,
              time: "právě teď",
              author: officeLabel,
              kind: "declined",
            },
          ],
        }));
      }
      showToast("Podnět odložen · zpráva odeslána občanovi.", "info");
      return true;
    },
    [municipalityPrompts, user, sendMessage, patchReportLinkedToPrompt, showToast]
  );

  const openCraftsmanPublicProfile = useCallback((ref) => {
    if (!ref) return;
    if (typeof ref === "string") {
      setCraftsmanProfileOpen({ serviceId: ref, userId: null });
      return;
    }
    setCraftsmanProfileOpen({
      serviceId: ref.serviceId ?? null,
      userId: ref.userId ?? null,
      name: ref.name ?? null,
    });
  }, []);

  const closeCraftsmanPublicProfile = useCallback(() => setCraftsmanProfileOpen(null), []);

  const resolveChatParticipantService = useCallback(
    (participantId) => {
      if (!participantId) return null;
      return (
        servicesCatalog.find((s) => s.id === participantId) ??
        servicesCatalog.find((s) => s.ownerUserId === participantId) ??
        null
      );
    },
    [servicesCatalog]
  );

  const receiveMessage = useCallback(
    (participantId, participantName, text) => {
      const time = nowTime();
      const chatOpen = chatModal?.participantId === participantId;
      const fallbackLocationId = activeLocationId || "domov";
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.participantId === participantId);
        const prior = idx >= 0 ? prev[idx].messages : [];
        const lastTopic =
          topicFromMessageMeta(prior[prior.length - 1]?.meta) ||
          (chatOpen ? normalizeChatTopic(chatModal?.activeTopic) : null);
        const replyMeta = lastTopic ? topicToMessageMeta(lastTopic) : null;
        const msg = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sender: "them",
          text,
          time,
          ...(replyMeta ? { meta: replyMeta } : null),
        };
        const markMineRead = (messages) =>
          messages.map((m) =>
            m.sender === "me" && m.status !== "read" ? { ...m, status: "read" } : m
          );

        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lastMessage: text,
            lastTime: time,
            locationId: updated[idx].locationId || fallbackLocationId,
            unread: chatOpen ? 0 : (updated[idx].unread ?? 0) + 1,
            messages: [...markMineRead(updated[idx].messages), msg],
          };
          return updated;
        }
        return [
          {
            chatId: `chat-${participantId}`,
            participantId,
            participantName,
            locationId: fallbackLocationId,
            lastMessage: text,
            lastTime: time,
            unread: chatOpen ? 0 : 1,
            messages: [msg],
          },
          ...prev,
        ];
      });
    },
    [chatModal, activeLocationId]
  );

  const markChatRead = useCallback(
    (participantId) => {
      setChats((prev) =>
        prev.map((c) => (c.participantId === participantId ? { ...c, unread: 0 } : c))
      );
      if (user?.id && participantId) {
        void markRemoteMessagesRead(user.id, participantId);
      }
    },
    [user?.id]
  );

  const getChatMessages = useCallback(
    (participantId) => {
      const chat = chats.find((c) => c.participantId === participantId);
      return chat?.messages ?? [];
    },
    [chats]
  );

  const openChat = useCallback(
    (participantId, participantName, topic = null) => {
      markChatRead(participantId);
      setChatModal({
        participantId,
        participantName,
        activeTopic: normalizeChatTopic(topic),
        // Když zprávy už byly otevřené, ← vrátí na seznam; jinak rovnou pryč
        dismissMessagesOnClose: !messagesOpen,
      });
    },
    [markChatRead, messagesOpen]
  );

  const startChat = useCallback(
    (participantId, participantName, initialMessage, topic = null) => {
      const activeTopic = normalizeChatTopic(topic);
      const dismissMessagesOnClose = !messagesOpen;
      if (initialMessage?.trim()) {
        sendMessage(
          participantId,
          participantName,
          initialMessage.trim(),
          activeTopic ? topicToMessageMeta(activeTopic) : null
        );
      }
      markChatRead(participantId);
      setChatModal({
        participantId,
        participantName,
        activeTopic,
        dismissMessagesOnClose,
      });
    },
    [sendMessage, markChatRead, messagesOpen]
  );

  const setChatActiveTopic = useCallback((topic) => {
    setChatModal((prev) =>
      prev ? { ...prev, activeTopic: normalizeChatTopic(topic) } : prev
    );
  }, []);

  useEffect(() => {
    if (!helpOfferChatKickoff) return;
    const { participantId, participantName, message, topic } = helpOfferChatKickoff;
    // Jen chat přes aktuální obrazovku — neotevírat seznam zpráv (jeden krok zpět)
    startChat(participantId, participantName, message, topic);
    setHelpOfferChatKickoff(null);
  }, [helpOfferChatKickoff, startChat]);

  // Klik na systémové upozornění / SW → otevřít chat
  useEffect(() => {
    const openFromPayload = (peerId, peerName) => {
      if (!peerId) {
        openMessages();
        return;
      }
      openMessages();
      openChat(peerId, peerName || "Soused");
    };

    const onSwMessage = (event) => {
      const data = event.data;
      if (!data || data.type !== "podplot-notification-click") return;
      openFromPayload(data.peerId, data.peerName);
    };

    const onCustom = (event) => {
      const detail = event.detail || {};
      openFromPayload(detail.peerId, detail.peerName);
    };

    navigator.serviceWorker?.addEventListener?.("message", onSwMessage);
    window.addEventListener("podplot:open-chat", onCustom);
    return () => {
      navigator.serviceWorker?.removeEventListener?.("message", onSwMessage);
      window.removeEventListener("podplot:open-chat", onCustom);
    };
  }, [openMessages, openChat]);

  const closeChat = useCallback(() => {
    setChatModal((prev) => {
      if (prev?.dismissMessagesOnClose) {
        setMessagesOpen(false);
      }
      return null;
    });
  }, []);

  const joinEvent = useCallback((eventId) => {
    if (!user) return;
    const userEntry = {
      id: user.id ?? "me",
      name: user.name,
      initials: user.initials,
      allowPublicAreaLabel: Boolean(user.allowPublicAreaLabel),
      publicAreaLabel: user.publicAreaLabel ?? "",
    };
    setJoinedEventIds((prev) => {
      const joining = !prev.includes(eventId);
      setEvents((evts) =>
        evts.map((e) => {
          if (e.id !== eventId) return e;
          const attendees = e.attendees ?? [];
          const nextAttendees = joining
            ? attendees.some((a) => a.id === userEntry.id)
              ? attendees
              : [...attendees, userEntry]
            : attendees.filter((a) => a.id !== userEntry.id);
          return {
            ...e,
            attendees: nextAttendees,
            participants: nextAttendees.length,
          };
        })
      );
      return joining ? [...prev, eventId] : prev.filter((id) => id !== eventId);
    });
  }, [user]);

  const isJoinedEvent = useCallback((eventId) => joinedEventIds.includes(eventId), [joinedEventIds]);

  const canUploadEventPhotos = useCallback(
    (event) => {
      if (!user || !event) return false;
      if (event.organizer === "Vy" || event.organizer === user.name) return true;
      if (joinedEventIds.includes(event.id)) return true;
      return (event.attendees ?? []).some(
        (a) => a.id === user.id || a.id === "me" || a.name === user.name
      );
    },
    [user, joinedEventIds]
  );

  const registerGalleryPhotoActivity = useCallback(
    (event, photo) => {
      if (!user || !event || !photo) return;
      const selfIds = new Set([user.id, "me"].filter(Boolean));
      if (selfIds.has(photo.authorId) || photo.authorName === user.name) return;
      const participated = isUserParticipatedInEvent(event, user, joinedEventIds);
      setEventGalleryActivity((prev) => {
        if (prev.some((a) => a.photoId === photo.id)) return prev;
        return [createGalleryActivity(event, photo, participated), ...prev];
      });
    },
    [user, joinedEventIds]
  );

  const addEventGalleryPhoto = useCallback(
    (eventId, url) => {
      if (!user || !url) return;
      let addedPhoto = null;
      let addedEvent = null;
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          if (!canUploadEventPhotos(e)) return e;
          const photo = {
            id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url,
            authorId: user.id ?? "me",
            authorName: user.name,
            authorInitials: user.initials,
            time: nowCzechTime(),
          };
          addedPhoto = photo;
          addedEvent = e;
          return { ...e, galleryPhotos: [...(e.galleryPhotos ?? []), photo] };
        })
      );
      if (addedPhoto && addedEvent) {
        registerGalleryPhotoActivity(addedEvent, addedPhoto);
        showToast("Fotka nahrána do galerie akce.", "success");
      }
    },
    [user, canUploadEventPhotos, showToast, registerGalleryPhotoActivity]
  );

  const dismissGalleryFeedActivity = useCallback((activityId) => {
    setEventGalleryActivity((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, feedDismissed: true } : a))
    );
  }, []);

  const markGalleryPhotoRead = useCallback((photoId) => {
    if (!photoId) return;
    setEventGalleryActivity((prev) =>
      prev.map((a) => (a.photoId === photoId ? { ...a, calendarRead: true } : a))
    );
  }, []);

  const ensurePastArchiveOpen = useCallback(
    (eventId) => {
      const ev = events.find((e) => e.id === eventId);
      if (ev && isEventPast(ev)) {
        setUiPref(UI_KEYS.EVENTS_PAST_ARCHIVE_OPEN, true);
      }
    },
    [events, setUiPref]
  );

  const openHomeEventGallery = useCallback((eventId, photoId) => {
    setHomeEventGallery({ eventId, photoId });
  }, []);

  const closeHomeEventGallery = useCallback(() => {
    setHomeEventGallery(null);
  }, []);

  const openLendingFromHome = useCallback(
    (postId) => {
      setActiveTab("neighbors");
      setPendingNeighborsSection("veci");
      setThingsCategory("pujcovna");
      setThingsLendingSubCategory(null);
      setPendingThingsItemId(postId);
      selectModuleItem(MODULE_IDS.THINGS, postId);
    },
    [selectModuleItem]
  );

  const openGalleryPhotoPreview = useCallback((eventId, photoId, { queue = null, fromFeed = false } = {}) => {
    setActiveTab("calendar");
    setCalendarFilter("mine");
    setSelectedEventId(eventId);
    ensurePastArchiveOpen(eventId);
    if (queue?.length) {
      setGalleryPreviewQueue(queue);
    } else {
      setGalleryPreviewQueue([{ eventId, photoId }]);
    }
    if (fromFeed) {
      setEventGalleryActivity((prev) =>
        prev.map((a) =>
          a.eventId === eventId && a.photoId === photoId ? { ...a, feedDismissed: true } : a
        )
      );
    }
  }, [ensurePastArchiveOpen]);

  const openUnreadGalleryPhotos = useCallback(() => {
    setEventGalleryActivity((current) => {
      const unread = getUnreadParticipatedGalleryActivities(current);
      if (unread.length > 0) {
        const queue = unread.map((a) => ({ eventId: a.eventId, photoId: a.photoId }));
        setActiveTab("calendar");
        setCalendarFilter("mine");
        setSelectedEventId(queue[0].eventId);
        setGalleryPreviewQueue(queue);
        ensurePastArchiveOpen(queue[0].eventId);
      }
      return current;
    });
  }, [ensurePastArchiveOpen]);

  const consumeGalleryPreview = useCallback(() => {
    setGalleryPreviewQueue((prev) => {
      const next = prev.slice(1);
      if (next[0]?.eventId) {
        setSelectedEventId(next[0].eventId);
        ensurePastArchiveOpen(next[0].eventId);
      }
      return next;
    });
  }, [ensurePastArchiveOpen]);

  const openEventGalleryFromFeed = useCallback(
    (activityId, eventId) => {
      const activity = eventGalleryActivity.find((a) => a.id === activityId);
      const photoId = activity?.photoId;
      if (!photoId) {
        openHomeEventGallery(eventId, null);
        return;
      }
      openHomeEventGallery(eventId, photoId);
      setEventGalleryActivity((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, calendarRead: true } : a))
      );
    },
    [eventGalleryActivity, openHomeEventGallery]
  );

  const eventHasUnreadGallery = useCallback(
    (eventId) =>
      eventGalleryActivity.some((a) => a.eventId === eventId && a.participated && !a.calendarRead),
    [eventGalleryActivity]
  );

  const getEventUnreadGalleryCount = useCallback(
    (eventId) =>
      eventGalleryActivity.filter((a) => a.eventId === eventId && a.participated && !a.calendarRead).length,
    [eventGalleryActivity]
  );

  const updateProfilePhoto = useCallback(
    (photoUrl) => {
      setUser((u) => {
        if (!u) return u;
        const next = { ...u, profilePhoto: photoUrl };
        void upsertRemoteProfile(next);
        try {
          const raw = localStorage.getItem("podplot-public-photos-v1");
          const map = raw ? JSON.parse(raw) : {};
          if (u.id) {
            map[u.id] = photoUrl;
            localStorage.setItem("podplot-public-photos-v1", JSON.stringify(map));
          }
        } catch {
          /* ignore */
        }
        return next;
      });
      showToast("Profilová fotka uložena.", "success");
    },
    [showToast]
  );

  const removeProfilePhoto = useCallback(() => {
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, profilePhoto: null };
      void upsertRemoteProfile(next);
      try {
        const raw = localStorage.getItem("podplot-public-photos-v1");
        const map = raw ? JSON.parse(raw) : {};
        if (u.id && map[u.id]) {
          delete map[u.id];
          localStorage.setItem("podplot-public-photos-v1", JSON.stringify(map));
        }
      } catch {
        /* ignore */
      }
      return next;
    });
    showToast("Profilová fotka odstraněna.", "info");
  }, [showToast]);

  const updatePublicDisambiguation = useCallback(
    ({ allowPublicAreaLabel, publicAreaLabel }) => {
      setUser((u) =>
        u
          ? {
              ...u,
              allowPublicAreaLabel: Boolean(allowPublicAreaLabel),
              publicAreaLabel: allowPublicAreaLabel ? (publicAreaLabel ?? "").trim() : "",
            }
          : u
      );
      showToast(
        allowPublicAreaLabel ? "Veřejný popisek pro jmenovce uložen." : "Popisek pro sousedské zobrazení vypnut.",
        "success"
      );
    },
    [showToast]
  );

  const updateAccountProfile = useCallback(
    ({ name, email, address }) => {
      setUser((u) =>
        u
          ? {
              ...u,
              ...(name != null ? { name: name.trim() } : {}),
              ...(email != null ? { email: email.trim() } : {}),
              ...(address != null ? { address: address.trim() } : {}),
            }
          : u
      );
      showToast("Údaje profilu uloženy.", "success");
    },
    [showToast]
  );

  const resolveLocationCoords = useCallback(
    async ({ street, houseNumber, psc, city, lat, lng, fallbackLat, fallbackLng }) => {
      const pscNorm = pscDigits(psc);
      let nextLat = lat;
      let nextLng = lng;
      if (nextLat == null || nextLng == null) {
        const queries = [
          `${street} ${houseNumber}, ${pscNorm} ${city}`.trim(),
          `${street} ${houseNumber}, ${city}`.trim(),
          `${pscNorm} ${city}`.trim(),
          city.trim(),
        ].filter((q) => q.length >= 3);

        for (const query of queries) {
          try {
            const results = await fetchAddressSuggestions(query);
            const hit = results.find((r) => r?.lat != null && r?.lon != null) ?? results[0];
            if (hit?.lat != null && hit?.lon != null) {
              nextLat = hit.lat;
              nextLng = hit.lon;
              break;
            }
          } catch {
            /* zkus další dotaz */
          }
        }
      }
      return {
        lat: nextLat ?? fallbackLat ?? USER_LOCATIONS[0].lat,
        lng: nextLng ?? fallbackLng ?? USER_LOCATIONS[0].lng,
      };
    },
    []
  );

  const applyActiveLocationRemap = useCallback(
    (locationId, { silent = false } = {}) => {
      setActiveLocationId(locationId);
      setCommunityGroups(getGroupsForLocation(locationId));
      setFeedSubFilter(getDefaultSubfilter(feedMainMode));
      setMapRootKey((k) => k + 1);
      setNeighborsRootKey((k) => k + 1);
      clearModuleSelection();
      setNeighbors((prev) => prev.filter((n) => !isSelfNeighborCandidate(n, user)));
      setNotifications((prev) =>
        prev.filter(
          (n) =>
            !(n.actionType === "trust_network" && isSelfNeighborCandidate(n.neighborId, user))
        )
      );
      if (!silent) {
        const loc = locations.find((l) => l.id === locationId);
        notifyLocationRemap(locationId, loc);
      }
    },
    [feedMainMode, clearModuleSelection, locations, notifyLocationRemap, user]
  );

  const updateUserLocation = useCallback(
    async (locationId, { street, houseNumber, psc, city, fullAddress, lat, lng, label } = {}) => {
      if (!locationId) return false;
      const municipality = String(city ?? "").trim();
      if (!municipality || !fullAddress) return false;
      const shortLabel = municipality.split("—")[0].split("–")[0].trim() || municipality;
      const current = locations.find((l) => l.id === locationId);
      const { lat: resolvedLat, lng: resolvedLng } = await resolveLocationCoords({
        street,
        houseNumber,
        psc,
        city: municipality,
        lat,
        lng,
        fallbackLat: current?.lat,
        fallbackLng: current?.lng,
      });
      const coordsChanged =
        Math.abs((current?.lat ?? 0) - resolvedLat) > 0.0005 ||
        Math.abs((current?.lng ?? 0) - resolvedLng) > 0.0005;
      const nextLabel =
        locationId === "domov"
          ? current?.label ?? "Domov"
          : String(label ?? current?.label ?? "Místo").trim() || current?.label || "Místo";

      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === locationId
            ? {
                ...loc,
                label: nextLabel,
                address: fullAddress,
                municipality,
                shortLabel,
                lat: resolvedLat,
                lng: resolvedLng,
                radiusKm: loc.radiusKm ?? DEFAULT_RADIUS_KM,
              }
            : loc
        )
      );

      if (locationId === "domov") {
        setUser((u) =>
          u
            ? {
                ...u,
                address: fullAddress,
                location: shortLabel,
                geo: {
                  ...(u.geo ?? {}),
                  city: municipality,
                  lat: resolvedLat,
                  lng: resolvedLng,
                },
              }
            : u
        );
      }

      applyActiveLocationRemap(locationId, { silent: true });

      showToast(
        coordsChanged
          ? `${nextLabel}: ${shortLabel} — vše přemapováno na toto místo.`
          : `${nextLabel}: adresa uložena — obsah je na ${shortLabel}.`,
        "success",
        { locationId, durationMs: 4500 }
      );
      return true;
    },
    [locations, resolveLocationCoords, applyActiveLocationRemap, showToast]
  );

  const addUserLocation = useCallback(
    async ({ street, houseNumber, psc, city, fullAddress, lat, lng, label } = {}) => {
      const placeLabel = String(label ?? "").trim();
      const municipality = String(city ?? "").trim();
      if (!placeLabel || !municipality || !fullAddress) return false;
      const shortLabel = municipality.split("—")[0].split("–")[0].trim() || municipality;
      const slug = placeLabel
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20) || "misto";
      const id = `misto-${slug}-${Date.now().toString(36).slice(-4)}`;
      const { lat: resolvedLat, lng: resolvedLng } = await resolveLocationCoords({
        street,
        houseNumber,
        psc,
        city: municipality,
        lat,
        lng,
      });

      const nextLoc = {
        id,
        emoji: "📍",
        label: placeLabel,
        shortLabel,
        municipality,
        address: fullAddress,
        lat: resolvedLat,
        lng: resolvedLng,
        radiusKm: DEFAULT_RADIUS_KM,
        custom: true,
      };

      setLocations((prev) => [...prev, nextLoc]);
      applyActiveLocationRemap(id, { silent: true });
      showToast(
        `Místo „${placeLabel}“ přidáno — vše je přemapováno na ${shortLabel}.`,
        "success",
        {
          locationId: id,
          durationMs: 4500,
        }
      );
      return true;
    },
    [resolveLocationCoords, applyActiveLocationRemap, showToast]
  );

  const removeUserLocation = useCallback(
    (locationId) => {
      if (!locationId || locationId === "domov") {
        showToast("Domov nelze smazat.", "info");
        return false;
      }
      setLocations((prev) => {
        const next = prev.filter((l) => l.id !== locationId);
        if (activeLocationId === locationId) {
          const fallback = next.find((l) => l.id === "domov") ?? next[0];
          if (fallback) applyActiveLocationRemap(fallback.id, { silent: false });
        }
        return next;
      });
      showToast("Místo odstraněno.", "info");
      return true;
    },
    [activeLocationId, applyActiveLocationRemap, showToast]
  );

  const updateHomeAddress = useCallback(
    async (payload) => updateUserLocation("domov", payload),
    [updateUserLocation]
  );

  const openEventDetail = useCallback(
    (eventId) => {
      setGalleryPreviewQueue([]);
      setSelectedEventId(eventId);
      ensurePastArchiveOpen(eventId);
    },
    [ensurePastArchiveOpen]
  );
  const closeEventDetail = useCallback(() => {
    setSelectedEventId(null);
    setGalleryPreviewQueue([]);
  }, []);

  const postEventChat = useCallback(
    (eventId, text) => {
      if (!user) return;
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          return {
            ...e,
            chat: [...(e.chat ?? []), { sender: user.name, text, time: nowTime() }],
          };
        })
      );
    },
    [user]
  );

  const createEvent = useCallback(
    ({
      title,
      address,
      mapPos,
      category,
      eventDate,
      eventTime,
      timeTbd = false,
      description,
      photo = null,
      notifyInterested,
    }) => {
      if (!user) return;
      const cat = INTEREST_OPTIONS.find((i) => i.id === category);
      const id = `ev-${Date.now()}`;
      const time = timeTbd ? "12:00" : normalizeCzechTime(eventTime) || "12:00";
      const startsAt = eventDate ? new Date(`${eventDate}T${time}`).toISOString() : null;
      const locationLabel = address?.trim() || activeLocation?.address || activeLocation?.shortLabel;
      const newEv = {
        id,
        title: title.trim(),
        date: formatCzechEventSchedule(startsAt, timeTbd),
        dateSort: eventDateSortValue(startsAt),
        startsAt,
        timeTbd,
        location: locationLabel,
        address: locationLabel,
        mapPos: mapPos ?? null,
        locationId: activeLocationId,
        distanceKm: 0.5,
        category,
        categoryLabel: cat?.label ?? category,
        description: description?.trim() || "",
        photo,
        organizer: user.name ?? "Vy",
        fromOffice:
          user.accountType === "urad" ||
          user.accountType === "instituce" ||
          user.role === "urad",
        participants: 1,
        participantIds: [],
        attendees: [{
          id: user.id ?? "me",
          name: user.name,
          initials: user.initials,
          allowPublicAreaLabel: Boolean(user.allowPublicAreaLabel),
          publicAreaLabel: user.publicAreaLabel ?? "",
        }],
        interestTags: [category],
        notifyInterested: notifyInterested,
        chat: [],
        galleryPhotos: [],
      };
      setEvents((prev) => [newEv, ...prev]);
      setJoinedEventIds((prev) => [...prev, id]);
      if (notifyInterested) {
        setNotifications((prev) => [
          {
            id: `n-${Date.now()}`,
            type: "blue",
            title: `Nová událost: ${title}`,
            body: `${cat?.label} · ${locationLabel}`,
            read: false,
            time: "právě teď",
          },
          ...prev,
        ]);
        showToast("Událost vytvořena — zájemci byli upozorněni.", "success");
      } else {
        showToast("Událost vytvořena.", "success");
      }
    },
    [user, activeLocation, activeLocationId, showToast]
  );

  const toggleInterest = useCallback((interestId) => {
    setUserInterests((prev) => ({ ...prev, [interestId]: !prev[interestId] }));
  }, []);

  const markNotificationRead = useCallback(
    (id) => {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (!target) return;
      if (target.actionType === "craftsman_profile") {
        openCraftsmanPublicProfile({
          serviceId: target.serviceId,
          userId: target.craftsmanUserId,
          name: target.title,
        });
        return;
      }
      if (target.actionType === "trust_network") {
        goToHomeWall();
        return;
      }
      if (target.actionType === "trust_received") {
        openProfile();
        setProfileScrollTarget("trust-received");
        return;
      }
      if (target.participantId) {
        openMessages();
        openChat(target.participantId, target.participantName ?? "Soused");
      }
    },
    [notifications, openMessages, openChat, openCraftsmanPublicProfile, openProfile, goToHomeWall]
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const unreadTrustVerifiersCount = useMemo(() => {
    const seen = new Set(trustVerifiersSeenIds);
    return trustVerifiers.filter((v) => v?.confirmerId && !seen.has(v.confirmerId)).length;
  }, [trustVerifiers, trustVerifiersSeenIds]);

  const openTrustVerifiers = useCallback(() => {
    openProfile();
    setProfileScrollTarget("trust-received");
  }, [openProfile]);

  const unreadMessagesCount = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread ?? 0), 0),
    [chats]
  );

  const galleryPreviewRequest = galleryPreviewQueue[0] ?? null;

  const feedGalleryActivities = useMemo(
    () => getFeedGalleryActivities(eventGalleryActivity),
    [eventGalleryActivity]
  );

  const unreadCalendarGalleryCount = useMemo(
    () => countUnreadCalendarGallery(eventGalleryActivity),
    [eventGalleryActivity]
  );

  const feedPostsForLocation = useMemo(() => {
    const base = filterByActiveLocation(FEED_POSTS, activeLocationId, activeLocation);
    return applyListingSaleVisibility(base, listingSaleOrders, user?.id ?? "me");
  }, [activeLocationId, activeLocation, listingSaleOrders, user?.id]);

  const userPostsForLocation = useMemo(() => {
    const base = filterByActiveLocation(userPosts, activeLocationId, activeLocation);
    return applyListingSaleVisibility(base, listingSaleOrders, user?.id ?? "me");
  }, [userPosts, activeLocationId, activeLocation, listingSaleOrders, user?.id]);

  const neighborHelpForLocation = useMemo(
    () => filterByActiveLocation(neighborHelp, activeLocationId, activeLocation),
    [neighborHelp, activeLocationId, activeLocation]
  );

  const updateLendingAvailability = useCallback((patch) => {
    setLendingAvailability((prev) => ({
      ...prev,
      ...patch,
      availabilityMessage:
        patch.availabilityMessage !== undefined
          ? String(patch.availabilityMessage)
          : prev.availabilityMessage,
      onVacation:
        patch.onVacation !== undefined ? Boolean(patch.onVacation) : prev.onVacation,
    }));
    showToast("Dostupnost půjčovny uložena — platí u všech vašich věcí.", "success");
  }, [showToast]);

  const applyOwnerAvailability = useCallback(
    (item) => {
      const isMine =
        item.mine || item.authorId === "me" || (user?.id && item.authorId === user.id);
      if (!isMine) return item;
      return {
        ...item,
        onVacation: lendingAvailability.onVacation,
        availabilityMessage: lendingAvailability.availabilityMessage,
      };
    },
    [lendingAvailability, user?.id]
  );

  const lendingItemsForLocation = useMemo(
    () =>
      filterByActiveLocation(
        [...userLendingItems, ...LENDING_ITEMS],
        activeLocationId,
        activeLocation
      ).map(applyOwnerAvailability),
    [userLendingItems, activeLocationId, activeLocation, applyOwnerAvailability]
  );

  const sponsoredBannersForLocation = useMemo(
    () => filterByActiveLocation(activeSponsoredBanners, activeLocationId, activeLocation),
    [activeSponsoredBanners, activeLocationId, activeLocation]
  );

  const locationEvents = useMemo(
    () => filterByActiveLocation(events, activeLocationId, activeLocation),
    [events, activeLocation, activeLocationId]
  );

  const sortEventsByDate = (a, b) =>
    (a.startsAt ? new Date(a.startsAt).getTime() : a.dateSort * 86400000) -
    (b.startsAt ? new Date(b.startsAt).getTime() : b.dateSort * 86400000);

  const upcomingEvents = useMemo(() => {
    return locationEvents.filter((e) => !isEventPast(e)).sort(sortEventsByDate);
  }, [locationEvents]);

  const pastEvents = useMemo(() => {
    return locationEvents.filter((e) => isEventPast(e)).sort((a, b) => sortEventsByDate(b, a));
  }, [locationEvents]);

  const filteredServicesCatalog = useMemo(() => {
    return filterByActiveLocation(
      servicesCatalog.filter((s) => !blockedUserIds.includes(s.id)),
      activeLocationId,
      activeLocation
    ).sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      const boostDiff = (b.catalogBoostRank ?? 0) - (a.catalogBoostRank ?? 0);
      if (boostDiff !== 0) return boostDiff;
      return a.distanceKm - b.distanceKm;
    });
  }, [servicesCatalog, blockedUserIds, activeLocation, activeLocationId]);

  const servicesCatalogWithRatings = useMemo(
    () =>
      filteredServicesCatalog.map((s) => ({
        ...s,
        rating: computeServiceRating(serviceReviews, s.id) ?? s.rating,
      })),
    [filteredServicesCatalog, serviceReviews]
  );

  const servicesCatalogReachable = useMemo(
    () => filterServicesByReach(servicesCatalogWithRatings),
    [servicesCatalogWithRatings]
  );

  const institutionsForMap = useMemo(() => {
    const base = INSTITUTIONS_MAP_PLACES.map((p) =>
      mergeInstitutionPlace(p, institutionPlaceOverrides[p.id])
    );
    const approved = placeSuggestions
      .filter((s) => s.status === SUGGESTION_STATUS.APPROVED)
      .map(suggestionToPlace);
    const pending = placeSuggestions
      .filter((s) => s.status === SUGGESTION_STATUS.PENDING)
      .map((s) => ({ ...suggestionToPlace(s), isPendingSuggestion: true, status: SUGGESTION_STATUS.PENDING }));
    const withClaims = [...base, ...approved].map((p) => {
      const claim = institutionClaims.find(
        (c) => c.placeId === p.id && c.status === SUGGESTION_STATUS.APPROVED
      );
      return {
        ...p,
        claimedByUserId: claim?.userId ?? p.claimedByUserId,
        claimStatus: claim ? CLAIM_STATUS.CLAIMED : p.claimStatus ?? CLAIM_STATUS.UNCLAIMED,
        isVerified: p.isVerified || Boolean(claim),
      };
    });
    return filterByActiveLocation([...withClaims, ...pending], activeLocationId, activeLocation);
  }, [activeLocationId, activeLocation, institutionPlaceOverrides, placeSuggestions, institutionClaims]);

  const institutionsSorted = useMemo(
    () => sortInstitutionsByPriority(institutionsForMap.filter((p) => !p.isPendingSuggestion)),
    [institutionsForMap]
  );

  const pendingPlaceSuggestions = useMemo(
    () => institutionsForMap.filter((p) => p.isPendingSuggestion),
    [institutionsForMap]
  );

  const ownedInstitution = useMemo(() => {
    if (!user) return null;
    const uid = user.id ?? "me";
    return institutionsSorted.find(
      (p) => p.claimedByUserId === uid || institutionClaims.some(
        (c) => c.placeId === p.id && c.userId === uid && c.status === SUGGESTION_STATUS.APPROVED
      )
    ) ?? null;
  }, [user, institutionsSorted, institutionClaims]);

  const ownedService = useMemo(() => {
    if (!user) return null;
    const uid = user.id ?? "me";
    return (
      servicesCatalog.find((s) => s.ownerUserId === uid) ??
      servicesCatalog.find((s) => s.id === "svc-mine") ??
      (testRoleId === "remeslnik" ? servicesCatalog.find((s) => s.id === "svc1") : null) ??
      null
    );
  }, [user, servicesCatalog, testRoleId]);

  const saveBusinessHours = useCallback(
    ({ hours, note } = {}) => {
      const nextHours =
        typeof hours === "string" && hours.trim() ? hours.trim() : businessHours;
      setBusinessHours(nextHours);
      if (typeof note === "string") setBusinessHoursNote(note.trim());
      if (ownedInstitution) {
        updateOwnedInstitution({ hours: nextHours });
      }
      showToast("Otevírací doba uložena.", "success");
    },
    [businessHours, ownedInstitution, updateOwnedInstitution, showToast]
  );

  const expressInterestInInquiry = useCallback(
    (inquiry) => {
      if (!user || !inquiry?.authorId) return false;
      if (inquiry.interestSent) {
        showToast("U této poptávky už máte zájem.", "info");
        return false;
      }
      const service = ownedService;
      const craftsmanName = user.name ?? service?.name ?? "Řemeslník";
      const title = inquiry.title?.trim() || "vaši poptávku";
      const text = `Mám zájem o vaši poptávku „${title}“. Rád se domluvím na termínu.`;
      const meta = {
        kind: "interest",
        inquiryId: inquiry.id,
        inquiryTitle: title,
        serviceId: service?.id ?? null,
        craftsmanUserId: user.id ?? "me",
        craftsmanName,
      };
      sendMessage(inquiry.authorId, inquiry.author, text, meta);
      setB2bInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, interestSent: true, read: true } : i))
      );
      setNotifications((prev) => [
        {
          id: `n-interest-${Date.now()}`,
          type: "green",
          title: `${craftsmanName} má zájem o poptávku`,
          body: `„${title}“ · klepněte pro profil a recenze`,
          read: false,
          time: "právě teď",
          actionType: "craftsman_profile",
          serviceId: service?.id ?? null,
          craftsmanUserId: user.id ?? "me",
        },
        ...prev,
      ]);
      showToast(
        `${inquiry.author} dostane zprávu a může otevřít váš profil s recenzemi.`,
        "success"
      );
      return true;
    },
    [user, ownedService, sendMessage, showToast]
  );

  const b2bInquiriesForRole = useMemo(() => {
    const now = inquiryClock;
    const isMobilni =
      isMobilniTestRole(testRoleId) || resolveBusinessSubtype(user) === "mobilni";
    const isFyzicka =
      isFyzickaTestRole(testRoleId) || resolveBusinessSubtype(user) === "fyzicka";

    if (isMobilni) {
      return filterCraftsmanInquiries(b2bInquiries, {
        radiusKm: craftsmanRadius,
        service: ownedService,
        now,
      });
    }
    if (isFyzicka || appUserRole === APP_ROLES.OFFICE) {
      return b2bInquiries.filter(
        (i) => i.type === "event_outreach" && (!i.visibleAt || i.visibleAt <= now)
      );
    }
    return b2bInquiries.filter((i) => !i.visibleAt || i.visibleAt <= now);
  }, [
    b2bInquiries,
    appUserRole,
    testRoleId,
    user,
    craftsmanRadius,
    ownedService,
    inquiryClock,
  ]);

  const sendEventOutreach = useCallback(
    ({ eventTitle, message, radiusKm = 5 }) => {
      if (!user || !message?.trim()) return;
      const targets = institutionsSorted.filter(
        (p) => p.accountType === "podnik" || p.accountType === "instituce"
      );
      targets.forEach((place) => {
        setB2bInquiries((prev) => [
          {
            id: `eo-${Date.now()}-${place.id}`,
            type: "event_outreach",
            title: eventTitle ?? "Nabídka spolupráce na akci",
            text: message.trim(),
            author: user.name,
            authorId: user.id ?? "me",
            time: "Právě teď",
            placeId: place.id,
            read: false,
          },
          ...prev,
        ]);
      });
      showToast(`Nabídka spolupráce odeslána ${targets.length} místům v okolí ${radiusKm} km.`, "success");
    },
    [user, showToast, institutionsSorted]
  );

  const thingsForModule = useMemo(() => {
    const lending = lendingItemsForLocation.map(normalizeLendingToThing);
    const lendingIds = new Set(lending.map((item) => item.id));
    const posts = [...userPostsForLocation, ...feedPostsForLocation]
      .filter(isThingsModuleListing)
      .filter((p) => !lendingIds.has(p.id))
      .map(normalizeFeedPostToThing);
    return filterThingsItems([...posts, ...lending], {
      categoryId: thingsCategory,
      lendingSubCategory: thingsLendingSubCategory,
      search: thingsSearchQuery,
      skipRadius: true,
    });
  }, [
    userPostsForLocation,
    feedPostsForLocation,
    lendingItemsForLocation,
    thingsCategory,
    thingsLendingSubCategory,
    thingsSearchQuery,
  ]);

  const localPeopleProfiles = useMemo(
    () =>
      collectLocalPeople({
        municipality: activeLocation?.municipality ?? activeLocation?.shortLabel ?? "",
        currentUser: user,
        neighbors,
        events: locationEvents,
        posts: [...feedPostsForLocation, ...userPostsForLocation, ...userGroupPosts],
        lendingItems: lendingItemsForLocation,
        neighborHelp: neighborHelpForLocation,
        chats,
      }),
    [
      activeLocation,
      user,
      neighbors,
      locationEvents,
      feedPostsForLocation,
      userPostsForLocation,
      userGroupPosts,
      lendingItemsForLocation,
      neighborHelpForLocation,
      chats,
    ]
  );

  const personNameIndex = useMemo(() => buildPersonNameIndex(localPeopleProfiles), [localPeopleProfiles]);

  const formatPersonName = useCallback(
    (personInput) => getDisplayNameForPerson(personNameIndex, personInput),
    [personNameIndex]
  );

  const getPersonPhoto = useCallback(
    (personInput) => {
      if (personInput == null) return null;
      const id =
        typeof personInput === "string"
          ? personInput
          : personInput?.id ?? personInput?.participantId ?? null;
      if (id && (id === user?.id || id === "me")) return user?.profilePhoto ?? null;
      const fromIndex = getPersonPhotoFromIndex(personNameIndex, personInput);
      if (fromIndex) return fromIndex;
      try {
        const raw = localStorage.getItem("podplot-public-photos-v1");
        const map = raw ? JSON.parse(raw) : {};
        if (id && map[id]) return map[id];
      } catch {
        /* ignore */
      }
      return null;
    },
    [personNameIndex, user?.id, user?.profilePhoto]
  );

  const allPostsForContacts = useMemo(
    () => [...FEED_POSTS, ...userPosts, ...userGroupPosts],
    [userPosts, userGroupPosts]
  );

  const messageContactDirectory = useMemo(
    () =>
      buildMessageContactDirectory({
        neighbors,
        feedPosts: feedPostsForLocation,
        userPosts: userPostsForLocation,
        userGroupPosts,
        events,
        servicesCatalog: filteredServicesCatalog,
        lendingItems: lendingItemsForLocation,
        neighborHelp: neighborHelpForLocation,
        chats,
        municipality: activeLocation?.municipality ?? activeLocation?.shortLabel ?? "",
      }).map((c) => ({
        ...c,
        displayName: getDisplayNameForPerson(personNameIndex, c),
      })),
    [
      neighbors,
      feedPostsForLocation,
      userPostsForLocation,
      userGroupPosts,
      events,
      filteredServicesCatalog,
      lendingItemsForLocation,
      neighborHelpForLocation,
      chats,
      activeLocation,
      personNameIndex,
    ]
  );

  const suggestedMessageContacts = useMemo(
    () =>
      getSuggestedMessageContacts({
        user,
        myUsefulPosts,
        mySearchHelpPosts,
        helpOffersByPost,
        joinedEventIds,
        confirmationsGiven,
        neighbors,
        allPosts: allPostsForContacts,
        events,
      }).map((c) => ({
        ...c,
        displayName: getDisplayNameForPerson(personNameIndex, c),
      })),
    [
      user,
      myUsefulPosts,
      mySearchHelpPosts,
      helpOffersByPost,
      joinedEventIds,
      confirmationsGiven,
      neighbors,
      allPostsForContacts,
      events,
      personNameIndex,
    ]
  );

  const proposedClubs = groupProposals;
  const activeClubs = communityGroups.map((g) => ({
    ...g,
    active: true,
    tag: `${g.emoji} ${g.name}`,
    votes: 5,
    required: 5,
    voted: false,
  }));
  const proposeClub = proposeGroup;
  const voteClub = voteGroupProposal;

  return (
    <AppContext.Provider
      value={{
        user,
        formatPersonName,
        getPersonPhoto,
        personNameIndex,
        register,
        login,
        logout,
        requestPasswordReset,
        completePasswordRecovery,
        changePassword,
        passwordRecovery,
        showPodplotStory,
        dismissPodplotStory,
        credits,
        activeTab,
        setActiveTab,
        selectMainTab,
        neighborsRootKey,
        mapRootKey,
        catalogRootKey,
        profileOpen,
        openProfile,
        closeProfile,
        messagesOpen,
        openMessages,
        closeMessages,
        plusMenuOpen,
        openPlusMenu,
        closePlusMenu,
        globalSearchQuery,
        setGlobalSearchQuery,
        mapFocus,
        pendingMapReportsCategory,
        clearPendingMapReportsCategory,
        openReportOnMapFromHome,
        openMapReport,
        openCreateEvent,
        createEventOpen,
        setCreateEventOpen,
        reportFormOpen,
        setReportFormOpen,
        placeSuggestionOpen,
        openPlaceSuggestion,
        closePlaceSuggestion,
        pendingNeighborsSection,
        setPendingNeighborsSection,
        pendingHelpFormOpen,
        setPendingHelpFormOpen,
        pendingThingsItemId,
        setPendingThingsItemId,
        homeEventGallery,
        openHomeEventGallery,
        closeHomeEventGallery,
        openLendingFromHome,
        clearMapFocus,
        confirmLendingReturn,
        toast,
        showToast,
        rentItem,
        buyListing,
        confirmListingHandover,
        listingSaleOrders,
        addCredits,
        payAmount,
        reservations,
        userPosts,
        userPostsForLocation,
        feedPostsForLocation,
        lendingItemsForLocation,
        userGroupPosts,
        userLendingItems,
        lendingAvailability,
        updateLendingAvailability,
        createOpen,
        createCategory,
        createGroupId,
        editingPost,
        openCreate,
        openEditListing,
        closeCreate,
        publishListing,
        updateUserPost,
        updateSecurityReport,
        updateAreaNewsItem,
        updateOfficePrompt,
        topPost,
        requestTopPayment,
        pendingPayment,
        setPendingPayment,
        confirmPendingPayment,
        feedMainMode,
        setFeedMainMode,
        switchFeedMainMode,
        feedSubFilter,
        setFeedSubFilter: selectFeedSubFilter,
        selectFeedSubFilter,
        showDiscoveryWall,
        setShowDiscoveryWall,
        expandedPillar,
        togglePillar,
        goToHomeWall,
        communityGroups,
        groupProposals,
        proposeGroup,
        voteGroupProposal,
        dismissedGroupProposalIds,
        dismissGroupProposal,
        restoreGroupProposal,
        getUiPref,
        setUiPref,
        toggleUiPref,
        createGroupModalOpen,
        setCreateGroupModalOpen,
        activeGroupId,
        openGroup,
        closeGroup,
        groupFilter,
        setGroupFilter,
        reportedPosts,
        reportPost,
        reportEvent,
        eventReporterIds,
        reportedReports,
        reportSecurityReport,
        userReports,
        extraReports,
        addSecurityReport,
        proposedClubs,
        activeClubs,
        proposeClub,
        voteClub,
        chats,
        sendMessage,
        expressInterestInInquiry,
        receiveMessage,
        markChatRead,
        getChatMessages,
        openChat,
        startChat,
        closeChat,
        setChatActiveTopic,
        chatModal,
        craftsmanProfileOpen,
        openCraftsmanPublicProfile,
        closeCraftsmanPublicProfile,
        resolveChatParticipantService,
        unreadMessagesCount,
        messageContactDirectory,
        suggestedMessageContacts,
        events,
        upcomingEvents,
        pastEvents,
        joinEvent,
        isJoinedEvent,
        canUploadEventPhotos,
        addEventGalleryPhoto,
        registerGalleryPhotoActivity,
        eventGalleryActivity,
        feedGalleryActivities,
        unreadCalendarGalleryCount,
        dismissGalleryFeedActivity,
        markGalleryPhotoRead,
        openGalleryPhotoPreview,
        openUnreadGalleryPhotos,
        galleryPreviewRequest,
        galleryPreviewQueue,
        consumeGalleryPreview,
        openEventGalleryFromFeed,
        eventHasUnreadGallery,
        getEventUnreadGalleryCount,
        updateProfilePhoto,
        removeProfilePhoto,
        updatePublicDisambiguation,
        updateAccountProfile,
        updateHomeAddress,
        updateUserLocation,
        addUserLocation,
        removeUserLocation,
        openEventDetail,
        closeEventDetail,
        selectedEventId,
        postEventChat,
        createEvent,
        calendarFilter,
        setCalendarFilter,
        notifications,
        markNotificationRead,
        unreadCount,
        neighbors,
        confirmNeighbor,
        dismissTrustNeighbor,
        hideTrustHomePrompt,
        showTrustHomePrompt,
        trustHomePromptHidden,
        confirmationsGiven,
        trustDismissedIds,
        trustVerifiers,
        unreadTrustVerifiersCount,
        markTrustVerifiersSeen,
        openTrustVerifiers,
        adminReports,
        blockedUserIds,
        reportUser,
        blockUser,
        isAdminMode,
        setIsAdminMode,
        userInterests,
        toggleInterest,
        locations,
        activeLocation,
        activeLocationId,
        setActiveLocation,
        servicesCatalog: servicesCatalogWithRatings,
        servicesCatalogReachable,
        institutionMapCategory,
        setInstitutionMapCategory,
        localGuideCategory: institutionMapCategory,
        setLocalGuideCategory: setInstitutionMapCategory,
        localGuideSearchQuery,
        setLocalGuideSearchQuery,
        appWorld: expandedPillar,
        toggleWorld: togglePillar,
        institutionsForMap,
        institutionsSorted,
        pendingPlaceSuggestions,
        placeSuggestions,
        submitPlaceSuggestion,
        approvePlaceSuggestion,
        submitInstitutionClaim,
        institutionClaims,
        updateOwnedInstitution,
        updatePlaceCommunityDetails,
        ownedInstitution,
        ownedService,
        serviceReviews,
        addServiceReview,
        reportServiceReview,
        placeReviews,
        addPlaceReview,
        reportPlaceReview,
        updateServiceDescription,
        updateServiceFocus,
        b2bInquiries: b2bInquiriesForRole,
        markB2bInquiryRead,
        sendEventOutreach,
        workDashboardTab,
        setWorkDashboardTab,
        isB2BWorkMode,
        isMobilniWorkMode,
        isFyzickaWorkMode,
        businessIsOpen,
        setBusinessIsOpen,
        businessHours,
        setBusinessHours,
        businessHoursNote,
        setBusinessHoursNote,
        businessNeighborNote,
        setBusinessNeighborNote,
        saveBusinessHours,
        publishBusinessNeighborNote,
        openBusinessComposer,
        pendingBusinessAction,
        clearPendingBusinessAction,
        invoiceOpen,
        openInvoice,
        closeInvoice,
        createInvoice,
        craftsmanInvoices,
        thingsForModule,
        thingsCategory,
        setThingsCategory,
        thingsLendingSubCategory,
        setThingsLendingSubCategory,
        thingsSearchQuery,
        setThingsSearchQuery,
        thingsMapRadiusKm,
        setThingsMapRadiusKm,
        moduleViewModes,
        setModuleViewMode,
        moduleSelection,
        selectModuleItem,
        clearModuleSelection,
        openModuleItemDetail,
        showModuleItemOnMap,
        homeModule,
        setHomeModule,
        neighborHelp: neighborHelpForLocation.filter((h) => !blockedUserIds.includes(h.id)),
        addNeighborHelpPost,
        addGroupBoardPost,
        serviceRequests,
        addServiceRequest,
        neighborHelpFilter,
        setNeighborHelpFilter,
        sosAlert,
        triggerSos,
        dismissSos,
        profileHint,
        dismissProfileHint,
        goToProfileFromHint,
        profileScrollTarget,
        clearProfileScrollTarget,
        promoteProfile,
        sponsoredBanners: sponsoredBannersForLocation,
        craftsmanRadius,
        setCraftsmanRadius,
        reportsMapRadiusKm,
        setReportsMapRadiusKm,
        eventsMapRadiusKm,
        setEventsMapRadiusKm,
        testRoleId,
        switchTestRole,
        userProfileIds,
        addUserProfile,
        openOfficePromptCall,
        openOfficeAnnouncementComposer,
        openOfficeCrisisComposer,
        pendingOfficeAction,
        clearPendingOfficeAction,
        areaNews,
        activeCrisis,
        acknowledgeNews,
        acknowledgedNewsIds,
        lunchMenusForLocation,
        lunchSubscriptions,
        toggleLunchSubscription,
        notificationPrefs,
        updateNotificationPrefs,
        toggleLunchMenuAlerts,
        toggleMessageAlerts,
        businessNotificationPrefs,
        subscribeMobilniPush,
        lunchMenuDraft,
        setLunchMenuDraft,
        publishLunchMenu,
        lunchSubscribersCount,
        craftsmanWallet,
        businessWallet,
        craftsmanAcceptsOrders,
        setCraftsmanAcceptsOrders,
        serviceOrders,
        createEscrowOrder,
        releaseEscrowOrder,
        withdrawToBank,
        municipalityPrompts,
        myMunicipalityPrompts,
        promptCalls,
        dismissedPromptCallIds,
        dismissPromptCall,
        restorePromptCall,
        submitMunicipalityPrompt,
        createPromptCall,
        createOfficePrompt,
        updatePromptStatus,
        sendOfficePromptReply,
        declineOfficePrompt,
        publishAreaNews,
        publishCrisisAlert,
        areaNewsTitleDraft,
        setAreaNewsTitleDraft,
        areaNewsBodyDraft,
        setAreaNewsBodyDraft,
        crisisTitleDraft,
        setCrisisTitleDraft,
        crisisBodyDraft,
        setCrisisBodyDraft,
        officePromptTitleDraft,
        setOfficePromptTitleDraft,
        officePromptBodyDraft,
        setOfficePromptBodyDraft,
        appUserRole,
        viewAsNeighbor,
        toggleViewAsNeighbor,
        markPostUseful,
        getUsefulCount,
        hasMarkedUseful,
        offerHelpOnPost,
        getHelpOffers,
        hasOfferedHelp,
        myHelpOffers,
        helpSearchOnPost,
        getSearchHelpCount,
        hasHelpedSearch,
        isSearchHighlighted,
        zboziSearchQuery,
        setZboziSearchQuery: setZboziSearch,
        zboziMarketCategory,
        setZboziMarketCategory: setZboziMarketCat,
        servicesSearchQuery,
        setServicesSearchQuery: setServicesSearch,
        servicesParentCategory,
        setServicesParentCategory: setServicesParentCat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
