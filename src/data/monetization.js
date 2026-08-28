/** Hybridní monetizace Podplot — ceník, limity kapacity a servisní poplatek */

export const SERVICE_FEE_PERCENT = 10;

/**
 * Kapacitní pravidla (lokalita = scope).
 * Detail v docs/monetization.md.
 */
export const PROMO_RULES = {
  /** Štítek na proužku Domů — placená propagace, ne „partnerství“. */
  bannerBadgeLabel: "Promo",
  /** Max aktivních (živých) bannerů v lokalitě — rotace; sousedy nezahlcujeme. */
  maxActiveBannersPerLocation: 5,
  /** Jeden majitel = jeden banner (živý nebo rezervovaný) v lokalitě. */
  maxActiveBannersPerOwner: 1,
  /** Max rezervací do budoucna v lokalitě (platba teď, start později). */
  maxScheduledBannersPerLocation: 12,
  /** Hodiny po vypršení, než může stejný majitel znovu koupit slot. */
  bannerCooldownHoursAfterEnd: 24,
  /** Max „výrazných“ TOP pozic ve feedu lokality. */
  maxTopSlotsPerLocation: 5,
  /** Max současně TOPovaných inzerátů jednoho uživatele. */
  maxActiveTopsPerUser: 2,
};

/** @deprecated použijte PROMO_RULES.bannerBadgeLabel */
export const BANNER_BADGE_LABEL = PROMO_RULES.bannerBadgeLabel;

export const TOP_BAZAR_PLANS = [
  { id: "3d", days: 3, price: 29, label: "3 dny", hint: "Rychlý boost ve feedu" },
  { id: "7d", days: 7, price: 59, label: "7 dní", hint: "Delší viditelnost", popular: true },
];

export const CATALOG_PREMIUM_PLANS = [
  { id: "7d", days: 7, price: 149, label: "7 dní", hint: "Přednostní výpis v katalogu" },
  { id: "30d", days: 30, price: 449, label: "30 dní", hint: "Nejlepší viditelnost", popular: true },
];

export const SPONSORED_STRIP_PLANS = [
  {
    id: "24h",
    hours: 24,
    price: 99,
    label: "24 hodin",
    hint: "Proužek Promo na domovské zdi sousedů",
    durationLabel: "1 den",
  },
  {
    id: "weekend",
    days: 3,
    price: 249,
    label: "Víkend (Pá–Ne)",
    hint: "Od aktivace cca 3 dny — ideální na víkendovou akci",
    popular: true,
    durationLabel: "3 dny",
  },
  {
    id: "7d",
    days: 7,
    price: 449,
    label: "7 dní",
    hint: "Týdenní viditelnost na domovské zdi",
    durationLabel: "7 dní",
  },
];

/** Jen karta — žádné dobíjení kreditů / peněženkový zůstatek. */
export const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Kartou / Apple Pay / Google Pay",
    icon: "💳",
    hint: "Platba přes bránu Podplotu",
  },
];

export function calcServiceFee(amount) {
  const safe = Math.max(0, Math.round(Number(amount) || 0));
  const fee = Math.round(safe * (SERVICE_FEE_PERCENT / 100));
  return { fee, sellerGets: safe - fee, buyerPays: safe };
}

/** Text před nákupem / u výběru „Přes Podplot“. */
export function formatListingEscrowFeeNote(amount) {
  const { fee, sellerGets, buyerPays } = calcServiceFee(amount);
  if (buyerPays <= 0) {
    return "Platba zůstane v úschově Podplotu do osobního předání.";
  }
  return `Zaplatíte ${buyerPays} Kč kartou. Prodejce dostane ${sellerGets} Kč po předání. Poplatek za úschovu Podplot ${fee} Kč (${SERVICE_FEE_PERCENT} %).`;
}

export function formatListingEscrowFeeShort(amount) {
  const { fee, sellerGets, buyerPays } = calcServiceFee(amount);
  if (buyerPays <= 0) return "";
  return `Poplatek ${fee} Kč (${SERVICE_FEE_PERCENT} %) · prodejce ${sellerGets} Kč`;
}

export function getMonetizationPlan(type, planId) {
  const lists = {
    top: TOP_BAZAR_PLANS,
    catalog: CATALOG_PREMIUM_PLANS,
    sponsored: SPONSORED_STRIP_PLANS,
  };
  return lists[type]?.find((p) => p.id === planId) ?? lists[type]?.[0];
}

/** Zpětná kompatibilita s pricing.js */
export const TOP_PLANS = TOP_BAZAR_PLANS.map((p) => ({
  id: p.id,
  days: p.days,
  label: p.label,
  hint: p.hint,
  baseCost: p.price,
  popular: p.popular,
}));

export function calculateTopCost(planId) {
  return getMonetizationPlan("top", planId)?.price ?? 29;
}

/** Chráněná transakce služeb — 3 % (2 % brána + 1 % provize) */
export const ESCROW_FEE_PERCENT = 3;

export function calcEscrowFee(amount) {
  const fee = Math.round(amount * (ESCROW_FEE_PERCENT / 100));
  return { fee, providerGets: amount - fee };
}

