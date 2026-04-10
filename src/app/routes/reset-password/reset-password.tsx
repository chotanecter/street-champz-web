import { Center, Paper, Title, Button, Group, Stack, TextInput, Text } from "@mantine/core";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import classes from "./reset-password.module.css";

export function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string>("");
    const [_, navigate] = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resetToken = params.get("token");

        if (!resetToken) {
            alert("Invalid reset link");
            navigate("/");
        } else {
            setToken(resetToken);
        }
    }, []);

    if (!token) {
        return null;
    }

    return (
        <Center h="100vh" style={{ background: "var(--mantine-color-dark-9)" }}>
            <Paper className={classes.root}>
                <img
                    className={classes.logo}
                    src="/logo.png"
                    alt="Street Champz"
                />

                <Title order={3} mb="md">
                    Reset Password
                </Title>

                <form onSubmit={async e => {
                    e.preventDefault();
                    e.stopPropagation();

                    const data = new FormData(e.target as HTMLFormElement);
                    const password = data.get("password")?.toString().trim();
                    const confirmPassword = data.get("confirmPassword")?.toString().trim();

                    if (!password || password.length === 0) {
                        return alert("Please enter a new password");
                    }

                    if (password.length < 6) {
                        return alert("Password must be at least 6 characters");
                    }

                    if (password !== confirmPassword) {
                        return alert("Passwords do not match");
                    }

                    setLoading(true);

                    try {
                        const response = await fetch(import.meta.env["VITE_API_BASE"] + "/auth/reset-password", {
                            method: "POST",
                            body: JSON.stringify({
                                token,
                                password
                            }),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });

                        if (response.ok) {
                            alert("Password reset successful! You can now sign in with your new password.");
                            navigate("/");
                        } else {
                            const message = await response.text();
                            alert(message || "Failed to reset password. The link may be invalid or expired.");
                        }
                    } catch (error) {
                        alert("Failed to reset password. Please try again.");
                    } finally {
                        setLoading(false);
                    }
                }}>
                    <Stack>
                        <Stack gap="xs">
                            <Text size="sm" c="dimmed">
                                Enter your new password below.
                            </Text>

                            <TextInput
                                name="password"
                                type="password"
                                placeholder="New password"
                                autoFocus
                                disabled={loading}
                            />

                            <TextInput
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                disabled={loading}
                            />
                        </Stack>

                        <Group justify="end">
                            <Button type="submit" loading={loading}>
                                Reset Password
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Center>
    );
}
