import { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import FeedCard from "./FeedCard.jsx";
import LiveFeedCard, { getListingBadge, getNeighborSectionBadge } from "./LiveFeedCard.jsx";
import HelpFeedActions from "./HelpFeedActions.jsx";
import DoodleEmptyState from "./doodle/DoodleEmptyState.jsx";
import { extractListingPrice } from "./CompactListingRow.jsx";
import { isThingsModuleListing } from "../utils/thingsModule.js";
import { getRecentGroupPosts, getGroup } from "../data/groups.js";
import { displayCreatorLabel } from "../data/accountTypes.js";

const SECTION_LABELS = {
  veci: "Věci",
  vypomoc: "Výpomoc",
  skupiny: "Skupiny",
  akce: "Kalendář akcí",
};

const PER_CATEGORY = 2;

function OpenCategoryLink({ section, onSelectSection }) {
  return (
    <button
      type="button"
      onClick={() => onSelectSection(section)}
      className="mt-1 text-xs font-semibold text-[#3D7A68] hover:underline"
    >
      Zobrazit vše — {SECTION_LABELS[section]}
    </button>
  );
}

export default function NeighborsLatestFeed({ onSelectSection }) {
  const {
    userPostsForLocation,
    feedPostsForLocation,
    neighborHelp,
    userGroupPosts,
    upcomingEvents,
    openEventDetail,
    communityGroups,
    getHelpOffers,
    listingSaleOrders,
    offerHelpOnPost,
    hasOfferedHelp,
    reportPost,
  } = useApp();

  const items = useMemo(() => {
    const veci = [...userPostsForLocation, ...feedPostsForLocation]
      .filter(isThingsModuleListing)
      .sort((a, b) => Number(Boolean(b.mine)) - Number(Boolean(a.mine)) || (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, PER_CATEGORY)
      .map((post) => {
        const reserved =
          post.saleStatus === "held" ||
          Boolean(listingSaleOrders?.some((o) => o.listingId === post.id && o.status === "held"));
        const listingBadge = getListingBadge(post.type);
        return {
          id: `veci-${post.id}`,
          section: "veci",
          title: post.title,
          badge: listingBadge.label,
          badgeClassName: listingBadge.className,
          preview: post.body,
          authorLabel: displayCreatorLabel(post.author, post.accountType, { mine: post.mine }),
          price: reserved ? null : extractListingPrice(post),
          statusLabel: reserved ? "V rezervaci" : null,
          post,
          mine: Boolean(post.mine),
          createdAt: post.createdAt ?? 0,
        };
      });

    const vypomoc = [...neighborHelp]
      .map((h) => {
        const sectionBadge = getNeighborSectionBadge("vypomoc", h.type);
        return {
          id: `help-${h.id}`,
          section: "vypomoc",
          title: h.title,
          badge: sectionBadge.label,
          badgeClassName: sectionBadge.className,
          preview: h.body,
          authorLabel: displayCreatorLabel(h.author, h.accountType, { mine: h.mine }),
          help: {
            ...h,
            helpId: h.id,
            helpType: h.type,
            offerCount: getHelpOffers(h.id).length,
          },
          mine: Boolean(h.mine),
          createdAt: h.createdAt ?? 0,
          engagement: getHelpOffers(h.id).length,
        };
      })
      .sort(
        (a, b) =>
          b.engagement - a.engagement ||
          Number(Boolean(b.mine)) - Number(Boolean(a.mine)) ||
          (b.createdAt ?? 0) - (a.createdAt ?? 0)
      )
      .slice(0, PER_CATEGORY);

    const skupiny = getRecentGroupPosts(userGroupPosts, PER_CATEGORY).map((post) => {
      const group = getGroup(post.groupId) ?? communityGroups.find((g) => g.id === post.groupId);
      const groupName = post.groupName ?? group?.name ?? "Skupina";
      return {
        id: `group-${post.id}`,
        section: "skupiny",
        title: post.title,
        badge: groupName,
        badgeClassName: "pp-badge--skupina",
        preview: post.body,
        authorLabel: displayCreatorLabel(post.author, post.accountType, { mine: post.mine }),
        meta: groupName,
        post: { ...post, groupName },
        mine: Boolean(post.mine),
        createdAt: post.createdAt ?? 0,
        price: null,
      };
    });

    const akce = upcomingEvents.slice(0, PER_CATEGORY).map((ev) => {
      const sectionBadge = getNeighborSectionBadge("akce");
      return {
        id: `event-${ev.id}`,
        section: "akce",
        title: ev.title,
        badge: sectionBadge.label,
        badgeClassName: sectionBadge.className,
        preview: [ev.date, ev.location].filter(Boolean).join(" · "),
        authorLabel: displayCreatorLabel(ev.organizer, ev.accountType, {
          mine: ev.organizer === "Vy",
        }),
        event: ev,
        createdAt: 0,
      };
    });

    const ordered = [...veci, ...vypomoc, ...skupiny, ...akce];
    const fresh = ordered
      .filter((item) => item.mine)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const rest = ordered.filter((item) => !item.mine);
    return [...fresh, ...rest];
  }, [
    userPostsForLocation,
    feedPostsForLocation,
    neighborHelp,
    userGroupPosts,
    upcomingEvents,
    communityGroups,
    getHelpOffers,
    listingSaleOrders,
  ]);

  if (items.length === 0) {
    return (
      <section className="px-4 pb-8 pt-1">
        <DoodleEmptyState
          illustration="chat"
          message="Zatím tu nic nového — buďte první, kdo něco přidá!"
        />
      </section>
    );
  }

  return (
    <section className="px-4 pb-8 pt-1">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-[#3D7A68]">
        Nejnovější
      </h2>
      <div className="space-y-1.5">
        {items.map((item) => {
          if (item.section === "veci" && item.post) {
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge={item.badge}
                badgeClassName={item.badgeClassName}
                title={item.title}
                authorLabel={item.authorLabel}
                preview={item.preview}
                editedItem={item.post}
                priceLabel={item.price}
                statusLabel={item.statusLabel}
                onReport={
                  item.post.mine ? undefined : (reason) => reportPost(item.post.id, reason)
                }
              >
                <FeedCard post={item.post} detailsOnly bodyInParent />
                <OpenCategoryLink section="veci" onSelectSection={onSelectSection} />
              </LiveFeedCard>
            );
          }

          if (item.section === "vypomoc" && item.help) {
            const helpNeedsExpand = !item.mine;
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge={item.badge}
                badgeClassName={item.badgeClassName}
                title={item.title}
                authorLabel={item.authorLabel}
                preview={item.preview}
                expandable={helpNeedsExpand}
              >
                {helpNeedsExpand ? (
                  <HelpFeedActions
                    help={item.help}
                    onOfferHelp={offerHelpOnPost}
                    alreadyOffered={hasOfferedHelp(item.help.helpId)}
                  />
                ) : null}
              </LiveFeedCard>
            );
          }

          if (item.section === "skupiny" && item.post) {
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge={item.badge}
                badgeClassName={item.badgeClassName}
                title={item.title}
                authorLabel={item.authorLabel}
                preview={item.preview || item.meta}
                editedItem={item.post}
                priceLabel={item.price}
              >
                <FeedCard post={item.post} detailsOnly bodyInParent />
                <OpenCategoryLink section="skupiny" onSelectSection={onSelectSection} />
              </LiveFeedCard>
            );
          }

          if (item.section === "akce" && item.event) {
            return (
              <LiveFeedCard
                key={item.id}
                itemId={item.id}
                badge={item.badge}
                badgeClassName={item.badgeClassName}
                title={item.title}
                authorLabel={item.authorLabel}
                preview={item.preview}
              >
                <p className="pp-text-body text-sm">
                  {item.event.address ?? item.event.location}
                  {item.event.categoryLabel ? ` · ${item.event.categoryLabel}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => openEventDetail(item.event.id)}
                  className="py-2 px-4 text-sm font-semibold text-white rounded-xl pp-btn-primary"
                >
                  Detail akce
                </button>
                <OpenCategoryLink section="akce" onSelectSection={onSelectSection} />
              </LiveFeedCard>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
