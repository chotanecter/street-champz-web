# S.K.A.T.E. Challenge — New Game Mode Spec

**Repo:** `chotanecter/street-champz-web`
**Stack anchors:** React 19 · Vite · Mantine UI v8 · Wouter · Framer Motion · SurrealDB · WebSockets · REST under `/api`
**Author:** drafted for Master
**Status:** proposal / v0.1

---

## 1. Summary

A new long-form, asynchronous game mode called **S.K.A.T.E. Challenge**. Unlike the existing real-time lobby gameplay, this mode runs as a *contest*: an admin picks a featured professional skater, uploads five trick videos (one per letter of S‑K‑A‑T‑E), opens a 2–4 week submission window, and sets a panel of judges. Players reproduce all five tricks on video. Once all five clips are submitted, the player's entry becomes public on the contest page, where the community can upvote. At the end of the window, the admin-appointed judges pick winners and sponsor prizes are distributed.

**Launch contest:** *Stuffed Toy Challenge* — presented by **CannabisHouse**. Prize: an exclusive stuffed toy. Featured skater: **Stevie Williams**.

---

## 2. Goals & Non-Goals

**Goals**
- Add an async, content-driven game mode that lives alongside the existing real-time lobby.
- Give admins (Master) a simple tool to spin up sponsored contests with a featured pro and a judging panel.
- Create a public "contest detail" surface that drives viewership, upvotes, and social shareability.
- Make the first contest (CannabisHouse × Stevie Williams) feel like a flagship launch event.

**Non-Goals (v1)**
- Automated trick validation / CV scoring. Judges decide.
- Monetary payouts from the app itself. Sponsor delivers the prize off-platform; app tracks winner + contact handoff.
- Live streaming. Submissions are uploaded clips only.

---

## 3. User Roles

| Role | Capabilities |
| --- | --- |
| **Admin (Master)** | Create/edit/close contests, upload featured-skater trick videos, set window length, assign judges, assign sponsor, pick winners, feature submissions. |
| **Judge** | Read-only access to all completed submissions in a contest; score/rank during the judging phase; submit final picks. |
| **Player** | Join a contest, upload clips for each of the 5 tricks, submit once all 5 are filmed, view/upvote others' entries after their own is submitted (or after the window closes — see §8). |
| **Viewer (guest/public)** | View the contest detail page, watch the featured skater's tricks, browse submissions, upvote after sign-in. |

Permissions live on the `user.role` field (`"admin" | "judge" | "player"`). Judge role is per-contest, stored on the contest record, not globally on the user.

---

## 4. Core Flows

### 4.1 Admin creates a contest
1. Admin opens `/admin` → new tab **Contests** → **New Contest**.
2. Wizard (3 steps, Mantine `Stepper`):
   - **Step 1 — Basics:** title, slug, sponsor (name, logo upload, link), hero image, description (rich text), prize description (e.g. "Free Weed for a Year from CannabisHouse").
   - **Step 2 — Featured Skater & Tricks:** pick or create skater profile (name, bio, avatar, socials). Upload 5 videos, one per letter S / K / A / T / E. Each trick has: label, optional trick name ("Nollie Heelflip"), difficulty tag, optional notes.
   - **Step 3 — Window & Judging:** start date, end date (system enforces 14–28 days), submissions close date, judging phase length (default 3 days), pick judges (multi-select user search), winner count (default 1, up to 5).
3. Admin hits **Publish** → contest goes live at `start_at`. Pre-publish it sits in `draft`.

### 4.2 Player submits
1. Player visits `/contests/:slug`, sees the featured skater's 5 trick videos in order.
2. Hits **Enter Challenge** (auth-gated). Creates a private `submission` row in `draft` state.
3. Player's own contest page now shows 5 upload slots (S, K, A, T, E). Each slot accepts a single video upload. Slots can be replaced freely until submission is final.
4. When all 5 slots are filled, the **Submit Entry** button activates. Confirming flips the submission to `submitted`, locks the videos, and makes the entry publicly visible on the contest detail page.
5. Players get an achievement ("First SKATE Entry") and XP via the existing progression system.

