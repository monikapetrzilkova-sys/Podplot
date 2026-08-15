import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { TEST_ROLES } from "../data/testRoles.js";
import { TEST_PERSONAS } from "../data/businessProfiles.js";
import { ADDRESS_PRIVACY_NOTE } from "../data/accountTypes.js";
import { LUNCH_PUBLISH_PLANS } from "../data/lunchMenus.js";
import {
  CRAFTSMAN_RADIUS_MIN_KM,
  CRAFTSMAN_RADIUS_MAX_KM,
  CRAFTSMAN_RADIUS_NATIONWIDE_KM,
  formatCraftsmanRadiusLabel,
  isNationwideRadius,
} from "../data/craftsmanSettings.js";
import {
  HOME_SERVICE_SUB_FILTERS,
  getSubcategoriesForHomeGroup,
  getServiceSubcategoryIds,
  formatServiceSubcategoryLabels,
  getServiceCategory,
} from "../data/serviceCategories.js";
import { SKIP_REGISTRATION, ENABLE_DEV_ROLE_SWITCH } from "../data/devConfig.js";
import PaymentModal from "./PaymentModal.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import BusinessEntityManagement from "./entity/BusinessEntityManagement.jsx";
import ServiceProfileEditor from "./entity/ServiceProfileEditor.jsx";
import { IconMapPin } from "../data/icons.jsx";
import AccountTypeIcon from "./AccountTypeIcon.jsx";

/** Osobní profily uživatele — bez institucionálních účtů (úřad). */
const PERSONAL_ROLE_IDS = ["soused", "podnik", "remeslnik"];

