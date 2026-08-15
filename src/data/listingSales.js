/** Prodej přes Podplot — rezervace + úschova až do osobního převzetí */

export const LISTING_SALE_STATUS = {
  held: "held",
  released: "released",
};

export const LISTING_SALE_STATUS_LABEL = {
  held: "V rezervaci",
  released: "Uzavřeno · vyplaceno",
};

/** Stejný uživatel i při legacy id „me“ vs. konkrétní účet (např. monika). */
export function isSameAppUser(a, b) {
  if (a == null || b == null) return false;
  if (a === b) return true;
  const self = new Set(["me", "monika"]);
  return self.has(a) && self.has(b);
}

/** Aktivní (neuzavřená) objednávka pro inzerát. */
export function getActiveListingSale(orders, listingId) {
  return (orders ?? []).find(
    (o) => o.listingId === listingId && o.status === LISTING_SALE_STATUS.held
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
    if (o.status === LISTING_SALE_STATUS.held) {
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
        saleStatus: LISTING_SALE_STATUS.held,
        saleStatusLabel: LISTING_SALE_STATUS_LABEL.held,
        saleOrderId: order.id,
        saleReservedByMe: isBuyer,
        saleIsSellerView: isSeller && !isBuyer,
        saleAmount: order.amount,
        saleSellerGets: order.sellerGets,
      };
    })
    .filter(Boolean);
}