### 4.3 Public upvotes & browses
- The contest detail page lists all `submitted` entries in a responsive grid (reuse `GameCard` variant).
- Each entry card: player avatar/name, "plays all 5" button (opens a stitched player modal), upvote count, upvote button, submitted-at, optional comment.
- Upvote is one-per-user-per-entry, toggleable. Upvotes contribute a social score displayed next to judge score.

### 4.4 Judging & winners
1. When `submissions_close_at` passes, the contest enters `judging` state. Upload slots lock for everyone.
2. Judges access `/contests/:slug/judge` (gated by `contest.judges` membership). They see an entry list with a private scorecard:
   - Trick-by-trick stars (1–5) for each of S/K/A/T/E
   - Style bonus (0–10)
   - Comments (private to admin + other judges)
3. Judges **submit final scorecard** once. Once all judges submit (or deadline hits), the admin sees an aggregate leaderboard.
4. Admin selects winners (can override the leaderboard), hits **Announce Winners**. Contest flips to `complete`, winner banner goes live on the contest page, losing entries stay visible for replay value.

---

## 5. Data Model (SurrealDB)

New tables. Field naming follows the existing `user.xp`, `user.coins` convention in `ARCHITECTURE.md`.

```sql
-- featured skater catalog (reusable across contests)
DEFINE TABLE skater SCHEMAFULL;
DEFINE FIELD name        ON skater TYPE string;
DEFINE FIELD slug        ON skater TYPE string;
DEFINE FIELD bio         ON skater TYPE string;
DEFINE FIELD avatar_url  ON skater TYPE string;
DEFINE FIELD socials     ON skater TYPE object; -- {instagram, youtube, ...}
DEFINE FIELD created_by  ON skater TYPE record(user);
DEFINE FIELD created_at  ON skater TYPE datetime VALUE time::now();

-- sponsor records
DEFINE TABLE sponsor SCHEMAFULL;
DEFINE FIELD name       ON sponsor TYPE string;
DEFINE FIELD logo_url   ON sponsor TYPE string;
DEFINE FIELD website    ON sponsor TYPE string;
DEFINE FIELD contact    ON sponsor TYPE string;  -- for prize handoff

-- the contest itself
DEFINE TABLE contest SCHEMAFULL;
DEFINE FIELD title              ON contest TYPE string;
DEFINE FIELD slug               ON contest TYPE string;
DEFINE FIELD description        ON contest TYPE string;
DEFINE FIELD hero_image_url     ON contest TYPE string;
DEFINE FIELD prize_description  ON contest TYPE string;
DEFINE FIELD sponsor            ON contest TYPE record(sponsor);
DEFINE FIELD featured_skater    ON contest TYPE record(skater);
DEFINE FIELD tricks             ON contest TYPE array; -- ordered [S,K,A,T,E]
-- each element: { letter, trick_name, difficulty, video_url, thumbnail_url, notes }
DEFINE FIELD start_at           ON contest TYPE datetime;
DEFINE FIELD submissions_close_at ON contest TYPE datetime;
DEFINE FIELD judging_close_at   ON contest TYPE datetime;
DEFINE FIELD status             ON contest TYPE string
    ASSERT $value INSIDE ["draft","scheduled","live","judging","complete","archived"];
DEFINE FIELD judges             ON contest TYPE array; -- array<record(user)>
DEFINE FIELD winner_count       ON contest TYPE int DEFAULT 1;
DEFINE FIELD winners            ON contest TYPE array DEFAULT []; -- array<record(submission)>
DEFINE FIELD created_by         ON contest TYPE record(user);
DEFINE FIELD created_at         ON contest TYPE datetime VALUE time::now();

-- player submissions
DEFINE TABLE submission SCHEMAFULL;
DEFINE FIELD contest      ON submission TYPE record(contest);
DEFINE FIELD player       ON submission TYPE record(user);
DEFINE FIELD clips        ON submission TYPE object;
-- clips shape: { S:{video_url,thumbnail_url,duration}, K:{...}, A:{...}, T:{...}, E:{...} }
DEFINE FIELD status       ON submission TYPE string
    ASSERT $value INSIDE ["draft","submitted","disqualified","winner"];
DEFINE FIELD submitted_at ON submission TYPE datetime;
DEFINE FIELD upvote_count ON submission TYPE int DEFAULT 0;
DEFINE FIELD judge_score  ON submission TYPE float DEFAULT 0; -- aggregated
DEFINE FIELD comment      ON submission TYPE string;

DEFINE INDEX uniq_player_contest ON submission COLUMNS contest, player UNIQUE;

-- upvotes (thin join)
DEFINE TABLE upvote SCHEMAFULL;
DEFINE FIELD submission ON upvote TYPE record(submission);
DEFINE FIELD user       ON upvote TYPE record(user);
DEFINE FIELD created_at ON upvote TYPE datetime VALUE time::now();
DEFINE INDEX uniq_upvote ON upvote COLUMNS submission, user UNIQUE;

-- judge scorecards
DEFINE TABLE scorecard SCHEMAFULL;
DEFINE FIELD submission ON scorecard TYPE record(submission);
DEFINE FIELD judge      ON scorecard TYPE record(user);
DEFINE FIELD scores     ON scorecard TYPE object; -- {S:1-5, K:1-5, A:1-5, T:1-5, E:1-5, style:0-10}
DEFINE FIELD total      ON scorecard TYPE float;  -- computed on write
DEFINE FIELD comment    ON scorecard TYPE string;
DEFINE FIELD submitted_at ON scorecard TYPE datetime;
DEFINE INDEX uniq_scorecard ON scorecard COLUMNS submission, judge UNIQUE;
```

