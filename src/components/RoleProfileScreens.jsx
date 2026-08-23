import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { TEST_ROLES } from "../data/testRoles.js";
import { TEST_PERSONAS } from "../data/businessProfiles.js";
import { LUNCH_PUBLISH_PLANS } from "../data/lunchMenus.js";
import {
  CRAFTSMAN_RADIUS_MIN_KM,
  CRAFTSMAN_RADIUS_MAX_KM,
  CRAFTSMAN_RADIUS_NATIONWIDE_KM,
  formatCraftsmanRadiusLabel,
  isNationwideRadius,
} from "../data/craftsmanSettings.js";
import {
  getPrimaryServiceSubcategoryId,
  getSecondaryServiceSubcategoryIds,
  buildServiceSubcategoryList,
  getServiceCategory,
} from "../data/serviceCategories.js";
import {
  validateAddressFields,
  formatFullAddress,
  parseStoredAddress,
  ADDRESS_PRIVACY_NOTE_INLINE,
} from "../data/addressValidation.js";
import { SKIP_REGISTRATION, ENABLE_DEV_ROLE_SWITCH } from "../data/devConfig.js";
import PaymentModal from "./PaymentModal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import BusinessEntityManagement from "./entity/BusinessEntityManagement.jsx";
import ServiceProfileEditor from "./entity/ServiceProfileEditor.jsx";
import CraftsmanProfilePanel from "./CraftsmanProfilePanel.jsx";
import CraftCategoryPicker from "./CraftCategoryPicker.jsx";
import StructuredAddressFields from "./StructuredAddressFields.jsx";
import { IconMapPin } from "../data/icons.jsx";
import AccountTypeIcon from "./AccountTypeIcon.jsx";

/** Osobní profily uživatele — bez institucionálních účtů (úřad). */
const PERSONAL_ROLE_IDS = ["soused", "podnik", "remeslnik"];

