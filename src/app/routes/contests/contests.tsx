import { Container, Loader, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "wouter";
import { useContests } from "../../contests";
import { ContestHeroCard } from "../../contests/components/ContestHeroCard";

/**
 * GET /contests  — index of live + upcoming S.K.A.T.E. contests.
 * Renders ContestHeroCard tiles; tapping one navigates to /contests/:slug.
 *
 * If the contests API isn't reachable (e.g. on a static-only deployment) or
 * there are no contests yet, we show a Coming Soon placeholder rather than
 * a raw error so the page still feels intentional.
 */
export default function ContestsIndex() {
  const { contests, loading, error } = useContests();

  if (loading) return <Loader m="xl" />;

  const showPlaceholder = !!error || contests.length === 0;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={1}>S.K.A.T.E. Challenges</Title>
        <Text c="dimmed">Match the pro's five tricks, enter the contest, win the prize.</Text>

        {showPlaceholder ? (
          <Paper p="xl" radius="md" withBorder ta="center">
            <Title order={3} mb="xs">Coming Soon</Title>
            <Text c="dimmed">
              Sponsored S.K.A.T.E. challenges drop here. Check back soon to match the pro's five tricks and win the prize.
            </Text>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {contests.map((c) => (
              <Link key={c.id} href={`/contests/${c.slug}`}>
                <div style={{ cursor: "pointer" }}>
                  <ContestHeroCard contest={c} />
                </div>
              </Link>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}
