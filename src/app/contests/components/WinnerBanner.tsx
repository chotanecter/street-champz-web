import { Avatar, Badge, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect } from "react";
import type { Submission } from "../types";

interface Props {
  winner: Submission;
  prizeDescription: string;
}

export function WinnerBanner({ winner, prizeDescription }: Props) {
  useEffect(() => {
    // Lazy import so SSR / test envs don't choke on canvas-confetti.
    void import("../../../utils/confetti").then((m) => m.celebrateVictory?.()).catch(() => undefined);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
    >
      <Paper
        withBorder
        radius="lg"
        p="xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,200,0,0.15), rgba(255,255,255,0.02))",
          borderColor: "var(--mantine-color-success-6, #3fb950)",
        }}
      >
        <Stack align="center" gap="md">
          <Badge color="success" size="xl" leftSection={<Trophy size={16} />}>
            Winner
          </Badge>
          <Avatar src={winner.playerAvatarUrl} radius="xl" size={96}>
            {winner.playerName[0]}
          </Avatar>
          <Title order={2}>{winner.playerName}</Title>
          <Group gap={4}>
            <Trophy size={18} color="gold" />
            <Text fw={600}>{prizeDescription}</Text>
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  );
}
