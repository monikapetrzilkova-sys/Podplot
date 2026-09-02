import { useState } from "react";
import { getRole } from "../data/roles.js";
import { formatAuthorName, getAccountType } from "../data/accountTypes.js";
import RoleBadge, { Avatar } from "./RoleBadge.jsx";
import { PostPhotos } from "./PhotoUpload.jsx";
import ReportMenu from "./ReportMenu.jsx";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";
import VerifiedBadge from "./VerifiedBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { canTopCategory, TOP_PLANS, calculateTopCost } from "../data/pricing.js";
import { MessageButton } from "./MessagesPage.jsx";
import ReportUserButton from "./ReportUserButton.jsx";
import PaymentModal from "./PaymentModal.jsx";
import PostInteractions from "./PostInteractions.jsx";
import EditedBadge from "./EditedBadge.jsx";
import AccountTypeIcon from "./AccountTypeIcon.jsx";
import ContentEditModal from "./ContentEditModal.jsx";
import {
  getActiveListingSale,
  isActiveListingSaleStatus,
  isSameAppUser,
} from "../data/listingSales.js";
import {
  formatListingUnitPrice,
  listingUsesVariablePrice,
} from "../data/listingPriceUnits.js";
import { DoodleHandIcon } from "./doodle/doodleIcons.jsx";
import { ACTION_BTN } from "./PostInteractions.jsx";
import { topicFromPost, topicFromGroupPost } from "../data/chatTopics.js";
import GroupPostComments from "./GroupPostComments.jsx";
import { isGroupBoardDiscussionPost } from "../data/groups.js";
import { formatContentAge } from "../data/czechDateTime.js";

function extractDistance(meta) {
  if (!meta) return null;
  const m = meta.match(/^(\d+\s*m|celá obec)/);
  return m ? m[1] : null;
}

function stripTimeFromMeta(meta) {
  if (!meta) return null;
  return String(meta)
    .replace(/\s*·\s*(právě teď|před\s+\d+\s*(min|h|dny?|dní)|včera(?:\s+\d{1,2}:\d{2})?)/gi, "")
    .replace(/^(právě teď|před\s+\d+\s*(min|h|dny?|dní)|včera(?:\s+\d{1,2}:\d{2})?)\s*·\s*/gi, "")
    .trim() || null;
}

function useListingSaleState(post) {
  const { listingSaleOrders, user } = useApp();
  const order = getActiveListingSale(listingSaleOrders, post.id);
  const viewerId = user?.id ?? "me";
  const isReserved = Boolean(order) || isActiveListingSaleStatus(post.saleStatus);
  const reservedByMe = order
    ? isSameAppUser(order.buyerId, viewerId)
    : Boolean(post.saleReservedByMe);
  const sellerView =
    isReserved &&
    !reservedByMe &&
    (post.mine || post.saleIsSellerView || (order && isSameAppUser(order.sellerId, viewerId)));
  return {
    order,
    isReserved,
    reservedByMe,
    sellerView,
    saleOrderId: order?.id ?? post.saleOrderId,
    saleAmount: order?.amount ?? post.saleAmount ?? post.listingPrice,
    saleOrder: order,
  };
}

function ListingSaleStatusPanel() {
  return null;
}

function ListingSaleBuyButton({ post }) {
  const isProdam = post.categoryId === "prodam" && Number(post.listingPrice) > 0;
  if (!isProdam || post.mine) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-1.5 rounded-xl whitespace-nowrap">
      <DoodleHandIcon className="w-3.5 h-3.5" />
      Platba osobně
    </span>
  );
}

