# Production Readiness Checklist

## ⚠️ Critical Items Before Production

### 1. Backend Integration Required

#### Database Schema
All user progression data currently in LocalStorage must move to database:

```sql
-- Add to existing user table
ALTER TABLE user ADD coins INT DEFAULT 500;
ALTER TABLE user ADD gems INT DEFAULT 50;
ALTER TABLE user ADD level INT DEFAULT 1;
ALTER TABLE user ADD xp INT DEFAULT 0;
ALTER TABLE user ADD daily_streak INT DEFAULT 0;
ALTER TABLE user ADD last_daily_claim DATETIME;
ALTER TABLE user ADD total_games INT DEFAULT 0;
ALTER TABLE user ADD total_wins INT DEFAULT 0;
```

#### API Endpoints to Implement

**Economy:**
- `GET /api/user/economy` - Get user's coins/gems
- `POST /api/user/economy/award` - Award currency (server validates source)
- `POST /api/user/economy/spend` - Spend currency (server validates)

**Progression:**
- `GET /api/user/progression` - Get level/XP
- `POST /api/user/progression/award-xp` - Award XP (server validates)

**Daily Rewards:**
- `GET /api/user/daily-rewards/status` - Check if can claim
- `POST /api/user/daily-rewards/claim` - Claim (server validates timing)

**Game Integration:**
- Modify game end endpoint to award coins/XP automatically
- Server verifies game outcome before awarding

### 2. Security Fixes

#### Current Issues
- ❌ LocalStorage can be manipulated (users can give themselves infinite coins)
- ❌ No server validation on rewards
- ❌ No rate limiting
- ❌ No audit trail

#### Required Fixes
- ✅ All currency changes must go through API
- ✅ Server validates all game outcomes
- ✅ Add rate limiting (max 100 requests/minute per user)
- ✅ Log all transactions for audit
- ✅ Add anti-cheat detection (flag impossible progression)

### 3. Code Changes Needed

#### Remove Development-Only Features
Current code has dev tools that should NOT be in production:

```typescript
// File: web/src/app/routes/main/profile/profile.tsx
// Lines with manual currency/XP buttons - already gated by ENV.enableDevTools ✅

// File: web/src/app/routes/main/theme-test.tsx  
// Entire file is for testing - should not be accessible in production
// Consider removing route or adding authentication check
```

#### Replace LocalStorage with API Calls

**Current (Development):**
```typescript
// economy/context.tsx
localStorage.setItem('coins', coins.toString());
```

**Production:**
```typescript
// Create service layer
// web/src/services/api/economy.ts
export async function updateCoins(amount: number, reason: string) {
  const response = await fetch('/api/user/economy/award', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount, reason })
  });
  
  if (!response.ok) throw new Error('Failed to update coins');
  return response.json();
}

// Use in context
const addCoins = async (amount: number, reason: string) => {
  try {
    const newBalance = await economyAPI.updateCoins(amount, reason);
    setCoins(newBalance.coins); // Update from server response
  } catch (error) {
    // Handle error, maybe show notification
    notifications.show({
      title: 'Error',
      message: 'Failed to update coins',
      color: 'red'
    });
  }
};
```

### 4. Testing Requirements

#### Load Testing
- Test with 1000+ concurrent users
- Verify database can handle transaction load
- Check API response times under load

#### Security Testing
- Attempt to manipulate client-side data
- Test rate limiting
- Verify JWT token validation
- Check for SQL injection vulnerabilities

#### Integration Testing
- Test full game flow: play → win → receive rewards
- Test daily rewards across timezone changes
- Test level up with exact XP thresholds
- Test streak reset after 48 hours

### 5. Monitoring & Analytics

#### Required Metrics
- Daily Active Users (DAU)
- Average coins earned per day
- Average gems earned per day
- Daily reward claim rate
- Level distribution (how many users at each level)
- Churn rate (users who stop claiming daily rewards)

#### Alerts to Set Up
- Unusual coin/gem spikes (possible exploit)
- API error rate > 5%
- Database query time > 500ms
- Failed authentication rate > 10%

### 6. Feature Flags

Implement gradual rollout:

```typescript
// config/features.ts
export const FEATURES = {
  dailyRewards: {
    enabled: getFeatureFlag('daily_rewards', true),
    rolloutPercentage: 100 // Start at 10%, increase to 100%
  },
  missions: {
    enabled: getFeatureFlag('missions', false), // Not ready yet
    rolloutPercentage: 0
  }
};
```

### 7. Data Migration

When moving from dev to production:

1. **Don't migrate LocalStorage data** - it's test data
2. **Start all users fresh** with default values (500 coins, 50 gems, level 1)
3. **Backfill existing users** if they already exist in database
4. **Announce new features** to users

### 8. Performance Optimization

#### Current Issues
- Every coin change triggers localStorage write
- No debouncing on frequent updates
- No caching of user data

#### Optimizations
```typescript
// Batch updates
const pendingUpdates = useRef([]);

const addCoins = (amount: number) => {
  // Update UI immediately (optimistic)
  setCoins(prev => prev + amount);
  
  // Queue server update
  pendingUpdates.current.push({ type: 'coins', amount });
  
  // Debounce actual API call
  debouncedSyncWithServer();
};
```

### 9. Error Handling

Add proper error handling:

```typescript
try {
  await claimDailyReward();
} catch (error) {
  if (error.code === 'ALREADY_CLAIMED') {
    // User already claimed today
    notifications.show({ message: 'Already claimed today!' });
  } else if (error.code === 'TOO_SOON') {
    // Not 20 hours yet
    notifications.show({ message: 'Come back later!' });
  } else {
    // Unexpected error
    logToSentry(error);
    notifications.show({ message: 'Something went wrong' });
  }
}
```

### 10. Documentation for Backend Team

Create these docs:
- API endpoint specifications (request/response formats)
- Database schema changes needed
- Expected validation logic for each endpoint
- Rate limiting requirements
- Error codes and messages
- Test cases for each endpoint

---

## Quick Migration Steps

For the backend team to implement:

1. **Week 1**: Add database fields, create migrations
2. **Week 2**: Implement API endpoints with tests
3. **Week 3**: Frontend team updates contexts to use API
4. **Week 4**: Integration testing in staging
5. **Week 5**: Gradual rollout to production (10% → 50% → 100%)

## Current Status

✅ UI/UX complete and polished
✅ All features working locally
✅ Code is organized and documented
⚠️ Using LocalStorage (dev only)
❌ No backend integration yet
❌ No server validation
❌ Not production-ready

**Estimated effort to make production-ready**: 2-3 weeks with backend + frontend team

## Files That Need Changes

**High Priority:**
- `web/src/app/economy/context.tsx` - Replace localStorage with API
- `web/src/app/progression/context.tsx` - Replace localStorage with API
- `web/src/app/rewards/context.tsx` - Replace localStorage with API
- `web/src/app/routes/game/game.tsx` - Award rewards through API

**Medium Priority:**
- Add `web/src/services/api/` folder with API clients
- Add error boundaries
- Add loading states
- Add retry logic

**Low Priority:**
- Performance optimizations
- Analytics integration
- Feature flags

---

**Bottom Line**: The UI is production-quality, but the data layer needs backend integration before real users can use it.

