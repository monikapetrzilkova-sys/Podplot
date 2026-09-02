import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getCategoriesForGroup, getCategory } from "../data/listingCategories.js";
import { getGroup } from "../data/groups.js";
import { getMyMemberGroups } from "../data/locations.js";
import { canTopCategory, TOP_PLANS, calculateTopCost, getTopPlan } from "../data/pricing.js";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import PhotoUpload from "./PhotoUpload.jsx";
import PaymentModal from "./PaymentModal.jsx";
import FormMarketCategoryPicker, { isZboziListingType } from "./FormMarketCategoryPicker.jsx";
import { FORM_MARKET_CATEGORIES } from "../data/marketCategories.js";
import { normalizeThingItemCategory } from "../data/thingItemCategories.js";
import { GroupNavIcon, GROUP_ICON_CLASS } from "./communityNavIcons.jsx";
import LendingItemTypeField from "./LendingItemTypeField.jsx";
import { resolveLendingItemTypeLabel } from "../data/lendingItemTypes.js";
import {
  DEFAULT_LISTING_PRICE_UNIT,
  LISTING_PRICE_UNITS,
  listingPriceInputLabel,
  listingUsesVariablePrice,
  normalizeListingPriceUnit,
  parseListingQuantity,
} from "../data/listingPriceUnits.js";
import {
  DEFAULT_LISTING_PAYMENT_METHOD,
} from "../data/listingPayment.js";
import { DoodlePackageIcon, DoodleScalesIcon, DoodleSellIcon } from "./doodle/doodleIcons.jsx";

function resolvePresetCategory(createCategory, feedMainMode, feedSubFilter) {
  if (createCategory) return createCategory;
  if (feedMainMode === "zbozi" && feedSubFilter && feedSubFilter !== "vse") {
    return feedSubFilter;
  }
  return "";
}

function getTitleHint(categoryId) {
  if (categoryId === "shanim") return "Co hledáte?";
  if (categoryId === "prodam" || categoryId === "daruji") {
    return "Co nabízíte?";
  }
  return null;
}

