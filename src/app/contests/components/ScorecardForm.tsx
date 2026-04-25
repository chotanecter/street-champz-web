import { Button, Group, Paper, Rating, Slider, Stack, Text, Textarea, Title } from "@mantine/core";
import { useState } from "react";
import type { Scorecard, Submission, TrickLetter } from "../types";
import { TRICK_ORDER } from "../types";

interface Props {
  submission: Submission;
  onSubmit: (card: Omit<Scorecard, "submissionId" | "judgeId" | "submittedAt">) => Promise<void>;
  existing?: Scorecard;
}

/**
 * ScorecardForm — judges rate each of the 5 tricks 1-5 stars plus an overall
 * 0-10 style bonus. Total = sum(trick stars) + style (max 35).
 */
export function ScorecardForm({ submission, onSubmit, existing }: Props) {
  const [scores, setScores] = useState<Record<TrickLetter, number>>(
    existing?.scores ?? { S: 0, K: 0, A: 0, T: 0, E: 0, style: 0 as unknown as number },
  );
  const [style, setStyle] = useState<number>(existing?.scores.style ?? 0);
  const [comment, setComment] = useState<string>(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);

  const total = TRICK_ORDER.reduce((acc, l) => acc + (scores[l] ?? 0), 0) + style;

  const save = async () => {
    setSaving(true);
    try {
      await onSubmit({
        scores: { S: scores.S, K: scores.K, A: scores.A, T: scores.T, E: scores.E, style },
        total,
        comment,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack>
        <Title order={4}>Judge {submission.playerName}</Title>

        {TRICK_ORDER.map((letter) => (
          <Group key={letter} justify="space-between">
            <Text fw={600}>{letter}</Text>
            <Rating
              value={scores[letter]}
              onChange={(v) => setScores((s) => ({ ...s, [letter]: v }))}
              count={5}
            />
          </Group>
        ))}

        <Stack gap={4}>
          <Group justify="space-between">
            <Text fw={600}>Style bonus</Text>
            <Text size="sm" c="dimmed">
              {style} / 10
            </Text>
          </Group>
          <Slider value={style} onChange={setStyle} min={0} max={10} step={1} />
        </Stack>

        <Textarea
          label="Private notes (admins + judges only)"
          value={comment}
          onChange={(e) => setComment(e.currentTarget.value)}
          minRows={2}
        />

        <Group justify="space-between">
          <Text fw={700}>
            Total: {total} / 35
          </Text>
          <Button onClick={save} loading={saving}>
            Submit scorecard
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
