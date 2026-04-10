import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../auth/context";

const notificationsContext = createContext<{
    subscribe: (type: string, handler: (data: any) => void) => () => void;
} | undefined>(undefined);

interface NotificationsProviderProps {
    children?: ReactNode;
}

export function NotificationsProvider(props: NotificationsProviderProps) {
    const { id } = useAuth();
    const handlers = useRef([] as { type: string, handler: (data: any) => void }[]);

    useEffect(() => {
        if (id === undefined) return;

        const subscription = new EventSource(import.meta.env["VITE_API_BASE"] + `/users/${id}/events`);

        subscription.onmessage = e => {
            if (e.data === "ping") return;

            const payload = JSON.parse(e.data);

            handlers.current
                .filter(({ type }) => type === payload.type)
                .forEach(({ handler }) => handler(payload.data));
        };

        return () => {
            subscription.close();
        };
    }, [id]);

    return (
        <notificationsContext.Provider
            value={{
                subscribe: (type, handler) => {
                    handlers.current.push({ type, handler });

                    return () => {
                        const index = handlers.current.findIndex(existingHandler => (
                            existingHandler.handler === handler
                        ));

                        if (index === -1) return;

                        handlers.current.splice(index);
                    };
                }
            }}
        >
            {props.children}
        </notificationsContext.Provider>
    );
};

export function useMyNotifications() {
    const context = useContext(notificationsContext);

    if (context === undefined) {
        throw Error("useMyNotifications() can only be used within a NotificationsProvider.");
    }

    return context;
};