import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import { celebrateAchievement } from "../../utils/confetti";

// TODO: Migrate to backend for production.
// For demo purposes, achievements are managed client-side using localStorage.
// In a real production environment, this state would be managed on the server
// to prevent cheating and ensure data integrity.

export type AchievementCategory = "games" | "wins" | "social" | "points" | "special";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // emoji
  requirement: number;
  rewardPoints: number;
}

export interface PlayerAchievement {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string; // ISO date
}

interface AchievementsContextValue {
  achievements: Achievement[];
  playerAchievements: Map<string, PlayerAchievement>;
  trackAchievement: (achievementId: string, progress: number) => void;
  getAchievementProgress: (achievementId: string) => PlayerAchievement | undefined;
  getUnlockedCount: () => number;
  getTotalCount: () => number;
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  getUnlockedAchievements: () => Achievement[];
}

const AchievementsContext = createContext<AchievementsContextValue | undefined>(undefined);

// Achievement definitions - all rewards are now in points
const ACHIEVEMENTS: Achievement[] = [
  // Games category
  {
    id: "first_game",
    title: "First Steps",
    description: "Play your first game",
    category: "games",
    rarity: "common",
    icon: "🎮",
    requirement: 1,
    rewardPoints: 100,
  },
  {
    id: "games_10",
    title: "Getting Started",
    description: "Play 10 games",
    category: "games",
    rarity: "common",
    icon: "🎯",
    requirement: 10,
    rewardPoints: 250,
  },
  {
    id: "games_50",
    title: "Dedicated Player",
    description: "Play 50 games",
    category: "games",
    rarity: "rare",
    icon: "🏆",
    requirement: 50,
    rewardPoints: 1000,
  },
  {
    id: "games_100",
    title: "Century Club",
    description: "Play 100 games",
    category: "games",
    rarity: "epic",
    icon: "💯",
    requirement: 100,
    rewardPoints: 2500,
  },
  
  // Wins category
  {
    id: "first_win",
    title: "Taste of Victory",
    description: "Win your first game",
    category: "wins",
    rarity: "common",
    icon: "🥇",
    requirement: 1,
    rewardPoints: 200,
  },
  {
    id: "wins_5",
    title: "Rising Star",
    description: "Win 5 games",
    category: "wins",
    rarity: "rare",
    icon: "⭐",
    requirement: 5,
    rewardPoints: 500,
  },
  {
    id: "wins_25",
    title: "Champion",
    description: "Win 25 games",
    category: "wins",
    rarity: "epic",
    icon: "👑",
    requirement: 25,
    rewardPoints: 2500,
  },
  {
    id: "wins_50",
    title: "Legend",
    description: "Win 50 games",
    category: "wins",
    rarity: "legendary",
    icon: "🔥",
    requirement: 50,
    rewardPoints: 5000,
  },
  
  // Social category
  {
    id: "invite_friend",
    title: "Social Butterfly",
    description: "Invite a friend to play",
    category: "social",
    rarity: "common",
    icon: "👥",
    requirement: 1,
    rewardPoints: 150,
  },
  {
    id: "play_with_5",
    title: "Popular Player",
    description: "Play with 5 different players",
    category: "social",
    rarity: "rare",
    icon: "🎭",
    requirement: 5,
    rewardPoints: 500,
  },
  
  // Points category (formerly economy)
  {
    id: "points_1000",
    title: "Point Collector",
    description: "Earn 1,000 total points",
    category: "points",
    rarity: "common",
    icon: "💰",
    requirement: 1000,
    rewardPoints: 250,
  },
  {
    id: "points_10000",
    title: "Point Master",
    description: "Earn 10,000 total points",
    category: "points",
    rarity: "rare",
    icon: "⭐",
    requirement: 10000,
    rewardPoints: 1000,
  },
  {
    id: "points_50000",
    title: "Halfway There",
    description: "Earn 50,000 total points",
    category: "points",
    rarity: "epic",
    icon: "🎯",
    requirement: 50000,
    rewardPoints: 5000,
  },
  {
    id: "points_100000",
    title: "Season Champion",
    description: "Reach the 100,000 point goal",
    category: "points",
    rarity: "legendary",
    icon: "🏆",
    requirement: 100000,
    rewardPoints: 10000,
  },
  {
    id: "daily_streak_7",
    title: "Week Warrior",
    description: "Claim daily rewards for 7 days straight",
    category: "points",
    rarity: "epic",
    icon: "📅",
    requirement: 7,
    rewardPoints: 1500,
  },
  
  // Special category
  {
    id: "perfect_game",
    title: "Flawless Victory",
    description: "Win a game without any fails",
    category: "special",
    rarity: "legendary",
    icon: "✨",
    requirement: 1,
    rewardPoints: 2500,
  },
  {
    id: "comeback_king",
    title: "Comeback King",
    description: "Win a game after being down to your last letter",
    category: "special",
    rarity: "epic",
    icon: "🎪",
    requirement: 1,
    rewardPoints: 1500,
  },
  {
    id: "beta_tester",
    title: "Beta Tester",
    description: "Played Street Champz during the beta — you helped build this!",
    category: "special",
    rarity: "legendary",
    icon: "🧪",
    requirement: 1,
    rewardPoints: 5000,
  },
];

