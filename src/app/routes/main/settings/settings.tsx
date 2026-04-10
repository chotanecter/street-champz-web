import { Title, Stack, Switch, Button, Group, Text, Divider, Select } from "@mantine/core";
import { Settings as SettingsIcon, Trash2, RefreshCw, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GameCard } from "../../../../components";
import { ENV } from "../../../../config/env";
import { LANGUAGES } from "../../../../i18n";
import { useAuth } from "../../../auth/context";
import classes from "./settings.module.css";

export function Settings() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
    }
  };

  const handleClearCache = () => {
    if (confirm(t("settings.clearDataConfirm"))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem("street-champz-onboarding-completed");
    window.location.reload();
  };

  return (
    <div className={classes.root}>
      <Title order={2} mb="lg">
        <SettingsIcon size={28} style={{ verticalAlign: "middle", marginRight: 8 }} />
        {t("settings.title")}
      </Title>

      <Stack gap="lg">
        {/* Audio Settings */}
        <GameCard>
          <Stack gap="md">
            <Text fw={600} size="lg">
              {t("settings.audio")}
            </Text>
            <Switch
              label={t("settings.soundEffects")}
              description={t("settings.soundEffectsDesc")}
              checked={soundEnabled}
              onChange={(event) => setSoundEnabled(event.currentTarget.checked)}
            />
            <Switch
              label={t("settings.music")}
              description={t("settings.musicDesc")}
              checked={musicEnabled}
              onChange={(event) => setMusicEnabled(event.currentTarget.checked)}
            />
          </Stack>
        </GameCard>

        {/* Notifications */}
        <GameCard>
          <Stack gap="md">
            <Text fw={600} size="lg">
              {t("settings.notifications")}
            </Text>
            <Switch
              label={t("settings.pushNotifications")}
              description={t("settings.pushNotificationsDesc")}
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.currentTarget.checked)}
            />
          </Stack>
        </GameCard>

        {/* Language */}
        <GameCard>
          <Stack gap="md">
            <Text fw={600} size="lg">
              {t("settings.language")}
            </Text>
            <Select
              label={t("settings.selectLanguage")}
              value={i18n.language}
              onChange={handleLanguageChange}
              data={LANGUAGES}
            />
          </Stack>
        </GameCard>

        {/* Dev Tools (only in development) */}
        {ENV.enableDevTools && (
          <GameCard>
            <Stack gap="md">
              <Text fw={600} size="lg" c="orange">
                {t("settings.developerTools")}
              </Text>
              <Divider />
              <Group>
                <Button
                  leftSection={<RefreshCw size={16} />}
                  variant="light"
                  color="blue"
                  onClick={handleResetOnboarding}
                >
                  {t("settings.resetOnboarding")}
                </Button>
                <Button
                  leftSection={<Trash2 size={16} />}
                  variant="light"
                  color="red"
                  onClick={handleClearCache}
                >
                  {t("settings.clearAllData")}
                </Button>
              </Group>
              <Text size="xs" c="dimmed">
                {t("settings.devToolsNote")}
              </Text>
            </Stack>
          </GameCard>
        )}

        {/* About */}
        <GameCard>
          <Stack gap="xs">
            <Text fw={600} size="lg">
              {t("settings.about")}
            </Text>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t("settings.version")}
              </Text>
              <Text size="sm">1.0.0 (Demo)</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t("settings.build")}
              </Text>
              <Text size="sm">Development</Text>
            </Group>
          </Stack>
        </GameCard>

        {/* Sign Out */}
        <GameCard>
          <Stack gap="xs">
            <Text fw={600} size="lg">Account</Text>
            <Text size="sm" c="dimmed">Sign out of your Street Champz account.</Text>
            <Button
              leftSection={<LogOut size={16} />}
              variant="light"
              color="red"
              onClick={() => auth.logout()}
            >
              Sign Out
            </Button>
          </Stack>
        </GameCard>
      </Stack>
    </div>
  );
}
