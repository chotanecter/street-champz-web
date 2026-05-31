// src/app/checkin/spots/pages/CheckInHome.tsx
// The /checkin screen: the original GPS presence check-in on top, a recent
// check-ins mini feed, then the LA Edition spot game.
// Providers are supplied by the route in main.tsx.

import { CheckInPage } from "../../pages/CheckInPage";
import { RecentCheckInsFeed } from "../components/RecentCheckInsFeed";
import { SpotGameSection } from "../components/SpotGameSection";

export function CheckInHome() {
  return (
    <>
      {/* "Who's skating nearby" presence check-in (existing feature) */}
      <CheckInPage />
      {/* Recent check-ins mini feed: Username · City · Time */}
      <RecentCheckInsFeed />
      {/* Spot Check-In game (map/list of curated LA spots) */}
      <SpotGameSection />
    </>
  );
}

export default CheckInHome;