export default function CreateListingModal() {
  const {
    createOpen,
    createCategory,
    createGroupId,
    editingPost,
    feedMainMode,
    feedSubFilter,
    closeCreate,
    publishListing,
    updateUserPost,
    zboziMarketCategory,
    thingsLendingSubCategory,
    communityGroups,
    joinedGroupIds,
  } = useApp();
  const [categoryId, setCategoryId] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [groupIds, setGroupIds] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState(DEFAULT_LISTING_PRICE_UNIT);
  const [availableQty, setAvailableQty] = useState("");
  const [photos, setPhotos] = useState([]);
  const [topPlanId, setTopPlanId] = useState("");
  const [topPayOpen, setTopPayOpen] = useState(false);
  const isEditing = Boolean(editingPost);
  /** Příspěvek z nástěnky skupiny (createGroupId) = diskuse; jinak jen viditelnost. */
  const isBoardCompose = Boolean(createGroupId);

  const toggleVisibilityGroup = useCallback((id) => {
    setGroupIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }, []);

  useEffect(() => {
    if (!createOpen) return;
    if (editingPost) {
      const fromIds = Array.isArray(editingPost.groupIds)
        ? editingPost.groupIds.filter(Boolean)
        : editingPost.groupId
          ? [editingPost.groupId]
          : [];
      setGroupIds(fromIds);
      setCategoryId(editingPost.categoryId ?? "");
      setItemCategoryId(
        editingPost.marketCategory || editingPost.lendingCategory || ""
      );
      setTitle(editingPost.title ?? "");
      setBody(editingPost.body ?? "");
      setPrice(
        editingPost.listingPrice != null && editingPost.listingPrice > 0
          ? String(editingPost.listingPrice)
          : editingPost.credits != null
            ? String(editingPost.credits)
            : ""
      );
      setPriceUnit(
        editingPost.categoryId === "prodam"
          ? normalizeListingPriceUnit(editingPost.listingPriceUnit)
          : DEFAULT_LISTING_PRICE_UNIT
      );
      setAvailableQty(
        editingPost.listingQuantity != null && editingPost.listingQuantity > 0
          ? String(editingPost.listingQuantity).replace(".", ",")
          : ""
      );
      setPhotos((editingPost.photos ?? []).map((url) => (typeof url === "string" ? { url } : url)));
      setTopPlanId("");
      setTopPayOpen(false);
      return;
    }
    const initialGroup = createGroupId ?? "";
    const preset = resolvePresetCategory(createCategory, feedMainMode, feedSubFilter);
    const cats = getCategoriesForGroup(initialGroup || null);
    const validCategory =
      preset && cats.some((c) => c.id === preset)
        ? preset
        : initialGroup
          ? "diskuse"
          : "";
    setGroupIds(initialGroup ? [initialGroup] : []);
    setCategoryId(validCategory);
    const presetFromMatrix = thingsLendingSubCategory
      ? normalizeThingItemCategory(thingsLendingSubCategory)
      : "";
    const presetMarket =
      zboziMarketCategory &&
      zboziMarketCategory !== "vse" &&
      FORM_MARKET_CATEGORIES.some((c) => c.id === zboziMarketCategory)
        ? zboziMarketCategory
        : "";
    setItemCategoryId(presetFromMatrix || presetMarket || "");
    setTitle("");
    setBody("");
    setPrice("");
    setPriceUnit(DEFAULT_LISTING_PRICE_UNIT);
    setAvailableQty("");
    setPhotos([]);
    setTopPlanId("");
    setTopPayOpen(false);
  }, [
    createOpen,
    editingPost,
    createCategory,
    createGroupId,
    feedMainMode,
    feedSubFilter,
    zboziMarketCategory,
    thingsLendingSubCategory,
  ]);

  if (!createOpen) return null;

  const boardGroupId = isBoardCompose ? createGroupId : null;
  const categories = getCategoriesForGroup(boardGroupId || null);
  const cat = categoryId ? getCategory(categoryId, boardGroupId || null) : null;
  const myGroups = getMyMemberGroups(communityGroups, joinedGroupIds);
  const selectedGroupLabels = groupIds
    .map((id) => myGroups.find((g) => g.id === id)?.name || getGroup(id)?.name)
    .filter(Boolean);
  const topEligible = !isEditing && categoryId && canTopCategory(categoryId);
  const listingPrice = cat?.priceField ? Number(price) || 0 : 0;
  const selectedTopCost = topPlanId ? calculateTopCost(topPlanId, listingPrice) : 0;
  const minTopCost = calculateTopCost("3d", listingPrice);
  const titleHint = getTitleHint(categoryId);
  const needsItemCategory = isZboziListingType(categoryId);
  const categoryDetailReady = !needsItemCategory || itemCategoryId;
  const showUnitPicker = categoryId === "prodam";
  const variablePrice = showUnitPicker && listingUsesVariablePrice(priceUnit);
  const parsedAvailable = variablePrice && availableQty.trim()
    ? parseListingQuantity(availableQty, priceUnit)
    : null;

  const canSubmit =
    categoryId &&
    title.trim().length >= 3 &&
    body.trim().length >= 5 &&
    categoryDetailReady &&
    (!cat?.priceField || Number(price) > 0) &&
    (!variablePrice || !availableQty.trim() || parsedAvailable > 0);

  const buildListingPayload = (topPaymentMethod = "card") => {
    const isLending = categoryId === "pujcovna";
    const resolvedTitle = isLending
      ? resolveLendingItemTypeLabel(title, itemCategoryId) || title.trim()
      : title;
    return {
      categoryId,
      marketCategory: needsItemCategory ? itemCategoryId : null,
      lendingCategory: isLending ? itemCategoryId : null,
      title: resolvedTitle,
      body,
      price,
      groupId: groupIds[0] || null,
      groupIds,
      boardPost: isBoardCompose,
      photos,
      topPlanId: topPlanId || null,
      topPaymentMethod,
      listingPriceUnit: showUnitPicker ? priceUnit : DEFAULT_LISTING_PRICE_UNIT,
      listingQuantity: variablePrice && parsedAvailable > 0 ? parsedAvailable : null,
      listingPaymentMethod: DEFAULT_LISTING_PAYMENT_METHOD,
    };
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (isEditing) {
      const isLending = categoryId === "pujcovna";
      const resolvedTitle = isLending
        ? resolveLendingItemTypeLabel(title, itemCategoryId) || title.trim()
        : title.trim();
      updateUserPost(editingPost.id, {
        title: resolvedTitle,
        body: body.trim(),
        listingPrice: cat?.priceField ? Number(price) || 0 : editingPost.listingPrice,
        listingPriceUnit: showUnitPicker ? priceUnit : editingPost.listingPriceUnit,
        listingQuantity: variablePrice && parsedAvailable > 0 ? parsedAvailable : null,
        listingPaymentMethod: DEFAULT_LISTING_PAYMENT_METHOD,
        marketCategory: needsItemCategory ? itemCategoryId : editingPost.marketCategory,
        lendingCategory: isLending ? itemCategoryId : editingPost.lendingCategory,
        photos: photos.map((p) => p.url ?? p),
      });
      closeCreate();
      return;
    }
    if (topPlanId && topEligible) {
      setTopPayOpen(true);
      return;
    }
    publishListing(buildListingPayload());
  };

  return (
    <AppPanelPortal>
    <div className="pp-app-sheet-overlay">
      <div className="absolute inset-0 pointer-events-auto">
        <ModalDoodleBackdrop onClose={closeCreate} />
      </div>

      <div className="pp-app-sheet flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-stone-200 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-stone-900">
              {isEditing ? "Upravit příspěvek" : "Nový příspěvek"}
            </h2>
            <button type="button" onClick={closeCreate} className="text-stone-400 hover:text-stone-600 text-xl px-2">
              ✕
            </button>
          </div>
          <p className="text-sm text-stone-500 flex items-center gap-1.5 flex-wrap">
            {isBoardCompose && selectedGroupLabels[0] ? (
              <>
                Pro skupinu
                <GroupNavIcon id={createGroupId} className={`w-3.5 h-3.5 ${GROUP_ICON_CLASS}`} />
                {selectedGroupLabels[0]}
              </>
            ) : cat ? (
              `Kategorie: ${cat.label}`
            ) : (
              "Nový inzerát nebo příspěvek"
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-5 min-w-0">
          {!isBoardCompose && (
            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">
                Zobrazit ve skupinách (volitelné)
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGroupIds([])}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                    groupIds.length === 0
                      ? "border-[#1B4332] bg-[#D8F3DC] text-[#1B4332]"
                      : "border-stone-200"
                  }`}
                >
                  Celá obec
                </button>
                {myGroups.map((g) => {
                  const active = groupIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleVisibilityGroup(g.id)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                        active
                          ? "border-[#1B4332] bg-[#D8F3DC] text-[#1B4332]"
                          : "border-stone-200"
                      }`}
                    >
                      <GroupNavIcon id={g.id} className={`w-3.5 h-3.5 ${GROUP_ICON_CLASS}`} />
                      {g.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-stone-500 mt-2 leading-snug">
                Můžeš zvolit více skupin — omezí to, kdo inzerát uvidí. Nejde o diskusní nástěnku;
                komentáře jsou jen u příspěvků přímo ve skupině.
              </p>
            </fieldset>
          )}

          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">Kategorie</legend>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(c.id);
                    if (!canTopCategory(c.id)) setTopPlanId("");
                    if (c.id !== "prodam") {
                      setPriceUnit(DEFAULT_LISTING_PRICE_UNIT);
                      setAvailableQty("");
                    }
                    if (!isZboziListingType(c.id)) {
                      setItemCategoryId("");
                    } else if (thingsLendingSubCategory) {
                      setItemCategoryId(normalizeThingItemCategory(thingsLendingSubCategory) || "");
                    }
                  }}
                  className={`text-left p-3 rounded-2xl border-2 transition-colors ${
                    categoryId === c.id
                      ? "border-[#1B4332] bg-[#D8F3DC]"
                      : "border-stone-200 bg-[#FAF9F6] hover:border-[#B7E4C7]"
                  }`}
                >
                  <span className={`block text-sm font-semibold ${categoryId === c.id ? "text-[#1B4332]" : "text-stone-800"}`}>
                    {c.label}
                  </span>
                  <span className="block text-[11px] text-stone-500 mt-0.5">{c.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {needsItemCategory && (
            <FormMarketCategoryPicker
              value={itemCategoryId}
              onChange={setItemCategoryId}
              disabled={!categoryId}
              showHint={!!categoryId && !itemCategoryId}
              legend={categoryId === "pujcovna" ? "Kategorie půjčovny" : "Věcná kategorie"}
            />
          )}

          <PhotoUpload photos={photos} onChange={setPhotos} disabled={!categoryId || !categoryDetailReady} />

          {categoryId === "pujcovna" ? (
            <LendingItemTypeField
              value={title}
              onChange={setTitle}
              categoryId={itemCategoryId || null}
              disabled={!categoryId || !categoryDetailReady}
            />
          ) : (
            <div>
              <label htmlFor="listing-title" className="block text-sm font-semibold text-stone-800 mb-1.5">
                Nadpis
              </label>
              {titleHint && (
                <p className="text-xs text-stone-500 mb-1.5">{titleHint}</p>
              )}
              <input
                id="listing-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!categoryId || !categoryDetailReady}
                placeholder={
                  categoryId
                    ? titleHint ?? "Stručný popis tvojí nabídky nebo poptávky"
                    : "Nejdřív zvolte kategorii"
                }
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#D8F3DC] disabled:bg-[#FAF9F6]"
              />
            </div>
          )}

          <div>
            <label htmlFor="listing-body" className="block text-sm font-semibold text-stone-800 mb-1.5">
              Popis
            </label>
            <textarea
              id="listing-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              disabled={!categoryId || !categoryDetailReady}
              placeholder={
                categoryId === "pujcovna"
                  ? "Značka, stav, kdy lze půjčit (víkend, večer…)…"
                  : "Podrobnosti pro sousedy…"
              }
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm resize-none focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#D8F3DC] disabled:bg-[#FAF9F6]"
            />
          </div>

          {cat?.priceField && (
            <div className="space-y-3">
              {showUnitPicker && (
                <fieldset>
                  <legend className="block text-sm font-semibold text-stone-800 mb-1.5">
                    Jak chceš cenu zadat?
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {LISTING_PRICE_UNITS.map((unit) => {
                      const selected = priceUnit === unit.id;
                      const UnitIcon =
                        unit.id === "kg"
                          ? DoodleScalesIcon
                          : unit.id === "ks"
                            ? DoodlePackageIcon
                            : DoodleSellIcon;
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => {
                            setPriceUnit(unit.id);
                            if (unit.id === DEFAULT_LISTING_PRICE_UNIT) setAvailableQty("");
                          }}
                          aria-pressed={selected}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 text-center transition-colors ${
                            selected
                              ? "border-[#1B4332] bg-[#D8F3DC] text-[#1B4332]"
                              : "border-stone-200 bg-[#FAF9F6] text-stone-700"
                          }`}
                        >
                          <UnitIcon className="w-5 h-5" />
                          <span className="text-xs font-semibold leading-tight">{unit.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-2 leading-snug">
                    {LISTING_PRICE_UNITS.find((u) => u.id === priceUnit)?.hint}
                  </p>
                </fieldset>
              )}
              <div>
                <label htmlFor="listing-price" className="block text-sm font-semibold text-stone-800 mb-1.5">
                  {showUnitPicker ? listingPriceInputLabel(priceUnit) : cat.priceLabel}
                </label>
                <input
                  id="listing-price"
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-[#1B4332]"
                />
              </div>
              {variablePrice && (
                <div>
                  <label htmlFor="listing-qty" className="block text-sm font-semibold text-stone-800 mb-1.5">
                    {LISTING_PRICE_UNITS.find((u) => u.id === priceUnit)?.availableLabel}{" "}
                    <span className="font-normal text-stone-400">(volitelné)</span>
                  </label>
                  <input
                    id="listing-qty"
                    type="text"
                    inputMode="decimal"
                    value={availableQty}
                    onChange={(e) => setAvailableQty(e.target.value)}
                    placeholder={priceUnit === "kg" ? "např. 3,5" : "např. 24"}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-[#1B4332]"
                  />
                  <p className="text-[11px] text-stone-500 mt-1.5 leading-snug">
                    Kupující uvidí cenu
                    {showUnitPicker ? " za jednotku" : ""} a domluví se s vámi ve zprávě. Platba
                    probíhá osobně při předání — Podplot peníze nedrží.
                  </p>
                </div>
              )}
            </div>
          )}

          {topEligible && (
            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">
                TOP boost (volitelné · jako na Vinted)
              </legend>
              <p className="text-[11px] text-stone-500 mb-2">
                Levné posunutí nahoru ve feedu. Od {minTopCost} Kč · platba kartou.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setTopPlanId("")}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-colors ${
                    !topPlanId ? "border-[#1B4332] bg-[#D8F3DC]" : "border-stone-200"
                  }`}
                >
                  <span className="text-sm font-semibold text-stone-800">Bez TOPu</span>
                  <span className="block text-[11px] text-stone-500">Běžné zobrazení ve feedu</span>
                </button>
                {TOP_PLANS.map((plan) => {
                  const cost = calculateTopCost(plan.id, listingPrice);
                  const selected = topPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setTopPlanId(plan.id)}
                      className={`w-full text-left p-3 rounded-2xl border-2 transition-colors ${
                        selected
                          ? "border-amber-400 bg-amber-50"
                          : "border-stone-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-stone-900">
                          {plan.label}
                          {plan.popular && (
                            <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              Nejoblíbenější
                            </span>
                          )}
                        </span>
                        <span className="text-sm font-bold text-amber-800">{cost} Kč</span>
                      </div>
                      <span className="block text-[11px] text-stone-500 mt-0.5">{plan.hint}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-colors ${
              canSubmit ? "text-white hover:opacity-95" : "bg-stone-100 text-stone-400"
            }`}
            style={canSubmit ? { background: "#1B4332" } : undefined}
          >
            {isEditing
              ? "Uložit úpravy"
              : topPlanId && topEligible
                ? `Publikovat s TOP boostem (${selectedTopCost} Kč)`
                : "Publikovat"}
          </button>
        </form>
      </div>

      <PaymentModal
        open={topPayOpen}
        onClose={() => setTopPayOpen(false)}
        title={`TOP boost — ${getTopPlan(topPlanId)?.label ?? ""}`}
        amount={selectedTopCost}
        note="Platba kartou — inzerát se posune nahoru ve feedu."
        onConfirm={(method) => publishListing(buildListingPayload(method))}
      />
    </div>
    </AppPanelPortal>
  );
}
