import { useApp } from "../context/AppContext.jsx";
import LiveNeighborFeed from "./LiveNeighborFeed.jsx";
import SponsoredStrip from "./SponsoredStrip.jsx";
import WorkDashboard from "./WorkDashboard.jsx";
import BusinessOperationsDashboard from "./BusinessOperationsDashboard.jsx";
import LunchMenuWidget from "./LunchMenuWidget.jsx";

export default function Dashboard() {
  const {
    isB2BWorkMode,
    isFyzickaWorkMode,
    isMobilniWorkMode,
    activeLocation,
    openPlusMenu,
  } = useApp();

  if (isFyzickaWorkMode) {
    return <BusinessOperationsDashboard />;
  }

  if (isB2BWorkMode || isMobilniWorkMode) {
    return <WorkDashboard />;
  }

  const place =
    activeLocation?.municipality || activeLocation?.shortLabel || "okolí";

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco pb-20">
      <header className="px-4 pt-3 pb-1 shrink-0">
        <h1 className="text-lg font-bold text-stone-900 leading-snug">Nové v {place}</h1>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
          Co se děje u sousedů. Chcete něco přidat? Klepněte na +.
        </p>
        <button
          type="button"
          onClick={openPlusMenu}
          className="mt-2.5 w-full py-2.5 rounded-xl text-xs font-semibold text-[#1B4D3E] bg-[#E8F3EF] border border-[#C5E0D6]"
        >
          Nabídnout / požádat / nahlásit
        </button>
      </header>

      <LunchMenuWidget />
      <LiveNeighborFeed />

      {/* Placená propagace — dole, označená Partner; sekce se skryje, když není banner */}
      <SponsoredHomeFooter />
    </div>
  );
}

function SponsoredHomeFooter() {
  const { sponsoredBanners } = useApp();
  if (!sponsoredBanners?.length) return null;
  return (
    <div className="mt-2 border-t border-stone-100 pt-1">
      <p className="px-4 pt-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
        Tip od partnerů v okolí
      </p>
      <SponsoredStrip />
    </div>
  );
}
