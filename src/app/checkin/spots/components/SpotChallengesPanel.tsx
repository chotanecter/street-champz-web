// src/app/checkin/spots/components/SpotChallengesPanel.tsx
// "Spot Check-In Challenges" for the Missions & Quests page. Self-contained:
// wraps its own SpotsProvider (Economy/Auth providers are available app-wide
// under /missions) so it can read collect progress without changing the route.

import { Badge, Card, Group, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import { Check, MapPin, Trophy, Video } from "lucide-react";
import { Link } from "wouter";

import { SpotsProvider, useSpots } from "../SpotsContext";
import { SPOT_GAME } from "../constants";

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  icon: typeof MapPin;
}

function ChallengeCard({ c }: { c: Challenge }) {
  const done = c.progress >= c.target;
  const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
  const Icon = done ? Check : c.icon;
  return (
    <Card withBorder radius="md" padding="sm">
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size="xl" radius="md" variant="light" color={done ? "blue" : "gray"}>
          <Icon size={22} />
        </ThemeIcon>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={700} size="sm">{c.title}</Text>
            <Badge size="sm" color="blue" variant={done ? "filled" : "light"}>
              +{c.reward}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mb={6}>{c.description}</Text>
          <Progress value={pct} color={done ? "blue" : "gray"} size="sm" radius="xl" />
          <Text size="xs" c="dimmed" mt={4}>
            {done ? "Complete" : `${Math.min(c.progress, c.target)} / ${c.target}`}
          </Text>
        </div>
      </Group>
    </Card>
  );
}

function PanelInner() {
  const { spots, checkIns, collectedCount, userId } = useSpots();

  const collected = collectedCount();
  const myCheckIns = checkIns.filter((c) => c.userId === userId).length;
  const knobbedCollected = new Set(
    checkIns
      .filter((c) => c.userId === userId)
      .map((c) => spots.find((s) => s.id === c.spotId))
      .filter((s) => s && s.access === "knobbed")
      .map((s) => s!.id),
  ).size;

  const challenges: Challenge[] = [
    { id: "first", title: "First Tap-In", description: "Check in at your first LA spot.", progress: collected, target: 1, reward: 250, icon: MapPin },
    { id: "five", title: "Getting Around", description: "Collect 5 different spots.", progress: collected, target: 5, reward: 1000, icon: MapPin },
    { id: "ten", title: "City Rat", description: "Collect 10 different spots.", progress: collected, target: 10, reward: 2500, icon: Trophy },
    { id: "all", title: "LA Completionist", description: `Collect all ${spots.length} spots in the LA Edition.`, progress: collected, target: spots.length, reward: 10000, icon: Trophy },
    { id: "landmark", title: "Pay Respects", description: "Tap in at a knobbed landmark spot.", progress: knobbedCollected, target: 1, reward: 500, icon: MapPin },
    { id: "sessions", title: "Frequent Skater", description: "Log 15 spot check-ins total.", progress: myCheckIns, target: 15, reward: 3000, icon: Video },
  ];

  return (
    <Stack gap="md">
      <Card withBorder radius="md" padding="sm" bg="dark.6">
        <Group justify="space-between">
          <div>
            <Text fw={800} size="sm">Spot Check-In — {SPOT_GAME.editionName}</Text>
            <Text size="xs" c="dimmed">{SPOT_GAME.sponsorNote}</Text>
          </div>
          <Badge size="lg" color="blue" variant="light">{collected}/{spots.length} collected</Badge>
        </Group>
        <Text
          component={Link}
          href="/checkin"
          size="xs"
          c="blue.5"
          fw={700}
          mt={6}
          style={{ textDecoration: "none" }}
        >
          Open the spot map →
        </Text>
      </Card>

      {challenges.map((c) => <ChallengeCard key={c.id} c={c} />)}
    </Stack>
  );
}

export function SpotChallengesPanel() {
  return (
    <SpotsProvider>
      <PanelInner />
    </SpotsProvider>
  );
}
