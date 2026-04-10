import { useState } from "react";
import { Title, Tabs, Stack, Button, Modal, TextInput, Textarea, Group, Text, Badge } from "@mantine/core";
import { Users, Plus, Trophy } from "lucide-react";
import { useTeams } from "../../../teams/context";
import { TeamCard, GameCard } from "../../../../components";
import classes from "./teams.module.css";

const LOGO_OPTIONS = ["👑", "⚡", "🔥", "💎", "🎯", "🚀", "⭐", "💪", "🎮", "🏆"];

export function Teams() {
  const { currentTeam, teams, createTeam, joinTeam, leaveTeam, getTeamMembers, isInTeam } = useTeams();
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [selectedLogo, setSelectedLogo] = useState(LOGO_OPTIONS[0]);

  const handleCreateTeam = () => {
    if (!teamName.trim()) return;
    
    createTeam(teamName, selectedLogo, teamDescription);
    setCreateModalOpen(false);
    setTeamName("");
    setTeamDescription("");
    setSelectedLogo(LOGO_OPTIONS[0]);
    setActiveTab("my-team");
  };

  const handleJoinTeam = (teamId: string) => {
    joinTeam(teamId);
    setActiveTab("my-team");
  };

  const teamMembers = currentTeam ? getTeamMembers(currentTeam.id) : [];

  return (
    <div className={classes.root}>
      <Group justify="space-between" align="center" mb="lg">
        <Title order={2}>
          <Users size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Teams
        </Title>
        {!isInTeam && (
          <Button
            leftSection={<Plus size={18} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Team
          </Button>
        )}
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "browse")}>
        <Tabs.List grow>
          <Tabs.Tab value="browse" leftSection={<Users size={16} />}>
            Browse Teams
          </Tabs.Tab>
          <Tabs.Tab
            value="my-team"
            leftSection={<Trophy size={16} />}
            rightSection={
              isInTeam ? (
                <Badge size="xs" color="blue" variant="filled">
                  1
                </Badge>
              ) : null
            }
          >
            My Team
          </Tabs.Tab>
        </Tabs.List>

        {/* Browse Teams Tab */}
        <Tabs.Panel value="browse" pt="md">
          <Stack gap="md">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isMember={currentTeam?.id === team.id}
                onJoin={() => handleJoinTeam(team.id)}
              />
            ))}
          </Stack>
        </Tabs.Panel>

        {/* My Team Tab */}
        <Tabs.Panel value="my-team" pt="md">
          {currentTeam ? (
            <Stack gap="lg">
              <GameCard variant="gradient">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <div className={classes.teamLogo}>
                        {currentTeam.logo}
                      </div>
                      <div>
                        <Text size="xl" fw={700}>
                          {currentTeam.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {currentTeam.description}
                        </Text>
                      </div>
                    </Group>
                    <Button color="red" variant="light" onClick={leaveTeam}>
                      Leave Team
                    </Button>
                  </Group>

                  <Group gap="xl">
                    <div>
                      <Text size="sm" c="dimmed">
                        Members
                      </Text>
                      <Text size="lg" fw={700}>
                        {currentTeam.memberIds.length}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Total Games
                      </Text>
                      <Text size="lg" fw={700}>
                        {currentTeam.stats.totalGames}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Wins
                      </Text>
                      <Text size="lg" fw={700} c="var(--mantine-color-success-5)">
                        {currentTeam.stats.totalWins}
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">
                        Total Coins
                      </Text>
                      <Text size="lg" fw={700} c="var(--mantine-color-gold-5)">
                        {currentTeam.stats.totalCoins.toLocaleString()}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </GameCard>

              <GameCard>
                <Stack gap="md">
                  <Text fw={600} size="lg">
                    Team Members
                  </Text>
                  {teamMembers.map((member) => (
                    <Group key={member.id} justify="space-between">
                      <Group gap="md">
                        <div>
                          <Text fw={500}>{member.username}</Text>
                          <Text size="sm" c="dimmed">
                            Level {member.level}
                          </Text>
                        </div>
                      </Group>
                      {member.role === "leader" && (
                        <Badge color="gold" variant="filled">
                          Leader
                        </Badge>
                      )}
                    </Group>
                  ))}
                </Stack>
              </GameCard>
            </Stack>
          ) : (
            <GameCard>
              <Stack gap="md" align="center" py="xl">
                <Users size={48} style={{ opacity: 0.5 }} />
                <Text size="lg" fw={600}>
                  You're not in a team yet
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Join an existing team or create your own to compete together!
                </Text>
                <Group>
                  <Button variant="light" onClick={() => setActiveTab("browse")}>
                    Browse Teams
                  </Button>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    Create Team
                  </Button>
                </Group>
              </Stack>
            </GameCard>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Create Team Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Your Team"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Team Name"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe your team"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            minRows={3}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Choose Logo
            </Text>
            <Group gap="sm">
              {LOGO_OPTIONS.map((logo) => (
                <button
                  key={logo}
                  className={`${classes.logoButton} ${selectedLogo === logo ? classes.logoButtonActive : ""}`}
                  onClick={() => setSelectedLogo(logo)}
                >
                  {logo}
                </button>
              ))}
            </Group>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={!teamName.trim()}>
              Create Team
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}

