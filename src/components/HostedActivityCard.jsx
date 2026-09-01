import { displayCreatorLabel } from "../data/accountTypes.js";
import { activityVenueLabel, nextEventForActivity, isOwnHostedActivity } from "../data/hostedActivities.js";

export default function HostedActivityCard({
  activity,
  events = [],
  user,
  onOpen,
  compact = false,
}) {
  if (!activity) return null;
  const next = nextEventForActivity(events, activity.id);
  const venue = activityVenueLabel(activity);
  const host = displayCreatorLabel(activity.hostName, activity.accountType, {
    mine: isOwnHostedActivity(activity, user),
  });
  const meta = [host, venue, next?.date ? `další ${next.date}` : "termíny se dopisují"]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={() => onOpen?.(activity.id)}
      className={`w-full text-left rounded-xl border border-stone-200 bg-white hover:bg-[#F7FAF9] transition-colors ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
          Kroužek
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-900 truncate">{activity.title}</p>
          <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-snug">{meta}</p>
          {activity.ageRange ? (
            <p className="text-[10px] text-stone-400 mt-0.5">{activity.ageRange}</p>
          ) : null}
        </div>
        <span className="text-[#9CA3AF] text-[10px] shrink-0 mt-1">›</span>
      </div>
    </button>
  );
}
