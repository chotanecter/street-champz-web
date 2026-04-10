import { useState } from "react";
import { Title, Tabs, Stack, Group, Text, Badge, Button, TextInput, ActionIcon, Modal } from "@mantine/core";
import { Bell, Users, UserPlus, X, Check, Trash2, Search } from "lucide-react";
import { useSocial } from "../../../social/context";
import { GameCard, UserAvatar } from "../../../../components";
import classes from "./social.module.css";

export function Social() {
  const {
    notifications: notificationsList,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    friends,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useSocial();

  const [activeTab, setActiveTab] = useState<string>("notifications");
  const [friendUsername, setFriendUsername] = useState("");
  const [requestSentModal, setRequestSentModal] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!friendUsername.trim()) return;
    const target = friendUsername.trim();
    const success = await sendFriendRequest(target);
    setFriendUsername("");
    if (success) {
      setRequestSentModal(target);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return "👥";
      case "game_invite":
        return "🎮";
      case "achievement":
        return "🏆";
      case "team_invite":
        return "⚡";
      default:
        return "📢";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={classes.root}>
      <Group justify="space-between" align="center" mb="lg">
        <Title order={2}>
          <Bell size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Social
        </Title>
        {unreadCount > 0 && (
          <Badge size="lg" color="red" variant="filled">
            {unreadCount} unread
          </Badge>
        )}
      </Group>

      {/* Friend Request Sent Confirmation Modal */}
      <Modal
        opened={!!requestSentModal}
        onClose={() => setRequestSentModal(null)}
        title="Friend Request Sent! 👥"
        centered
        size="sm"
      >
        <Stack align="center" gap="md" py="md">
          <UserPlus size={48} color="var(--mantine-color-blue-5)" />
          <Text ta="center" fw={600}>
            Friend request sent to <strong>{requestSentModal}</strong>!
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            They'll get a notification when they're online.
          </Text>
          <Button fullWidth onClick={() => setRequestSentModal(null)}>
            Got it!
          </Button>
        </Stack>
      </Modal>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "notifications")}>
        <Tabs.List grow>
          <Tabs.Tab
            value="notifications"
            leftSection={<Bell size={16} />}
            rightSection={
              unreadCount > 0 ? (
                <Badge size="xs" color="red" variant="filled">
                  {unreadCount}
                </Badge>
              ) : null
            }
          >
            Notifications
          </Tabs.Tab>
          <Tabs.Tab
            value="friends"
            leftSection={<Users size={16} />}
            rightSection={
              <Badge size="xs" color="gray" variant="light">
                {friends.length}
              </Badge>
            }
          >
            Friends
          </Tabs.Tab>
          <Tabs.Tab
            value="requests"
            leftSection={<UserPlus size={16} />}
            rightSection={
              friendRequests.length > 0 ? (
                <Badge size="xs" color="blue" variant="filled">
                  {friendRequests.length}
                </Badge>
              ) : null
            }
          >
            Requests
          </Tabs.Tab>
        </Tabs.List>

        {/* Notifications Tab */}
        <Tabs.Panel value="notifications" pt="md">
          {notificationsList.length > 0 && (
            <Group justify="flex-end" mb="sm">
              <Button size="xs" variant="light" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </Group>
          )}

          <Stack gap="xs">
            {notificationsList.length === 0 ? (
              <GameCard>
                <Stack align="center" gap="md" py="xl">
                  <Bell size={48} style={{ opacity: 0.5 }} />
                  <Text size="lg" fw={600}>
                    No notifications
                  </Text>
                  <Text size="sm" c="dimmed">
                    You're all caught up!
                  </Text>
                </Stack>
              </GameCard>
            ) : (
              notificationsList.map((notification) => (
                <div
                  key={notification.id}
                  className={`${classes.notificationCard} ${!notification.read ? classes.unread : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="md" align="flex-start">
                      <div className={classes.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text fw={600} size="sm">
                          {notification.title}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {notification.message}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </div>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                    >
                      <X size={16} />
                    </ActionIcon>
                  </Group>
                </div>
              ))
            )}
          </Stack>
        </Tabs.Panel>

        {/* Friends Tab */}
        <Tabs.Panel value="friends" pt="md">
          <GameCard mb="md">
            <Group gap="xs">
              <TextInput
                placeholder="Enter username"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                leftSection={<Search size={16} />}
                style={{ flex: 1 }}
              />
              <Button onClick={handleSendRequest} leftSection={<UserPlus size={16} />}>
                Add Friend
              </Button>
            </Group>
          </GameCard>

          <Stack gap="xs">
            {friends.length === 0 ? (
              <GameCard>
                <Stack align="center" gap="md" py="xl">
                  <Users size={48} style={{ opacity: 0.5 }} />
                  <Text size="lg" fw={600}>
                    No friends yet
                  </Text>
                  <Text size="sm" c="dimmed">
                    Add friends to play together!
                  </Text>
                </Stack>
              </GameCard>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className={classes.friendCard}>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="md">
                      <div style={{ position: "relative" }}>
                        <UserAvatar userId={friend.userId || friend.id} username={friend.username} size="md" />
                        {friend.online && <div className={classes.onlineIndicator} />}
                      </div>
                      <div>
                        <Text fw={600} size="sm">
                          {friend.username}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {friend.online ? (
                            <Badge size="xs" color="green" variant="dot">
                              Online
                            </Badge>
                          ) : (
                            `Last seen ${formatTimestamp(friend.lastSeen || new Date().toISOString())}`
                          )}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge color="blue" variant="light">
                        Lv {friend.level}
                      </Badge>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => removeFriend(friend.id)}
                      >
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </div>
              ))
            )}
          </Stack>
        </Tabs.Panel>

        {/* Friend Requests Tab */}
        <Tabs.Panel value="requests" pt="md">
          <Stack gap="xs">
            {friendRequests.length === 0 ? (
              <GameCard>
                <Stack align="center" gap="md" py="xl">
                  <UserPlus size={48} style={{ opacity: 0.5 }} />
                  <Text size="lg" fw={600}>
                    No friend requests
                  </Text>
                  <Text size="sm" c="dimmed">
                    You'll see requests here
                  </Text>
                </Stack>
              </GameCard>
            ) : (
              friendRequests.map((request) => (
                <div key={request.id} className={classes.requestCard}>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="md">
                      <UserAvatar userId={request.fromUserId} username={request.fromUsername} size="md" />
                      <div>
                        <Text fw={600} size="sm">
                          {request.fromUsername}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatTimestamp(request.timestamp)}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <ActionIcon
                        variant="filled"
                        color="green"
                        onClick={() => acceptFriendRequest(request.id)}
                      >
                        <Check size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="filled"
                        color="red"
                        onClick={() => rejectFriendRequest(request.id)}
                      >
                        <X size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </div>
              ))
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
