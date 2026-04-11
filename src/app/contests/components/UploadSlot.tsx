import { Badge, Button, Card, FileButton, Group, Progress, Stack, Text } from "@mantine/core";
import { Check, Upload, Video } from "lucide-react";
import { useState } from "react";
import type { Clip, TrickLetter } from "../types";

interface Props {
  letter: TrickLetter;
  featuredTrickName: string;
  clip?: Clip;
  onUpload: (file: File) => Promise<Clip>;
  onClear?: () => void;
  disabled?: boolean;
}

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_DURATION_SEC = 45;

export function UploadSlot({ letter, featuredTrickName, clip, onUpload, onClear, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File | null) => {
    if (!file) return;
    setError(null);
    if (file.size > MAX_BYTES) {
      setError(`Max file size is ${MAX_BYTES / 1024 / 1024} MB`);
      return;
    }
    setUploading(true);
    setProgress(0);
    const tick = setInterval(() => setProgress((p) => Math.min(p + 8, 90)), 200);
    try {
      await onUpload(file);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      clearInterval(tick);
      setUploading(false);
    }
  };

  const filled = Boolean(clip?.videoUrl);

  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Badge size="xl" color={filled ? "success" : "gold"} variant="filled">
            {letter}
          </Badge>
          {filled && <Check size={20} color="var(--mantine-color-success-6, #3fb950)" />}
        </Group>

        <Text fw={600}>{featuredTrickName || "Trick TBD"}</Text>
        <Text size="xs" c="dimmed">
          Max {MAX_DURATION_SEC}s · {MAX_BYTES / 1024 / 1024}MB · mp4/webm
        </Text>

        {uploading && <Progress value={progress} animated />}

        {error && (
          <Text size="xs" c="red">
            {error}
          </Text>
        )}

        <Group>
          <FileButton accept="video/mp4,video/webm,video/quicktime" onChange={handle} disabled={disabled || uploading}>
            {(props) => (
              <Button {...props} leftSection={filled ? <Video size={16} /> : <Upload size={16} />} variant={filled ? "light" : "filled"}>
                {filled ? "Replace" : "Upload"}
              </Button>
            )}
          </FileButton>
          {filled && onClear && (
            <Button variant="subtle" color="red" onClick={onClear} disabled={disabled || uploading}>
              Clear
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
