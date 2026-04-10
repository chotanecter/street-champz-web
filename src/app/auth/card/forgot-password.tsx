import { Button, Group, Stack, TextInput, Text } from "@mantine/core";
import { useState } from "react";

interface ForgotPasswordProps {
    onBack?: () => void;
}

export function ForgotPassword(props: ForgotPasswordProps) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <form onSubmit={async e => {
            e.preventDefault();
            e.stopPropagation();

            const data = new FormData(e.target as HTMLFormElement);
            const email = data.get("email")?.toString().trim();

            if (!email || email.length === 0) {
                return alert("Please enter your email address");
            }

            setLoading(true);

            try {
                const response = await fetch(import.meta.env["VITE_API_BASE"] + "/auth/forgot-password", {
                    method: "POST",
                    body: JSON.stringify({ email }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    setSubmitted(true);
                } else {
                    alert("Failed to send reset email. Please try again.");
                }
            } catch (error) {
                alert("Failed to send reset email. Please try again.");
            } finally {
                setLoading(false);
            }
        }}>
            <Stack>
                {submitted ? (
                    <Stack gap="md">
                        <Text size="sm" c="dimmed">
                            If an account exists with that email, you will receive a password reset link shortly.
                        </Text>
                        <Button onClick={props.onBack} variant="light">
                            Back to Sign In
                        </Button>
                    </Stack>
                ) : (
                    <>
                        <Stack gap="xs">
                            <Text size="sm" c="dimmed">
                                Enter your email address and we'll send you a link to reset your password.
                            </Text>
                            <TextInput
                                name="email"
                                type="email"
                                placeholder="Email address"
                                autoFocus
                                disabled={loading}
                            />
                        </Stack>

                        <Group justify="space-between">
                            <Button onClick={props.onBack} variant="subtle" disabled={loading}>
                                Back
                            </Button>
                            <Button type="submit" loading={loading}>
                                Send Reset Link
                            </Button>
                        </Group>
                    </>
                )}
            </Stack>
        </form>
    );
}
