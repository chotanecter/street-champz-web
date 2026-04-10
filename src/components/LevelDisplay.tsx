import { Badge, Progress, Stack, Text, Tooltip } from "@mantine/core";
import classes from "./LevelDisplay.module.css";

interface LevelDisplayProps {
    level: number;
    xp: number;
    xpForNextLevel: number;
    showProgress?: boolean;
    size?: "sm" | "md" | "lg";
}

export const LevelDisplay = ({ 
    level, 
    xp, 
    xpForNextLevel,
    showProgress = false,
    size = "md" 
}: LevelDisplayProps) => {
    const progressPercent = Math.floor((xp / xpForNextLevel) * 100);
    const badgeSize = size === "sm" ? "md" : size === "md" ? "lg" : "xl";

    if (showProgress) {
        return (
            <Stack gap="xs" className={classes.container}>
                <Badge 
                    size={badgeSize}
                    variant="filled" 
                    color="blue"
                    className={classes.badge}
                >
                    LVL {level}
                </Badge>
                <Progress 
                    value={progressPercent} 
                    size="sm"
                    color="blue"
                    className={classes.progress}
                />
                <Text size="xs" c="dimmed" ta="center">
                    {xp}/{xpForNextLevel} XP
                </Text>
            </Stack>
        );
    }

    return (
        <Tooltip 
            label={`${xp}/${xpForNextLevel} XP (${progressPercent}%)`}
            position="bottom"
        >
            <Badge 
                size={badgeSize}
                variant="gradient" 
                gradient={{ from: "blue", to: "cyan", deg: 90 }}
                className={classes.badge}
            >
                LVL {level}
            </Badge>
        </Tooltip>
    );
};

