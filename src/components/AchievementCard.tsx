import { motion } from "framer-motion";
import { Progress, Badge, Group, Stack, Text } from "@mantine/core";
import { Lock, Star } from "lucide-react";
import type { Achievement, PlayerAchievement, AchievementRarity } from "../app/achievements/context";
import classes from "./AchievementCard.module.css";

interface AchievementCardProps {
  achievement: Achievement;
  playerProgress?: PlayerAchievement;
}

const rarityColors: Record<AchievementRarity, string> = {
  common: "gray",
  rare: "blue",
  epic: "premium",
  legendary: "gold",
};

export function AchievementCard({ achievement, playerProgress }: AchievementCardProps) {
  const progress = playerProgress?.progress || 0;
  const unlocked = playerProgress?.unlocked || false;
  const progressPercent = (progress / achievement.requirement) * 100;

  return (
    <motion.div
      className={`${classes.card} ${unlocked ? classes.unlocked : classes.locked}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Group gap="md" wrap="nowrap" align="flex-start">
        {/* Icon */}
        <div className={`${classes.icon} ${unlocked ? classes.iconUnlocked : ""}`}>
          {unlocked ? (
            <span className={classes.emoji}>{achievement.icon}</span>
          ) : (
            <Lock size={24} className={classes.lockIcon} />
          )}
        </div>

        {/* Content */}
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text fw={600} size="sm" className={unlocked ? classes.titleUnlocked : ""}>
                {achievement.title}
              </Text>
              <Text size="xs" c="dimmed">
                {achievement.description}
              </Text>
            </div>
            <Badge
              color={rarityColors[achievement.rarity]}
              variant={unlocked ? "filled" : "light"}
              size="sm"
            >
              {achievement.rarity}
            </Badge>
          </Group>

          {/* Progress */}
          {!unlocked && (
            <div>
              <Group justify="space-between" mb={4}>
                <Text size="xs" c="dimmed">
                  Progress
                </Text>
                <Text size="xs" c="dimmed">
                  {progress}/{achievement.requirement}
                </Text>
              </Group>
              <Progress
                value={progressPercent}
                color={rarityColors[achievement.rarity]}
                size="sm"
                radius="xl"
              />
            </div>
          )}

          {/* Rewards */}
          <Group gap="xs">
            <Badge color="gold" variant="light" size="xs" leftSection={<Star size={10} />}>
              +{achievement.rewardPoints.toLocaleString()} points
            </Badge>
          </Group>

          {/* Unlocked date */}
          {unlocked && playerProgress?.unlockedAt && (
            <Text size="xs" c="dimmed" fs="italic">
              Unlocked {new Date(playerProgress.unlockedAt).toLocaleDateString()}
            </Text>
          )}
        </Stack>
      </Group>
    </motion.div>
  );
}
