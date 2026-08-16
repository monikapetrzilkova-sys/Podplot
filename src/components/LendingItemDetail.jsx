import RoleBadge, { Avatar } from "./RoleBadge.jsx";
import { MessageButton } from "./MessagesPage.jsx";
import ReportUserButton from "./ReportUserButton.jsx";
import LendingOwnerStatus from "./LendingOwnerStatus.jsx";
import { getLendingCategory } from "../data/lendingCategories.js";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import { DoodlePackageIcon } from "./doodle/doodleIcons.jsx";
import { formatAuthorName } from "../data/accountTypes.js";
import { topicFromLending } from "../data/chatTopics.js";

export default function LendingItemDetail({ group, onClose, onRent }) {
  if (!group) return null;

  const cat = getLendingCategory(group.lendingCategory);
  const offers = [...group.offers].sort((a, b) => a.credits - b.credits);

  return (
    <AppPanelPortal>
    <div className="pp-app-sheet-overlay">
      <div className="absolute inset-0 pointer-events-auto">
        <ModalDoodleBackdrop onClose={onClose} />
      </div>
      <div className="pp-app-sheet">
        <div className="pp-app-sheet-body p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-[#E8F3EF] text-[#3D7A68] flex items-center justify-center shrink-0">
                <DoodlePackageIcon className="w-7 h-7" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900">{group.itemTypeLabel}</h2>
                <p className="text-xs text-stone-500">
                  {cat?.label ?? "Půjčovna"} · {offers.length}{" "}
                  {offers.length === 1 ? "nabídka" : offers.length < 5 ? "nabídky" : "nabídek"}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-stone-400 text-xl px-1">
              ×
            </button>
          </div>

          <div className="space-y-3">
            {offers.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  item.onVacation
                    ? "bg-stone-50 border-stone-200 opacity-75"
                    : item.mine
                      ? "bg-emerald-50 border-emerald-300"
                      : "bg-stone-50 border-stone-200"
                }`}
              >
                {item.mine && (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 mb-2">
                    Vaše nabídka
                  </p>
                )}
                <div className="flex items-start gap-3 mb-2">
                  <Avatar initials={item.initials} roleId={item.role} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          item.onVacation ? "text-stone-400" : "text-stone-900"
                        }`}
                      >
                        {formatAuthorName(item.author, item.accountType)}
                      </span>
                      <RoleBadge roleId={item.role} />
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{item.distance}</p>
                  </div>
                  <div
                    className={`shrink-0 flex items-center gap-1 bg-white border px-2.5 py-1 rounded-xl ${
                      item.onVacation ? "border-stone-200" : "border-emerald-200"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        item.onVacation ? "text-stone-400" : "text-emerald-800"
                      }`}
                    >
                      {item.credits} Kč
                    </span>
                    <span
                      className={`text-[10px] ${
                        item.onVacation ? "text-stone-400" : "text-emerald-700"
                      }`}
                    >
                      /{item.period ?? "den"}
                    </span>
                  </div>
                </div>
                <p
                  className={`text-sm font-medium ${
                    item.onVacation ? "text-stone-400" : "text-stone-800"
                  }`}
                >
                  {item.item}
                </p>
                <p className={`text-xs mt-1 ${item.onVacation ? "text-stone-400" : "text-stone-600"}`}>
                  {item.description}
                </p>
                <LendingOwnerStatus
                  className="mt-2"
                  onVacation={item.onVacation}
                  availabilityMessage={item.availabilityMessage}
                />
                {item.mine ? (
                  <p className="text-xs text-center py-2 mt-3 bg-emerald-100 text-emerald-800 rounded-xl">
                    Vaše nabídka k půjčení
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={item.onVacation}
                      onClick={() => onRent(item)}
                      className="w-full py-2.5 mt-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
                    >
                      {item.onVacation ? "Teď nedostupné" : `Půjčit si · od ${item.credits} Kč/den`}
                    </button>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <MessageButton
                        participantId={item.id}
                        participantName={item.author}
                        topic={topicFromLending(item)}
                      />
                      <ReportUserButton targetId={item.id} targetName={item.author} compact />
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
    </AppPanelPortal>
  );
}
