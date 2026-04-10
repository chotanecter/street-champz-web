import { Route, useLocation } from "wouter";
import classes from "./main.module.css";
import { Navbar } from "./navbar/navbar";
import { Header } from "./header/header";
import { Play } from "./play/play";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useMyNotifications } from "../../notifications/context";
import { Leaderboard } from "./leaderboard/leaderboard";
import { Profile } from "./profile/profile";
import { Missions } from "./missions/missions";
import { Achievements } from "./achievements/achievements";
import { Teams } from "./teams/teams";
import { Social } from "./social/social";
import { Settings } from "./settings/settings";
import { Help } from "./help/help";
import { Shop } from "./shop/shop";
import { useRewards } from "../../rewards/context";
import { useEconomy } from "../../economy/context";
import { useAchievements } from "../../achievements/context";
import { DailyRewardModal, OnboardingModal } from "../../../components";

const ONBOARDING_KEY = "street-champz-onboarding-completed";

export function Main() {
    const { subscribe } = useMyNotifications();
    const [_, navigate] = useLocation();
    const { 
        dailyRewards, 
        currentStreak, 
        canClaimDaily, 
        claimDailyReward,
        showDailyModal,
        setShowDailyModal 
    } = useRewards();
    const { addPoints } = useEconomy();
    const { trackAchievement } = useAchievements();
    
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem(ONBOARDING_KEY);
    });

    useEffect(() => {
        // Auto-unlock beta tester achievement for all current users
        trackAchievement("beta_tester", 1);
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        addPoints(1000, "achievement", false); // Starter bonus - 1000 points
        notifications.show({
            title: "Welcome Bonus Claimed! 🎉",
            message: "You received 1,000 points to start your journey!",
            color: "success",
        });
    };

    useEffect(() => {
        const unsubscribeInvitations = subscribe("INVITATION", async data => {
            const notificationId = `invite-${data.gameId}-${new Date().valueOf()}`;

            notifications.show({
                id: notificationId,
                title: `${data.invitedBy.username} invited you to a game!`,
                message: "Click here to join",
                position: "top-center",
                withCloseButton: false,
                onClick: () => {
                    notifications.hide(notificationId);
                    navigate("/game/" + data.gameId);
                },
            });
        });

        return () => {
            unsubscribeInvitations();
        };
    }, []);

    return (
        <div className={classes.root}>
            <Header />

            <div className={classes.main}>
                <Route path="/">
                    <Play />
                </Route>

                <Route path="/leaderboard">
                    <Leaderboard />
                </Route>

                <Route path="/profile">
                    <Profile />
                </Route>

                <Route path="/missions">
                    <Missions />
                </Route>

                <Route path="/achievements">
                    <Achievements />
                </Route>

                <Route path="/teams">
                    <Teams />
                </Route>

                <Route path="/social">
                    <Social />
                </Route>

                <Route path="/settings">
                    <Settings />
                </Route>

                <Route path="/help">
                    <Help />
                </Route>

                <Route path="/shop">
                    <Shop />
                </Route>
            </div>

            <Navbar />

            <OnboardingModal
                opened={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
            />

            <DailyRewardModal
                opened={showDailyModal}
                onClose={() => setShowDailyModal(false)}
                rewards={dailyRewards}
                currentStreak={currentStreak}
                canClaim={canClaimDaily}
                onClaim={claimDailyReward}
            />
        </div>
    );
};
