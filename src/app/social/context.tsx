import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "../auth/context";
import { useMyNotifications } from "../notifications/context";
import { notifications } from "@mantine/notifications";
import { apiFetch } from "../../config/env";

// TODO: Migrate notifications to backend for production.
// Friend requests and friend list are now fully backed by the API.

export interface Notification {
  id: string;
  type: "friend_request" | "game_invite" | "achievement" | "team_invite" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionData?: any;
}

export interface Friend {
  id: string;
  userId?: string;
  username: string;
  level: number;
  online: boolean;
  lastSeen?: string;
  hasAvatar?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  timestamp: string;
}

interface SocialContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;

  friends: Friend[];
  friendRequests: FriendRequest[];
  sendFriendRequest: (username: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
}

const SocialContext = createContext<SocialContextValue | undefined>(undefined);

const NOTIFICATIONS_KEY = "street-champz-notifications";

// Sample notifications for demo
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "achievement",
    title: "Achievement Unlocked! 🎮",
    message: "You unlocked 'First Steps'",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-2",
    type: "system",
    title: "Welcome to Street Champz!",
    message: "Start playing to earn coins and level up",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export function SocialProvider({ children }: { children: ReactNode }) {
  const { id: userId } = useAuth();
  const { subscribe } = useMyNotifications();

  const [notificationsList, setNotificationsList] = useState<Notification[]>(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  // Persist notifications to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notificationsList));
  }, [notificationsList]);

  // Load friends and friend requests from API on mount
  useEffect(() => {
    if (!userId) return;

    const loadFriends = async () => {
      try {
        const res = await apiFetch("/friends");
        if (res.ok) {
          const data = await res.json();
          setFriends(data.friends || []);
        }
      } catch (err) {
        console.error("Failed to load friends:", err);
      }
    };

    const loadFriendRequests = async () => {
      try {
        const res = await apiFetch("/friends/requests");
        if (res.ok) {
          const data = await res.json();
          setFriendRequests(data.requests || []);
        }
      } catch (err) {
        console.error("Failed to load friend requests:", err);
      }
    };

    loadFriends();
    loadFriendRequests();
  }, [userId]);

  // SSE: listen for incoming friend requests
  useEffect(() => {
    const unsub = subscribe("FRIEND_REQUEST", (data: { requestId: string; fromUsername: string; fromUserId: string }) => {
      setFriendRequests(prev => {
        if (prev.some(r => r.id === data.requestId)) return prev;
        return [{
          id: data.requestId,
          fromUserId: data.fromUserId,
          fromUsername: data.fromUsername,
          timestamp: new Date().toISOString()
        }, ...prev];
      });

      addNotification({
        type: "friend_request",
        title: "New Friend Request 👥",
        message: `${data.fromUsername} sent you a friend request`,
      });
    });

    return unsub;
  }, [subscribe]);

  // SSE: listen for accepted friend requests
  useEffect(() => {
    const unsub = subscribe("FRIEND_ACCEPTED", (_data: { byUsername: string }) => {
      // Refresh friends list
      apiFetch("/friends").then(res => {
        if (res.ok) res.json().then(data => setFriends(data.friends || []));
      });

      addNotification({
        type: "system",
        title: "Friend Request Accepted! 🎉",
        message: `${_data.byUsername} accepted your friend request`,
      });
    });

    return unsub;
  }, [subscribe]);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (notificationId: string) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotificationsList((prev) => [newNotification, ...prev]);
  };

  const sendFriendRequest = async (username: string): Promise<boolean> => {
    try {
      const res = await apiFetch("/friends/request", {
        method: "POST",
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        return true;
      }

      const err = await res.json().catch(() => ({}));
      const code = err?.code;

      if (code === "ALREADY_FRIENDS") {
        notifications.show({ title: "Already Friends", message: `You're already friends with ${username}`, color: "yellow" });
      } else if (code === "REQUEST_EXISTS") {
        notifications.show({ title: "Request Already Sent", message: `Friend request to ${username} is pending`, color: "yellow" });
      } else if (code === "USER_NOT_FOUND") {
        notifications.show({ title: "User Not Found", message: `No user named "${username}" exists`, color: "red" });
      } else if (code === "CANNOT_ADD_SELF") {
        notifications.show({ title: "That's you!", message: "You can't add yourself as a friend", color: "yellow" });
      } else {
        notifications.show({ title: "Error", message: err?.error || "Failed to send friend request", color: "red" });
      }

      return false;
    } catch (err) {
      console.error("Send friend request error:", err);
      notifications.show({ title: "Error", message: "Failed to send friend request", color: "red" });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const request = friendRequests.find((r) => r.id === requestId);
    try {
      const res = await apiFetch("/friends/accept", {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
        // Refresh friends
        apiFetch("/friends").then(r => {
          if (r.ok) r.json().then(data => setFriends(data.friends || []));
        });

        if (request) {
          notifications.show({ title: "Friend Added! 🎉", message: `You're now friends with ${request.fromUsername}`, color: "green" });
          addNotification({ type: "system", title: "New Friend", message: `${request.fromUsername} is now your friend` });
        }
      } else {
        notifications.show({ title: "Error", message: "Failed to accept friend request", color: "red" });
      }
    } catch (err) {
      console.error("Accept friend request error:", err);
      notifications.show({ title: "Error", message: "Failed to accept friend request", color: "red" });
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const res = await apiFetch("/friends/reject", {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
        notifications.show({ title: "Request Rejected", message: "Friend request declined", color: "gray" });
      } else {
        notifications.show({ title: "Error", message: "Failed to reject friend request", color: "red" });
      }
    } catch (err) {
      console.error("Reject friend request error:", err);
    }
  };

  const removeFriend = async (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    try {
      const res = await apiFetch(`/friends/${friendId}`, { method: "DELETE" });

      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
        if (friend) {
          notifications.show({ title: "Friend Removed", message: `${friend.username} has been removed from your friends`, color: "gray" });
        }
      } else {
        notifications.show({ title: "Error", message: "Failed to remove friend", color: "red" });
      }
    } catch (err) {
      console.error("Remove friend error:", err);
    }
  };

  return (
    <SocialContext.Provider
      value={{
        notifications: notificationsList,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        addNotification,
        friends,
        friendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error("useSocial must be used within SocialProvider");
  }
  return context;
}
