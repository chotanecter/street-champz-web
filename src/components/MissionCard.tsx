import { Card, Stack, Text, Progress, Group, Badge, Button } from "@mantine/core";
import { Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "../utils/animations";
import type { Mission } from "../app/missions/context";
import classes from "./MissionCard.module.css";

interface MissionCardProps {
    mission: Mission;
    onClaim: () => void;
    index?: number;
}

export const MissionCard = ({ mission, onClaim, index = 0 }: MissionCardProps) => {
    const progressPercent = (mission.progress / mission.target) * 100;
    const canClaim = mission.completed && !mission.claimed;

    const getMissionColor = () => {
        switch (mission.type) {
            case "daily": return "blue";
            case "weekly": return "purple";
            case "lifetime": return "gold";
            default: return "gray";
        }
    };

    return (
        <motion.div
            variants={fadeInUp}
            custom={index}
            initial="hidden"
            animate="visible"
        >
            <Card 
                className={`${classes.card} ${mission.completed ? classes.completed : ""} ${canClaim ? classes.canClaim : ""}`}
                padding="md"
            >
                <Stack gap="sm">
                    <Group justify="space-between" wrap="nowrap">
                        <div>
                            <Group gap="xs">
                                <Text fw={600} size="md">
                                    {mission.title}
                                </Text>
                                <Badge size="sm" color={getMissionColor()} variant="light">
                                    {mission.type}
                                </Badge>
                            </Group>
                            <Text size="sm" c="dimmed">
                                {mission.description}
                            </Text>
                        </div>

                        {mission.claimed && (
                            <div className={classes.claimedBadge}>
                                <Check size={20} />
                            </div>
                        )}
                    </Group>

                    <div>
                        <Group justify="space-between" mb={4}>
                            <Text size="xs" c="dimmed">
                                Progress
                            </Text>
                            <Text size="xs" fw={600}>
                                {mission.progress}/{mission.target}
                            </Text>
                        </Group>
                        <Progress 
                            value={progressPercent} 
                            color={getMissionColor()}
                            size="md"
                            className={classes.progress}
                        />
                    </div>

                    <Group justify="space-between" align="center">
                        <Group gap={4} className={classes.rewardDisplay}>
                            <Star size={18} color="var(--mantine-color-gold-5)" fill="var(--mantine-color-gold-5)" />
                            <Text size="sm" fw={700} c="gold.4">
                                +{(mission.rewards.points || 0).toLocaleString()}
                            </Text>
                            <Text size="xs" c="dimmed">points</Text>
                        </Group>

                        {canClaim && (
                            <Button
                                size="xs"
                                variant="gradient"
                                gradient={{ from: "gold", to: "orange", deg: 90 }}
                                onClick={onClaim}
                                className={classes.claimButton}
                            >
                                Claim
                            </Button>
                        )}
                    </Group>
                </Stack>
            </Card>
        </motion.div>
    );
};
