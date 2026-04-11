import { Container, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useRoute } from "wouter";
import { ContestHeroCard } from "../../contests/components/ContestHeroCard";
import { SubmissionCard } from "../../contests/components/SubmissionCard";
import { TrickReel } from "../../contests/components/TrickReel";
import { WinnerBanner } from "../../contests/components/WinnerBanner";
import { useContest } from "../../contests/hooks/useContest";

/**
 * GET /contests/:slug — public contest detail view.
 *
 * Layout:
 *  1. Hero card (sponsor, prize, countdown, Enter CTA)
 *  2. TrickReel — pro's 5 videos
 *  3. (if complete) WinnerBanner
 *  4. SubmissionGrid — all completed entries, sorted by judge score then upvotes
 */
export default function ContestDetailRoute() {
  const [, params] = useRoute<{ slug: string }>("/contests/:slug");
  const { contest, submissions, loading, error } = useContest(params?.slug);

  if (loading) return <Loader m="xl" />;
  if (error)
    return (
      <Container>
        <Text c="red">{error}</Text>
      </Container>
    );
  if (!contest)
    return (
      <Container>
        <Text>Contest not found.</Text>
      </Container>
    );

  const winner =
    contest.status === "complete" ? submissions.find((s) => s.status === "winner") : undefined;

  const sorted = [...submissions].sort((a, b) => {
    if (b.judgeScore !== a.judgeScore) return b.judgeScore - a.judgeScore;
    if (b.upvoteCount !== a.upvoteCount) return b.upvoteCount - a.upvoteCount;
    const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return ta - tb;
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <ContestHeroCard contest={contest} />
        <TrickReel tricks={contest.tricks} skaterName={contest.featuredSkater.name} />
        {winner && <WinnerBanner winner={winner} prizeDescription={contest.prizeDescription} />}
        <div>
          <Title order={3} mb="sm">
            Entries ({sorted.length})
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {sorted.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </SimpleGrid>
          {sorted.length === 0 && (
            <Text c="dimmed" mt="md">
              No submissions yet — be the first to enter.
            </Text>
          )}
        </div>
      </Stack>
    </Container>
  );
}
