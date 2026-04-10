import { useState } from "react";
import { Title, Tabs, Stack, Group, Badge, Text, Progress } from "@mantine/core";
import { motion } from "framer-motion";
import { Trophy, Target, Users, Coins, Sparkles } from "lucide-react";
import { useAchievements } from "../../../achievements/context";
import { AchievementCard } from "../../../../components";
import { staggerContainer, fadeInUp } from "../../../../utils/animations";
import type { AchievementCategory } from "../../../achievements/context";
import classes from "./achievements.module.css";

const categoryIcons: Record<AchievementCategory, React.ReactNode> = {
  games: <Target size={16} />,
  wins: <Trophy size={16} />,
  social: <Users size={16} />,
  points: <Coins size={16} />,
  special: <Sparkles size={16} />,
};

const categoryLabels: Record<AchievementCategory, string> = {
  games: "Games",
  wins: "Wins",
  social: "Social",
  points: "Points",
  special: "Special",
};

export function Achievements() {
  const {
    achievements,
    playerAchievements,
    getUnlockedCount,
    getTotalCount,
    getAchievementsByCategory,
    getAchievementProgress,
  } = useAchievements();

  const [activeTab, setActiveTab] = useState<AchievementCategory>("games");

  const unlockedCount = getUnlockedCount();
  const totalCount = getTotalCount();
  const completionPercent = (unlockedCount / totalCount) * 100;

  const categoryAchievements = getAchievementsByCategory(activeTab);

  return (
    <div className={classes.root}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Stack gap="md" mb="xl">
          <Group justify="space-between" align="center">
            <Title order={2}>
              <Trophy size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
              Achievements
            </Title>
            <Badge size="lg" color="gold" variant="filled">
              {unlockedCount}/{totalCount}
            </Badge>
          </Group>

          {/* Overall Progress */}
          <div>
            <Group justify="space-between" mb={8}>
              <Text size="sm" fw={500}>
                Overall Progress
              </Text>
              <Text size="sm" c="dimmed">
                {completionPercent.toFixed(0)}%
              </Text>
            </Group>
            <Progress value={completionPercent} color="gold" size="lg" radius="xl" />
          </div>
        </Stack>
      </motion.div>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as AchievementCategory)}>
        <Tabs.List grow>
          {(Object.keys(categoryLabels) as AchievementCategory[]).map((category) => {
            const categoryCount = getAchievementsByCategory(category).filter((a) => {
              const progress = getAchievementProgress(a.id);
              return progress?.unlocked;
            }).length;
            const categoryTotal = getAchievementsByCategory(category).length;

            return (
              <Tabs.Tab
                key={category}
                value={category}
                leftSection={categoryIcons[category]}
                rightSection={
                  <Badge size="xs" color="gray" variant="light">
                    {categoryCount}/{categoryTotal}
                  </Badge>
                }
              >
                {categoryLabels[category]}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        {(Object.keys(categoryLabels) as AchievementCategory[]).map((category) => (
          <Tabs.Panel key={category} value={category} pt="md">
            <Stack gap="md">
              {getAchievementsByCategory(category).map((achievement, index) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    playerProgress={getAchievementProgress(achievement.id)}
                  />
              ))}
            </Stack>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