function ProfileRoleChip({ role, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
        active
          ? "border-[#3D7A68] bg-[#E8F3EF] text-[#1B4D3E]"
          : "border-stone-200 bg-white text-stone-600 hover:border-[#C5DDD4]"
      }`}
    >
      <AccountTypeIcon roleId={role.id} accountType={role.accountType} className="w-3.5 h-3.5" />
      {role.label}
      {active ? <span className="text-[9px] uppercase opacity-70">●</span> : null}
    </button>
  );
}

/** Zkušební přepínač rolí (Developer Mode) — v produkci skrytý. Úřad jen jako samostatný účet. */
export function ProfileTypeTestSwitcher() {
  const { testRoleId, switchTestRole } = useApp();
  if (!ENABLE_DEV_ROLE_SWITCH) return null;

  const personal = TEST_ROLES.filter((r) => PERSONAL_ROLE_IDS.includes(r.id));
  const office = TEST_ROLES.filter((r) => r.id === "urad");

  return (
    <section className="rounded-xl border border-dashed border-amber-300 bg-amber-50/40 p-3 mb-3">
      <h3 className="text-xs font-bold text-stone-900 mb-2">Developer · role</h3>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {personal.map((r) => (
          <ProfileRoleChip
            key={r.id}
            role={r}
            active={testRoleId === r.id}
            onClick={() => switchTestRole(r.id)}
          />
        ))}
      </div>
      <p className="text-[10px] text-amber-800/80 mb-1.5 leading-snug">
        Úřad je samostatná registrace (oficiální e-mail obce) — zde jen pro vývoj.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {office.map((r) => (
          <ProfileRoleChip
            key={r.id}
            role={r}
            active={testRoleId === r.id}
            onClick={() => switchTestRole(r.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default function MyProfilesPanel({ embedded = false }) {
  const {
    testRoleId,
    switchTestRole,
    userProfileIds,
    user,
    setupAdditionalProfile,
  } = useApp();
  const [adding, setAdding] = useState(false);
  const [setupRoleId, setSetupRoleId] = useState(null);
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [addressErrors, setAddressErrors] = useState({});
  const [businessName, setBusinessName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceHomeGroup, setServiceHomeGroup] = useState("domov-zahrada");
  const [primarySubcategory, setPrimarySubcategory] = useState(null);
  const [secondarySubcategories, setSecondarySubcategories] = useState([]);
  const [customKeywords, setCustomKeywords] = useState("");
  const [craftsmanRadius, setCraftsmanRadiusLocal] = useState(15);
  const [acceptsOrders, setAcceptsOrders] = useState(true);
  const [formError, setFormError] = useState("");

  const activeIds = SKIP_REGISTRATION
    ? PERSONAL_ROLE_IDS
    : (userProfileIds?.length ? userProfileIds : ["soused"]).filter((id) =>
        PERSONAL_ROLE_IDS.includes(id)
      );
  const activeProfiles = activeIds
    .map((id) => TEST_ROLES.find((r) => r.id === id))
    .filter(Boolean);
  const addableProfiles = SKIP_REGISTRATION
    ? []
    : TEST_ROLES.filter((r) => PERSONAL_ROLE_IDS.includes(r.id) && !activeIds.includes(r.id));

  const setupRole = setupRoleId ? TEST_ROLES.find((r) => r.id === setupRoleId) : null;
  const isMobilniSetup = setupRole?.businessSubtype === "mobilni";
  const serviceSubcategories = buildServiceSubcategoryList(
    primarySubcategory,
    secondarySubcategories
  );

  const resetAddressFields = () => {
    setStreet("");
    setHouseNumber("");
    setPsc("");
    setCity("");
    setAddressErrors({});
  };

  const loadAddressFields = (fullAddress) => {
    const parsed = parseStoredAddress(fullAddress || "");
    setStreet(parsed.street);
    setHouseNumber(parsed.houseNumber);
    setPsc(parsed.psc);
    setCity(parsed.city);
    setAddressErrors({});
  };

  const resetSetupForm = () => {
    setSetupRoleId(null);
    resetAddressFields();
    setBusinessName("");
    setServiceDescription("");
    setServiceHomeGroup("domov-zahrada");
    setPrimarySubcategory(null);
    setSecondarySubcategories([]);
    setCustomKeywords("");
    setCraftsmanRadiusLocal(15);
    setAcceptsOrders(true);
    setFormError("");
  };

  const startSetup = (roleId) => {
    setSetupRoleId(roleId);
    loadAddressFields(user?.address ?? "");
    setBusinessName("");
    setServiceDescription("");
    setServiceHomeGroup("domov-zahrada");
    setPrimarySubcategory(null);
    setSecondarySubcategories([]);
    setCustomKeywords("");
    setCraftsmanRadiusLocal(15);
    setAcceptsOrders(true);
    setFormError("");
    setAdding(false);
  };

  const cancelSetup = () => {
    resetSetupForm();
    setAdding(false);
  };

  const submitSetup = () => {
    setFormError("");
    const addressResult = validateAddressFields({ street, houseNumber, psc, city });
    setAddressErrors(addressResult.errors);
    if (!addressResult.valid) {
      setFormError("Doplňte adresu ve správném formátu (ulice, č.p., PSČ).");
      return;
    }
    if (isMobilniSetup && !primarySubcategory) {
      setFormError("Vyberte hlavní zaměření služby.");
      return;
    }
    const fullAddress = formatFullAddress({ street, houseNumber, psc, city });
    const keywords = customKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const result = setupAdditionalProfile?.(setupRoleId, {
      address: fullAddress,
      businessName: businessName.trim() || undefined,
      serviceDescription,
      serviceHomeGroup,
      serviceSubcategories,
      primarySubcategory,
      serviceKeywords: keywords,
      craftsmanRadius,
      craftsmanAcceptsOrders: acceptsOrders,
    });
    if (!result?.ok) {
      setFormError(result?.error || "Nepodařilo se vytvořit profil.");
      return;
    }
    resetSetupForm();
  };

  return (
    <section
      className={
        embedded
          ? "pt-3 mt-3 border-t border-stone-100"
          : "rounded-xl border border-[#C5DDD4] bg-white p-3 mb-3"
      }
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="text-[11px] font-bold text-stone-800 uppercase tracking-wide">
          Moje profily
        </h3>
        {addableProfiles.length > 0 && !adding && !setupRole && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-[11px] font-semibold text-[#3D7A68]"
          >
            + Přidat
          </button>
        )}
      </div>

      {!embedded ? (
        <p className="text-[10px] text-stone-500 mb-2 leading-snug">
          Přepínejte mezi sousedem, mobilní službou a provozovnou. Úřední účet se zakládá
          jen samostatnou registrací s oficiálním e-mailem obce.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {activeProfiles.map((r) => (
          <ProfileRoleChip
            key={r.id}
            role={r}
            active={testRoleId === r.id}
            onClick={() => switchTestRole(r.id)}
          />
        ))}
      </div>

      {adding && !setupRole && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {addableProfiles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => startSetup(r.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-[#3D7A68]/50 text-[11px] font-semibold text-[#1B4D3E] bg-[#F1F6F5]"
            >
              <AccountTypeIcon roleId={r.id} accountType={r.accountType} className="w-3.5 h-3.5" />
              {r.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="text-[11px] font-semibold text-stone-400 px-2"
          >
            Zrušit
          </button>
        </div>
      )}

      {setupRole && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40"
            aria-label="Zavřít"
            onClick={cancelSetup}
          />
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[#C5DDD4] bg-white p-4 space-y-3 shadow-xl">
          <div>
            <p className="text-sm font-semibold text-stone-900">
              Nový profil: {setupRole.label}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
              Stejné přihlášení jako{" "}
              <span className="font-semibold text-stone-700">{user?.name}</span>
              — vyplňte jen katalog a působnost.
            </p>
          </div>

          {isMobilniSetup && (
            <label className="block">
              <span className="text-xs font-semibold text-stone-600">
                Katalogové jméno
              </span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={`např. ${user?.name?.split(" ")[0] || "Jan"} — instalatér`}
                className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
              />
            </label>
          )}

          {!isMobilniSetup && (
            <label className="block">
              <span className="text-xs font-semibold text-stone-600">Název provozovny</span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="např. Kavárna U Ráje"
                className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
              />
            </label>
          )}

          <StructuredAddressFields
            street={street}
            houseNumber={houseNumber}
            psc={psc}
            city={city}
            onStreetChange={setStreet}
            onHouseNumberChange={setHouseNumber}
            onPscChange={setPsc}
            onCityChange={setCity}
            fieldErrors={addressErrors}
            onClearError={(key) => setAddressErrors((prev) => ({ ...prev, [key]: "" }))}
            legend={isMobilniSetup ? "Výchozí adresa / působnost" : "Adresa provozovny"}
            privacyNote={ADDRESS_PRIVACY_NOTE_INLINE}
          />

          {isMobilniSetup && (
            <>
              <label className="block">
                <span className="text-xs font-semibold text-stone-600">Popis služeb</span>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={3}
                  placeholder="Čím se zabýváte, co nabízíte sousedům…"
                  className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white resize-none"
                />
              </label>

              <div>
                <p className="text-xs font-semibold text-stone-600 mb-1">Kapacita a dojezd</p>
                <label className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-sm font-medium">
                    {acceptsOrders ? "Přijímám zakázky" : "Kapacita plná"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAcceptsOrders((v) => !v)}
                    className="text-xs font-semibold text-[#3D7A68]"
                  >
                    Přepnout
                  </button>
                </label>
                <label className="block mt-2">
                  <span className="text-xs text-stone-500">
                    Dojezd: {formatCraftsmanRadiusLabel(craftsmanRadius)}
                  </span>
                  <input
                    type="range"
                    min={CRAFTSMAN_RADIUS_MIN_KM}
                    max={CRAFTSMAN_RADIUS_MAX_KM}
                    value={Math.min(
                      CRAFTSMAN_RADIUS_MAX_KM,
                      Math.max(CRAFTSMAN_RADIUS_MIN_KM, craftsmanRadius)
                    )}
                    onChange={(e) => setCraftsmanRadiusLocal(Number(e.target.value))}
                    className="w-full mt-1 accent-[#3D7A68]"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <CraftCategoryPicker
                  homeGroup={serviceHomeGroup}
                  onHomeGroupChange={setServiceHomeGroup}
                  primaryId={primarySubcategory}
                  onPrimaryChange={setPrimarySubcategory}
                  secondaryIds={secondarySubcategories}
                  onSecondaryChange={setSecondarySubcategories}
                />
                <label className="block">
                  <span className="text-xs font-semibold text-stone-600">
                    Klíčová slova (volitelně)
                  </span>
                  <input
                    type="text"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                    placeholder="např. bojler, sifon"
                    className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
                  />
                </label>
              </div>
            </>
          )}

          {formError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancelSetup}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-stone-200 text-stone-600 bg-white"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={submitSetup}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#3D7A68]"
            >
              Vytvořit profil
            </button>
          </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** @deprecated použijte MyProfilesPanel */
export function RoleTestPanel(props) {
  return <MyProfilesPanel {...props} />;
}

export function SousedRoleView() {
  const { user, neighbors, confirmNeighbor, confirmationsGiven, lunchSubscriptions } = useApp();
  const isVerified = (user?.neighborhoodConfirmations ?? 0) >= 3;

  return (
    <div className="space-y-4">
      {isVerified && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          ✓ Komunitou ověřený soused ({user.neighborhoodConfirmations} potvrzení)
        </p>
      )}
      <section className="bg-white border border-stone-200 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-2">Sousedé k potvrzení</h3>
        <div className="space-y-2">
          {neighbors
            .filter((n) => n?.id && n.id !== user?.id && n.id !== "me" && !confirmationsGiven.includes(n.id))
            .sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)))
            .map((n) => (
            <div
              key={n.id}
              className={`flex items-center justify-between gap-2 p-2 rounded-xl ${
                n.isNew ? "bg-emerald-50 border border-emerald-200" : "bg-stone-50"
              }`}
            >
              <div>
                <p className="text-sm font-medium">
                  {n.name}
                  {n.isNew ? (
                    <span className="ml-2 text-[10px] font-bold uppercase text-emerald-700">Nový</span>
                  ) : null}
                </p>
                <p className="text-xs text-stone-500">{n.distance ?? n.location}</p>
              </div>
              <button
                type="button"
                onClick={() => confirmNeighbor(n.id)}
                className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-600 text-white"
              >
                Potvrdit, že se známe
              </button>
            </div>
          ))}
          {neighbors.every((n) => confirmationsGiven.includes(n.id)) && (
            <p className="text-xs text-stone-500">Zatím nemáte nikoho nového k potvrzení.</p>
          )}
        </div>
      </section>
      {lunchSubscriptions.length > 0 && (
        <p className="text-xs text-stone-600">
          Odebíráte polední menu u {lunchSubscriptions.length} podniků.
        </p>
      )}
    </div>
  );
}

export function CraftsmanCapacitySettings() {
  const {
    craftsmanAcceptsOrders,
    setCraftsmanAcceptsOrders,
    craftsmanRadius,
    setCraftsmanRadius,
    ownedService,
    updateServiceFocus,
  } = useApp();

  const [homeGroup, setHomeGroup] = useState(
    ownedService?.homeGroupId ?? "domov-zahrada"
  );
  const [primarySubcategory, setPrimarySubcategory] = useState(() =>
    getPrimaryServiceSubcategoryId(ownedService)
  );
  const [secondarySubcategories, setSecondarySubcategories] = useState(() =>
    getSecondaryServiceSubcategoryIds(ownedService)
  );
  const [keywordsText, setKeywordsText] = useState(
    (ownedService?.keywords ?? []).join(", ")
  );

  useEffect(() => {
    if (!ownedService) return;
    setHomeGroup(ownedService.homeGroupId ?? "domov-zahrada");
    const primary = getPrimaryServiceSubcategoryId(ownedService);
    const secondary = getSecondaryServiceSubcategoryIds(ownedService);
    setPrimarySubcategory(primary);
    setSecondarySubcategories(secondary);
    const ids = buildServiceSubcategoryList(primary, secondary);
    const autoLabels = new Set(
      ids.map((id) => getServiceCategory(id)?.label).filter(Boolean)
    );
    setKeywordsText(
      (ownedService.keywords ?? []).filter((k) => !autoLabels.has(k)).join(", ")
    );
  }, [
    ownedService?.id,
    ownedService?.homeGroupId,
    ownedService?.subcategory,
    ownedService?.subcategories,
    ownedService?.primarySubcategory,
    ownedService?.keywords,
  ]);

  const nationwide = isNationwideRadius(craftsmanRadius);
  const sliderValue = nationwide
    ? CRAFTSMAN_RADIUS_MAX_KM
    : Math.min(
        CRAFTSMAN_RADIUS_MAX_KM,
        Math.max(CRAFTSMAN_RADIUS_MIN_KM, Number(craftsmanRadius) || CRAFTSMAN_RADIUS_MIN_KM)
      );
  const subcategories = buildServiceSubcategoryList(primarySubcategory, secondarySubcategories);

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold mb-2">Kapacita a dojezd</h3>
        <p className="text-xs text-stone-500 mb-3">
          Na pracovní stránce uvidíte jen poptávky ve zvoleném okruhu a ve vašem oboru.
        </p>
        <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
          <span className="text-sm font-medium">
            {craftsmanAcceptsOrders ? "🟢 Přijímám zakázky" : "🔴 Kapacita plná"}
          </span>
          <button
            type="button"
            onClick={() => setCraftsmanAcceptsOrders(!craftsmanAcceptsOrders)}
            className="text-xs font-semibold text-emerald-700"
          >
            Přepnout
          </button>
        </label>
        <label className="flex items-start gap-3 mt-3 p-3 rounded-xl border border-stone-200 bg-[#F7FAF9] cursor-pointer">
          <input
            type="checkbox"
            checked={nationwide}
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
              Bez omezení vzdálenosti — poptávky z celé ČR ve vašem oboru
            </span>
          </span>
        </label>
        {!nationwide && (
          <label className="block mt-3">
            <span className="text-xs text-stone-500">
              Dojíždění: {formatCraftsmanRadiusLabel(sliderValue)}
            </span>
            <input
              type="range"
              min={CRAFTSMAN_RADIUS_MIN_KM}
              max={CRAFTSMAN_RADIUS_MAX_KM}
              value={sliderValue}
              onChange={(e) => setCraftsmanRadius(Number(e.target.value))}
              className="w-full mt-1 accent-emerald-600"
            />
          </label>
        )}
        {nationwide && (
          <p className="text-xs text-[#3D7A68] mt-2 font-medium">
            {formatCraftsmanRadiusLabel(craftsmanRadius)}
          </p>
        )}
      </div>

      {ownedService && (
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <h3 className="text-sm font-bold">Obor a klíčová slova</h3>
          <p className="text-xs text-stone-500">
            Hlavní zaměření určuje ikonu v katalogu. Vedlejší obory pomáhají při párování poptávek.
          </p>
          <CraftCategoryPicker
            homeGroup={homeGroup}
            onHomeGroupChange={setHomeGroup}
            primaryId={primarySubcategory}
            onPrimaryChange={setPrimarySubcategory}
            secondaryIds={secondarySubcategories}
            onSecondaryChange={setSecondarySubcategories}
          />
          <input
            type="text"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="Další klíčová slova oddělená čárkou"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
          <button
            type="button"
            disabled={!primarySubcategory}
            onClick={() => {
              const selectedLabels = new Set(
                subcategories.map((id) => getServiceCategory(id)?.label).filter(Boolean)
              );
              const custom = keywordsText
                .split(/[,;]+/)
                .map((k) => k.trim())
                .filter(Boolean)
                .filter((k) => !selectedLabels.has(k));
              updateServiceFocus({
                serviceId: ownedService.id,
                homeGroupId: homeGroup,
                primarySubcategory,
                subcategories,
                subcategory: primarySubcategory,
                keywords: custom,
              });
            }}
            className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold disabled:opacity-40"
          >
            Uložit zaměření
          </button>
        </div>
      )}
    </section>
  );
}

export function CraftsmanOrdersSection() {
  const { serviceOrders } = useApp();
  const openOrders = serviceOrders.filter((o) => o.providerRole === "remeslnik" && o.status !== "released");

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-4 mt-4">
      <h3 className="text-sm font-bold mb-2">Moje zakázky</h3>
      {openOrders.length === 0 ? (
        <p className="text-xs text-stone-500">Zatím žádné aktivní zakázky.</p>
      ) : (
        openOrders.map((o) => (
          <div key={o.id} className="p-3 bg-emerald-50 rounded-xl mb-2 text-xs">
            <p className="font-semibold">{o.title}</p>
            <p className="text-stone-600 mt-1">{o.escrowStatusLabel}</p>
          </div>
        ))
      )}
    </section>
  );
}

function CraftsmanAccountSettings() {
  const { user, updateAccountProfile, changePassword, logout } = useApp();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [addressErrors, setAddressErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    const parsed = parseStoredAddress(user.address ?? "");
    setStreet(parsed.street);
    setHouseNumber(parsed.houseNumber);
    setPsc(parsed.psc);
    setCity(parsed.city);
  }, [user?.name, user?.email, user?.address, user]);

  const saveProfile = () => {
    setFormError("");
    const addressResult = validateAddressFields({ street, houseNumber, psc, city });
    setAddressErrors(addressResult.errors);
    if (!addressResult.valid) {
      setFormError("Doplňte adresu ve správném formátu (ulice, č.p., PSČ).");
      return;
    }
    updateAccountProfile({
      name,
      email,
      address: formatFullAddress({ street, houseNumber, psc, city }),
    });
  };

  const savePassword = async () => {
    const result = await changePassword(password, passwordConfirm);
    if (result?.ok) {
      setPassword("");
      setPasswordConfirm("");
    }
  };

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-4">
      <h3 className="text-sm font-bold mb-1">Údaje účtu</h3>
      <p className="text-xs text-stone-500 mb-3">
        Upravte výchozí adresu působnosti ve stejném formátu jako při registraci.
      </p>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-stone-600">Jméno / název</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-stone-600">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
        </label>
        <StructuredAddressFields
          street={street}
          houseNumber={houseNumber}
          psc={psc}
          city={city}
          onStreetChange={setStreet}
          onHouseNumberChange={setHouseNumber}
          onPscChange={setPsc}
          onCityChange={setCity}
          fieldErrors={addressErrors}
          onClearError={(key) => setAddressErrors((prev) => ({ ...prev, [key]: "" }))}
          legend="Výchozí adresa / působnost"
        />
        {formError ? (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {formError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={saveProfile}
          className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
        >
          Uložit údaje
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
        <h4 className="text-xs font-bold text-stone-700">Změna hesla</h4>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nové heslo"
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
        />
        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="Potvrzení hesla"
          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
        />
        <button
          type="button"
          onClick={savePassword}
          className="w-full py-2 border border-stone-300 rounded-xl text-sm font-semibold"
        >
          Změnit heslo
        </button>
        <button
          type="button"
          onClick={logout}
          className="w-full py-2.5 text-sm font-semibold text-stone-600 border border-stone-200 rounded-xl"
        >
          Odhlásit se
        </button>
      </div>
    </section>
  );
}

export function CraftsmanRoleView() {
  const {
    craftsmanWallet,
    credits,
    addCredits,
    withdrawToBank,
    craftsmanInvoices,
  } = useApp();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState(500);

  return (
    <div className="space-y-4">
      <CraftsmanProfilePanel />
      <CraftsmanOrdersSection />
      {craftsmanInvoices?.length > 0 && (
        <section className="bg-white border border-stone-200 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-stone-800 mb-2">Nedávné faktury</h3>
          <ul className="space-y-2">
            {craftsmanInvoices.slice(0, 8).map((inv) => (
              <li
                key={inv.id}
                className="text-xs text-stone-600 border-b border-stone-100 pb-2 last:border-0"
              >
                <span className="font-semibold text-stone-800">{inv.clientName}</span>
                {" · "}
                {inv.amount} Kč
                <span className="block text-stone-400 mt-0.5 line-clamp-1">{inv.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <FinancialCenter
        balance={craftsmanWallet}
        credits={credits}
        onTopUp={() => setTopUpOpen(true)}
        onWithdraw={() => setWithdrawOpen(true)}
      />

      <PaymentModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Dobít kredit"
        amount={100}
        amountEditable
        walletBalance={credits}
        allowWallet={false}
        onConfirm={(_method, paid) => {
          addCredits(paid ?? 100);
          setTopUpOpen(false);
        }}
      />

      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ModalDoodleBackdrop onClose={() => setWithdrawOpen(false)} />
          <div className="relative bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="font-bold mb-3">Vyplatit na bankovní účet</h3>
            <input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Číslo účtu"
              className="w-full border rounded-xl px-3 py-2 text-sm mb-2"
            />
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
            />
            <button
              type="button"
              onClick={() => {
                withdrawToBank(withdrawAmount, bankAccount);
                setWithdrawOpen(false);
              }}
              className="w-full py-2.5 bg-[#3D7A68] text-white rounded-xl text-sm font-semibold"
            >
              Odeslat převod
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BusinessRoleView() {
  const {
    businessWallet,
    credits,
    addCredits,
    withdrawToBank,
    businessIsOpen,
    businessHours,
    businessHoursNote,
    setActiveTab,
    closeProfile,
  } = useApp();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const persona = TEST_PERSONAS.podnik;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#C5DDD4] bg-[#F7FAF9] p-4">
        <h3 className="text-sm font-bold text-stone-900">
          {persona.businessName ?? "Provozovna"}
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          {businessIsOpen ? "Otevřeno" : "Zavřeno"} · {businessHours}
          {businessHoursNote ? ` · ${businessHoursNote}` : ""}
        </p>
        <p className="text-[11px] text-stone-400 mt-2">
          Denní provoz spravujete na záložce Provoz. Banner a viditelnost na záložce Propagace.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              closeProfile();
              setActiveTab("home");
            }}
            className="py-2 rounded-xl text-xs font-semibold border border-[#C5DDD4] text-[#1B4D3E] bg-white"
          >
            Provoz
          </button>
          <button
            type="button"
            onClick={() => {
              closeProfile();
              setActiveTab("ads");
            }}
            className="py-2 rounded-xl text-xs font-semibold border border-[#C5DDD4] text-[#1B4D3E] bg-[#E8F0ED]"
          >
            Propagace
          </button>
        </div>
      </section>

      <BusinessEntityManagement />

      <section className="pp-card p-4">
        <h3 className="text-sm font-bold text-stone-800 mb-1">Podplot kredity</h3>
        <p className="text-2xl font-bold text-[#1B4D3E] tabular-nums">{credits} Kč</p>
        <p className="text-[11px] text-stone-500 mt-1 mb-3">
          Peněženka provozu: {businessWallet} Kč · kredity na propagaci
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTopUpOpen(true)}
            className="flex-1 py-2.5 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
          >
            Dobít kredity
          </button>
          <button
            type="button"
            onClick={() => withdrawToBank(businessWallet, "123456789/0100")}
            className="flex-1 py-2.5 border border-[#C5DDD4] rounded-xl text-xs font-semibold text-[#1B4D3E]"
          >
            Vyplatit
          </button>
        </div>
      </section>

      <PaymentModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Dobít Podplot kredity"
        amount={200}
        amountEditable
        walletBalance={credits}
        allowWallet={false}
        onConfirm={(_method, paid) => {
          addCredits(paid ?? 200);
          setTopUpOpen(false);
        }}
      />
    </div>
  );
}

/** Profil úřadu v overlay — odkaz na Agendu; akce jsou pod [+]. */
export function MunicipalityRoleView() {
  const { setActiveTab, closeProfile, municipalityPrompts, activeCrisis, user } = useApp();
  const persona = TEST_PERSONAS.urad;
  const officeName = user?.name || persona.businessName || persona.name;
  const openPrompts = municipalityPrompts.filter((p) => p.status !== "done" && p.status !== "declined").length;

  return (
    <div className="space-y-4 mb-4">
      <section className="rounded-2xl border border-[#C5DDD4] bg-[#F7FAF9] p-4">
        <div className="flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-2xl bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0"
            aria-hidden
          >
            <AccountTypeIcon roleId="urad" accountType="urad" className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-900">{officeName}</h3>
            <p className="text-xs text-stone-500">
              Institucionální profil
              {user?.institutionRole ? ` · ${user.institutionRole}` : ""}
              {user?.institutionId ? ` · ID ${user.institutionId}` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="pp-card p-3.5 space-y-2 text-xs text-stone-600">
        <p>
          Otevřená hlášení:{" "}
          <span className="font-semibold text-stone-900">{openPrompts}</span>
        </p>
        <p>
          Mimořádné oznámení:{" "}
          <span className="font-semibold text-stone-900">
            {activeCrisis ? "aktivní" : "žádné"}
          </span>
        </p>
        <p className="text-[11px] text-stone-400 pt-1">
          Nové oznámení, výzva nebo akce — tlačítko + ve spodní liště.
        </p>
      </section>

      <button
        type="button"
        onClick={() => {
          closeProfile();
          setActiveTab("office");
        }}
        className="w-full py-2.5 rounded-xl text-xs font-semibold border border-[#C5DDD4] text-[#1B4D3E] bg-[#F1F6F5]"
      >
        Otevřít Agendu
      </button>
    </div>
  );
}

function FinancialCenter({ balance, credits, onTopUp, onWithdraw }) {
  return (
    <section className="pp-card p-4">
      <h3 className="text-sm font-bold text-stone-800 mb-1">Podplot kredity</h3>
      <p className="text-2xl font-bold text-[#1B4D3E] tabular-nums">{credits} Kč</p>
      <p className="text-xs text-stone-500 mb-3">Peněženka: {balance} Kč</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onTopUp}
          className="flex-1 py-2 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
        >
          Dobít kredity
        </button>
        <button
          type="button"
          onClick={onWithdraw}
          className="flex-1 py-2 border border-[#C5DDD4] rounded-xl text-xs font-semibold text-[#1B4D3E]"
        >
          Vyplatit na účet
        </button>
      </div>
    </section>
  );
}