export default function FeedCard({ post, compact = false, detailsOnly = false, bodyInParent = false }) {
  const {
    topPost,
    reportedPosts,
    reportPost,
    deleteOwnPost,
    isSearchHighlighted,
    openEditListing,
    updateSecurityReport,
    updateUserPost,
  } = useApp();
  const [topTarget, setTopTarget] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const { isReserved } = useListingSaleState(post);
  const authorId = post.authorId ?? post.id?.replace(/^f/, "user-") ?? post.author?.toLowerCase().replace(/\s/g, "-");
  const isSponsor = post.sponsored;
  const group = post.groupName;
  const showTopButton =
    post.mine && !post.topped && canTopCategory(post.categoryId) && !isReserved;
  const topDays = post.topDays ?? 7;
  const isReported = reportedPosts.includes(post.id);
  const acc = post.accountType ? getAccountType(post.accountType) : null;
  const accRole = acc ? getRole(acc.role) : null;
  const authorLabel = formatAuthorName(post.author, post.accountType);
  const isGroupDiscussion = isGroupBoardDiscussionPost(post);
  const messageTopic = isGroupDiscussion ? topicFromGroupPost(post) : topicFromPost(post);
  const distance = extractDistance(post.meta);
  const ageLabel = formatContentAge(post);
  const metaRest = stripTimeFromMeta(
    post.mine ? post.meta : post.meta?.replace(/^\d+\s*m\s*·\s*/, "") ?? post.meta
  );
  const metaLine = [!post.mine ? distance : null, ageLabel, metaRest]
    .filter(Boolean)
    .filter((part, idx, arr) => arr.indexOf(part) === idx)
    .join(" · ");
  const searchHighlight = isSearchHighlighted(post.id);
  const isListingEdit =
    post.mine &&
    ["daruji", "prodam", "shanim", "pujcovna"].includes(post.categoryId ?? post.feedSubtype);
  const canEditContent =
    post.mine &&
    (isListingEdit ||
      Boolean(post.fromSecurityReportId) ||
      post.feedSubtype === "hlaseni" ||
      ["Tip", "Hlášení", "Pátrání"].includes(post.type));

  const startEdit = () => {
    if (isListingEdit) {
      openEditListing(post);
      return;
    }
    setEditOpen(true);
  };

  const saveContentEdit = ({ title, body }) => {
    if (post.fromSecurityReportId) {
      return updateSecurityReport(post.fromSecurityReportId, { type: title, body });
    }
    return updateUserPost(post.id, { title, body });
  };

  const editControls = canEditContent && !isReported && (
    <button
      type="button"
      onClick={startEdit}
      className={`${ACTION_BTN} bg-white text-[#3D7A68] border-[#C5DDD4] hover:bg-[#F1F6F5]`}
    >
      Upravit
    </button>
  );

  const editModal = (
    <ContentEditModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      title="Upravit příspěvek"
      titleLabel={post.fromSecurityReportId || post.feedSubtype === "hlaseni" ? "Typ / nadpis" : "Nadpis"}
      initialTitle={post.title}
      initialBody={post.body}
      onSave={saveContentEdit}
    />
  );

  if (detailsOnly) {
    const bodyText = String(post.body ?? "").trim();
    const titleText = String(post.title ?? "").trim();
    const showBody = !bodyInParent && bodyText && bodyText !== titleText;
    return (
      <div className="space-y-2">
        {!bodyInParent && <EditedBadge item={post} />}
        {showBody ? <p className="pp-text-body">{post.body}</p> : null}
        <PostPhotos photos={post.photos} compact />
        {!isReported && (
          <div
            className={`flex flex-nowrap gap-1.5 items-center pt-1 overflow-x-auto ${
              searchHighlight ? "bg-amber-50/60 -mx-1 px-1 rounded-xl" : ""
            }`}
          >
            {editControls}
            {!isGroupDiscussion && !post.mine && !isReserved && <PostInteractions post={post} />}
            {!post.mine && (
              <>
                <MessageButton
                  participantId={authorId}
                  participantName={post.author}
                  topic={messageTopic}
                  compact
                  label={isGroupDiscussion ? "Soukromě" : "Domluvit předání"}
                />
                {!isGroupDiscussion && <ListingSaleBuyButton post={post} />}
              </>
            )}
            {!isGroupDiscussion && post.mine && <PostInteractions post={post} />}
            {!post.mine && !isReserved && (
              <ReportUserButton targetId={authorId} targetName={post.author} compact />
            )}
          </div>
        )}
        {!isReported && !isGroupDiscussion ? <ListingSaleStatusPanel post={post} /> : null}
        {isGroupDiscussion && !isReported ? (
          <GroupPostComments
            postId={post.id}
            postTitle={post.title}
            groupName={post.groupName}
          />
        ) : null}
        {showTopButton && !isReported && (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] text-stone-500">Posunout nahoru ve feedu:</p>
            <div className="flex gap-2">
              {TOP_PLANS.map((plan) => {
                const cost = calculateTopCost(plan.id, post.listingPrice);
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() =>
                      setTopTarget({
                        postId: post.id,
                        planId: plan.id,
                        cost,
                        planLabel: plan.label,
                      })
                    }
                    className="flex-1 py-2 rounded-xl text-[11px] font-semibold border border-amber-400 bg-amber-100 text-amber-900"
                  >
                    {plan.label} · {cost} Kč
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <PaymentModal
          open={!!topTarget}
          onClose={() => setTopTarget(null)}
          title={topTarget ? `TOP inzerát — ${topTarget.planLabel}` : "TOP boost"}
          amount={topTarget?.cost ?? 0}
          note="Platba kartou — inzerát se posune nahoru ve feedu."
          onConfirm={(method) => {
            if (topTarget) topPost(topTarget.postId, topTarget.planId, method);
            setTopTarget(null);
          }}
        />
        {editModal}
      </div>
    );
  }

  return (
    <article
      className={`pp-card overflow-hidden transition-all ${
        isReported ? "opacity-45 grayscale pointer-events-none" : ""
      } ${
        searchHighlight
          ? "ring-2 ring-amber-400"
          : isReserved
            ? "ring-1 ring-amber-300"
          : post.topped
          ? "ring-1 ring-amber-200"
          : post.mine
            ? "ring-1 ring-[#64A08D]/40"
            : ""
      }`}
    >
      {isSampleContent(post) && !compact && (
        <div className="px-4 py-1.5 bg-stone-100 border-b border-stone-200 flex items-center gap-2">
          <SampleBadge />
          <span className="text-[10px] text-stone-500">Jen ukázka, jak Podplot vypadá</span>
        </div>
      )}

      {isReported && (
        <div className="px-4 py-1.5 bg-stone-200 border-b border-stone-300">
          <span className="text-[10px] font-bold uppercase text-stone-600">Nahlášeno · skryto pro vás</span>
        </div>
      )}

      {post.topped && !isReported && !isReserved && (
        <div className="px-4 py-1.5 bg-amber-200 border-b border-amber-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
            TOP boost · {topDays} dní
          </span>
        </div>
      )}

      {post.mine && !post.topped && !isReported && !isReserved && (
        <div className="px-4 py-1.5 bg-teal-200 border-b border-teal-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Vaše nabídka</span>
        </div>
      )}

      {group && !post.mine && !post.topped && !isReported && !isReserved && (
        <div className="px-4 py-1.5 bg-stone-100 border-b border-stone-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
            {group}
          </span>
        </div>
      )}

      {isSponsor && !isReported && (
        <div className="px-4 py-1.5 bg-amber-100/80 border-b border-amber-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Sponzorováno · lokální inzerce
          </span>
        </div>
      )}

      <div className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start gap-3 mb-2">
          <Avatar
            initials={post.initials}
            name={post.author}
            roleId={post.role}
            size={compact ? "sm" : "md"}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="pp-text-title">{authorLabel}</span>
              {distance && !post.mine && (
                <span className="pp-text-meta">· {distance}</span>
              )}
              {post.isVerified && (
                <VerifiedBadge accountType={post.accountType} compact />
              )}
              {acc && accRole && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${accRole.badge}`}>
                  <AccountTypeIcon accountType={post.accountType} className="w-3 h-3" />
                  {post.accountType === "soused" ? "" : acc.shortLabel}
                </span>
              )}
              {!compact && !acc && <RoleBadge roleId={post.role} />}
            </div>
            <p className="pp-text-meta">
              {metaLine || post.meta || null}
            </p>
          </div>
          <div className="flex items-start gap-1 shrink-0">
            {isSampleContent(post) && compact ? <SampleBadge /> : null}
            {post.type && (
              <span className="pp-badge shrink-0">{post.type}</span>
            )}
            {!isReported && !isReserved && (
              <ReportMenu
                compact
                onReport={post.mine ? undefined : (reason) => reportPost(post.id, reason)}
                onDelete={post.mine ? () => deleteOwnPost(post.id) : undefined}
              />
            )}
          </div>
        </div>

        <h3 className="pp-text-title mb-1 flex items-center gap-2 flex-wrap">
          <span>{post.title}</span>
          <EditedBadge item={post} />
        </h3>
        {!compact && <p className="pp-text-body">{post.body}</p>}
      </div>

      <PostPhotos photos={post.photos} compact={compact} />

      {!compact && !isReported && (
        <div
          className={`px-4 pb-3 flex flex-nowrap gap-1.5 items-center overflow-x-auto ${
            searchHighlight ? "bg-amber-50/60" : ""
          }`}
        >
          {editControls}
          {!isGroupDiscussion && !post.mine && !isReserved && <PostInteractions post={post} />}
          {!post.mine && (
            <>
              <MessageButton
                participantId={authorId}
                participantName={post.author}
                topic={messageTopic}
                compact
                label={isGroupDiscussion ? "Soukromě" : "Domluvit předání"}
              />
              {!isGroupDiscussion && <ListingSaleBuyButton post={post} />}
            </>
          )}
          {!isGroupDiscussion && post.mine && <PostInteractions post={post} />}
          {!post.mine && !isReserved && (
            <ReportUserButton targetId={authorId} targetName={post.author} compact />
          )}
        </div>
      )}

      {!compact && !isReported && !isGroupDiscussion && isReserved ? (
        <div className="px-4 pb-3">
          <ListingSaleStatusPanel post={post} />
        </div>
      ) : null}

      {isGroupDiscussion && !compact && !isReported ? (
        <div className="px-4 pb-3">
          <GroupPostComments
            postId={post.id}
            postTitle={post.title}
            groupName={post.groupName}
          />
        </div>
      ) : null}

      {showTopButton && !compact && !isReported && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-[11px] text-stone-500">Posunout nahoru ve feedu (jako bump na Vinted):</p>
          <div className="flex gap-2">
            {TOP_PLANS.map((plan) => {
              const cost = calculateTopCost(plan.id, post.listingPrice);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() =>
                    setTopTarget({
                      postId: post.id,
                      planId: plan.id,
                      cost,
                      planLabel: plan.label,
                    })
                  }
                  className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold border transition-colors border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200"
                >
                  {plan.label}
                  <span className="block text-xs font-bold mt-0.5">{cost} Kč</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <PaymentModal
        open={!!topTarget}
        onClose={() => setTopTarget(null)}
        title={topTarget ? `TOP inzerát — ${topTarget.planLabel}` : "TOP boost"}
        amount={topTarget?.cost ?? 0}
        note="Platba kartou — inzerát se posune nahoru ve feedu."
        onConfirm={(method) => {
          if (topTarget) topPost(topTarget.postId, topTarget.planId, method);
          setTopTarget(null);
        }}
      />
      {editModal}
    </article>
  );
}
