import { useMemo, useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import FeedCard from "./FeedCard.jsx";
import LiveFeedCard, { getListingBadge } from "./LiveFeedCard.jsx";
import HelpFeedActions from "./HelpFeedActions.jsx";
import DoodleEmptyState from "./doodle/DoodleEmptyState.jsx";
import FeedSkeleton from "./FeedSkeleton.jsx";
import { extractDistanceFromMeta, extractListingPrice } from "./CompactListingRow.jsx";
import {
  isThingsModuleListing,
  isCommunityAnnouncementPost,
  isPujcovnaListing,
  normalizeLendingToThing,
} from "../utils/thingsModule.js";
import { isServiceOrSponsoredAdPost } from "../utils/categoryAccents.js";
import { REPORTS_TIP_CATEGORY_ID, resolveReportCategoryId } from "../data/reportCategories.js";
import { getPostInteractionType, INTERACTION_TYPES } from "../data/postInteractions.js";
import { getActiveListingSale } from "../data/listingSales.js";
import { displayCreatorLabel } from "../data/accountTypes.js";
import { lendingDisplayTitle } from "../data/lendingItemTypes.js";
import { reportSnapshotFromFeedPost } from "../utils/reportPinUtils.js";
import { feedItemNeedsExpand } from "./feed/feedExpand.js";
import { isReportActive, normalizeReportValidity } from "../data/reportExpiry.js";
import { SECURITY_REPORTS } from "../data/mockData.js";

function listingPreview(post, title) {
  const body = String(post?.body ?? "").trim();
  if (!body) return null;
  if (title && body === String(title).trim()) return null;
  return post.body;
}

function lendingToLivePost(item) {
  const thing = normalizeLendingToThing(item);
  const title = lendingDisplayTitle(thing) || thing.label || thing.item || "Půjčovna";
  return {
    id: thing.id,
    title,
    body: thing.description || thing.subtitle || "",
    type: "Půjčovna",
    categoryId: "pujcovna",
    feedType: "komunita",
    feedSubtype: "veci",
    author: thing.author,
    authorId: thing.authorId,
    accountType: thing.accountType,
    initials: thing.initials,
    mine: Boolean(thing.mine),
    photos: thing.photos ?? [],
    listingPrice: thing.credits ?? thing.listingPrice ?? null,
    meta: thing.distance || (thing.mine ? "Právě teď · 0 m" : ""),
    createdAt: thing.createdAt ?? 0,
    thingKind: "lending",
    lendingCategory: thing.lendingCategory,
    itemTypeLabel: thing.itemTypeLabel,
  };
}

export default function LiveNeighborFeed() {
  const {
    areaNews,
    neighborHelp,
    userPostsForLocation,
    feedPostsForLocation,
    lendingItemsForLocation,
    feedGalleryActivities,
    upcomingEvents,
    openEventGalleryFromFeed,
    openEventDetail,
    joinEvent,
    isJoinedEvent,
    openLendingFromHome,
    openReportOnMapFromHome,
    offerHelpOnPost,
    hasOfferedHelp,
    formatPersonName,
    globalSearchQuery,
    reportPost,
    deleteOwnPost,
    showToast,
    openMapReport,
    openCreateHelp,
    getUsefulCount,
    getSearchHelpCount,
    getHelpOffers,
    listingSaleOrders,
    user,
    extraReports,
    userReports,
  } = useApp();

  const [showSkeleton, setShowSkeleton] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShowSkeleton(false), 420);
    return () => window.clearTimeout(t);
  }, []);

  const reportGeneric = () => showToast("Děkujeme za nahlášení.", "info");

  const items = useMemo(() => {
    const reportById = new Map();
    for (const r of [...SECURITY_REPORTS, ...(extraReports ?? []), ...(userReports ?? [])]) {
      if (r?.id) reportById.set(r.id, normalizeReportValidity(r));
    }

    const isAnnouncementStillVisible = (post) => {
      if (post?.mine) return true;
      const rid =
        post.fromSecurityReportId ||
        (String(post.id || "").startsWith("feed-") ? String(post.id).slice(5) : null);
      if (rid && reportById.has(rid)) {
        return isReportActive(reportById.get(rid));
      }
      if (
        rid ||
        post.feedSubtype === "hlaseni" ||
        post.reportCategoryId ||
        post.expiresAt != null ||
        post.untilResolved
      ) {
        return isReportActive(normalizeReportValidity(post));
      }
      return true;
    };

    const engagementForPost = (post) => {
      if (!post?.id) return 0;
      const type = getPostInteractionType(post);
      if (type === INTERACTION_TYPES.SEARCH) return getSearchHelpCount(post.id);
      if (type === INTERACTION_TYPES.HELP) return getHelpOffers(post.id).length;
      if (type === INTERACTION_TYPES.TIP) return getUsefulCount(post.id);
      return Math.max(
        getUsefulCount(post.id),
        getSearchHelpCount(post.id),
        getHelpOffers(post.id).length
      );
    };

    const communityPosts = [...userPostsForLocation, ...feedPostsForLocation].filter(
      (p) => !isServiceOrSponsoredAdPost(p)
    );

    const postIds = new Set(communityPosts.map((p) => p.id));
    const lendingPosts = (lendingItemsForLocation ?? [])
      .filter((item) => item?.id && !postIds.has(item.id))
      .map(lendingToLivePost);

    const gallery = feedGalleryActivities.map((a) => ({
      id: a.id,
      kind: "eventGallery",
      title: a.participated
        ? `Nové fotky z akce, které jste se zúčastnili`
        : `Nové fotky z akce v okolí`,
      subtitle: `${formatPersonName({ id: a.authorId, name: a.authorName })} · ${a.eventTitle}`,
      distance: a.time,
      photoUrl: a.photoUrl,
      activityId: a.id,
      eventId: a.eventId,
      photoId: a.photoId,
      engagement: 0,
    }));

    const events = (upcomingEvents ?? []).slice(0, 6).map((ev) => {
      const mine =
        Boolean(ev.mine) ||
        ev.organizer === "Vy" ||
        (user?.name && ev.organizer === user.name);
      return {
        id: `event-${ev.id}`,
        kind: "event",
        title: ev.title,
        subtitle: [ev.date, ev.address ?? ev.location].filter(Boolean).join(" · "),
        eventId: ev.id,
        event: ev,
        mine,
        createdAt: ev.createdAt ?? (mine ? Date.now() : 0),
        engagement: ev.participants ?? 0,
      };
    });

    const news = areaNews
      .filter((n) => n.type !== "crisis")
      .slice(0, 4)
      .map((n) => ({
        id: `news-${n.id}`,
        kind: "news",
        title: n.title,
        distance: n.time,
        body: n.body,
        newsId: n.id,
        newsItem: n,
        engagement: 0,
      }));

    const help = [...neighborHelp]
      .map((h) => {
        const offerCount = getHelpOffers(h.id).length;
        return {
          id: `help-${h.id}`,
          kind: "help",
          title: h.title,
          distance: h.distance,
          body: h.body,
          helpType: h.type,
          helpId: h.id,
          author: h.author,
          mine: Boolean(h.mine),
          createdAt: h.createdAt ?? (h.mine ? Date.now() : 0),
          offerCount,
          engagement: offerCount,
        };
      })
      .sort((a, b) => b.engagement - a.engagement || (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 4);

    const listings = [...communityPosts.filter(isThingsModuleListing), ...lendingPosts]
      .map((p) => {
        const reserved =
          p.saleStatus === "held" || Boolean(getActiveListingSale(listingSaleOrders, p.id));
        return {
          id: `post-${p.id}`,
          kind: "listing",
          title: p.title,
          distance: extractDistanceFromMeta(p.meta),
          price: extractListingPrice(p),
          reserved,
          photoUrl: p.photos?.[0],
          post: p,
          isPujcovna: isPujcovnaListing(p),
          mine: Boolean(p.mine),
          createdAt: p.createdAt ?? 0,
          engagement: engagementForPost(p),
        };
      })
      .sort((a, b) => {
        if (a.isPujcovna !== b.isPujcovna) return a.isPujcovna ? -1 : 1;
        return b.engagement - a.engagement || (b.createdAt ?? 0) - (a.createdAt ?? 0);
      })
      .slice(0, 10);

    const announcements = communityPosts
      .filter(isCommunityAnnouncementPost)
      .filter(isAnnouncementStillVisible)
      .map((p) => ({
        id: `hlaseni-${p.id}`,
        kind: "announcement",
        title: p.title,
        distance: extractDistanceFromMeta(p.meta),
        photoUrl: p.photos?.[0],
        post: p,
        mine: Boolean(p.mine),
        createdAt: p.createdAt ?? 0,
        engagement: engagementForPost(p),
      }))
      .sort((a, b) => b.engagement - a.engagement || (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 8);

    const ordered = [...announcements, ...events, ...gallery, ...news, ...help, ...listings];

    const isFresh = (item) =>
      Boolean(item.mine) ||
      Boolean(item.post?.mine) ||
      Boolean(item.isPujcovna && (item.createdAt ?? 0) > Date.now() - 1000 * 60 * 60 * 48) ||
      (typeof item.distance === "string" && /právě teď/i.test(item.distance)) ||
      (typeof item.post?.meta === "string" && /právě teď/i.test(item.post.meta));

    const byEngagementThenTime = (a, b) => {
      const ap = a.isPujcovna ? 1 : 0;
      const bp = b.isPujcovna ? 1 : 0;
      if (ap !== bp) return bp - ap;
      const de = (b.engagement ?? 0) - (a.engagement ?? 0);
      if (de !== 0) return de;
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    };

    const fresh = ordered.filter(isFresh).sort(byEngagementThenTime);
    const rest = ordered.filter((item) => !isFresh(item)).sort(byEngagementThenTime);
    return [...fresh, ...rest];
  }, [
    areaNews,
    neighborHelp,
    userPostsForLocation,
    feedPostsForLocation,
    lendingItemsForLocation,
    feedGalleryActivities,
    upcomingEvents,
    user?.name,
    formatPersonName,
    getUsefulCount,
    getSearchHelpCount,
    getHelpOffers,
    listingSaleOrders,
    extraReports,
    userReports,
  ]);

  const filteredItems = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.body?.toLowerCase().includes(q)
    );
  }, [items, globalSearchQuery]);

  if (filteredItems.length === 0) {
    if (showSkeleton) {
      return (
        <section className="px-4 pt-2 pb-3 shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-[#3D7A68]">
            Živé dění v okolí
          </h2>
          <FeedSkeleton rows={3} className="px-0" />
        </section>
      );
    }
    return (
      <section className="px-4 pt-2 pb-3 shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-[#3D7A68]">
          Živé dění v okolí
        </h2>
        <DoodleEmptyState
          illustration="chat"
          message="V okolí zatím nic nového. Buďte první — nahlaste tip nebo požádejte o pomoc."
          actionLabel="Nahlásit"
          onAction={() => openMapReport?.()}
        />
        <div className="flex justify-center mt-1">
          <button
            type="button"
            onClick={() => openCreateHelp?.()}
            className="text-xs font-semibold text-[#3D7A68] hover:underline"
          >
            Nebo požádat o pomoc
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pt-2 pb-3 shrink-0">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-[#3D7A68]">
        Živé dění v okolí
      </h2>
      <div className="space-y-1.5">
        {filteredItems.map((item) => {
          if (item.kind === "eventGallery") {
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge="Akce"
                badgeClassName="pp-badge--akce"
                title={item.title}
                preview={item.subtitle || null}
                onReport={reportGeneric}
                expandable={false}
                onSummaryClick={() => openEventGalleryFromFeed(item.activityId, item.eventId)}
              />
            );
          }

          if (item.kind === "event") {
            const ev = item.event;
            const joined = isJoinedEvent(item.eventId);
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge="Akce"
                badgeClassName="pp-badge--akce"
                title={item.title}
                authorLabel={displayCreatorLabel(ev?.organizer, ev?.accountType, {
                  mine: item.mine,
                })}
                preview={item.subtitle || null}
                mine={Boolean(item.mine)}
                onDelete={
                  item.mine
                    ? () => deleteOwnPost(item.eventId, { kind: "event" })
                    : undefined
                }
                ctaLabel="Detail akce"
              >
                {(ev?.address || ev?.location || ev?.categoryLabel) && (
                  <p className="pp-text-body text-xs text-stone-600">
                    {[ev?.address ?? ev?.location, ev?.categoryLabel].filter(Boolean).join(" · ")}
                  </p>
                )}
                {ev?.description ? (
                  <p className="pp-text-body text-xs text-stone-600 line-clamp-4 whitespace-pre-wrap">
                    {ev.description}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => joinEvent(item.eventId)}
                    disabled={joined}
                    className={`py-2 px-4 text-sm font-semibold rounded-xl transition-colors ${
                      joined
                        ? "bg-[#E8F3EF] text-[#1B4D3E] cursor-default"
                        : "text-white pp-btn-primary"
                    }`}
                  >
                    {joined ? "Jdete na akci" : "Jdu na akci"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEventDetail(item.eventId)}
                    className="py-2 px-4 text-sm font-semibold rounded-xl border border-[#C5DDD4] text-[#3D7A68] bg-white hover:bg-[#E8F3EF] transition-colors"
                  >
                    Celý detail
                  </button>
                </div>
              </LiveFeedCard>
            );
          }

          if (item.kind === "news") {
            const newsNeedsExpand = feedItemNeedsExpand(
              { body: item.body, photos: item.newsItem?.photos },
              { preview: item.body }
            );
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge="Aktualita"
                badgeClassName="pp-badge--hlaseni"
                title={item.title}
                preview={item.body}
                editedItem={item.newsItem}
                onReport={reportGeneric}
                expandable={newsNeedsExpand}
              >
                {newsNeedsExpand ? (
                  <p className="pp-text-body text-xs text-stone-600 whitespace-pre-wrap">{item.body}</p>
                ) : null}
              </LiveFeedCard>
            );
          }

          if (item.kind === "help") {
            const helpNeedsExpand = feedItemNeedsExpand(
              { body: item.body },
              { preview: item.body, hasExtraDetail: !item.mine }
            );
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge="Výpomoc"
                badgeClassName="pp-badge--vypomoc"
                title={item.title}
                authorLabel={displayCreatorLabel(item.author, item.accountType, {
                  mine: item.mine,
                })}
                preview={item.body}
                onReport={item.mine ? undefined : reportGeneric}
                onDelete={
                  item.mine ? () => deleteOwnPost(item.helpId, { kind: "help" }) : undefined
                }
                mine={Boolean(item.mine)}
                expandable={helpNeedsExpand}
              >
                {helpNeedsExpand ? (
                  item.mine ? (
                    <p className="pp-text-body text-sm whitespace-pre-wrap">{item.body}</p>
                  ) : (
                    <HelpFeedActions
                      help={item}
                      onOfferHelp={offerHelpOnPost}
                      alreadyOffered={hasOfferedHelp(item.helpId)}
                    />
                  )
                ) : null}
              </LiveFeedCard>
            );
          }

          if (item.kind === "announcement") {
            const post = item.post;
            const reportCategoryId = resolveReportCategoryId(post) || post.reportCategoryId || null;
            const badge = getListingBadge(post.type, { reportCategoryId });
            const isTip =
              reportCategoryId === REPORTS_TIP_CATEGORY_ID ||
              (post.type ?? "").toLowerCase() === "tip" ||
              post.interactionType === "tip";
            const reportId =
              post.fromSecurityReportId ||
              (String(post.id || "").startsWith("feed-") ? String(post.id).slice(5) : null);
            const placeLabel = post.placeLabel || null;
            const distance = extractDistanceFromMeta(post.meta);
            const mapCategory = isTip ? REPORTS_TIP_CATEGORY_ID : "all";

            const openOnMap = () => {
              if (!reportId) return;
              openReportOnMapFromHome(reportId, {
                category: mapCategory,
                snapshot: reportSnapshotFromFeedPost(post),
              });
            };

            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge={badge.label}
                badgeClassName={badge.className || (isTip ? "pp-badge--tip" : "")}
                reportCategoryId={reportCategoryId}
                badgeTone={badge.tone}
                BadgeIcon={badge.Icon}
                title={item.title}
                authorLabel={displayCreatorLabel(post.author, post.accountType, {
                  mine: post.mine,
                })}
                distanceLabel={[distance, placeLabel].filter(Boolean).join(" · ") || null}
                preview={post.body}
                editedItem={post}
                onReport={
                  post.mine || item.mine
                    ? undefined
                    : (reason) => reportPost(post.id, reason)
                }
                onDelete={
                  post.mine || item.mine ? () => deleteOwnPost(post.id) : undefined
                }
                mine={Boolean(post.mine || item.mine)}
                onMapClick={reportId ? openOnMap : undefined}
              >
                <FeedCard post={post} detailsOnly bodyInParent />
              </LiveFeedCard>
            );
          }

          const badge = getListingBadge(item.post.type);
          if (item.isPujcovna) {
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge={badge.label}
                badgeClassName={badge.className}
                badgeTone={badge.tone}
                BadgeIcon={badge.Icon}
                title={item.title}
                authorLabel={displayCreatorLabel(item.post?.author, item.post?.accountType, {
                  mine: item.post?.mine,
                })}
                preview={listingPreview(item.post, item.title)}
                priceLabel={item.price}
                editedItem={item.post}
                onReport={
                  item.post?.mine || item.mine
                    ? undefined
                    : (reason) => reportPost(item.post.id, reason)
                }
                onDelete={
                  item.post?.mine || item.mine
                    ? () => deleteOwnPost(item.post.id)
                    : undefined
                }
                expandable={false}
                onSummaryClick={() => openLendingFromHome(item.post.id)}
                mine={Boolean(item.mine || item.post?.mine)}
              />
            );
          }

          return (
            <LiveFeedCard
              key={item.id}
              itemId={item.id}
              badge={badge.label}
              badgeClassName={badge.className}
              badgeTone={badge.tone}
              BadgeIcon={badge.Icon}
              title={item.title}
              authorLabel={displayCreatorLabel(item.post?.author, item.post?.accountType, {
                mine: item.post?.mine,
              })}
              preview={listingPreview(item.post, item.title)}
              statusLabel={item.reserved ? "V rezervaci" : null}
              priceLabel={item.reserved ? null : item.price}
              editedItem={item.post}
              onReport={
                item.post?.mine || item.mine
                  ? undefined
                  : (reason) => reportPost(item.post.id, reason)
              }
              onDelete={
                item.post?.mine || item.mine
                  ? () => deleteOwnPost(item.post.id)
                  : undefined
              }
              mine={Boolean(item.mine || item.post?.mine)}
            >
              <FeedCard post={item.post} detailsOnly bodyInParent />
            </LiveFeedCard>
          );
        })}
      </div>
    </section>
  );
}
