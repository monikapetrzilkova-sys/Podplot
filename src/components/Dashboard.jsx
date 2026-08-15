import { useApp } from "../context/AppContext.jsx";
import LiveNeighborFeed from "./LiveNeighborFeed.jsx";
import SponsoredStrip from "./SponsoredStrip.jsx";
import WorkDashboard from "./WorkDashboard.jsx";
import BusinessOperationsDashboard from "./BusinessOperationsDashboard.jsx";
import LunchMenuWidget from "./LunchMenuWidget.jsx";

export default function Dashboard() {
  const { isB2BWorkMode, isFyzickaWorkMode, isMobilniWorkMode } = useApp();

  if (isFyzickaWorkMode) {
    return <BusinessOperationsDashboard />;
  }

  if (isB2BWorkMode || isMobilniWorkMode) {
    return <WorkDashboard />;
  }

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco pb-20">
      <SponsoredStrip />
      <LunchMenuWidget />
      <LiveNeighborFeed />
    </div>
  );
}
