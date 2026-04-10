import { useState } from "react";
import { Modal, Stack, Text, Button, Group, Stepper, ScrollArea } from "@mantine/core";
import { Gamepad2, Trophy, Star, Crown, ShoppingBag } from "lucide-react";
import { celebratePoints } from "../utils/confetti";
import classes from "./OnboardingModal.module.css";

interface OnboardingModalProps {
  opened: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ opened, onClose, onComplete }: OnboardingModalProps) {
  const [active, setActive] = useState(0);

  const handleComplete = () => {
    celebratePoints();
    onComplete();
    onClose();
  };

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Welcome to Street Champz!"
      size="xl"
      closeOnClickOutside={false}
      closeOnEscape={false}
      scrollAreaComponent={ScrollArea.Autosize}
      styles={{ body: { padding: 'var(--mantine-spacing-sm)' } }}
    >
      <Stack gap="lg">
        <Stepper active={active} onStepClick={setActive}>
          <Stepper.Step label="Welcome" description="Get started">
            <Stack gap="md" align="center" py="md">
              <div className={classes.icon}>
                <Gamepad2 size={48} />
              </div>
              <Text size="xl" fw={700} ta="center">
                Welcome to Street Champz!
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Master the game of S.K.A.T.E., compete with players worldwide, and become a legend on the streets!
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Earn Points" description="Compete">
            <Stack gap="md" align="center" py="md">
              <div className={classes.icon}>
                <Crown size={48} />
              </div>
              <Text size="xl" fw={700} ta="center">
                Compete for #1!
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Every season (3 months), compete to have the most points! The player at the top of the leaderboard wins a special prize. Earn points by playing games, completing missions, and checking in daily.
              </Text>
              <Group gap="lg" mt="md">
                <div className={classes.statBox}>
                  <Text size="sm" c="dimmed">
                    Season Prize
                  </Text>
                  <Group gap="xs">
                    <Trophy size={20} color="var(--mantine-color-gold-5)" />
                    <Text size="xl" fw={700} c="var(--mantine-color-gold-5)">
                      #1 Wins!
                    </Text>
                  </Group>
                </div>
              </Group>
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Shop & Earn" description="More points">
            <Stack gap="md" align="center" py="md">
              <div className={classes.icon}>
                <ShoppingBag size={48} />
              </div>
              <Text size="xl" fw={700} ta="center">
                Shop Merch, Earn Points!
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Get extra points when you purchase official Street Champz merchandise. Shirts, hoodies, and accessories all help you climb the leaderboard!
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Get Started" description="Claim bonus">
            <Stack gap="md" align="center" py="md">
              <div className={classes.icon}>
                <Trophy size={48} />
              </div>
              <Text size="xl" fw={700} ta="center">
                You're All Set!
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Here's a starter bonus to get you going. Good luck out there, champ!
              </Text>
              <div className={classes.bonusBox}>
                <Text size="lg" fw={700}>
                  Starter Bonus
                </Text>
                <Group gap="md" justify="center" mt="sm">
                  <Group gap="xs">
                    <Star size={24} color="var(--mantine-color-gold-5)" fill="var(--mantine-color-gold-5)" />
                    <Text size="xl" fw={700} c="var(--mantine-color-gold-5)">
                      +1,000 points
                    </Text>
                  </Group>
                </Group>
              </div>
            </Stack>
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between" mt="xl">
          <Button variant="default" onClick={prevStep} disabled={active === 0}>
            Back
          </Button>
          {active === 3 ? (
            <Button onClick={handleComplete} color="gold" size="lg">
              Claim Bonus & Start Playing!
            </Button>
          ) : (
            <Button onClick={nextStep}>Next</Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
