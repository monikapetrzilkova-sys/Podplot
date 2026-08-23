import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { ADDRESS_PRIVACY_NOTE } from "../data/accountTypes.js";
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
import { IconMapPin } from "../data/icons.jsx";
import {
  CATALOG_DOODLE_ICONS,
  DoodleCheckIcon,
  SERVICE_CATEGORY_DOODLE_ICONS,
} from "./doodle/doodleIcons.jsx";

function OverviewRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-stone-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">{label}</p>
        <p className="text-sm text-stone-800 mt-0.5 whitespace-pre-wrap break-words">
          {value || "—"}
        </p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-[11px] font-semibold text-[#3D7A68] pt-0.5"
        >
          Upravit
        </button>
      )}
    </div>
  );
}

/**
 * Krátký přehled mobilní služby + editace (bez údajů účtu a bez recenzí).
 */
export default function CraftsmanProfilePanel() {
  const {
    user,
    ownedService,
    updateAccountProfile,
    updateServiceDescription,
    updateServiceFocus,
    craftsmanAcceptsOrders,
    setCraftsmanAcceptsOrders,
    craftsmanRadius,
    setCraftsmanRadius,
    changePassword,
    setActiveTab,
    closeProfile,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [catalogName, setCatalogName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [homeGroup, setHomeGroup] = useState("domov-zahrada");
  const [subcategories, setSubcategories] = useState([]);
  const [keywordsText, setKeywordsText] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setCatalogName(ownedService?.name || user?.businessName || "");
    setAddress(ownedService?.defaultAddress || user?.address || "");
    setDescription(ownedService?.serviceDescription || "");
    setHomeGroup(ownedService?.homeGroupId || "domov-zahrada");
    const ids = getServiceSubcategoryIds(ownedService);
    setSubcategories(ids);
    const autoLabels = new Set(ids.map((id) => getServiceCategory(id)?.label).filter(Boolean));
    setKeywordsText(
      (ownedService?.keywords ?? []).filter((k) => !autoLabels.has(k)).join(", ")
    );
  }, [
    ownedService?.id,
    ownedService?.name,
    ownedService?.defaultAddress,
    ownedService?.serviceDescription,
    ownedService?.homeGroupId,
    ownedService?.subcategories,
    ownedService?.keywords,
    user?.businessName,
    user?.address,
  ]);

  const nationwide = isNationwideRadius(craftsmanRadius);
  const sliderValue = nationwide
    ? CRAFTSMAN_RADIUS_MAX_KM
    : Math.min(
        CRAFTSMAN_RADIUS_MAX_KM,
        Math.max(CRAFTSMAN_RADIUS_MIN_KM, Number(craftsmanRadius) || CRAFTSMAN_RADIUS_MIN_KM)
      );
  const craftSubs = getSubcategoriesForHomeGroup(homeGroup);
  const focusLabel = formatServiceSubcategoryLabels(getServiceSubcategoryIds(ownedService));

  const openEdit = () => {
    setFormError("");
    setEditing(true);
  };

  const saveEdit = () => {
    setFormError("");
    const name = catalogName.trim();
    if (!name) {
      setFormError("Vyplňte katalogové jméno.");
      return;
    }
    if (!address.trim()) {
      setFormError("Vyplňte výchozí adresu.");
      return;
    }
    if (subcategories.length === 0) {
      setFormError("Vyberte alespoň jedno zaměření.");
      return;
    }
    updateAccountProfile({
      businessName: name,
      address: address.trim(),
    });
    if (ownedService?.id) {
      updateServiceDescription(ownedService.id, description.trim());
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
    }
    setEditing(false);
  };

  const savePassword = async () => {
    const result = await changePassword(password, passwordConfirm);
    if (result?.ok) {
      setPassword("");
      setPasswordConfirm("");
      setPasswordOpen(false);
    }
  };

  if (editing) {
    return (
      <section className="rounded-2xl border border-[#C5DDD4] bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-stone-900">Upravit mobilní profil</h3>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-[11px] font-semibold text-stone-500"
          >
            Zrušit
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-stone-600">Katalogové jméno</span>
          <input
            type="text"
            value={catalogName}
            onChange={(e) => setCatalogName(e.target.value)}
            placeholder="např. Jan — instalatér"
            className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-stone-600">Výchozí adresa / působnost</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
          <span className="block text-[10px] text-stone-400 mt-1">{ADDRESS_PRIVACY_NOTE}</span>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-stone-600">Popis služeb</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Čím se zabýváte…"
            className="w-full mt-1 px-3 py-2 border border-stone-200 rounded-xl text-sm resize-none"
          />
        </label>

        <div>
          <p className="text-xs font-semibold text-stone-600 mb-1">Kapacita a dojezd</p>
          <label className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
            <span className="text-sm font-medium">
              {craftsmanAcceptsOrders ? "Přijímám zakázky" : "Kapacita plná"}
            </span>
            <button
              type="button"
              onClick={() => setCraftsmanAcceptsOrders(!craftsmanAcceptsOrders)}
              className="text-xs font-semibold text-[#3D7A68]"
            >
              Přepnout
            </button>
          </label>
          <label className="flex items-start gap-2 mt-2 p-2.5 rounded-xl border border-stone-200 cursor-pointer">
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
            <span className="text-xs text-stone-600">Celá republika</span>
          </label>
          {!nationwide && (
            <label className="block mt-2">
              <span className="text-xs text-stone-500">
                Dojezd: {formatCraftsmanRadiusLabel(sliderValue)}
              </span>
              <input
                type="range"
                min={CRAFTSMAN_RADIUS_MIN_KM}
                max={CRAFTSMAN_RADIUS_MAX_KM}
                value={sliderValue}
                onChange={(e) => setCraftsmanRadius(Number(e.target.value))}
                className="w-full mt-1 accent-[#3D7A68]"
              />
            </label>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-600">Obor</p>
          <div className="grid grid-cols-2 gap-2">
            {HOME_SERVICE_SUB_FILTERS.map((g) => {
              const GroupIcon = CATALOG_DOODLE_ICONS[g.id] ?? CATALOG_DOODLE_ICONS.ostatni;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setHomeGroup(g.id);
                    setSubcategories([]);
                  }}
                  className={`px-2.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                    homeGroup === g.id
                      ? "border-[#3D7A68] bg-[#F1F6F5] text-[#1B4D3E]"
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  <GroupIcon className="w-4 h-4 shrink-0" />
                  {g.shortLabel ?? g.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {craftSubs.map((c) => {
              const selected = subcategories.includes(c.id);
              const CatIcon =
                SERVICE_CATEGORY_DOODLE_ICONS[c.id] ?? SERVICE_CATEGORY_DOODLE_ICONS.ostatni;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setSubcategories((prev) => {
                      if (prev.includes(c.id)) {
                        if (prev.length <= 1) return prev;
                        return prev.filter((x) => x !== c.id);
                      }
                      return [...prev, c.id];
                    })
                  }
                  className={`px-2.5 py-1.5 rounded-full border text-[11px] font-semibold inline-flex items-center gap-1 ${
                    selected
                      ? "border-[#3D7A68] bg-[#E8F3EF] text-[#1B4D3E]"
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  {selected ? (
                    <DoodleCheckIcon className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <CatIcon className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {c.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="Klíčová slova oddělená čárkou"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
          />
        </div>

        {formError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {formError}
          </p>
        )}

        <button
          type="button"
          onClick={saveEdit}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3D7A68]"
        >
          Uložit změny
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-[#C5DDD4] bg-white p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-stone-900">Mobilní služba</h3>
          <button
            type="button"
            onClick={openEdit}
            className="text-[11px] font-semibold text-[#3D7A68]"
          >
            Upravit profil
          </button>
        </div>
        <p className="text-[11px] text-stone-500 mb-2">
          Přihlášení zůstává stejné jako u sousedského účtu.
        </p>

        <OverviewRow
          label="Katalogové jméno"
          value={ownedService?.name || user?.businessName}
          onEdit={openEdit}
        />
        <OverviewRow
          label="Výchozí adresa"
          value={ownedService?.defaultAddress || user?.address}
          onEdit={openEdit}
        />
        <OverviewRow
          label="Popis služeb"
          value={ownedService?.serviceDescription}
          onEdit={openEdit}
        />
        <OverviewRow
          label="Kapacita a dojezd"
          value={`${craftsmanAcceptsOrders ? "Přijímám zakázky" : "Kapacita plná"} · ${formatCraftsmanRadiusLabel(craftsmanRadius)}`}
          onEdit={openEdit}
        />
        <OverviewRow label="Obor" value={focusLabel || ownedService?.profession} onEdit={openEdit} />

        <button
          type="button"
          onClick={() => {
            closeProfile();
            setActiveTab("ads");
          }}
          className="mt-3 w-full py-2 rounded-xl text-xs font-semibold border border-[#C5DDD4] text-[#1B4D3E] bg-[#F1F6F5]"
        >
          Propagace (banner, topování, push)
        </button>
      </section>

      <details
        className="rounded-xl border border-stone-200 bg-white px-3 py-2"
        open={passwordOpen}
        onToggle={(e) => setPasswordOpen(e.currentTarget.open)}
      >
        <summary className="text-[11px] font-semibold text-stone-500 cursor-pointer select-none">
          Změna hesla
        </summary>
        <div className="pt-2 pb-1 space-y-2">
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
            className="w-full py-2 border border-stone-300 rounded-xl text-xs font-semibold"
          >
            Uložit heslo
          </button>
        </div>
      </details>

      {!ownedService && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
          <IconMapPin className="w-4 h-4 shrink-0 mt-0.5" />
          Katalogový profil ještě není hotový — doplňte údaje přes Upravit profil.
        </p>
      )}
    </div>
  );
}
