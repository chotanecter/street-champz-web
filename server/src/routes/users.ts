// server/src/routes/users.ts
// User + avatar + leaderboard endpoints. The frontend already calls:
//   GET /users/:id/avatar   (UserAvatar component — fixes leaderboard pics)
//   GET /leaderboard
//   PUT /users/me/avatar     (save own avatar)

import { Router } from "express";
import { requireAuth, optionalAuth } from "../auth.js";
import { query } from "../db.js";

export const usersRouter = Router();

// Public-ish: fetch a user's avatar by id (used across leaderboard, feeds…)
usersRouter.get("/users/:id/avatar", optionalAuth, async (req, res) => {
  const id = req.params.id.includes(":") ? req.params.id : `user:${req.params.id}`;
  try {
    const rows = await query<Array<{ avatar: string | null }>>(
      `SELECT avatar FROM ONLY $id`,
      { id },
    );
    const avatar = Array.isArray(rows) ? rows[0]?.avatar : (rows as unknown as { avatar?: string })?.avatar;
    res.json({ avatar: avatar ?? null });
  } catch {
    res.json({ avatar: null });
  }
});

// Save the signed-in user's avatar (base64 data URL in Phase 2).
usersRouter.put("/users/me/avatar", requireAuth, async (req, res) => {
  const { avatar } = req.body ?? {};
  if (typeof avatar !== "string" || !avatar.startsWith("data:")) {
    return res.status(400).json({ error: "avatar must be a data URL" });
  }
  try {
    await query(`UPDATE $u SET avatar = $a, hasAvatar = true`, { u: req.user!.id, a: avatar });
    res.json({ success: true });
  } catch (e) {
    console.error("[avatar save] failed", e);
    res.status(500).json({ error: "Could not save avatar" });
  }
});

// Leaderboard — top players by points (includes hasAvatar so the UI can fetch pics).
usersRouter.get("/leaderboard", optionalAuth, async (_req, res) => {
  try {
    const rows = await query<Array<Record<string, unknown>>>(
      `SELECT meta::id(id) AS id, username, points, hasAvatar
       FROM user ORDER BY points DESC LIMIT 100`,
    );
    const ranked = (rows ?? []).map((r, i) => ({ ...r, rank: i + 1 }));
    res.json(ranked);
  } catch (e) {
    console.error("[leaderboard] failed", e);
    res.status(500).json({ error: "Could not load leaderboard" });
  }
});
