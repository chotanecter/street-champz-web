import { Group, Stack, Text, Badge, Button } from "@mantine/core";
import { Users, Trophy, Coins } from "lucide-react";
import type { Team } from "../app/teams/context";
import classes from "./TeamCard.module.css";

interface TeamCardProps {
  team: Team;
  isMember?: boolean;
  onJoin?: () => void;
  onView?: () => void;
}

export function TeamCard({ team, isMember = false, onJoin, onView }: TeamCardProps) {
  const winRate = team.stats.totalGames > 0
    ? Math.round((team.stats.totalWins / team.stats.totalGames) * 100)
    : 0;

  return (
    <div className={`${classes.card} ${isMember ? classes.memberCard : ""}`}>
      <Group gap="md" wrap="nowrap" align="flex-start">
        {/* Logo */}
        <div className={classes.logo}>
          <span className={classes.emoji}>{team.logo}</span>
        </div>

        {/* Content */}
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text fw={600} size="lg">
                {team.name}
              </Text>
              <Text size="sm" c="dimmed">
                {team.description}
              </Text>
            </div>
            {isMember && (
              <Badge color="blue" variant="filled" size="sm">
                Your Team
              </Badge>
            )}
          </Group>

          {/* Stats */}
          <Group gap="lg">
            <Group gap="xs">
              <Users size={16} />
              <Text size="sm" c="dimmed">
                {team.memberIds.length} {team.memberIds.length === 1 ? "member" : "members"}
              </Text>
            </Group>
            <Group gap="xs">
              <Trophy size={16} />
              <Text size="sm" c="dimmed">
                {winRate}% win rate
              </Text>
            </Group>
            <Group gap="xs">
              <Coins size={16} />
              <Text size="sm" c="dimmed">
                {team.stats.totalCoins.toLocaleString()} coins
              </Text>
            </Group>
          </Group>

          {/* Actions */}
          <Group gap="sm" mt="xs">
            {onView && (
              <Button variant="light" size="sm" onClick={onView}>
                View Team
              </Button>
            )}
            {onJoin && !isMember && (
              <Button color="blue" size="sm" onClick={onJoin}>
                Join Team
              </Button>
            )}
          </Group>
        </Stack>
      </Group>
    </div>
  );
}