export const ESCROW_STATUSES = {
  pending: "Čeká na zaplacení",
  held: "Peníze v bezpečné úschově",
  released: "Vyplaceno řemeslníkovi / Dokončeno",
};

/** Prodej inzerátu (bazar) — platba držená do „Převzato a zaplaceno“ */
export const LISTING_SALE_STATUSES = {
  held: "V rezervaci — platba v úschově Podplotu",
  adjust_pending: "Prodejce navrhl jiné množství — čeká se na vás",
  released: "Převzato · platba uvolněna prodejci",
  cancelled: "Nákup zrušen · platba vrácena",
};

function todayIsoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysIso(isoDate, days) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayIsoDate(dt);
}

function startOfLocalDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function parseIsoDay(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function planDurationDays(plan) {
  if (!plan) return 1;
  if (plan.hours) return Math.max(1, Math.ceil(plan.hours / 24));
  return plan.days ?? 1;
}

export function isSponsoredBannerLive(banner, today = todayIsoDate()) {
  if (!banner) return false;
  if (banner.activeFrom && banner.activeFrom > today) return false;
  return !banner.activeUntil || banner.activeUntil >= today;
}

/** @deprecated alias — živý banner na stripu */
export function isSponsoredBannerActive(banner, today = todayIsoDate()) {
  return isSponsoredBannerLive(banner, today);
}

export function isSponsoredBannerUpcoming(banner, today = todayIsoDate()) {
  if (!banner?.activeFrom) return false;
  return banner.activeFrom > today && (!banner.activeUntil || banner.activeUntil >= banner.activeFrom);
}

/** Živý nebo rezervovaný (ještě neskončil). */
export function isSponsoredBannerRelevant(banner, today = todayIsoDate()) {
  return isSponsoredBannerLive(banner, today) || isSponsoredBannerUpcoming(banner, today);
}

export function isTopPostActive(post, now = Date.now()) {
  if (!post?.topped) return false;
  if (!post.toppedUntil) return true;
  return new Date(post.toppedUntil).getTime() > now;
}

/**
 * Bannery pro rotaci na Domů — jen živé, max N (sousedy nezahlcujeme).
 */
export function pickBannersForStrip(banners, limit = PROMO_RULES.maxActiveBannersPerLocation) {
  const active = (banners ?? []).filter((b) => isSponsoredBannerLive(b));
  return active
    .slice()
    .sort((a, b) => {
      const ra = a.promoRank ?? 0;
      const rb = b.promoRank ?? 0;
      if (rb !== ra) return rb - ra;
      return String(b.activeUntil ?? "").localeCompare(String(a.activeUntil ?? ""));
    })
    .slice(0, limit);
}

function bannerOwnerKey(banner) {
  return banner?.ownerUserId ?? banner?.id ?? null;
}

function bannerInterval(banner) {
  const start =
    parseIsoDay(banner.activeFrom) ??
    (banner.promoRank ? startOfLocalDay(new Date(banner.promoRank)) : startOfLocalDay());
  const endDay = parseIsoDay(banner.activeUntil) ?? start;
  // Interval [start, end+1 day) — activeUntil je poslední den včetně
  const end = new Date(endDay);
  end.setDate(end.getDate() + 1);
  return { start, end, ownerKey: bannerOwnerKey(banner) };
}

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function countOverlapAt(intervals, start, end, excludeOwnerKey) {
  return intervals.filter((iv) => {
    if (excludeOwnerKey && iv.ownerKey === excludeOwnerKey) return false;
    return intervalsOverlap(start, end, iv.start, iv.end);
  }).length;
}

/**
 * Najde okamžitý start, nebo nejbližší volný časový slot (bez navyšování živých nad max 5).
 * @returns {{
 *   ok: true,
 *   mode: 'immediate' | 'scheduled',
 *   activeFrom: string,
 *   activeUntil: string,
 *   usedLive: number,
 *   maxLive: number,
 *   scheduledCount: number,
 *   message?: string,
 * } | {
 *   ok: false,
 *   usedLive: number,
 *   maxLive: number,
 *   message: string,
 * }}
 */
export function resolveBannerPurchaseOffer(bannersInLocation, ownerUserId, plan, now = new Date()) {
  const maxLive = PROMO_RULES.maxActiveBannersPerLocation;
  const maxScheduled = PROMO_RULES.maxScheduledBannersPerLocation;
  const today = todayIsoDate(now);
  const durationDays = planDurationDays(plan);
  const relevant = (bannersInLocation ?? []).filter((b) => isSponsoredBannerRelevant(b, today));
  const live = relevant.filter((b) => isSponsoredBannerLive(b, today));
  const upcoming = relevant.filter((b) => isSponsoredBannerUpcoming(b, today));
  const usedLive = live.filter((b) => bannerOwnerKey(b) !== ownerUserId).length;
  const scheduledOthers = upcoming.filter((b) => bannerOwnerKey(b) !== ownerUserId).length;

  if (scheduledOthers >= maxScheduled && usedLive >= maxLive) {
    return {
      ok: false,
      usedLive: live.length,
      maxLive,
      message: `Rezervace na další termíny jsou plné. Zkuste to později — živých Promo je max. ${maxLive}.`,
    };
  }

  const intervals = relevant.map(bannerInterval);
  const dayStart = startOfLocalDay(now);

  const tryWindow = (startDay) => {
    const start = startOfLocalDay(startDay);
    if (start < dayStart) return null;
    const endExclusive = new Date(start);
    endExclusive.setDate(endExclusive.getDate() + durationDays);
    const overlap = countOverlapAt(intervals, start, endExclusive, ownerUserId);
    if (overlap >= maxLive) return null;
    const activeFrom = todayIsoDate(start);
    const activeUntil = addDaysIso(activeFrom, durationDays - 1);
    return { activeFrom, activeUntil, start };
  };

  const immediate = tryWindow(dayStart);
  if (immediate) {
    const mode = "immediate";
    return {
      ok: true,
      mode,
      activeFrom: immediate.activeFrom,
      activeUntil: immediate.activeUntil,
      usedLive: live.length,
      maxLive,
      scheduledCount: upcoming.length,
      message:
        usedLive >= maxLive
          ? null
          : `Volné sloty: ${Math.max(0, maxLive - usedLive)}/${maxLive}`,
    };
  }

  // Kandidáti: dny, kdy některý banner končí (+1), a další dny dopředu
  const candidateStarts = new Set();
  for (const iv of intervals) {
    candidateStarts.add(todayIsoDate(iv.end)); // den po posledním dni = iv.end už je exclusive
  }
  // Pro jistotu projdi až ~90 dní dopředu po koncích
  const sortedEnds = [...intervals].map((iv) => iv.end.getTime()).sort((a, b) => a - b);
  for (const t of sortedEnds) {
    candidateStarts.add(todayIsoDate(new Date(t)));
  }
  for (let i = 1; i <= 60; i++) {
    candidateStarts.add(addDaysIso(today, i));
  }

  const sortedCandidates = [...candidateStarts]
    .map((iso) => parseIsoDay(iso))
    .filter(Boolean)
    .sort((a, b) => a - b);

  for (const startDay of sortedCandidates) {
    if (startDay <= dayStart) continue;
    const win = tryWindow(startDay);
    if (!win) continue;
    if (scheduledOthers >= maxScheduled) {
      return {
        ok: false,
        usedLive: live.length,
        maxLive,
        message: `Fronta rezervací je plná (max. ${maxScheduled}). Živých Promo zůstává max. ${maxLive}.`,
      };
    }
    return {
      ok: true,
      mode: "scheduled",
      activeFrom: win.activeFrom,
      activeUntil: win.activeUntil,
      usedLive: live.length,
      maxLive,
      scheduledCount: upcoming.length,
      message: `Teď je plno (${maxLive}/${maxLive}). Další volný slot od ${win.activeFrom}.`,
    };
  }

  return {
    ok: false,
    usedLive: live.length,
    maxLive,
    message: `Nepodařilo se najít volný Promo termín. Zkuste kratší plán nebo později.`,
  };
}

/**
 * @deprecated použijte resolveBannerPurchaseOffer — při plnu už nabízí rezervaci.
 */
export function canPurchaseBannerSlot(bannersInLocation, ownerUserId) {
  const offer = resolveBannerPurchaseOffer(
    bannersInLocation,
    ownerUserId,
    SPONSORED_STRIP_PLANS[0]
  );
  if (!offer.ok) {
    return { ok: false, used: offer.usedLive, max: offer.maxLive, message: offer.message };
  }
  if (offer.mode === "scheduled") {
    return {
      ok: true,
      scheduled: true,
      used: offer.usedLive,
      max: offer.maxLive,
      message: offer.message,
      activeFrom: offer.activeFrom,
      activeUntil: offer.activeUntil,
    };
  }
  return { ok: true, used: offer.usedLive, max: offer.maxLive };
}

/**
 * @returns {{ ok: true, used: number, max: number } | { ok: false, used: number, max: number, message: string }}
 */
export function canPurchaseTopSlot({ locationToppedCount, userToppedCount, alreadyTopped }) {
  if (alreadyTopped) {
    return {
      ok: false,
      used: locationToppedCount,
      max: PROMO_RULES.maxTopSlotsPerLocation,
      message: "Tento inzerát je už TOPovaný.",
    };
  }
  const maxLoc = PROMO_RULES.maxTopSlotsPerLocation;
  const maxUser = PROMO_RULES.maxActiveTopsPerUser;
  if (userToppedCount >= maxUser) {
    return {
      ok: false,
      used: userToppedCount,
      max: maxUser,
      message: `Můžete mít najednou max. ${maxUser} TOPované inzeráty.`,
    };
  }
  if (locationToppedCount >= maxLoc) {
    return {
      ok: false,
      used: locationToppedCount,
      max: maxLoc,
      message: `TOP pozice v lokalitě jsou obsazené (${maxLoc}/${maxLoc}). Zkuste to později.`,
    };
  }
  return { ok: true, used: locationToppedCount, max: maxLoc };
}
