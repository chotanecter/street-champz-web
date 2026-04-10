import { Button, Stack, Title, Text, Group, Divider, Badge, Modal, TextInput, Select, NumberInput, Textarea, FileButton, ActionIcon } from "@mantine/core";
import { useState, useRef } from "react";
import { useAuth } from "../../../auth/context";

function countryCodeToFlag(code: string | null | undefined): string {
    if (!code || code.length !== 2) return "🌍";
    return String.fromCodePoint(
        ...code.toUpperCase().split("").map(c => 0x1F1E0 + c.charCodeAt(0) - 65)
    );
}
import { useEconomy } from "../../../economy/context";
import { useRewards } from "../../../rewards/context";
import { useMissions } from "../../../missions/context";
import { useAchievements } from "../../../achievements/context";
import { useProfile } from "../../../profile/context";
import { GameCard, PointsDisplay } from "../../../../components";
import { ProfileAvatar } from "../../../../components/SkaterAvatar";
import { ENV } from "../../../../config/env";
import { Trophy, Settings, HelpCircle, Star, Crown, Edit2, Camera, X, MapPin, Clock, Zap } from "lucide-react";
import { useLocation } from "wouter";
import classes from "./profile.module.css";

export function Profile() {
    const auth = useAuth();
    const { points, addPoints, getDaysRemaining } = useEconomy();
    const { setShowDailyModal, currentStreak } = useRewards();
    const { updateMissionProgress } = useMissions();
    const { getUnlockedCount, getTotalCount, trackAchievement } = useAchievements();
    const { profile, updateProfile, uploadAvatar, removeAvatar } = useProfile();
    const [_, navigate] = useLocation();
    
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState(profile);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (file: File | null) => {
        if (!file) return;
        setAvatarError(null);
        try {
            await uploadAvatar(file);
        } catch (error) {
            setAvatarError(error instanceof Error ? error.message : "Failed to upload image");
        }
    };

    const handleSaveProfile = () => {
        updateProfile(editForm);
        setEditModalOpen(false);
    };

    const handleOpenEdit = () => {
        setEditForm(profile);
        setEditModalOpen(true);
    };

    return (
        <Stack gap="lg" p="md" className={classes.root}>
            {/* Profile Header Card */}
            <GameCard variant="gradient" className={classes.profileCard}>
                <div className={classes.profileHeader}>
                    {/* Avatar Section */}
                    <div className={classes.avatarSection}>
                        <FileButton onChange={handleAvatarChange} accept="image/*">
                            {(props) => (
                                <div className={classes.betaRing}>
                                    <div className={classes.avatarWrapper}>
                                        <ProfileAvatar 
                                            src={profile.avatar}
                                            size={120}
                                            username={auth.username || "Player"}
                                            editable
                                            onClick={props.onClick}
                                        />
                                        <ActionIcon 
                                            className={classes.cameraButton}
                                            variant="filled"
                                            color="blue"
                                            radius="xl"
                                            size="lg"
                                            {...props}
                                        >
                                            <Camera size={18} />
                                        </ActionIcon>
                                    </div>
                                </div>
                            )}
                        </FileButton>
                        {profile.avatar && (
                            <Button 
                                variant="subtle" 
                                color="red" 
                                size="xs" 
                                onClick={removeAvatar}
                                mt="xs"
                            >
                                Remove Photo
                            </Button>
                        )}
                        {avatarError && (
                            <Text size="xs" c="red" mt="xs">{avatarError}</Text>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className={classes.profileInfo}>
                        <Group justify="space-between" align="flex-start" w="100%">
                            <div>
                                <Text size="xl" fw={700} className={classes.username}>
                                    {auth.username}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {profile.bio || "Street Champz Player"}
                                </Text>
                                {auth.country && (
                                    <Text size="sm" c="dimmed" mt={2}>
                                        {countryCodeToFlag(auth.countryCode)} {auth.city ? `${auth.city}, ` : ''}{auth.country}
                                    </Text>
                                )}
                            </div>
                            <ActionIcon 
                                variant="subtle" 
                                onClick={handleOpenEdit}
                                aria-label="Edit profile"
                            >
                                <Edit2 size={18} />
                            </ActionIcon>
                        </Group>

                        {/* Quick Stats */}
                        <Group gap="lg" mt="md" wrap="wrap">
                            {profile.stance && (
                                <div className={classes.quickStat}>
                                    <Text size="xs" c="dimmed">Stance</Text>
                                    <Text size="sm" fw={600} tt="capitalize">{profile.stance}</Text>
                                </div>
                            )}
                            {profile.yearsSkating > 0 && (
                                <div className={classes.quickStat}>
                                    <Text size="xs" c="dimmed">Years Skating</Text>
                                    <Text size="sm" fw={600}>{profile.yearsSkating}</Text>
                                </div>
                            )}
                            {profile.favoriteTrick && (
                                <div className={classes.quickStat}>
                                    <Text size="xs" c="dimmed">Fav Trick</Text>
                                    <Text size="sm" fw={600}>{profile.favoriteTrick}</Text>
                                </div>
                            )}
                            {profile.favoriteSpot && (
                                <div className={classes.quickStat}>
                                    <Group gap={4}>
                                        <MapPin size={12} />
                                        <Text size="xs" c="dimmed">Spot</Text>
                                    </Group>
                                    <Text size="sm" fw={600}>{profile.favoriteSpot}</Text>
                                </div>
                            )}
                        </Group>

                        {/* Points Display */}
                        <div className={classes.pointsBadge}>
                            <PointsDisplay
                                points={points}
                                daysRemaining={getDaysRemaining()}
                                variant="compact"
                            />
                        </div>
                    </div>
                </div>
            </GameCard>

            {/* Season Competition */}
            <GameCard>
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group gap="sm">
                            <Crown size={20} color="var(--mantine-color-gold-5)" />
                            <Text fw={600}>Season Competition</Text>
                        </Group>
                        <Badge size="lg" color="blue" variant="light">
                            {getDaysRemaining()} days left
                        </Badge>
                    </Group>
                    
                    <Group gap="xs">
                        <Star size={20} color="var(--mantine-color-gold-5)" fill="var(--mantine-color-gold-5)" />
                        <Text size="xl" fw={700} c="gold.4">
                            {points.toLocaleString()}
                        </Text>
                        <Text size="sm" c="dimmed">points</Text>
                    </Group>
                    
                    <Text size="sm" c="dimmed">
                        Most points at season end wins a special prize!
                    </Text>
                    
                    <Button 
                        variant="light" 
                        color="blue" 
                        onClick={() => navigate("/leaderboard")}
                    >
                        View Leaderboard
                    </Button>
                </Stack>
            </GameCard>

            {/* Game Stats */}
            <GameCard>
                <Stack gap="md">
                    <Text fw={600}>Game Stats</Text>
                    <div className={classes.statsGrid}>
                        <div className={classes.statItem}>
                            <Text size="lg" fw={700}>0</Text>
                            <Text size="xs" c="dimmed">Total Games</Text>
                        </div>
                        <div className={classes.statItem}>
                            <Text size="lg" fw={700} c="var(--mantine-color-success-5)">0</Text>
                            <Text size="xs" c="dimmed">Wins</Text>
                        </div>
                        <div className={classes.statItem}>
                            <Text size="lg" fw={700}>0%</Text>
                            <Text size="xs" c="dimmed">Win Rate</Text>
                        </div>
                        <div className={classes.statItem}>
                            <Text size="lg" fw={700} c="var(--mantine-color-gold-5)">🔥 {currentStreak}</Text>
                            <Text size="xs" c="dimmed">Daily Streak</Text>
                        </div>
                    </div>
                </Stack>
            </GameCard>

            {/* Achievements */}
            <GameCard 
                variant="gradient"
                onClick={() => navigate("/achievements")}
                style={{ cursor: "pointer" }}
            >
                <Group justify="space-between" align="center">
                    <Group gap="md">
                        <Trophy size={32} color="var(--mantine-color-gold-5)" />
                        <div>
                            <Text fw={600}>Achievements</Text>
                            <Text size="sm" c="dimmed">View your collection</Text>
                        </div>
                    </Group>
                    <Badge size="xl" color="gold" variant="filled">
                        {getUnlockedCount()}/{getTotalCount()}
                    </Badge>
                </Group>
            </GameCard>

            {/* Settings & Help */}
            <Group grow>
                <GameCard onClick={() => navigate("/settings")} style={{ cursor: "pointer" }}>
                    <Group gap="md">
                        <Settings size={24} color="var(--mantine-color-blue-5)" />
                        <div>
                            <Text fw={600} size="sm">Settings</Text>
                            <Text size="xs" c="dimmed">Preferences</Text>
                        </div>
                    </Group>
                </GameCard>

                <GameCard onClick={() => navigate("/help")} style={{ cursor: "pointer" }}>
                    <Group gap="md">
                        <HelpCircle size={24} color="var(--mantine-color-green-5)" />
                        <div>
                            <Text fw={600} size="sm">Help & FAQ</Text>
                            <Text size="xs" c="dimmed">Get support</Text>
                        </div>
                    </Group>
                </GameCard>
            </Group>

            {/* Edit Profile Modal */}
            <Modal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Profile"
                size="md"
            >
                <Stack gap="md">
                    <Textarea
                        label="Bio"
                        placeholder="Tell us about yourself..."
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        maxLength={150}
                        autosize
                        minRows={2}
                        maxRows={4}
                    />

                    <Select
                        label="Stance"
                        placeholder="Select your stance"
                        value={editForm.stance}
                        onChange={(value) => setEditForm({ ...editForm, stance: value as "regular" | "goofy" })}
                        data={[
                            { value: "regular", label: "Regular" },
                            { value: "goofy", label: "Goofy" },
                        ]}
                    />

                    <NumberInput
                        label="Years Skating"
                        placeholder="How long have you been skating?"
                        value={editForm.yearsSkating}
                        onChange={(value) => setEditForm({ ...editForm, yearsSkating: typeof value === 'number' ? value : 0 })}
                        min={0}
                        max={50}
                    />

                    <TextInput
                        label="Favorite Trick"
                        placeholder="e.g., Kickflip, Tre Flip"
                        value={editForm.favoriteTrick}
                        onChange={(e) => setEditForm({ ...editForm, favoriteTrick: e.target.value })}
                        maxLength={30}
                    />

                    <TextInput
                        label="Favorite Spot"
                        placeholder="e.g., Local park, Downtown"
                        value={editForm.favoriteSpot}
                        onChange={(e) => setEditForm({ ...editForm, favoriteSpot: e.target.value })}
                        maxLength={50}
                        leftSection={<MapPin size={16} />}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} color="blue">
                            Save Changes
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Dev Tools */}
            {ENV.enableDevTools && (
                <>
                    <Divider label="Dev Tools (Testing Only)" />

                    <GameCard variant="default">
                        <Stack gap="md">
                            <Text fw={600} size="sm" c="dimmed">Test Points & Rewards</Text>
                            <Group>
                                <Button 
                                    onClick={() => addPoints(100, "achievement", true)}
                                    color="gold"
                                    size="sm"
                                >
                                    +100 Points
                                </Button>
                                <Button 
                                    onClick={() => addPoints(1000, "achievement", true)}
                                    color="gold"
                                    size="sm"
                                    variant="light"
                                >
                                    +1,000 Points
                                </Button>
                                <Button 
                                    onClick={() => addPoints(10000, "achievement", true)}
                                    color="gold"
                                    size="sm"
                                    variant="outline"
                                >
                                    +10,000 Points
                                </Button>
                                <Button 
                                    onClick={() => setShowDailyModal(true)}
                                    color="orange"
                                    size="sm"
                                    variant="light"
                                >
                                    📅 Daily Rewards
                                </Button>
                            </Group>
                            <Text fw={600} size="sm" c="dimmed" mt="md">Test Missions & Achievements</Text>
                            <Group>
                                <Button 
                                    onClick={() => {
                                        updateMissionProgress("daily_play_1");
                                        trackAchievement("first_game", 1);
                                        trackAchievement("games_10", 1);
                                        trackAchievement("games_50", 1);
                                        trackAchievement("games_100", 1);
                                    }}
                                    color="blue"
                                    size="sm"
                                    variant="light"
                                >
                                    +1 Game Played
                                </Button>
                                <Button 
                                    onClick={() => {
                                        updateMissionProgress("daily_win_1");
                                        trackAchievement("first_win", 1);
                                        trackAchievement("wins_5", 1);
                                        trackAchievement("wins_25", 1);
                                        trackAchievement("wins_50", 1);
                                    }}
                                    color="success"
                                    size="sm"
                                    variant="light"
                                >
                                    +1 Win
                                </Button>
                                <Button 
                                    onClick={() => {
                                        trackAchievement("points_1000", 100);
                                        trackAchievement("points_10000", 100);
                                        trackAchievement("points_50000", 100);
                                    }}
                                    color="gold"
                                    size="sm"
                                    variant="light"
                                >
                                    +100 Points Earned
                                </Button>
                            </Group>
                        </Stack>
                    </GameCard>
                </>
            )}
        </Stack>
    );
}