const STORAGE_KEY = "street-champz-achievements";

export function AchievementsProvider({ children }: { children: ReactNode }) {
  
  const [playerAchievements, setPlayerAchievements] = useState<Map<string, PlayerAchievement>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return new Map(Object.entries(parsed));
      } catch {
        return new Map();
      }
    }
    return new Map();
  });

  // Persist to localStorage
  useEffect(() => {
    const obj = Object.fromEntries(playerAchievements);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }, [playerAchievements]);

  const trackAchievement = (achievementId: string, progress: number) => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    setPlayerAchievements((prev) => {
      const current = prev.get(achievementId) || {
        achievementId,
        progress: 0,
        unlocked: false,
      };

      // Already unlocked, do nothing
      if (current.unlocked) return prev;

      const newProgress = Math.min(current.progress + progress, achievement.requirement);
      const newUnlocked = newProgress >= achievement.requirement;

      // Check if we just unlocked it
      if (newUnlocked && !current.unlocked) {
        // Trigger celebration
        celebrateAchievement();
        
        // Show notification
        notifications.show({
          title: `Achievement Unlocked! ${achievement.icon}`,
          message: `${achievement.title} - +${achievement.rewardPoints.toLocaleString()} points`,
          color: achievement.rarity === "legendary" ? "gold" : achievement.rarity === "epic" ? "premium" : "success",
        });

        // Award rewards (handled by the component that tracks achievements)
        // This is a bit of a circular dependency, so we'll emit a custom event
        window.dispatchEvent(
          new CustomEvent("achievement-unlocked", {
            detail: {
              points: achievement.rewardPoints,
            },
          })
        );
      }

      const updated = new Map(prev);
      updated.set(achievementId, {
        achievementId,
        progress: newProgress,
        unlocked: newUnlocked,
        unlockedAt: newUnlocked ? new Date().toISOString() : current.unlockedAt,
      });

      return updated;
    });
  };

  const getAchievementProgress = (achievementId: string) => {
    return playerAchievements.get(achievementId);
  };

  const getUnlockedCount = () => {
    return Array.from(playerAchievements.values()).filter((a) => a.unlocked).length;
  };

  const getTotalCount = () => {
    return ACHIEVEMENTS.length;
  };

  const getAchievementsByCategory = (category: AchievementCategory) => {
    return ACHIEVEMENTS.filter((a) => a.category === category);
  };

  const getUnlockedAchievements = () => {
    return ACHIEVEMENTS.filter((a) => {
      const progress = playerAchievements.get(a.id);
      return progress?.unlocked;
    });
  };

  return (
    <AchievementsContext.Provider
      value={{
        achievements: ACHIEVEMENTS,
        playerAchievements,
        trackAchievement,
        getAchievementProgress,
        getUnlockedCount,
        getTotalCount,
        getAchievementsByCategory,
        getUnlockedAchievements,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error("useAchievements must be used within AchievementsProvider");
  }
  return context;
}
