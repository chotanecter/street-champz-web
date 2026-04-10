import { Group, Text, Tooltip, Badge } from "@mantine/core";
import { Star, Crown } from "lucide-react";
import classes from "./PointsDisplay.module.css";

interface PointsDisplayProps {
    points: number;
    daysRemaining: number;
    rank?: number;
    variant?: "compact" | "full" | "header";
}

export const PointsDisplay = ({ 
    points, 
    daysRemaining,
    rank,
    variant = "compact"
}: PointsDisplayProps) => {
    
    if (variant === "header") {
        return (
            <Tooltip 
                label={`${daysRemaining} days left in season • Rank: #${rank || '?'}`}
                position="bottom"
            >
                <Group gap="xs" className={classes.headerContainer}>
                    <Star size={18} className={classes.pointsIcon} />
                    <Text size="sm" fw={700} className={classes.pointsText}>
                        {points.toLocaleString()}
                    </Text>
                </Group>
            </Tooltip>
        );
    }
    
    if (variant === "compact") {
        return (
            <Group gap="xs" className={classes.container}>
                <Star size={20} className={classes.pointsIcon} />
                <Text size="md" fw={600} className={classes.pointsText}>
                    {points.toLocaleString()}
                </Text>
            </Group>
        );
    }

    // Full variant - shows points and rank
    return (
        <div className={classes.fullContainer}>
            <Group justify="space-between" mb="xs">
                <Group gap="xs">
                    <Crown size={24} className={classes.trophyIcon} />
                    <Text fw={700} size="lg">Season Competition</Text>
                </Group>
                <Badge 
                    size="lg" 
                    variant="light"
                    color="blue"
                >
                    {daysRemaining} days left
                </Badge>
            </Group>

            <Group justify="center" my="md" gap="xl">
                <div className={classes.rankBox}>
                    <Text size="xs" c="dimmed" ta="center">YOUR RANK</Text>
                    <Text 
                        size="2.5rem" 
                        fw={900} 
                        ta="center"
                        style={{ 
                            color: rank === 1 ? 'var(--mantine-color-gold-5)' : 'var(--mantine-color-blue-5)',
                            lineHeight: 1
                        }}
                    >
                        #{rank || '?'}
                    </Text>
                </div>

                <div>
                    <Group gap="xs" mb="xs">
                        <Star size={24} className={classes.pointsIcon} />
                        <Text size="xl" fw={700} className={classes.pointsText}>
                            {points.toLocaleString()}
                        </Text>
                        <Text size="sm" c="dimmed">
                            points
                        </Text>
                    </Group>
                    
                    {rank === 1 ? (
                        <Badge size="lg" color="gold" variant="filled">
                            👑 You're in 1st place!
                        </Badge>
                    ) : (
                        <Text size="sm" c="dimmed">
                            Compete to be #1!
                        </Text>
                    )}
                </div>
            </Group>
        </div>
    );
};
