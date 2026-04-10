/**
 * Economy Context - Manages Points system
 * 
 * Points are earned through:
 * - Purchasing merchandise (real items)
 * - Daily check-ins
 * - Completing missions
 * - Winning games
 * 
 * Season Competition: Player with the most points at the end of 3 months wins!
 * 
 * All data is fetched from and persisted to the backend API.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { celebratePoints } from "../../utils/confetti";
import { apiFetch } from "../../config/env";

interface EconomyContextType {
    points: number;
    addPoints: (amount: number, reason: string, celebrate?: boolean) => Promise<void>;
    seasonEndDate: Date;
    getDaysRemaining: () => number;
    loading: boolean;
}

const economyContext = createContext<EconomyContextType | undefined>(undefined);

interface EconomyProviderProps {
    children?: ReactNode;
}

export const EconomyProvider = ({ children }: EconomyProviderProps) => {
    const [points, setPoints] = useState<number>(0);
    const [seasonEndDate, setSeasonEndDate] = useState<Date>(new Date());
    const [daysRemaining, setDaysRemaining] = useState<number>(90);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch from API on mount
    useEffect(() => {
        const fetchEconomy = async () => {
            try {
                const res = await apiFetch("/user/economy");
                if (res.ok) {
                    const data = await res.json();
                    setPoints(data.points);
                    setSeasonEndDate(new Date(data.seasonEnd));
                    setDaysRemaining(data.daysRemaining);
                }
            } catch (err) {
                console.error("Failed to fetch economy:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEconomy();
    }, []);

    // Listen for achievement unlocks and award rewards
    useEffect(() => {
        const handleAchievementUnlock = async (event: CustomEvent) => {
            const { points: rewardPoints } = event.detail;
            if (rewardPoints > 0) {
                await addPoints(rewardPoints, "achievement", true);
            }
        };

        window.addEventListener("achievement-unlocked", handleAchievementUnlock as EventListener);

        return () => {
            window.removeEventListener("achievement-unlocked", handleAchievementUnlock as EventListener);
        };
    }, []);

    const addPoints = async (amount: number, reason: string, celebrate: boolean = true) => {
        try {
            const res = await apiFetch("/user/economy/award", {
                method: "POST",
                body: JSON.stringify({ amount, reason }),
            });

            if (res.ok) {
                const data = await res.json();
                setPoints(data.points);
                if (celebrate && amount > 0) {
                    celebratePoints();
                }
            }
        } catch (err) {
            console.error("Failed to award points:", err);
        }
    };

    const getDaysRemaining = (): number => {
        return daysRemaining;
    };

    return (
        <economyContext.Provider
            value={{
                points,
                addPoints,
                seasonEndDate,
                getDaysRemaining,
                loading
            }}
        >
            {children}
        </economyContext.Provider>
    );
};

export const useEconomy = () => {
    const context = useContext(economyContext);

    if (context === undefined) {
        throw Error("useEconomy() can only be used within an EconomyProvider.");
    }

    return context;
};
