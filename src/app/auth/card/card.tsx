import { Box, Paper, SegmentedControl, Title } from "@mantine/core";
import { useState } from "react";
import { SignIn } from "./signin";
import classes from "./card.module.css";
import { SignUp } from "./signup";
import { ForgotPassword } from "./forgot-password";

interface AuthCardProps {
    onComplete?: (token: string) => void;
}

type Mode = "signin" | "signup" | "forgot-password";

export function AuthCard(props: AuthCardProps) {
    const [mode, setMode] = useState<Mode>("signin");

    return (
        <Paper className={classes.root}>
            <img
                className={classes.logo}
                src="/logo.png"
                alt="Street Champz"
            />

            {mode === "forgot-password" ? (
                <Title order={3} mb="md">
                    Forgot Password
                </Title>
            ) : (
                <SegmentedControl
                    fullWidth
                    color="blue"
                    value={mode}
                    data={[
                        { label: "Log in", value: "signin" },
                        { label: "Sign up", value: "signup" }
                    ]}
                    onChange={value => setMode(value as "signin" | "signup")}
                />
            )}

            <Box>
                {mode === "signin" ? (
                    <SignIn
                        onComplete={token => props.onComplete?.(token)}
                        onForgotPassword={() => setMode("forgot-password")}
                    />
                ) : mode === "signup" ? (
                    <SignUp onComplete={token => props.onComplete?.(token)} />
                ) : (
                    <ForgotPassword onBack={() => setMode("signin")} />
                )}
            </Box>
        </Paper>
    );
};