Existing `user` gains one optional field: `skater_profile` (link to `skater` record) so pros can have a claimed account.

---

## 6. API Surface

Add under `/api/contests/*`. All POST/PATCH/DELETE are server-validated; the admin write surface mirrors `ARCHITECTURE.md`'s security posture.

```
GET    /api/contests                         # list live + upcoming
GET    /api/contests/:slug                   # full contest record + featured tricks
GET    /api/contests/:slug/submissions       # paginated, only `submitted` entries
POST   /api/contests/:slug/enter             # player creates draft submission
POST   /api/contests/:slug/clips/:letter     # multipart upload, returns {video_url, thumbnail_url}
POST   /api/contests/:slug/submit            # finalize: validates 5 clips present, flips to submitted
POST   /api/submissions/:id/upvote           # toggle upvote
DELETE /api/submissions/:id/upvote

# admin
POST   /api/admin/contests                   # create (draft)
PATCH  /api/admin/contests/:id               # update
POST   /api/admin/contests/:id/publish
POST   /api/admin/contests/:id/close-submissions
POST   /api/admin/contests/:id/announce-winners  { winners: [submission_id,...] }
POST   /api/admin/skaters                    # create featured skater
POST   /api/admin/sponsors                   # create sponsor

# judging
GET    /api/contests/:slug/judging           # judge-gated list of submissions
POST   /api/submissions/:id/scorecard        # judge submits scorecard
GET    /api/contests/:slug/leaderboard       # admin-gated aggregate of all scorecards
```

