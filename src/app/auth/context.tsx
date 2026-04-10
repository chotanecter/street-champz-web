import { Center, Loader } from "@mantine/core";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthCard } from "./card/card";

const authContext = createContext<{
    token?: string;
    username?: string;
    id?: string;
    country?: string | null;
    countryCode?: string | null;
    city?: string | null;
    role?: string;

    logout: () => void;
    setToken: (token: string | null) => void;
} | undefined>(undefined);

interface AuthProviderProps {
    children?: ReactNode;
}

const TOKEN_STORAGE_KEY = "token";

export function AuthProvider(props: AuthProviderProps) {
    const [token, setTokenState] = useState<string | null>();
    const [username, setUsername] = useState<string>();
    const [id, setId] = useState<string>();
    const [country, setCountry] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState<string | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [role, setRole] = useState<string | undefined>(undefined);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setTokenState(null);
        setUsername(undefined);
        setId(undefined);
        setCountry(null);
        setCountryCode(null);
        setCity(null);
        setRole(undefined);
    }, []);

    const setToken = useCallback((t: string | null) => {
        if (t === null) {
            logout();
        } else {
            setTokenState(t);
        }
    }, [logout]);

    const authenticate = async (tokenStr: string) => {
        const response = await fetch(import.meta.env["VITE_API_BASE"] + "/users/me", {
            headers: {
                "Authorization": "Bearer " + tokenStr
            }
        });

        if (response.status !== 200) {
            logout();
            return false;
        }

        const data = await response.json();
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenStr);
        setUsername(data.username);
        setId(data.id);
        setCountry(data.country || null);
        setCountryCode(data.countryCode || null);
        setCity(data.city || null);
        setRole(data.role || "user");
        setTokenState(tokenStr);

        return true;
    };

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken === null) {
            setTokenState(null);
            return;
        }
        authenticate(storedToken);
    }, []);

    return (
        <authContext.Provider
            value={{
                token: token ?? undefined,
                username,
                id,
                country,
                countryCode,
                city,
                role,
                logout,
                setToken
            }}
        >
            {token === undefined ? (
                <Center h="100%">
                    <Loader />
                </Center>
            ) : (
                token !== null ? (
                    props.children
                ) : (
                    <Center h="100dvh" style={{ overflow: "auto", padding: "16px" }}>
                        <AuthCard onComplete={tokenStr => authenticate(tokenStr)} />
                    </Center>
                )
            )}
        </authContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(authContext);

    if (context === undefined) {
        throw Error("useAuth() can only be used within an AuthProvider.");
    }

    return context;
};
