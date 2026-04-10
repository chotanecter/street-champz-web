import { Title, Stack, Accordion, Text } from "@mantine/core";
import { HelpCircle } from "lucide-react";
import { GameCard } from "../../../../components";
import classes from "./help.module.css";

export function Help() {
  return (
    <div className={classes.root}>
      <Title order={2} mb="lg">
        <HelpCircle size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
        Help & FAQ
      </Title>

      <GameCard>
        <Accordion variant="separated">
          <Accordion.Item value="what-is-skate">
            <Accordion.Control>What is S.K.A.T.E.?</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                S.K.A.T.E. is a classic skateboarding game where players take turns performing tricks. If you can't match your opponent's trick, you get a letter. The first player to spell "SKATE" loses!
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="how-to-play">
            <Accordion.Control>How do I play?</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  1. Create or join a game
                </Text>
                <Text size="sm">
                  Go to the Play tab and either create a new game or join an existing one.
                </Text>
                <Text size="sm" fw={600} mt="sm">
                  2. Take turns
                </Text>
                <Text size="sm">
                  When it's your turn, set a trick for others to match or defend against the current trick.
                </Text>
                <Text size="sm" fw={600} mt="sm">
                  3. Win the game
                </Text>
                <Text size="sm">
                  Be the last player standing! Avoid spelling S.K.A.T.E. to win.
                </Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="coins-xp">
            <Accordion.Control>How do I earn points?</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                <Text size="sm">
                  • <strong>Win games</strong> - Earn points per victory
                </Text>
                <Text size="sm">
                  • <strong>Participate</strong> - Get points just for playing
                </Text>
                <Text size="sm">
                  • <strong>Daily rewards</strong> - Claim daily login bonuses
                </Text>
                <Text size="sm">
                  • <strong>Complete missions</strong> - Finish daily, weekly, and lifetime quests
                </Text>
                <Text size="sm">
                  • <strong>Unlock achievements</strong> - Earn rewards for milestones
                </Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="teams">
            <Accordion.Control>How do teams work?</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                Create or join a team to compete together! Teams have their own leaderboards and stats. You can only be in one team at a time. Team wins contribute to your team's overall score.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="achievements">
            <Accordion.Control>What are achievements?</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                Achievements are special milestones you can unlock by playing games, winning matches, and reaching goals. Each achievement rewards you with points. Check the Achievements page to see your progress!
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="leaderboard">
            <Accordion.Control>How does the leaderboard work?</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                The leaderboard ranks players by their wins and performance. There are weekly, monthly, and all-time rankings. Top players at the end of each season earn special rewards!
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="friends">
            <Accordion.Control>How do I add friends?</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                Go to the Social page (bell icon in header), navigate to the Friends tab, and enter a username to send a friend request. Once accepted, you can see when they're online and invite them to games!
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="support">
            <Accordion.Control>Need more help?</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                For additional support, contact us at support@streetchampz.com or join our Discord community for tips, tricks, and to connect with other players!
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </GameCard>
    </div>
  );
}

