import { Button, Group, Stack, TextInput, Text } from "@mantine/core";
import { useState } from "react";

interface SignUpProps {
    onComplete?: (token: string) => void;
}

export function SignUp(props: SignUpProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            setError(null);

            const data = new FormData(e.target as HTMLFormElement);
            const email = data.get("email")?.toString().trim();
            const username = data.get("username")?.toString().trim();
            const password = data.get("password")?.toString().trim();
            const confirmPassword = data.get("confirmPassword")?.toString().trim();

            if ([email, username, password, confirmPassword].includes(undefined)) {
                return setError("Please complete all fields.");
            }

            if ([email, username, password, confirmPassword].some(value => value!.length === 0)) {
                return setError("Please complete all fields.");
            }

            if (!email!.includes("@") || !email!.includes(".")) {
                return setError("Please enter a valid email address.");
            }

            if (username!.length < 3) {
                return setError("Username must be at least 3 characters.");
            }

            if (password!.length < 6) {
                return setError("Password must be at least 6 characters.");
            }

            if (confirmPassword !== password) {
                return setError("Passwords do not match.");
            }

            setLoading(true);

            fetch(import.meta.env["VITE_API_BASE"] + "/auth/signup", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    username,
                    password
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                if (!response.ok) {
                    return response.text().then(body => {
                        if (body === "EMAIL_TAKEN") {
                            setError("That email is already in use.");
                        } else if (body === "USERNAME_TAKEN") {
                            setError("That username is already taken.");
                        } else {
                            setError(body || `Server error (${response.status}). Please try again.`);
                        }
                        setLoading(false);
                    });
                }

                response.text().then(body => {
                    if (body === "EMAIL_TAKEN") {
                        setError("That email is already in use.");
                        setLoading(false);
                        return;
                    }

                    if (body === "USERNAME_TAKEN") {
                        setError("That username is already taken.");
                        setLoading(false);
                        return;
                    }

                    setLoading(false);
                    props.onComplete?.(body);
                });
            }).catch(err => {
                console.error("Signup error:", err);
                setError("Could not connect to server. Please try again.");
                setLoading(false);
            });
        }}>
            <Stack>
                <Stack>
                    <TextInput
                        name="email"
                        placeholder="Email"
                        autoFocus
                    />

                    <TextInput
                        name="username"
                        placeholder="Username"
                    />

                    <TextInput
                        type="password"
                        name="password"
                        placeholder="Password"
                    />

                    <TextInput
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                    />
                </Stack>

                {error && (
                    <Text c="red" size="sm" ta="center">
                        {error}
                    </Text>
                )}

                <Group justify="end">
                    <Button
                        type="submit"
                        loading={loading}
                    >
                        Go!
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
