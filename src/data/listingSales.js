/** Prodej přes Podplot — rezervace + úschova až do osobního převzetí */

export const LISTING_SALE_STATUS = {
  held: "held",
  adjust_pending: "adjust_pending",
  released: "released",
  cancelled: "cancelled",
};

export const LISTING_SALE_STATUS_LABEL = {
  held: "V rezervaci",
  adjust_pending: "Čeká na potvrzení množství",
  released: "Uzavřeno · vyplaceno",
  cancelled: "Zrušeno",
};

export function isActiveListingSaleStatus(status) {
  return status === LISTING_SALE_STATUS.held || status === LISTING_SALE_STATUS.adjust_pending;
}

/** Stejný uživatel i při legacy id „me“ vs. konkrétní účet (např. monika). */
export function isSameAppUser(a, b) {
  if (a == null || b == null) return false;
  if (a === b) return true;
  const left = String(a);
  const right = String(b);
  if (left === right) return true;
  const self = new Set(["me", "monika"]);
  return self.has(left) && self.has(right);
}

function normalizeTrustName(name = "") {
  return String(name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function emailsMatch(a, b) {
  const left = String(a ?? "").trim().toLowerCase();
  const right = String(b ?? "").trim().toLowerCase();
  return Boolean(left && right && left === right);
}

/** Je kandidát aktuálně přihlášený uživatel? (síť důvěry, zprávy…) */
export function isCurrentUserRef(candidateId, user) {
  if (!candidateId || !user) return false;
  if (candidateId === "me") return true;
  if (isSameAppUser(candidateId, user.id)) return true;
  if (user.id && String(candidateId) === String(user.id)) return true;
  return false;
}

/**
 * Soused / profil = já sama (id, e-mail, nebo stejné jméno při chybějícím/stejném e-mailu).
 * Při přepínání lokalit nesmí vlastní profil vyskakovat jako „nový soused“.
 */
export function isSelfNeighborCandidate(neighborOrId, user) {
  if (!user || neighborOrId == null) return false;
  if (typeof neighborOrId !== "object") {
    return isCurrentUserRef(neighborOrId, user);
  }
  const n = neighborOrId;
  if (n.id && isCurrentUserRef(n.id, user)) return true;
  if (emailsMatch(n.email, user.email)) return true;
  if (user.name && n.name && normalizeTrustName(user.name) === normalizeTrustName(n.name)) {
    // Stejné jméno + žádný cizí e-mail → bereme jako sebe (duplicitní profil / drift id)
    if (!n.email || !user.email || emailsMatch(n.email, user.email)) return true;
  }
  return false;
}

/** Aktivní (neuzavřená) objednávka pro inzerát. */
export function getActiveListingSale(orders, listingId) {
  return (orders ?? []).find(
    (o) => o.listingId === listingId && isActiveListingSaleStatus(o.status)
  );
}

/**
 * Obohatí / skryje inzeráty podle rezervací:
 * - released → pryč
 * - held → jen kupující a prodejce (s příznaky pro UI)
 */
export function applyListingSaleVisibility(posts, saleOrders, viewerId = "me") {
  const activeByListing = new Map();
  const closedIds = new Set();
  for (const o of saleOrders ?? []) {
    if (o.status === LISTING_SALE_STATUS.released) {
      closedIds.add(o.listingId);
      continue;
    }
    if (isActiveListingSaleStatus(o.status)) {
      activeByListing.set(o.listingId, o);
    }
  }

  return (posts ?? [])
    .map((post) => {
      if (!post?.id) return null;
      if (closedIds.has(post.id)) return null;

      const order = activeByListing.get(post.id);
      if (!order) return post;

      const isBuyer = isSameAppUser(order.buyerId, viewerId);
      const isSeller =
        post.mine === true ||
        isSameAppUser(post.authorId, viewerId) ||
        isSameAppUser(order.sellerId, viewerId);
      if (!isBuyer && !isSeller) return null;

      return {
        ...post,
        saleStatus: order.status,
        saleStatusLabel:
          LISTING_SALE_STATUS_LABEL[order.status] ?? LISTING_SALE_STATUS_LABEL.held,
        saleOrderId: order.id,
        saleReservedByMe: isBuyer,
        saleIsSellerView: isSeller && !isBuyer,
        saleAmount: order.amount,
        saleSellerGets: order.sellerGets,
      };
    })
    .filter(Boolean);
}
