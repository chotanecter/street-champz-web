import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { motion } from "framer-motion";
import { Clock, Trophy } from "lucide-react";
import type { Contest } from "../types";

interface Props {
  contest: Contest;
  onEnter?: () => void;
  hasEntered?: boolean;
}

function formatCountdown(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "closed";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h left`;
}

export function ContestHeroCard({ contest, onEnter, hasEntered }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Paper
        radius="lg"
        p="xl"
        withBorder
        style={{
          backgroundImage: contest.heroImageUrl ? `url(${contest.heroImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Badge color="premium" variant="filled" size="lg">
              Presented by {contest.sponsor.name}
            </Badge>
            <Badge color="blue" variant="light" leftSection={<Clock size={12} />}>
              {formatCountdown(contest.submissionsCloseAt)}
            </Badge>
          </Group>

          <Title order={1}>{contest.title}</Title>
          <Text size="lg" c="dimmed">
            Featuring <strong>{contest.featuredSkater.name}</strong>
          </Text>
          <Text>{contest.description}</Text>

          <Paper radius="md" p="md" bg="dark.7" withBorder>
            <Group gap="xs">
              <Trophy size={18} color="gold" />
              <Text fw={600}>{contest.prizeDescription}</Text>
            </Group>
          </Paper>

          <Group>
            <Button
              size="lg"
              color="blue"
              onClick={onEnter}
              disabled={contest.status !== "live" || hasEntered}
            >
              {hasEntered ? "Entry in progress" : "Enter Challenge"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  );
}
