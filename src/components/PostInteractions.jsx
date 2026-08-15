import { useApp } from "../context/AppContext.jsx";
import { getPostInteractionType, INTERACTION_TYPES } from "../data/postInteractions.js";
import { MessageButton } from "./MessagesPage.jsx";
import { DoodleBulbIcon, DoodleHelpIcon, DoodleMegaphoneIcon } from "./doodle/doodleIcons.jsx";

/** Kompaktní akce — vejde se do jedné lišty s zprávou a vlaječkou */
export const ACTION_BTN =
  "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded-xl border transition-colors whitespace-nowrap shrink-0";

const INTERACTION_IDLE =
  "bg-white text-[#3D7A68] border-[#C5DDD4] hover:bg-[#F1F6F5]";
const INTERACTION_DONE = "bg-[#E8F3EF] text-[#1B4D3E] border-[#C5DDD4]";
const INTERACTION_MUTED = "bg-stone-100 text-stone-500 border-stone-200";

export default function PostInteractions({ post }) {
  const {
    markPostUseful,
    getUsefulCount,
    hasMarkedUseful,
    offerHelpOnPost,
    hasOfferedHelp,
    getHelpOffers,
    helpSearchOnPost,
    getSearchHelpCount,
    hasHelpedSearch,
    isSearchHighlighted,
  } = useApp();

  if (post.mine) {
    const offers = getHelpOffers(post.id);
    if (offers.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase text-emerald-700 tracking-wide">Nabídky pomoci</p>
        {offers.map((o) => (
          <div key={o.helperId + o.time} className="flex items-center justify-between gap-2 bg-emerald-50 rounded-xl p-2.5">
            <p className="text-xs text-stone-800">
              Soused <strong>{o.helperName}</strong> nabízí pomoc
            </p>
            <MessageButton participantId={o.helperId} participantName={o.helperName} className="shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  const type = getPostInteractionType(post);
  const usefulCount = getUsefulCount(post.id);
  const helpOfferCount = getHelpOffers(post.id).length;
  const searchCount = getSearchHelpCount(post.id);
  const highlighted = isSearchHighlighted(post.id);

  if (type === INTERACTION_TYPES.TIP) {
    const marked = hasMarkedUseful(post.id);
    return (
      <button
        type="button"
        onClick={() => markPostUseful(post.id)}
        disabled={marked}
        className={`${ACTION_BTN} ${marked ? INTERACTION_DONE : INTERACTION_IDLE}`}
      >
        <DoodleBulbIcon className="w-4 h-4 shrink-0" />
        Užitečné
        {usefulCount > 0 && <span className="opacity-80 tabular-nums">· {usefulCount}</span>}
      </button>
    );
  }

  if (type === INTERACTION_TYPES.HELP) {
    const offered = hasOfferedHelp(post.id);
    return (
      <button
        type="button"
        disabled={offered}
        onClick={() =>
          offerHelpOnPost({
            postId: post.id,
            authorId: post.authorId ?? post.id,
            authorName: post.author,
            postTitle: post.title,
          })
        }
        className={`${ACTION_BTN} ${offered ? INTERACTION_MUTED : INTERACTION_IDLE}`}
      >
        <DoodleHelpIcon className="w-4 h-4 shrink-0" />
        {offered ? "Nabídka v profilu (48 h)" : "Nabízím pomoc"}
        {helpOfferCount > 0 && <span className="opacity-80 tabular-nums">· {helpOfferCount}</span>}
      </button>
    );
  }

  if (type === INTERACTION_TYPES.SEARCH) {
    const helped = hasHelpedSearch(post.id);
    return (
      <button
        type="button"
        onClick={() => helpSearchOnPost(post.id)}
        disabled={helped}
        title={highlighted ? "Zvýrazněno v okolí" : undefined}
        className={`${ACTION_BTN} ${
          helped || highlighted ? INTERACTION_DONE : INTERACTION_IDLE
        }`}
      >
        <DoodleMegaphoneIcon className="w-4 h-4 shrink-0" />
        Pomáhám hledat
        {searchCount > 0 && <span className="opacity-80 tabular-nums">· {searchCount}</span>}
      </button>
    );
  }

  return null;
}
