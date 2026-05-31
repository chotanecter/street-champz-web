# StreetChampz API (Phase 2 backend)

Node + Express + SurrealDB. Lives in `/server`, deployed **separately** from the
Vite frontend (the frontend already points at `VITE_API_BASE`, e.g. a Railway host).

## What's built (this slice)

**Check-in / nearby — the core game (priority):**
- `POST /check-in` — GPS check-in; ghost-prevention displacement wipe; returns nearby skaters
- `DELETE /check-in` — check out
- `GET /check-in/nearby` — refresh nearby (1 mi / last 2 h), for the 60 s poll
- `POST /check-in/spot` — NFC sticker tap at a curated spot → +250 pts, once/day/spot, logged
- `GET /check-in/recent` — global recent-check-ins feed of **real** users

**Users / avatars / leaderboard (fixes the missing pics):**
- `GET /users/:id/avatar` — what the frontend `UserAvatar` already calls
- `PUT /users/me/avatar` — save your avatar
- `GET /leaderboard` — top players by points (+`hasAvatar`)

`GET /health` for platform health checks.

## Auth

Bearer JWT on every request (`Authorization: Bearer <token>`), matching the
frontend's existing pattern. `JWT_SECRET` must match whatever issues the tokens.
> Note: signup/login isn't in this slice — it assumes tokens already exist (the
> app stores one at `localStorage["token"]`). Auth issuance is the next slice.

## Run locally

```bash
# 1) start SurrealDB (Docker)
docker run --rm -p 8000:8000 surrealdb/surrealdb:latest \
  start --user root --pass root memory

# 2) the API
cd server
cp .env.example .env      # edit if needed
npm install
npm run migrate           # apply schema.surql
npm run dev               # http://localhost:3000/health
```

The frontend dev server proxies `/api` → `localhost:3000` (see `vite.config.ts`).

## Deploy to Railway

1. New Railway service from this repo, **root directory = `server`**.
2. Add a **SurrealDB** instance (Railway template or external) and set env vars:
   `SURREAL_URL`, `SURREAL_NS`, `SURREAL_DB`, `SURREAL_USER`, `SURREAL_PASS`,
   `JWT_SECRET`, `CORS_ORIGINS=https://streetchampz.com`.
3. Build: `npm install && npm run build` · Start: `npm run start`.
4. Run `npm run migrate` once (Railway one-off command or a release step).
5. Point the frontend's `VITE_API_BASE` at the service URL and redeploy.

## Schema

See `src/schema.surql` — `user`, `check_ins` (one active per user, geo-indexed),
and `spot_checkin` (history for the feed + passport).

## Not yet in this slice (next steps)

- Auth issuance (signup/login/JWT minting)
- Games, contests, missions, teams, social endpoints (frontend still falls back to
  mock for those)
- NTAG424 CMAC signature verification on `/check-in/spot` (currently trusts the tap)
- Object storage for avatars/clips instead of base64 in the DB
