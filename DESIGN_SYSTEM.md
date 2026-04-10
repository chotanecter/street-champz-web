# Street Champz Design System

## 🎨 Color Palette

### Primary Colors
- **Blue** (`blue`) - Primary actions, links, main CTAs
  - Use for: Play buttons, primary navigation, default actions
  - Shade 5 (`#0091FF`) is the main brand color

- **Gold** (`gold`) - Currency, rewards, coins
  - Use for: Coin displays, shop items, purchase buttons
  - Shade 5 (`#F59E0B`) for coins and currency

- **Success** (`success`) - Wins, achievements, positive feedback
  - Use for: Victory screens, completed missions, success states
  - Shade 5 (`#10B981`) for win indicators

- **Premium** (`premium`) - VIP features, special content, upgrades
  - Use for: Premium shop items, VIP badges, exclusive features
  - Shade 6 (`#A855F7`) for premium highlights

### Surface Colors
- **Slate** - Cards, backgrounds, surfaces
  - Shade 8 (`#1d293d`) - Card backgrounds
  - Shade 9 (`#0f172b`) - Page backgrounds

## 🧩 Components

### GameCard
Elevated card component with variants for different contexts.

**When to use:**
- Game lobby listings
- Profile sections
- Content containers
- Feature highlights

**Variants:**
- `default` - Standard card, use for most content
- `gradient` - Enhanced card with blue accent, use for active/selected states
- `premium` - Special styling with glow, use for VIP/premium content

