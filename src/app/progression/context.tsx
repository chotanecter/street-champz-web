/**
 * Progression Context - Manages XP and Leveling
 * 
 * All data is fetched from and persisted to the backend API.
 */
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { celebrateLevelUp } from "../../utils/confetti";
import { notifications } from "@mantine/notifications";
import { apiFetch } from "../../config/env";

interface ProgressionContextType {
    level: number;
    xp: number;
    xpForNextLevel: number;
    addXp: (amount: number, reason?: string) => Promise<void>;
    getProgressPercent: () => number;
    loading: boolean;
}

const progressionContext = createContext<ProgressionContextType | undefined>(undefined);

interface ProgressionProviderProps {
    children?: ReactNode;
}

export const ProgressionProvider = ({ children }: ProgressionProviderProps) => {
    const [level, setLevel] = useState<number>(1);
    const [xp, setXp] = useState<number>(0);
    const [xpForNextLevel, setXpForNextLevel] = useState<number>(100);
    const [loading, setLoading] = useState<boolean>(true);
    const addXpRef = useRef<((amount: number, reason?: string) => Promise<void>) | null>(null);

    // Fetch from API on mount
    useEffect(() => {
        const fetchProgression = async () => {
            try {
                const res = await apiFetch("/user/progression");
                if (res.ok) {
                    const data = await res.json();
                    setLevel(data.level);
                    setXp(data.xp);
                    setXpForNextLevel(data.xpForNextLevel);
                }
            } catch (err) {
                console.error("Failed to fetch progression:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgression();
    }, []);

    const addXp = async (amount: number, reason: string = "game") => {
        try {
            const res = await apiFetch("/user/progression/award-xp", {
                method: "POST",
                body: JSON.stringify({ amount, reason }),
            });

            if (res.ok) {
                const data = await res.json();
                
                if (data.levelsGained > 0) {
                    celebrateLevelUp();
                    notifications.show({
                        title: "Level Up!",
                        message: `Congratulations! You reached level ${data.level}!`,
                        color: "blue",
                        autoClose: 5000,
                    });
                }

                setLevel(data.level);
                setXp(data.xp);
                setXpForNextLevel(data.xpForNextLevel);
            }
        } catch (err) {
            console.error("Failed to award XP:", err);
        }
    };

    addXpRef.current = addXp;

    const getProgressPercent = (): number => {
        if (xpForNextLevel === 0) return 0;
        return Math.floor((xp / xpForNextLevel) * 100);
    };

    // Listen for achievement unlocks and award XP
    useEffect(() => {
        const handleAchievementUnlock = async (event: CustomEvent) => {
            const { xp: rewardXp } = event.detail;
            if (rewardXp > 0 && addXpRef.current) {
                await addXpRef.current(rewardXp, "achievement");
            }
        };

        window.addEventListener("achievement-unlocked", handleAchievementUnlock as EventListener);

        return () => {
            window.removeEventListener("achievement-unlocked", handleAchievementUnlock as EventListener);
        };
    }, []);

    return (
        <progressionContext.Provider
            value={{
                level,
                xp,
                xpForNextLevel,
                addXp,
                getProgressPercent,
                loading
            }}
        >
            {children}
        </progressionContext.Provider>
    );
};

export const useProgression = () => {
    const context = useContext(progressionContext);

    if (context === undefined) {
        throw Error("useProgression() can only be used within a ProgressionProvider.");
    }

    return context;
};
