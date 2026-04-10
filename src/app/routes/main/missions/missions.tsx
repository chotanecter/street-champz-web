import { Stack, Title, Tabs, Text } from "@mantine/core";
import { useMissions } from "../../../missions/context";
import { MissionCard } from "../../../../components";
import { motion } from "framer-motion";
import { staggerContainer } from "../../../../utils/animations";

export function Missions() {
    const { missions, claimMissionReward } = useMissions();

    const dailyMissions = missions.filter(m => m.type === "daily");
    const weeklyMissions = missions.filter(m => m.type === "weekly");
    const lifetimeMissions = missions.filter(m => m.type === "lifetime");

    const renderMissions = (missionsList: typeof missions) => {
        if (missionsList.length === 0) {
            return (
                <Text c="dimmed" ta="center" py="xl">
                    No missions available
                </Text>
            );
        }

        return (
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <Stack gap="md">
                    {missionsList.map((mission, index) => (
                        <MissionCard
                            key={mission.id}
                            mission={mission}
                            onClaim={() => claimMissionReward(mission.id)}
                            index={index}
                        />
                    ))}
                </Stack>
            </motion.div>
        );
    };

    return (
        <Stack gap="lg" p="md">
            <Title order={2}>Missions & Quests</Title>

            <Tabs defaultValue="daily" variant="pills">
                <Tabs.List grow>
                    <Tabs.Tab value="daily">
                        Daily ({dailyMissions.filter(m => m.completed && !m.claimed).length})
                    </Tabs.Tab>
                    <Tabs.Tab value="weekly">
                        Weekly ({weeklyMissions.filter(m => m.completed && !m.claimed).length})
                    </Tabs.Tab>
                    <Tabs.Tab value="lifetime">
                        Lifetime ({lifetimeMissions.filter(m => m.completed && !m.claimed).length})
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="daily" pt="md">
                    {renderMissions(dailyMissions)}
                </Tabs.Panel>

                <Tabs.Panel value="weekly" pt="md">
                    {renderMissions(weeklyMissions)}
                </Tabs.Panel>

                <Tabs.Panel value="lifetime" pt="md">
                    {renderMissions(lifetimeMissions)}
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
}

