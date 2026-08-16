import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import FeedCard from "./FeedCard.jsx";
import LiveFeedCard, { getListingBadge } from "./LiveFeedCard.jsx";
import HelpFeedActions from "./HelpFeedActions.jsx";
import { extractDistanceFromMeta, extractListingPrice } from "./CompactListingRow.jsx";
import { isThingsModuleListing, isCommunityAnnouncementPost } from "../utils/thingsModule.js";
import { isServiceOrSponsoredAdPost } from "../utils/categoryAccents.js";
import { IconMapPin } from "../data/icons.jsx";
import { REPORTS_TIP_CATEGORY_ID } from "../data/reportCategories.js";
import { getPostInteractionType, INTERACTION_TYPES } from "../data/postInteractions.js";
import { getActiveListingSale } from "../data/listingSales.js";
import { displayCreatorLabel } from "../data/accountTypes.js";

function isPujcovnaPost(post) {
  return post?.categoryId === "pujcovna" || (post?.type ?? "").toLowerCase().includes("půjčovna");
}

export default function LiveNeighborFeed() {
  const {
    areaNews,
    neighborHelp,
    userPostsForLocation,
    feedPostsForLocation,
    feedGalleryActivities,
    openEventGalleryFromFeed,
    openLendingFromHome,
    openReportOnMapFromHome,
    offerHelpOnPost,
    hasOfferedHelp,
    formatPersonName,
    globalSearchQuery,
    reportPost,
    showToast,
    getUsefulCount,
    getSearchHelpCount,
    getHelpOffers,
    listingSaleOrders,
  } = useApp();

  const reportGeneric = () => showToast("Děkujeme za nahlášení.", "info");

  const items = useMemo(() => {
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

    const listings = communityPosts
      .filter(isThingsModuleListing)
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
          isPujcovna: isPujcovnaPost(p),
          mine: Boolean(p.mine),
          createdAt: p.createdAt ?? 0,
          engagement: engagementForPost(p),
        };
      })
      .sort((a, b) => b.engagement - a.engagement || (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 8);

    const announcements = communityPosts
      .filter(isCommunityAnnouncementPost)
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

    const ordered = [...announcements, ...gallery, ...news, ...help, ...listings];

    const isFresh = (item) =>
      Boolean(item.mine) ||
      Boolean(item.post?.mine) ||
      (typeof item.distance === "string" && /právě teď/i.test(item.distance)) ||
      (typeof item.post?.meta === "string" && /právě teď/i.test(item.post.meta));

    const byEngagementThenTime = (a, b) => {
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
    feedGalleryActivities,
    formatPersonName,
    getUsefulCount,
    getSearchHelpCount,
    getHelpOffers,
    listingSaleOrders,
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

  if (filteredItems.length === 0) return null;

  return (
    <section className="px-4 pt-2 pb-3 shrink-0">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-[#3D7A68]">
        Živé sousedské dění
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

          if (item.kind === "news") {
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
              >
                <p className="pp-text-body text-sm whitespace-pre-wrap">{item.body}</p>
              </LiveFeedCard>
            );
          }

          if (item.kind === "help") {
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
                onReport={reportGeneric}
                mine={Boolean(item.mine)}
              >
                <HelpFeedActions
                  help={item}
                  onOfferHelp={offerHelpOnPost}
                  alreadyOffered={hasOfferedHelp(item.helpId)}
                />
              </LiveFeedCard>
            );
          }

          if (item.kind === "announcement") {
            const badge = getListingBadge(item.post.type);
            const post = item.post;
            const isTip =
              post.reportCategoryId === REPORTS_TIP_CATEGORY_ID ||
              (post.type ?? "").toLowerCase() === "tip" ||
              post.interactionType === "tip";
            const reportId = post.fromSecurityReportId;
            const placeLabel = post.placeLabel || null;
            const distance = extractDistanceFromMeta(post.meta);
            const canOpenMap = Boolean(reportId);

            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge={badge.label}
                badgeClassName={badge.className || (isTip ? "pp-badge--tip" : "")}
                title={item.title}
                authorLabel={displayCreatorLabel(post.author, post.accountType, {
                  mine: post.mine,
                })}
                preview={post.body}
                editedItem={post}
                onReport={(reason) => reportPost(post.id, reason)}
                mine={Boolean(post.mine || item.mine)}
              >
                <FeedCard post={post} detailsOnly />
                {(placeLabel || distance || canOpenMap) && (
                  <div className="pt-1">
                    {canOpenMap ? (
                      <button
                        type="button"
                        onClick={() =>
                          openReportOnMapFromHome(reportId, {
                            category: isTip ? REPORTS_TIP_CATEGORY_ID : "all",
                          })
                        }
                        className={`w-full flex items-center gap-2 text-left text-xs rounded-lg py-1 -mx-0.5 px-0.5 hover:bg-[#F7FAF9] transition-colors ${
                          isTip ? "text-[#5A7A1E]" : "text-[#3D7A68]"
                        }`}
                        aria-label={`Zobrazit ${placeLabel || "místo"} na mapě`}
                      >
                        <span className="flex-1 min-w-0 truncate font-medium">
                          {[placeLabel, distance].filter(Boolean).join(" · ") || "Lokalita"}
                        </span>
                        <IconMapPin
                          className={`w-3.5 h-3.5 shrink-0 ${isTip ? "text-[#8FAE3E]" : "text-[#3D7A68]"}`}
                          aria-hidden
                        />
                      </button>
                    ) : (
                      <p className="flex items-center gap-1.5 text-xs text-stone-500">
                        <span className="flex-1 min-w-0 truncate">
                          {[placeLabel, distance].filter(Boolean).join(" · ")}
                        </span>
                      </p>
                    )}
                  </div>
                )}
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
                title={item.title}
                authorLabel={displayCreatorLabel(item.post?.author, item.post?.accountType, {
                  mine: item.post?.mine,
                })}
                preview={item.post?.body}
                priceLabel={item.price}
                editedItem={item.post}
                onReport={(reason) => reportPost(item.post.id, reason)}
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
              title={item.title}
              authorLabel={displayCreatorLabel(item.post?.author, item.post?.accountType, {
                mine: item.post?.mine,
              })}
              preview={item.post?.body}
              statusLabel={item.reserved ? "V rezervaci" : null}
              priceLabel={item.reserved ? null : item.price}
              editedItem={item.post}
              onReport={(reason) => reportPost(item.post.id, reason)}
              mine={Boolean(item.mine || item.post?.mine)}
            >
              <FeedCard post={item.post} detailsOnly />
            </LiveFeedCard>
          );
        })}
      </div>
    </section>
  );
}
