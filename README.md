# Street Champz - Web Frontend

Modern, gamified skateboarding game interface built with React, Vite, and Mantine UI.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ (currently on 20.18.0, upgrade recommended)
- npm or bun

### Development
\`\`\`bash
# Install dependencies
npm install

# Start dev server
VITE_API_BASE=/api npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

### Environment Variables
- `VITE_API_BASE` - API endpoint (use `/api` for local dev with proxy)

## 🏗️ Project Structure

\`\`\`
web/
├── src/
│   ├── app/                    # Main app routes & logic
│   │   ├── auth/              # Authentication context & components
│   │   ├── notifications/     # Notification system
│   │   └── routes/            # Page routes
│   │       ├── game/          # Game play screen
│   │       └── main/          # Main app (lobby, leaderboard, profile)
│   ├── components/            # Reusable UI components
│   │   ├── GameCard.tsx       # Enhanced card variants
│   │   ├── CurrencyDisplay.tsx # Coin/gem display
│   │   └── RewardCard.tsx     # Reward/achievement cards
│   ├── utils/                 # Utility functions
│   │   ├── animations.ts      # Framer Motion variants
│   │   └── confetti.ts        # Celebration effects
│   ├── globals.css            # Global styles
│   └── main.tsx               # App entry point
├── public/                    # Static assets
├── DESIGN_SYSTEM.md          # Design system documentation
└── package.json
\`\`\`

## 🎨 Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete documentation on:
- Color palette & usage
- Component library
- Animation patterns
- Typography & spacing
- Accessibility guidelines

## 🧩 Key Technologies

- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **Mantine UI v8** - Component library
- **Framer Motion** - Animation library
- **Wouter** - Lightweight routing
- **Lucide React** - Icon library
- **Canvas Confetti** - Celebration effects
- **CSS Modules** - Scoped styling

## 🎮 Features

### Implemented
- ✅ User authentication (sign up/sign in)
- ✅ Real-time game lobby
- ✅ WebSocket-based gameplay
- ✅ Player invitations
- ✅ Leaderboard (points-based)
- ✅ Gamified UI components
- ✅ Animation system
- ✅ Celebration effects

### In Progress
- 🔨 Virtual economy (coins/gems)
- 🔨 Profile customization
- 🔨 Achievement system
- 🔨 Daily rewards
- 🔨 Team/clan system

## 🎯 Development Workflow

### Adding New Features
1. Create components in `/src/components/`
2. Use design system colors & patterns
3. Add animations for polish
4. Test in theme test page first
5. Integrate into main app

### Testing Components
Visit `/theme-test` route to see all components and test interactions without authentication.

### Code Style
- TypeScript strict mode
- CSS Modules for styling
- Functional components with hooks
- Early returns for readability
- Descriptive variable names

## 🔧 Configuration

### Vite Proxy
The dev server proxies `/api/*` requests to `http://localhost:3000` (backend API).

See `vite.config.ts`:
\`\`\`typescript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
      ws: true,
      rewrite: path => path.replace(/^\/api/, "")
    }
  }
}
\`\`\`

### Theme Configuration
Mantine theme is configured in `src/app/app.tsx` with custom color palettes:
- Blue (primary)
- Gold (currency)
- Success (wins)
- Premium (VIP)
- Slate (surfaces)

## 🎨 Component Usage Examples

### GameCard
\`\`\`tsx
import { GameCard } from "@/components";

<GameCard variant="gradient">
  <Text>Enhanced card with blue accent</Text>
</GameCard>
\`\`\`

### CurrencyDisplay
\`\`\`tsx
import { CurrencyDisplay } from "@/components";

<CurrencyDisplay type="coins" amount={1250} size="md" />
\`\`\`

### RewardCard
\`\`\`tsx
import { RewardCard } from "@/components";
import { Trophy } from "lucide-react";

<RewardCard
  title="Daily Bonus"
  description="Claim your reward!"
  icon={<Trophy size={48} />}
  badge="NEW"
  onClick={handleClaim}
/>
\`\`\`

### Animations
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

### Celebrations
\`\`\`tsx
import { celebrateVictory } from "@/utils/confetti";

const handleWin = () => {
  celebrateVictory(); // Trigger confetti
  // Show victory screen
};
\`\`\`

## 🐛 Troubleshooting

### Port Already in Use
\`\`\`bash
# Kill existing Vite processes
pkill -f "vite"
\`\`\`

### Module Not Found Errors
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Hot Reload Not Working
- Check that `--host` flag is present
- Verify no syntax errors in components
- Check browser console for errors

## 📝 Notes

- Node.js version warning is cosmetic; app works on 20.18.0
- Theme test page (`/theme-test`) bypasses authentication for development
- All colors use Mantine's color system for consistency
- Animations use `transform` and `opacity` for performance

## 🚀 Next Steps

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) "Future Enhancements" section for planned features.

