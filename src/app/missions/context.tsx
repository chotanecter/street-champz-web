import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useEconomy } from "../economy/context";
import { celebrateAchievement } from "../../utils/confetti";
import { notifications } from "@mantine/notifications";

export type MissionType = "daily" | "weekly" | "lifetime";
export type MissionCategory = "games" | "wins" | "streak" | "social" | "purchases";

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: MissionType;
    category: MissionCategory;
    progress: number;
    target: number;
    rewards: {
        points: number;
    };
    completed: boolean;
    claimed: boolean;
}

interface MissionsContextType {
    missions: Mission[];
    updateMissionProgress: (missionId: string, increment: number) => void;
    claimMissionReward: (missionId: string) => void;
    resetDailyMissions: () => void;
}

const missionsContext = createContext<MissionsContextType | undefined>(undefined);

interface MissionsProviderProps {
    children?: ReactNode;
}

const MISSIONS_STORAGE_KEY = "street_champz_missions";
const LAST_DAILY_RESET_KEY = "street_champz_last_daily_reset";

// Mission templates - all rewards are now in points
const DAILY_MISSIONS: Omit<Mission, "progress" | "completed" | "claimed">[] = [
    {
        id: "daily_play_1",
        title: "First Game",
        description: "Play your first game today",
        type: "daily",
        category: "games",
        target: 1,
        rewards: { points: 50 }
    },
    {
        id: "daily_play_3",
        title: "Getting Warmed Up",
        description: "Play 3 games today",
        type: "daily",
        category: "games",
        target: 3,
        rewards: { points: 150 }
    },
    {
        id: "daily_win_1",
        title: "Victory",
        description: "Win a game today",
        type: "daily",
        category: "wins",
        target: 1,
        rewards: { points: 200 }
    },
];

const WEEKLY_MISSIONS: Omit<Mission, "progress" | "completed" | "claimed">[] = [
    {
        id: "weekly_games_10",
        title: "Active Player",
        description: "Play 10 games this week",
        type: "weekly",
        category: "games",
        target: 10,
        rewards: { points: 500 }
    },
    {
        id: "weekly_wins_5",
        title: "Winner's Circle",
        description: "Win 5 games this week",
        type: "weekly",
        category: "wins",
        target: 5,
        rewards: { points: 1000 }
    },
    {
        id: "weekly_streak_5",
        title: "Consistency",
        description: "Maintain a 5-day login streak",
        type: "weekly",
        category: "streak",
        target: 5,
        rewards: { points: 750 }
    },
];

const LIFETIME_MISSIONS: Omit<Mission, "progress" | "completed" | "claimed">[] = [
    {
        id: "lifetime_games_50",
        title: "Veteran",
        description: "Play 50 total games",
        type: "lifetime",
        category: "games",
        target: 50,
        rewards: { points: 2500 }
    },
    {
        id: "lifetime_wins_25",
        title: "Champion",
        description: "Win 25 total games",
        type: "lifetime",
        category: "wins",
        target: 25,
        rewards: { points: 5000 }
    },
    {
        id: "lifetime_games_100",
        title: "Street Legend",
        description: "Play 100 total games",
        type: "lifetime",
        category: "games",
        target: 100,
        rewards: { points: 10000 }
    },
];

export const MissionsProvider = ({ children }: MissionsProviderProps) => {
    const { addPoints } = useEconomy();
    const [missions, setMissions] = useState<Mission[]>([]);

    // Initialize missions
    useEffect(() => {
        const savedMissions = localStorage.getItem(MISSIONS_STORAGE_KEY);
        const lastReset = localStorage.getItem(LAST_DAILY_RESET_KEY);
        
        if (savedMissions) {
            // Parse and migrate old missions that might have coins/gems/xp instead of points
            const parsed = JSON.parse(savedMissions);
            const migrated = parsed.map((m: any) => ({
                ...m,
                rewards: {
                    points: m.rewards?.points || m.rewards?.coins || m.rewards?.xp || 100
                }
            }));
            setMissions(migrated);
        } else {
            // First time - create all missions
            const allMissions = [
                ...DAILY_MISSIONS.map(m => ({ ...m, progress: 0, completed: false, claimed: false })),
                ...WEEKLY_MISSIONS.map(m => ({ ...m, progress: 0, completed: false, claimed: false })),
                ...LIFETIME_MISSIONS.map(m => ({ ...m, progress: 0, completed: false, claimed: false })),
            ];
            setMissions(allMissions);
        }

        // Check if we need to reset daily missions
        if (lastReset) {
            const lastResetDate = new Date(lastReset);
            const now = new Date();
            const hoursSinceReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);

            if (hoursSinceReset >= 24) {
                resetDailyMissions();
            }
        } else {
            localStorage.setItem(LAST_DAILY_RESET_KEY, new Date().toISOString());
        }
    }, []);

    // Save missions to localStorage when they change
    useEffect(() => {
        if (missions.length > 0) {
            localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(missions));
        }
    }, [missions]);

    const updateMissionProgress = (missionId: string, increment: number = 1) => {
        setMissions(prevMissions => {
            return prevMissions.map(mission => {
                if (mission.id === missionId && !mission.completed) {
                    const newProgress = Math.min(mission.progress + increment, mission.target);
                    const nowCompleted = newProgress >= mission.target;

                    if (nowCompleted && !mission.completed) {
                        // Mission just completed
                        notifications.show({
                            title: "Mission Complete! 🎯",
                            message: mission.title,
                            color: "blue",
                            autoClose: 3000,
                        });
                    }

                    return {
                        ...mission,
                        progress: newProgress,
                        completed: nowCompleted
                    };
                }
                return mission;
            });
        });
    };

    const claimMissionReward = (missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        
        if (!mission || !mission.completed || mission.claimed) return;

        // Award points
        addPoints(mission.rewards.points, "mission_reward", true);

        celebrateAchievement();

        // Mark as claimed
        setMissions(prevMissions => 
            prevMissions.map(m => 
                m.id === missionId ? { ...m, claimed: true } : m
            )
        );

        notifications.show({
            title: "Rewards Claimed! 🎁",
            message: `+${mission.rewards.points.toLocaleString()} points`,
            color: "gold",
            autoClose: 3000,
        });
    };

    const resetDailyMissions = () => {
        setMissions(prevMissions => {
            const resetDaily = prevMissions.map(mission => {
                if (mission.type === "daily") {
                    return {
                        ...mission,
                        progress: 0,
                        completed: false,
                        claimed: false
                    };
                }
                return mission;
            });
            return resetDaily;
        });

        localStorage.setItem(LAST_DAILY_RESET_KEY, new Date().toISOString());
    };

    return (
        <missionsContext.Provider
            value={{
                missions,
                updateMissionProgress,
                claimMissionReward,
                resetDailyMissions
            }}
        >
            {children}
        </missionsContext.Provider>
    );
};

export const useMissions = () => {
    const context = useContext(missionsContext);

    if (context === undefined) {
        throw Error("useMissions() can only be used within a MissionsProvider.");
    }

    return context;
};
