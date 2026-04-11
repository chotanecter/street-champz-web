import { Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";
import type { Submission } from "../types";

interface Props {
  submissions: Submission[];
  /**
   * Only players who have submitted clips for every required trick count as
   * having "completed the challenge" and therefore appear on the leaderboard.
   */
  completedOnly?: boolean;
}

/**
 * Leaderboard — ranked list of contest entries.
 *
 * Ordering matches the spec tiebreakers:
 *   1. Judge score (desc)
 *   2. Upvote count (desc)
 *   3. Earliest `submittedAt` (asc)
 *
 * A player is "complete" when their submission has a clip for each of the 5
 * S/K/A/T/E trick slots. Drafts and partially-filmed entries are hidden by
 * default via `completedOnly`.
 */
export function Leaderboard({ submissions, completedOnly = true }: Props) {
  const eligible = completedOnly
    ? submissions.filter((s) => {
        const clips = s.clips ?? {};
        return ["S", "K", "A", "T", "E"].every(
          (l) => clips[l as keyof typeof clips]?.videoUrl,
        );
      })
    : submissions;

  const ranked = [...eligible].sort((a, b) => {
    if (b.judgeScore !== a.judgeScore) return b.judgeScore - a.judgeScore;
    if (b.upvoteCount !== a.upvoteCount) return b.upvoteCount - a.upvoteCount;
    const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return ta - tb;
  });

  if (ranked.length === 0) {
    return (
      <Paper withBorder p="md" radius="md">
        <Text c="dimmed" ta="center">
          No one has completed the challenge yet. Be the first to land all five tricks.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={4}>Leaderboard</Title>
          <Badge variant="light" color="yellow">
            {ranked.length} complete
          </Badge>
        </Group>
        <Stack gap={6}>
          {ranked.map((s, idx) => {
            const rank = idx + 1;
            const medalColor =
              rank === 1 ? "yellow" : rank === 2 ? "gray" : rank === 3 ? "orange" : "dimmed";
            const Icon = rank === 1 ? Crown : rank <= 3 ? Trophy : Medal;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <Paper
                  withBorder
                  radius="sm"
                  p="sm"
                  bg={rank === 1 ? "dark.6" : undefined}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Text fw={700} w={28} ta="center" c={medalColor}>
                        #{rank}
                      </Text>
                      <Icon size={18} />
                      <Stack gap={0}>
                        <Text fw={600}>{s.playerName}</Text>
                        <Text size="xs" c="dimmed">
                          {s.upvoteCount} upvotes
                          {s.submittedAt
                            ? ` · ${new Date(s.submittedAt).toLocaleDateString()}`
                            : ""}
                        </Text>
                      </Stack>
                    </Group>
                    <Stack gap={0} align="flex-end">
                      <Text fw={700} size="lg">
                        {s.judgeScore.toFixed(1)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        judge score
                      </Text>
                    </Stack>
                  </Group>
                </Paper>
              </motion.div>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