Video upload: use a signed URL pattern against the existing media backend (if there isn't one, v1 can proxy through the Node API with multipart → disk → CDN). Cap per-clip length at 45s, max 100 MB, re-encode to h264/webm on upload.

---

## 7. Frontend Changes

### 7.1 New routes (Wouter)
```
/contests                       # index, grid of live + upcoming contests
/contests/:slug                 # public contest detail page
/contests/:slug/enter           # auth-gated player submission workspace
/contests/:slug/judge           # judge workspace (gated)
/admin/contests                 # admin list + create
/admin/contests/:id             # admin edit/publish/announce
```

Add to `src/app/routes/contests/` following the existing `game/` and `main/` patterns.

### 7.2 New module: `src/app/contests/`
```
src/app/contests/
├── ContestsContext.tsx         # list + cache + realtime updates
├── hooks/
│   ├── useContest.ts
│   ├── useSubmission.ts
│   └── useJudging.ts
├── components/
│   ├── ContestHeroCard.tsx     # sponsor ribbon, countdown, CTA
│   ├── TrickReel.tsx           # S/K/A/T/E video row
│   ├── SubmissionGrid.tsx      # upvote-sorted grid
│   ├── SubmissionCard.tsx      # reuses GameCard variant
│   ├── UploadSlot.tsx          # per-letter upload
│   ├── ScorecardForm.tsx       # judge tool
│   └── WinnerBanner.tsx
└── index.ts
```

### 7.3 Design system hooks
- Reuse the `Gold` palette for the upvote/score badge, `Premium` for sponsor ribbon, `Success` for winner banner, `Blue` as base.
- `TrickReel` uses `Framer Motion` staggered `fadeInUp` for the five cards.
- Winner announcement triggers `celebrateVictory()` from `src/utils/confetti.ts`.
- Add a new animation variant `flipCardIn` for revealing completed submissions.
- Add icons from `lucide-react`: `Video`, `Trophy`, `ThumbsUp`, `Gavel`, `Clock`.

### 7.4 Notifications
Hook into the existing `src/app/notifications/` context:
- "Contest {title} is now live" (at `start_at`)
- "48 hours left to submit" (T-minus 48h)
- "Your entry is live on the leaderboard" (on submit)
- "Judging begins" / "Winners announced"

### 7.5 Admin UI additions
Add a **Contests** tab in `src/app/routes/admin/admin.tsx` alongside existing tabs. It reuses the admin's existing `Table` + `Modal` + `TextInput` pattern. Wizard modal becomes a `Stepper` inside a `Modal.Root`.

---

## 8. Submission visibility rules

Two options — pick one and lock it in:

- **Option A (recommended):** Entries become public **the moment a player submits all 5 clips**, so the grid fills up over the window and builds hype. Upvote war runs in parallel with submissions + submissions. Chosen for the spec below.

- **Option B:** Entries stay hidden until `submissions_close_at`, then all revealed at once. Creates a "big reveal" moment but no rolling hype. Simpler to moderate.

(Recommendation: Option A. It matches "once they submit their submission is visible under the contest details" from your original brief.)

---

## 9. Moderation & anti-abuse

- All uploaded clips run through a content scan before being made public. Draft state while pending.
- Admin has a **Disqualify** action on each submission (sets `status = disqualified`, hides from public grid, frees the unique (contest,player) index so player can re-enter if allowed).
- Upvote manipulation: 1 upvote per user per submission, tracked by user id + device fingerprint; suspiciously fast rate triggers shadow decay.
- Rate limit uploads: 3 uploads per slot per 10 minutes.
- Judges can't upvote in contests they're judging.
- Admin can't be a judge in their own contest (enforced server-side).

---

## 10. Launch contest config — *Stuffed Toy Challenge*

```json
{
  "title": "Stuffed Toy Challenge",
  "slug": "stuffed-toy-challenge",
  "status": "draft",
  "sponsor": {
    "name": "CannabisHouse",
    "logo_url": "TBD — upload via admin",
    "website": "TBD"
  },
  "prize_description": "Exclusive limited-edition stuffed toy from CannabisHouse, shipped to the winner.",
  "featured_skater": {
    "name": "Stevie Williams",
    "bio": "Legendary Philly-born street skater. DGK founder.",
    "avatar_url": "TBD"
  },
  "tricks": [
    { "letter": "S", "trick_name": "TBD", "video_url": "TBD" },
    { "letter": "K", "trick_name": "TBD", "video_url": "TBD" },
    { "letter": "A", "trick_name": "TBD", "video_url": "TBD" },
    { "letter": "T", "trick_name": "TBD", "video_url": "TBD" },
    { "letter": "E", "trick_name": "TBD", "video_url": "TBD" }
  ],
  "window_days": 21,
  "judging_days": 3,
  "judges": ["Master (you) + 2–4 TBD"],
  "winner_count": 1
}
```

Open questions on the launch:
- Who are the other judges besides you?
- How many stuffed toys — one grand-prize winner, or runner-ups too?
- Is the stuffed toy a one-off collectible or a production run CannabisHouse is branding?
- Shipping: CannabisHouse handles fulfillment directly, or does the app collect a shipping address from the winner and pass it over?
- Do you want the featured tricks filmed exclusively for the launch, or licensed from existing Stevie Williams footage?

---

## 11. Phased rollout

**Phase 1 — Scaffolding (1 week)**
- Tables, API stubs (draft/publish only), admin contest wizard, no uploads (mocked URLs), public contest detail page with placeholder grid.

**Phase 2 — Player submission (1 week)**
- Real video upload, per-letter slots, submission finalization, public reveal, notifications.

**Phase 3 — Judging + winners (1 week)**
- Judge workspace, scorecards, admin leaderboard + announcement flow, winner banner + confetti.

**Phase 4 — Polish (ongoing)**
- Upvote leaderboard tiebreaker, moderation queue, email digests, sponsor analytics export, age/geo gate for the launch contest.

**Phase 5 — Launch event**
- Film Stevie Williams' 5 tricks → upload → publish contest → social push.

---

## 12. Open product questions for Master

1. **Visibility:** lock in Option A (rolling reveal) vs Option B (big reveal at close)?
2. **Judging weight vs upvotes:** is judge score the *only* deciding factor, or does upvote count contribute (e.g. 80/20)?
3. **Judge panel composition:** how many judges per contest, and can they be non-admins? Do judges get a dedicated role screen or is it just a URL?
4. **Player re-entry:** if a player gets disqualified, can they re-submit in the same contest?
5. **Geo/age gate for CannabisHouse launch:** who owns setting this up?
6. **Winner handoff:** how does CannabisHouse actually deliver the prize — app collects shipping from winner, or just hands off contact info?
7. **Tie-breakers:** if two entries have identical judge scores, does the upvote count decide? Or does admin manually break ties?

---

## 12a. Resolved defaults (v0.2)

Default answers to §12 questions — override any of these if you disagree:

1. **Visibility:** Option A — rolling reveal the moment a player submits all 5 clips.
2. **Judging vs upvotes:** Judges decide. Upvotes are a social signal and a tiebreaker only (if judge scores tie, higher upvote count wins; if still tied, earlier `submitted_at` wins).
3. **Judge panel:** 3 judges per contest (odd number = no ties on majority calls). Master is automatic seat 1. Non-admins can be judges. They access a gated `/contests/:slug/judge` page — no separate role dashboard in v1.
4. **Player re-entry after disqualification:** Disallowed in v1. Keeps moderation simple; can be relaxed later via a `can_reenter` flag on the contest.
5. **Launch winner count:** 1 grand-prize winner for the Stuffed Toy Challenge.
6. **Shipping / fulfillment:** App collects shipping address from the winner via a one-time private form after winner announcement, then surfaces it to the admin for handoff to CannabisHouse. Address is stored encrypted, never shown on the public winner banner.
7. **Tie-breakers:** Covered in (2) — upvote count first, then submission timestamp.

These are now baked into the scaffolding in §13.

## 13. Next steps

1. Master answers §12.
2. I open a PR adding `src/app/contests/` scaffolding + admin Contests tab stub + SurrealDB migration file + API route stubs (no video upload yet).
3. Second PR wires upload + public reveal.
4. Third PR adds judging + winner announcement, then we schedule the Stevie Williams shoot and launch.
