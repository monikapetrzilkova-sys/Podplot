import { useApp } from "../context/AppContext.jsx";
import LiveNeighborFeed from "./LiveNeighborFeed.jsx";
import SponsoredStrip from "./SponsoredStrip.jsx";
import WorkDashboard from "./WorkDashboard.jsx";
import BusinessOperationsDashboard from "./BusinessOperationsDashboard.jsx";
import LunchMenuWidget from "./LunchMenuWidget.jsx";
import WelcomeCard from "./WelcomeCard.jsx";
import TrustNeighborHomePrompt from "./TrustNeighborHomePrompt.jsx";
import NeighborOnboardingChecklist from "./NeighborOnboardingChecklist.jsx";
import OpenReportsReminder from "./OpenReportsReminder.jsx";

export default function Dashboard() {
  const {
    isB2BWorkMode,
    isFyzickaWorkMode,
    isMobilniWorkMode,
  } = useApp();

  if (isFyzickaWorkMode) {
    return <BusinessOperationsDashboard />;
  }

  if (isB2BWorkMode || isMobilniWorkMode) {
    return <WorkDashboard />;
  }

  return (
    <div className="pp-page pp-page--doodle flex flex-col min-h-full bg-abstract-organic has-deco pb-20">
      <WelcomeCard />
      <NeighborOnboardingChecklist />
      <OpenReportsReminder />
      <TrustNeighborHomePrompt />
      {/* Placená propagace nahoře — štítek Promo, max 5 v lokalitě */}
      <SponsoredStrip />
      <LunchMenuWidget />
      <LiveNeighborFeed />
    </div>
  );
}
