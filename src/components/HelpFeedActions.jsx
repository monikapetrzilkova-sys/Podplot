import { MessageButton } from "./MessagesPage.jsx";
import ReportUserButton from "./ReportUserButton.jsx";
import { DoodleHelpIcon } from "./doodle/doodleIcons.jsx";
import { ACTION_BTN } from "./PostInteractions.jsx";
import { topicFromHelp } from "../data/chatTopics.js";

/** Rozbalené akce u výpomoci — stejně na Domů i u Sousedů */
export default function HelpFeedActions({ help, onOfferHelp, alreadyOffered }) {
  const topic = topicFromHelp(help);
  return (
    <>
      <p className="pp-text-body text-sm mb-2 line-clamp-3">{help.body}</p>
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
        {help.helpType === "hledam" && (
          <button
            type="button"
            disabled={alreadyOffered}
            onClick={() =>
              onOfferHelp({
                postId: help.helpId,
                authorId: help.authorId || help.helpId,
                authorName: help.author,
                postTitle: help.title,
              })
            }
            className={`${ACTION_BTN} ${
              alreadyOffered
                ? "bg-stone-100 text-stone-500 border-stone-200"
                : "bg-white text-[#3D7A68] border-[#C5DDD4] hover:bg-[#F1F6F5]"
            }`}
          >
            <DoodleHelpIcon className="w-4 h-4 shrink-0" />
            {alreadyOffered ? "Nabídka v profilu (48 h)" : "Nabízím pomoc"}
            {help.offerCount > 0 && (
              <span className="opacity-80 tabular-nums">· {help.offerCount}</span>
            )}
          </button>
        )}
        <MessageButton
          participantId={help.authorId || help.helpId}
          participantName={help.author}
          topic={topic}
          compact
        />
        <ReportUserButton
          targetId={help.authorId || help.helpId}
          targetName={help.author}
          compact
        />
      </div>
    </>
  );
}
