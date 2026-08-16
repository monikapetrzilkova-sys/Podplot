import { useState } from "react";
import { getRole } from "../data/roles.js";
import { formatAuthorName, getAccountType } from "../data/accountTypes.js";
import RoleBadge, { Avatar } from "./RoleBadge.jsx";
import { PostPhotos } from "./PhotoUpload.jsx";
import ReportMenu from "./ReportMenu.jsx";
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
  isSameAppUser,
  LISTING_SALE_STATUS,
} from "../data/listingSales.js";
import { ACTION_BTN } from "./PostInteractions.jsx";
import { topicFromPost } from "../data/chatTopics.js";

function extractDistance(meta) {
  if (!meta) return null;
  const m = meta.match(/^(\d+\s*m|celá obec)/);
  return m ? m[1] : null;
}

function useListingSaleState(post) {
  const { listingSaleOrders, user } = useApp();
  const order = getActiveListingSale(listingSaleOrders, post.id);
  const viewerId = user?.id ?? "me";
  const isReserved = Boolean(order) || post.saleStatus === LISTING_SALE_STATUS.held;
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
  };
}

function ListingSaleActions({ post }) {
  const { buyListing, confirmListingHandover, credits } = useApp();
  const [buyTarget, setBuyTarget] = useState(null);
  const { isReserved, reservedByMe, sellerView, saleOrderId, saleAmount } = useListingSaleState(post);

  const isProdam = post.categoryId === "prodam" && Number(post.listingPrice) > 0;

  if (isReserved && reservedByMe) {
    return (
      <div className="w-full space-y-2">
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">V rezervaci</p>
          <p className="text-xs text-amber-800 mt-0.5">
            Platba {saleAmount} Kč je v úschově Podplotu. Po kontrole zboží naživo potvrďte
            převzetí — prodejce nic potvrzovat nemusí.
          </p>
        </div>
        <button
          type="button"
          onClick={() => confirmListingHandover(saleOrderId)}
          className="w-full text-xs font-semibold text-white px-3 py-2.5 rounded-xl pp-btn-primary"
        >
          Převzato a zaplaceno
        </button>
      </div>
    );
  }

  if (isReserved && sellerView) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 w-full">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">V rezervaci</p>
        <p className="text-xs text-amber-800 mt-0.5">
          Kupující zaplatil přes Podplot. Po osobním předání potvrdí převzetí v aplikaci — vy nic
          potvrzovat nemusíte.
        </p>
      </div>
    );
  }

  if (isReserved) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 w-full">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">V rezervaci</p>
        <p className="text-xs text-amber-800 mt-0.5">
          Zboží je rezervované — platba je v úschově Podplotu do osobního převzetí.
        </p>
      </div>
    );
  }

  if (!isProdam || post.mine) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setBuyTarget(post)}
        className="text-xs font-semibold text-white px-3 py-1.5 rounded-xl pp-btn-primary"
      >
        Koupit / Zaplatit přes Podplot · {post.listingPrice} Kč
      </button>
      <PaymentModal
        open={!!buyTarget}
        onClose={() => setBuyTarget(null)}
        title={buyTarget ? `Koupit: ${buyTarget.title}` : "Platba"}
        amount={buyTarget?.listingPrice ?? 0}
        walletBalance={credits}
        note="Platba přes bránu Podplotu. Inzerát se rezervuje a peníze zůstanou v úschově, dokud po osobní kontrole nepotvrdíte „Převzato a zaplaceno“."
        confirmLabel={`Zaplatit a rezervovat · ${buyTarget?.listingPrice ?? 0} Kč`}
        onConfirm={(method) => {
          if (buyTarget) buyListing(buyTarget, method);
          setBuyTarget(null);
        }}
      />
    </>
  );
}

export default function FeedCard({ post, compact = false, detailsOnly = false }) {
  const {
    topPost,
    reportedPosts,
    reportPost,
    credits,
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
  const messageTopic = topicFromPost(post);
  const distance = extractDistance(post.meta);
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
    return (
      <div className="space-y-2">
        <EditedBadge item={post} />
        <p className="pp-text-body">{post.body}</p>
        <PostPhotos photos={post.photos} compact />
        {!isReported && (
          <div
            className={`flex flex-nowrap gap-1.5 items-center pt-1 overflow-x-auto ${
              searchHighlight ? "bg-amber-50/60 -mx-1 px-1 rounded-xl" : ""
            }`}
          >
            {editControls}
            {!post.mine && !isReserved && <PostInteractions post={post} />}
            {!post.mine && (
              <>
                <MessageButton
                  participantId={authorId}
                  participantName={post.author}
                  topic={messageTopic}
                  compact
                />
                <ListingSaleActions post={post} />
              </>
            )}
            {post.mine && <PostInteractions post={post} />}
            {post.mine && <ListingSaleActions post={post} />}
            {!post.mine && !isReserved && (
              <ReportUserButton targetId={authorId} targetName={post.author} compact />
            )}
          </div>
        )}
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
          walletBalance={credits}
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
            Skupina · {group}
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
              {post.mine ? post.meta : post.meta?.replace(/^\d+\s*m\s*·\s*/, "") ?? post.meta}
            </p>
          </div>
          <div className="flex items-start gap-1 shrink-0">
            {post.type && (
              <span className="pp-badge shrink-0">{post.type}</span>
            )}
            {!post.mine && !isReported && !isReserved && (
              <ReportMenu compact onReport={(reason) => reportPost(post.id, reason)} />
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
          {!post.mine && !isReserved && <PostInteractions post={post} />}
          {!post.mine && (
            <>
              <MessageButton
                participantId={authorId}
                participantName={post.author}
                topic={messageTopic}
                compact
              />
              <ListingSaleActions post={post} />
            </>
          )}
          {post.mine && <PostInteractions post={post} />}
          {post.mine && <ListingSaleActions post={post} />}
          {!post.mine && !isReserved && (
            <ReportUserButton targetId={authorId} targetName={post.author} compact />
          )}
        </div>
      )}

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
        walletBalance={credits}
        onConfirm={(method) => {
          if (topTarget) topPost(topTarget.postId, topTarget.planId, method);
          setTopTarget(null);
        }}
      />
      {editModal}
    </article>
  );
}
