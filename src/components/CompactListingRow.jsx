import CompactAccordion from "./CompactAccordion.jsx";
import { accordionKey } from "../data/uiPreferences.js";
import FeedCard from "./FeedCard.jsx";
import EditedBadge from "./EditedBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { getActiveListingSale } from "../data/listingSales.js";

export function extractListingPrice(post) {
  if (!post) return null;
  if (post.feedSubtype === "daruji" || post.categoryId === "daruji") return "Zdarma";
  const isLending =
    post.thingKind === "lending" ||
    post.categoryId === "pujcovna" ||
    post.feedSubtype === "pujcovna" ||
    post.type === "Půjčovna";
  if (isLending) {
    const perDay = post.credits ?? post.listingPrice;
    if (perDay != null && perDay !== "" && Number(perDay) >= 0) {
      return `${perDay} Kč/den`;
    }
  }
  if (post.listingPrice) return `${post.listingPrice} Kč`;
  const day = post.meta?.match(/(\d+)\s*(?:Kč\/den|kredit)/i);
  if (day) return `${day[1]} Kč/den`;
  const kc = post.meta?.match(/(\d+)\s*Kč/);
  if (kc) return `${kc[1]} Kč`;
  return null;
}

export function extractDistanceFromMeta(meta) {
  if (!meta) return null;
  const m = meta.match(/(?:^|·\s*)(\d+\s*m|celá obec)/i);
  return m ? m[1] : null;
}

export default function CompactListingRow({ post }) {
  const { listingSaleOrders } = useApp();
  const price = extractListingPrice(post);
  const distance = extractDistanceFromMeta(post.meta);
  const reserved = post.saleStatus === "held" || Boolean(getActiveListingSale(listingSaleOrders, post.id));

  return (
    <CompactAccordion
      prefKey={accordionKey("listing", post.id)}
      summary={
        <div className="flex items-center gap-2 min-w-0 w-full text-sm">
          <span className="font-semibold text-stone-900 truncate flex-1">{post.title}</span>
          {post.updatedAt && <EditedBadge item={post} className="shrink-0" />}
          {distance && <span className="shrink-0 text-stone-400 text-[11px]">{distance}</span>}
          {reserved ? (
            <span className="shrink-0 text-amber-800 font-semibold text-xs">V rezervaci</span>
          ) : (
            price && (
              <span className="shrink-0 text-emerald-700 font-bold text-xs tabular-nums whitespace-nowrap">
                {price}
              </span>
            )
          )}
        </div>
      }
    >
      <FeedCard post={post} detailsOnly />
    </CompactAccordion>
  );
}
