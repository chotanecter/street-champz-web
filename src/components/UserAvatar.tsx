import { Avatar } from "@mantine/core";
import { useState, useEffect } from "react";
import { ENV } from "../config/env";

interface UserAvatarProps {
    userId: string;
    username: string;
    size?: number | "sm" | "md" | "lg" | "xl";
    // If you already have the base64 locally (own profile), pass it directly
    localAvatar?: string | null;
}

// Consistent color per username
function colorFromUsername(username: string): string {
    const colors = ["blue", "red", "green", "orange", "grape", "teal", "cyan", "pink", "violet", "yellow"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({ userId, username, size = "md", localAvatar }: UserAvatarProps) {
    const [avatarSrc, setAvatarSrc] = useState<string | null>(localAvatar || null);

    useEffect(() => {
        if (localAvatar !== undefined) {
            setAvatarSrc(localAvatar);
            return;
        }
        // Fetch from backend
        fetch(ENV.apiBaseUrl + "/users/" + userId + "/avatar")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.avatar) setAvatarSrc(data.avatar);
            })
            .catch(() => {});
    }, [userId, localAvatar]);

    return (
        <Avatar
            src={avatarSrc}
            size={size}
            color={colorFromUsername(username)}
            radius="xl"
        >
            {username[0]?.toUpperCase()}
        </Avatar>
    );
}