function ProfileRoleButton({ role, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center gap-3 ${
        active
          ? "border-[#3D7A68] bg-[#E8F3EF] ring-1 ring-[#3D7A68]/30"
          : "border-stone-200 bg-[#F7FAF9] hover:border-[#C5DDD4]"
      }`}
    >
      <span className="shrink-0 w-9 h-9 rounded-xl bg-white border border-[#C5DDD4] text-[#3D7A68] inline-flex items-center justify-center">
        <AccountTypeIcon roleId={role.id} accountType={role.accountType} className="w-5 h-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-stone-900">{role.label}</span>
          {active && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#1B4D3E] bg-white border border-[#C5DDD4] px-1.5 py-0.5 rounded-md">
              Aktivní
            </span>
          )}
        </span>
        <span className="block text-[11px] text-stone-500 mt-0.5">{role.hint}</span>
      </span>
    </button>
  );
}

/** Zkušební přepínač rolí (Developer Mode) — v produkci skrytý přes ENABLE_DEV_ROLE_SWITCH. */
export function ProfileTypeTestSwitcher() {
  const { testRoleId, switchTestRole } = useApp();
  if (!ENABLE_DEV_ROLE_SWITCH) return null;

  const personal = TEST_ROLES.filter((r) => PERSONAL_ROLE_IDS.includes(r.id));
  const office = TEST_ROLES.filter((r) => r.id === "urad");

  return (
    <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-4 mb-4">
      <h3 className="text-sm font-bold text-stone-900 mb-0.5">Developer Mode · přepínač rolí</h3>
      <p className="text-[11px] text-stone-500 mb-3">
        Jen pro testování — v ostré verzi skryté. Přepíná kontext (Občan ↔ Úředník) bez nové registrace.
      </p>

      <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
        Občan / podnik
      </p>
      <div className="space-y-2 mb-3">
        {personal.map((r) => (
          <ProfileRoleButton
            key={r.id}
            role={r}
            active={testRoleId === r.id}
            onClick={() => switchTestRole(r.id)}
          />
        ))}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
        Úřad
      </p>
      <div className="space-y-2">
        {office.map((r) => (
          <ProfileRoleButton
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

export default function MyProfilesPanel() {
  const {
    testRoleId,
    switchTestRole,
    userProfileIds,
    addUserProfile,
  } = useApp();
  const [adding, setAdding] = useState(false);

  // Při zkoušce ukazuj všechny osobní typy hned (nemusíš nejdřív „přidávat“)
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

  const handleAdd = (roleId) => {
    addUserProfile?.(roleId);
    switchTestRole(roleId);
    setAdding(false);
  };

  return (
    <section className="rounded-2xl border border-[#C5DDD4] bg-white p-4 mb-4">
      <h3 className="text-sm font-bold text-stone-900 mb-0.5">Moje profily</h3>
      <p className="text-[11px] text-stone-500 mb-3">
        Osobní a pracovní role jsou oddělené od institucionálních účtů (úřad).
      </p>

      <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
        Osobní / pracovní
      </p>
      <div className="space-y-2">
        {activeProfiles.map((r) => (
          <ProfileRoleButton
            key={r.id}
            role={r}
            active={testRoleId === r.id}
            onClick={() => switchTestRole(r.id)}
          />
        ))}
      </div>

      {addableProfiles.length > 0 && (
        <div className="mt-3">
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border border-dashed border-[#3D7A68]/50 text-[#1B4D3E] bg-[#F1F6F5] hover:bg-[#E8F3EF]"
            >
              + Přidat další profil
            </button>
          ) : (
            <div className="rounded-xl border border-[#C5DDD4] bg-[#F1F6F5] p-3 space-y-2">
              <p className="text-[11px] font-semibold text-stone-600">Vyberte typ profilu</p>
              {addableProfiles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleAdd(r.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-stone-200 hover:border-[#3D7A68] text-xs"
                >
                  <span className="font-semibold text-stone-900 inline-flex items-center gap-2">
                    <AccountTypeIcon roleId={r.id} accountType={r.accountType} className="w-4 h-4 text-[#3D7A68]" />
                    {r.label}
                  </span>
                  <span className="block text-stone-500 mt-0.5">{r.hint}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="w-full py-1.5 text-[11px] font-semibold text-stone-500"
              >
                Zrušit
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-stone-100">
        <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1.5">
          Institucionální (odděleně)
        </p>
        <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
          Úřad a veřejná správa mají vlastní navigaci a oprávnění — nejsou součástí osobních profilů.
        </p>
        {TEST_ROLES.filter((r) => r.id === "urad").map((r) => (
          <ProfileRoleButton
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
          {neighbors.map((n) => (
            <div key={n.id} className="flex items-center justify-between gap-2 p-2 bg-stone-50 rounded-xl">
              <div>
                <p className="text-sm font-medium">{n.name}</p>
                <p className="text-xs text-stone-500">{n.distance}</p>
              </div>
              <button
                type="button"
                disabled={confirmationsGiven.includes(n.id)}
                onClick={() => confirmNeighbor(n.id)}
                className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
              >
                {confirmationsGiven.includes(n.id) ? "Potvrzeno" : "Potvrdit, že se známe"}
              </button>
            </div>
          ))}
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
  const [subcategories, setSubcategories] = useState(() =>
    getServiceSubcategoryIds(ownedService).length
      ? getServiceSubcategoryIds(ownedService)
      : ["instalater"]
  );
  const [keywordsText, setKeywordsText] = useState(
    (ownedService?.keywords ?? []).join(", ")
  );

  useEffect(() => {
    if (!ownedService) return;
    setHomeGroup(ownedService.homeGroupId ?? "domov-zahrada");
    const ids = getServiceSubcategoryIds(ownedService);
    setSubcategories(ids.length ? ids : ["instalater"]);
    const autoLabels = new Set(
      ids.map((id) => getServiceCategory(id)?.label).filter(Boolean)
    );
    setKeywordsText(
      (ownedService.keywords ?? []).filter((k) => !autoLabels.has(k)).join(", ")
    );
  }, [ownedService?.id, ownedService?.homeGroupId, ownedService?.subcategory, ownedService?.subcategories, ownedService?.keywords]);

  const nationwide = isNationwideRadius(craftsmanRadius);
  const sliderValue = nationwide
    ? CRAFTSMAN_RADIUS_MAX_KM
    : Math.min(
        CRAFTSMAN_RADIUS_MAX_KM,
        Math.max(CRAFTSMAN_RADIUS_MIN_KM, Number(craftsmanRadius) || CRAFTSMAN_RADIUS_MIN_KM)
      );
  const craftSubs = getSubcategoriesForHomeGroup(homeGroup);

  const toggleSubcategory = (id) => {
    setSubcategories((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

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
            Můžete zvolit více zaměření (např. elektrikář i truhlář). Kategorie Domov / Péče / Děti /
            Ostatní slouží k výběru a párování poptávek.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {HOME_SERVICE_SUB_FILTERS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setHomeGroup(g.id)}
                className={`px-2.5 py-2 rounded-xl border text-xs font-semibold ${
                  homeGroup === g.id
                    ? "border-[#3D7A68] bg-[#F1F6F5] text-[#1B4D3E]"
                    : "border-stone-200 text-stone-600"
                }`}
              >
                {g.shortLabel ?? g.label}
              </button>
            ))}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-stone-500 mb-1.5">
              Zaměření (více možností)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {craftSubs.map((c) => {
                const selected = subcategories.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleSubcategory(c.id)}
                    aria-pressed={selected}
                    className={`px-2.5 py-1.5 rounded-full border text-[11px] font-semibold ${
                      selected
                        ? "border-[#3D7A68] bg-[#E8F3EF] text-[#1B4D3E]"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    {selected ? "✓ " : ""}
                    {c.label}
                  </button>
                );
              })}
            </div>
            {subcategories.length > 0 && (
              <p className="text-[10px] text-[#3D7A68] mt-1.5">
                Vybráno: {formatServiceSubcategoryLabels(subcategories)}
              </p>
            )}
          </div>
          <input
            type="text"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="Další klíčová slova oddělená čárkou"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
          <button
            type="button"
            disabled={subcategories.length === 0}
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
                subcategories,
                subcategory: subcategories[0],
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
  const { user, updateAccountProfile, showToast } = useApp();
  const persona = TEST_PERSONAS.remeslnik;
  const [name, setName] = useState(user?.name ?? persona.name);
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? persona.name);
    setEmail(user.email ?? "");
    setAddress(user.address ?? "");
  }, [user?.name, user?.email, user?.address, user, persona.name]);

  const saveProfile = () => {
    updateAccountProfile({ name, email, address });
  };

  const savePassword = () => {
    if (!password.trim()) {
      showToast("Zadejte nové heslo.", "error");
      return;
    }
    if (password !== passwordConfirm) {
      showToast("Hesla se neshodují.", "error");
      return;
    }
    setPassword("");
    setPasswordConfirm("");
    showToast("Heslo bylo změněno.", "success");
  };

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-4">
      <h3 className="text-sm font-bold mb-1">Údaje účtu</h3>
      <p className="text-xs text-stone-500 mb-3">{persona.businessName}</p>
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
        <div className="flex items-start gap-2 text-sm text-stone-600 bg-stone-50 rounded-xl p-3">
          <IconMapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase text-stone-400">Výchozí adresa</p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white"
            />
            <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">{ADDRESS_PRIVACY_NOTE}</p>
          </div>
        </div>
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
    ownedService,
    craftsmanInvoices,
    setActiveTab,
    closeProfile,
  } = useApp();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState(500);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#C5DDD4] bg-[#F7FAF9] p-4">
        <h3 className="text-sm font-bold text-stone-900">Řemeslnický účet</h3>
        <p className="text-[11px] text-stone-500 mt-1">
          Banner, topování katalogu a push poptávek najdete na záložce Propagace.
        </p>
        <button
          type="button"
          onClick={() => {
            closeProfile();
            setActiveTab("ads");
          }}
          className="mt-3 w-full py-2 rounded-xl text-xs font-semibold border border-[#C5DDD4] text-[#1B4D3E] bg-[#E8F0ED]"
        >
          Otevřít Propagaci
        </button>
      </section>
      <CraftsmanAccountSettings />
      {ownedService && (
        <section className="bg-white border border-stone-200 rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-2">Katalogový profil</h3>
          <p className="text-xs text-stone-500 mb-3">
            Služby a ceník patří sem — ne do sousedského feedu.
          </p>
          <ServiceProfileEditor service={ownedService} />
        </section>
      )}
      <CraftsmanCapacitySettings />
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
