import { Button, Group, Stack, TextInput, Anchor } from "@mantine/core";

interface SignInProps {
    onComplete?: (token: string) => void;
    onForgotPassword?: () => void;
}

export function SignIn(props: SignInProps) {
    return (
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();

            const data = new FormData(e.target as HTMLFormElement);
            const identity = data.get("identity")?.toString().trim();
            const password = data.get("password")?.toString().trim();

            if (identity === undefined || password === undefined || identity.length === 0 || password.length === 0) {
                return alert("Please complete all fields of the form");
            }

            fetch(import.meta.env["VITE_API_BASE"] + "/auth/signin", {
                method: "POST",
                body: JSON.stringify({
                    identity,
                    password
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.status !== 200) {
                        return alert("Incorrect credentials");
                    }

                    response.text().then(token => props.onComplete?.(token));
                });
        }}>
            <Stack>
                <Stack>
                    <TextInput
                        name="identity"
                        placeholder="Username or email"
                        autoFocus
                    />

                    <TextInput
                        type="password"
                        name="password"
                        placeholder="Password"
                    />

                    <Anchor
                        size="sm"
                        onClick={props.onForgotPassword}
                        style={{ alignSelf: "flex-start" }}
                    >
                        Forgot password?
                    </Anchor>
                </Stack>

                <Group justify="end">
                    <Button
                        type="submit"
                    >
                        Go!
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}