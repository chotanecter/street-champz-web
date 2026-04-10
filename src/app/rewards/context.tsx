/**
 * Rewards Context - Daily Rewards system
 * 
 * All data is fetched from and persisted to the backend API.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useEconomy } from "../economy/context";
import { celebratePoints } from "../../utils/confetti";
import { notifications } from "@mantine/notifications";
import { apiFetch } from "../../config/env";

interface DailyReward {
    day: number;
    points: number;
    bonus?: boolean;
    claimed: boolean;
}

interface RewardsContextType {
    dailyRewards: DailyReward[];
    currentStreak: number;
    canClaimDaily: boolean;
    claimDailyReward: () => Promise<void>;
    showDailyModal: boolean;
    setShowDailyModal: (show: boolean) => void;
    loading: boolean;
}

const rewardsContext = createContext<RewardsContextType | undefined>(undefined);

interface RewardsProviderProps {
    children?: ReactNode;
}

export const RewardsProvider = ({ children }: RewardsProviderProps) => {
    const { addPoints } = useEconomy();
    const [currentStreak, setCurrentStreak] = useState<number>(0);
    const [canClaimDaily, setCanClaimDaily] = useState<boolean>(false);
    const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
    const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch from API on mount
    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const res = await apiFetch("/user/daily-rewards/status");
                if (res.ok) {
                    const data = await res.json();
                    setCurrentStreak(data.streak);
                    setCanClaimDaily(data.canClaim);
                    setDailyRewards(data.rewards);

                    if (data.canClaim) {
                        setTimeout(() => setShowDailyModal(true), 2000);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch daily rewards:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, []);

    const claimDailyReward = async () => {
        if (!canClaimDaily) return;

        try {
            const res = await apiFetch("/user/daily-rewards/claim", {
                method: "POST",
            });

            if (res.ok) {
                const data = await res.json();

                // Update local state
                setCurrentStreak(data.newStreak);
                setCanClaimDaily(false);

                // Refresh rewards list
                const statusRes = await apiFetch("/user/daily-rewards/status");
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    setDailyRewards(statusData.rewards);
                }

                // Celebrate
                celebratePoints();
                notifications.show({
                    title: data.claimed.bonus ? "🎉 Bonus Day Reward!" : "Daily Reward Claimed!",
                    message: `+${data.pointsAwarded.toLocaleString()} points${data.claimed.bonus ? " (7-day bonus!)" : ""}`,
                    color: "gold",
                    autoClose: 3000,
                });
            } else {
                const err = await res.json();
                notifications.show({
                    title: "Can't claim yet",
                    message: err.error || "Try again later",
                    color: "red",
                    autoClose: 3000,
                });
            }
        } catch (err) {
            console.error("Failed to claim daily reward:", err);
        }
    };

    return (
        <rewardsContext.Provider
            value={{
                dailyRewards,
                currentStreak,
                canClaimDaily,
                claimDailyReward,
                showDailyModal,
                setShowDailyModal,
                loading
            }}
        >
            {children}
        </rewardsContext.Provider>
    );
};

export const useRewards = () => {
    const context = useContext(rewardsContext);

    if (context === undefined) {
        throw Error("useRewards() can only be used within a RewardsProvider.");
    }

    return context;
};