**Example:**
\`\`\`tsx
<GameCard variant="gradient">
  <Text>Your content here</Text>
</GameCard>
\`\`\`

---

### CurrencyDisplay
Shows coins or gems with icon and formatted number.

**When to use:**
- Header balance display
- Shop pricing
- Reward amounts
- Transaction confirmations

**Types:**
- `coins` - Gold currency (earned through gameplay)
- `gems` - Premium currency (IAP)

**Sizes:**
- `sm` - Compact display (16px icon)
- `md` - Standard display (20px icon)
- `lg` - Prominent display (24px icon)

**Example:**
\`\`\`tsx
<CurrencyDisplay type="coins" amount={1250} size="md" />
<CurrencyDisplay type="gems" amount={450} size="lg" showLabel />
\`\`\`

---

### RewardCard
Interactive card for rewards, achievements, and missions.

**When to use:**
- Daily reward screens
- Achievement unlocks
- Mission tracking
- Shop bundles
- Event promotions

**Props:**
- `title` - Main heading
- `description` - Supporting text
- `icon` - Large visual icon
- `badge` - Top-right indicator (NEW, CLAIMED, progress)
- `badgeColor` - Mantine color name
- `onClick` - Click handler (triggers celebrations)

**Example:**
\`\`\`tsx
<RewardCard
  title="Daily Bonus"
  description="Claim your reward!"
  icon={<Trophy size={48} />}
  badge="NEW"
  badgeColor="success"
  onClick={() => celebrateCoins()}
/>
\`\`\`

---

## 🎬 Animations

### Pre-built Animation Variants
Located in `/src/utils/animations.ts`

**fadeInUp** - Smooth entrance from bottom
- Use for: Cards, modals, page sections
- Duration: 300ms

**popIn** - Scale up entrance
- Use for: Badges, notifications, small elements
- Duration: 300ms with backOut easing

**bounce** - Spring bounce entrance
- Use for: Rewards, achievements, celebratory content
- Duration: 500ms with spring physics

**slideInRight** - Slide from right
- Use for: Notifications, side panels, alerts
- Duration: 300ms

**Example:**
\`\`\`tsx
import { motion } from "framer-motion";
import { fadeInUp } from "@/utils/animations";

<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeInUp}
>
  <YourContent />
</motion.div>
\`\`\`

---

## 🎉 Celebrations

### Confetti Effects
Located in `/src/utils/confetti.ts`

**When to use:**
- `celebrateVictory()` - Game wins, major achievements
- `celebrateCoins()` - Currency earned, purchases
- `celebrateLevelUp()` - Level progression
- `celebrateAchievement()` - Achievement unlocks
- `celebrateSmall()` - Minor accomplishments

**Best Practices:**
- Trigger on user-initiated actions
- Don't overuse (reserve for meaningful moments)
- Pair with sound effects (when implemented)
- Consider battery/performance on mobile

**Example:**
\`\`\`tsx
import { celebrateVictory } from "@/utils/confetti";

const handleWin = () => {
  celebrateVictory();
  // Show victory screen
};
\`\`\`

---

## 🎯 Button Hierarchy

### Color Usage
1. **Primary (Blue)** - Main actions
   - "Play Now", "Start Game", "Continue"

2. **Success (Green)** - Positive confirmations
   - "Claim", "Accept", "Confirm Win"

3. **Gold** - Currency-related actions
   - "Buy", "Shop", "Purchase Coins"

4. **Premium (Purple)** - VIP/Premium actions
   - "Upgrade", "Go Premium", "Unlock VIP"

### Variants
- `filled` - Primary action (most prominent)
- `light` - Secondary action (less prominent)
- `outline` - Tertiary action (minimal)
- `subtle` - Utility action (very minimal)

---

## 📏 Spacing Scale

Use Mantine's spacing tokens:
- `xs` (8px) - Tight spacing between related elements
- `sm` (12px) - Default gap between elements
- `md` (16px) - Standard padding/margin
- `lg` (20px) - Section spacing
- `xl` (24px) - Large section breaks

---

## 🔤 Typography

### Hierarchy
- `h1` / `Title order={1}` - Page titles
- `h2` / `Title order={2}` - Section headers
- `h3` / `Title order={3}` - Subsection headers
- `Text` - Body copy, descriptions
- `Text size="sm"` - Supporting text, metadata

### Emphasis
- `fw={700}` - Bold for emphasis
- `fw={600}` - Semi-bold for headers
- `c="dimmed"` - De-emphasized text
- `ta="center"` - Centered for cards/modals

---

## 🎮 Game-Specific Patterns

### Player Status
- Show online status with green indicator
- Use `<Indicator />` from Mantine
- Animate with pulse for notifications

### Game States
- **LOBBY**: Blue/neutral colors, waiting state
- **ACTIVE**: Vibrant colors, animations
- **VICTORY**: Green + confetti
- **DEFEAT**: Subtle, respectful feedback (no red/harsh)

### Leaderboard
- Top 3 get special treatment (gold, silver, bronze)
- Highlight current player position
- Use rank badges for tiers

### Currency & Economy
- Always show icons with amounts
- Format large numbers (1,250 not 1250)
- Animate increases/decreases
- Green for gains, subtle for losses

---

## ♿ Accessibility

### Required Practices
- All buttons need `aria-label` if icon-only
- Interactive elements need keyboard support
- Color contrast meets WCAG AA
- Motion can be reduced via `prefers-reduced-motion`

### Focus States
- All interactive elements show focus ring
- Mantine handles this by default
- Don't remove focus styles

---

## 📱 Responsive Design

### Breakpoints
- Mobile first approach
- Use Mantine's responsive props
- `cols={{ base: 1, sm: 2, md: 3 }}`

### Touch Targets
- Minimum 44px × 44px for mobile
- Add padding for comfortable tapping
- Consider thumb zones on mobile

---

## 🚀 Performance

### Animation Performance
- Use `transform` and `opacity` only
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Consider `prefers-reduced-motion`

### Component Best Practices
- Lazy load heavy components
- Memoize expensive calculations
- Virtualize long lists
- Optimize images (WebP, lazy loading)

---

## 📦 Component File Structure

\`\`\`
src/
  components/
    ComponentName/
      ComponentName.tsx       # Component logic
      ComponentName.module.css # Component styles
      index.ts               # Export
    index.ts                 # Barrel export all components
\`\`\`

---

## 🎨 Adding New Components

1. **Create component in `/src/components/`**
2. **Use existing design tokens** (colors, spacing)
3. **Add to theme test page** for showcase
4. **Document usage** in this guide
5. **Export from** `/src/components/index.ts`

---

## 🔄 Future Enhancements

### Planned
- [ ] Sound effects system
- [ ] Haptic feedback (mobile)
- [ ] Avatar system components
- [ ] Team/clan components
- [ ] Shop bundle cards
- [ ] Profile customization UI
- [ ] Daily rewards modal
- [ ] Mission tracker component

---

## 📚 Resources

- [Mantine Documentation](https://mantine.dev)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)
- Canvas Confetti for celebrations

