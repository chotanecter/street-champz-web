import { Container, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "wouter";
import { useContests } from "../../contests";
import { ContestHeroCard } from "../../contests/components/ContestHeroCard";

/**
 * GET /contests  — index of live + upcoming S.K.A.T.E. contests.
 * Renders ContestHeroCard tiles; tapping one navigates to /contests/:slug.
 */
export default function ContestsIndex() {
  const { contests, loading, error } = useContests();

  if (loading) return <Loader m="xl" />;
  if (error)
    return (
      <Container>
        <Text c="red">{error}</Text>
      </Container>
    );

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={1}>S.K.A.T.E. Challenges</Title>
        <Text c="dimmed">Match the pro's five tricks, enter the contest, win the prize.</Text>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {contests.map((c) => (
            <Link key={c.id} href={`/contests/${c.slug}`}>
              <div style={{ cursor: "pointer" }}>
                <ContestHeroCard contest={c} />
              </div>
            </Link>
          ))}
        </SimpleGrid>
        {contests.length === 0 && <Text c="dimmed">No contests are live yet. Check back soon.</Text>}
      </Stack>
    </Container>
  );
}
