# Production Architecture Guide

## Current State (Demo/Local)
The current implementation uses LocalStorage for rapid prototyping and demo purposes. This works great locally but is **NOT production-ready**.

## Production Migration Path

### 1. Database Schema Extensions Needed

Add to the `user` table in SurrealDB:

```sql
-- User progression and economy
DEFINE FIELD coins ON TABLE user TYPE int DEFAULT 500;
DEFINE FIELD gems ON TABLE user TYPE int DEFAULT 50;
DEFINE FIELD level ON TABLE user TYPE int DEFAULT 1;
DEFINE FIELD xp ON TABLE user TYPE int DEFAULT 0;

-- Daily rewards tracking
DEFINE FIELD daily_streak ON TABLE user TYPE int DEFAULT 0;
DEFINE FIELD last_daily_claim ON TABLE user TYPE datetime;

-- Mission/quest tracking
DEFINE FIELD missions ON TABLE user TYPE array DEFAULT [];
DEFINE FIELD achievements ON TABLE user TYPE array DEFAULT [];

-- Game stats
DEFINE FIELD total_games ON TABLE user TYPE int DEFAULT 0;
DEFINE FIELD total_wins ON TABLE user TYPE int DEFAULT 0;
```

### 2. API Endpoints to Add

```typescript
// Economy endpoints
GET  /api/user/economy - Get coins/gems balance
POST /api/user/economy/coins - Add/subtract coins (server validates)
POST /api/user/economy/gems - Add/subtract gems (server validates)

// Progression endpoints  
GET  /api/user/progression - Get level/XP
POST /api/user/progression/xp - Add XP (server validates & levels up)

// Daily rewards
GET  /api/user/daily-rewards - Get daily reward status
POST /api/user/daily-rewards/claim - Claim daily reward (server validates timing)

// Missions/Achievements
GET  /api/user/missions - Get active missions with progress
POST /api/user/missions/:id/progress - Update mission progress
GET  /api/user/achievements - Get achievement status
```

### 3. Client-Side Changes Needed

**Replace LocalStorage with API calls:**

```typescript
// ❌ Current (LocalStorage)
localStorage.setItem('coins', coins.toString());

// ✅ Production (API)
await fetch('/api/user/economy/coins', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount: 100, reason: 'game_win' })
});
```

**Add server validation:**
- Game wins verified by server before awarding coins/XP
- Daily rewards timing checked server-side
- Mission progress validated against actual game events

**Add optimistic updates:**
- Update UI immediately for smooth UX
- Revert if server rejects
- Show loading states

### 4. Security Considerations

**Server-side validation for all rewards:**
```typescript
// Server checks game actually ended and user won
if (!gameExists || !userWon) {
  return res.status(400).json({ error: 'Invalid game win' });
}

// Apply rewards
await db.query(`
  UPDATE user:${userId} SET 
    coins += 100,
    xp += 50,
    total_wins += 1
`);
```

**Rate limiting:**
- Prevent spam claiming
- Limit mission progress updates
- Cap daily API calls per user

**Anti-cheat:**
- Server tracks all transactions
- Audit log for coin/gem changes
- Detect impossible progression speeds

### 5. Migration Strategy

**Phase 1: Add database fields (backend team)**
- Extend user table schema
- Create migration script
- Backfill existing users

**Phase 2: Add API endpoints (backend team)**
- Implement endpoints with validation
- Add tests
- Deploy to staging

**Phase 3: Update frontend (can do now)**
- Create API service layer
- Add error handling
- Implement retry logic
- Keep LocalStorage as fallback during transition

**Phase 4: Testing & Rollout**
- Test with real users in staging
- Monitor for issues
- Gradual rollout with feature flags
- Keep old system as backup

### 6. Environment Configuration

```typescript
// config.ts
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const USE_LOCAL_STORAGE = IS_DEVELOPMENT && 
  import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

// In production, always use API
export const SHOULD_USE_API = !USE_LOCAL_STORAGE;
```

### 7. Cross-Device Sync

With backend storage:
- User logs in on phone → sees same progress
- User plays on desktop → progress syncs
- Consistent experience across devices

### 8. Analytics & Monitoring

Add tracking for:
- Daily active users (DAU)
- Daily reward claim rate
- Average session length
- Coin/gem economy balance
- Mission completion rates
- Level progression curve

## Recommended Next Steps

1. **Share this architecture doc with backend team**
2. **Get their input on database schema**
3. **Plan sprint for API implementation**
4. **Create abstraction layer in frontend now** (so UI changes work for demo, easy to swap to API later)
5. **Add feature flags for gradual rollout**

## Code Organization

```
web/src/
├── services/
│   ├── api/          # API client layer
│   │   ├── economy.ts
│   │   ├── progression.ts
│   │   └── rewards.ts
│   └── storage/      # LocalStorage fallback (dev only)
│       └── local.ts
├── hooks/            # React hooks that use services
│   ├── useEconomy.ts
│   ├── useProgression.ts
│   └── useRewards.ts
└── contexts/         # Context providers
    ├── EconomyContext.tsx
    ├── ProgressionContext.tsx
    └── RewardsContext.tsx
```

This separation allows easy swapping between LocalStorage (demo) and API (production).

