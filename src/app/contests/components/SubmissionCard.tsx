import { ActionIcon, Avatar, Badge, Card, Group, Stack, Text } from "@mantine/core";
import { motion } from "framer-motion";
import { ThumbsUp, Trophy } from "lucide-react";
import type { Submission } from "../types";
import { TRICK_ORDER } from "../types";

interface Props {
  submission: Submission;
  onOpen?: (submission: Submission) => void;
  onUpvote?: (submission: Submission) => void;
  upvoted?: boolean;
}

export function SubmissionCard({ submission, onOpen, onUpvote, upvoted }: Props) {
  const isWinner = submission.status === "winner";
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
      <Card
        withBorder
        radius="md"
        p="md"
        style={{ cursor: "pointer", borderColor: isWinner ? "var(--mantine-color-success-6, #3fb950)" : undefined }}
        onClick={() => onOpen?.(submission)}
      >
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <Avatar src={submission.playerAvatarUrl} radius="xl" size="sm">
                {submission.playerName[0]}
              </Avatar>
              <Text fw={600} size="sm">
                {submission.playerName}
              </Text>
            </Group>
            {isWinner && (
              <Badge color="success" leftSection={<Trophy size={12} />}>
                Winner
              </Badge>
            )}
          </Group>

          <Group gap={4}>
            {TRICK_ORDER.map((letter) => (
              <Badge
                key={letter}
                size="sm"
                variant={submission.clips[letter] ? "filled" : "outline"}
                color={submission.clips[letter] ? "gold" : "gray"}
              >
                {letter}
              </Badge>
            ))}
          </Group>

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : ""}
            </Text>
            <Group gap={4}>
              <ActionIcon
                variant={upvoted ? "filled" : "subtle"}
                color="gold"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpvote?.(submission);
                }}
              >
                <ThumbsUp size={16} />
              </ActionIcon>
              <Text size="sm" fw={600}>
                {submission.upvoteCount}
              </Text>
            </Group>
          </Group>
        </Stack>
      </Card>
    </motion.div>
  );
}
