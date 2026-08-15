import { useApp } from "../context/AppContext.jsx";
import { UI_KEYS } from "../data/uiPreferences.js";
import { useUiPref } from "../hooks/useUiPref.js";
import { IconAlert } from "../data/icons.jsx";
import EditedBadge from "./EditedBadge.jsx";

export default function CrisisAlertBar() {
  const { activeCrisis, setActiveTab } = useApp();
  const [open, , toggleOpen] = useUiPref(UI_KEYS.CRISIS_ALERT_EXPANDED, false);

  if (!activeCrisis) return null;

  return (
    <div className="mt-2 shrink-0 pp-crisis-enter">
      <div className="pp-crisis-bar overflow-hidden">
        <button
          type="button"
          onClick={toggleOpen}
          className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 min-h-[44px]"
          aria-expanded={open}
        >
          <span className="pp-crisis-bar-icon" aria-hidden>
            <IconAlert className="w-4 h-4" style={{ strokeWidth: 1.75 }} />
          </span>
          <span className="text-xs font-bold flex-1 leading-snug tracking-wide uppercase flex items-center gap-2 flex-wrap min-w-0">
            <span className="line-clamp-1">{activeCrisis.title}</span>
            <EditedBadge
              item={activeCrisis}
              className="normal-case tracking-normal bg-white/20 border-white/30 text-inherit"
            />
          </span>
          <span className="text-[10px] opacity-70 shrink-0">{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <div className="px-3.5 pb-3 pt-0 border-t pp-crisis-bar-divider animate-[fadeIn_0.15s_ease-out]">
            <h3 className="text-sm font-bold mt-2.5 leading-snug flex items-center gap-2 flex-wrap">
              {activeCrisis.title}
              <EditedBadge
                item={activeCrisis}
                className="normal-case tracking-normal bg-white/20 border-white/30 text-inherit"
              />
            </h3>
            <p className="text-xs mt-1.5 leading-relaxed opacity-95 whitespace-pre-wrap">
              {activeCrisis.body}
            </p>
            {activeCrisis.author && (
              <p className="text-[10px] mt-2 opacity-70">{activeCrisis.author}</p>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className="text-[10px] mt-2.5 underline font-semibold opacity-90 hover:opacity-100"
            >
              Zobrazit na mapě hlášení ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
