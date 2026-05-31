// server/src/routes/checkin.ts
// The core game endpoints (per CHECKIN_BACKEND_HANDOFF.md):
//   POST   /check-in          tap/GPS check-in, returns nearby skaters
//   DELETE /check-in          check out
//   GET    /check-in/nearby   refresh nearby list (60s poll)
//   POST   /check-in/spot     NFC sticker tap at a curated spot (+points)
//   GET    /check-in/recent   global recent check-ins feed (real users)

import { Router } from "express";
import { requireAuth } from "../auth.js";
import { getDb, query } from "../db.js";

export const checkinRouter = Router();

const RADIUS_M = 1609.34; // 1 mile
const POINTS_SPOT = 250;

function validCoords(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" && typeof lng === "number" &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  );
}

// ── POST /check-in ────────────────────────────────────────────────────
checkinRouter.post("/check-in", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { lat, lng, spot_label } = req.body ?? {};
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "lat and lng are required" });
  }
  if (!validCoords(lat, lng)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    const db = await getDb();
    // Ghost prevention — displacement: wipe an existing check-in if it's >1mi away.
    const existing = await query<Array<{ location: { coordinates: [number, number] } }>>(
      `SELECT location FROM check_ins WHERE user_id = $u LIMIT 1`,
      { u: userId },
    );
    if (existing?.[0]?.location) {
      const dist = await query<number[]>(
        `RETURN geo::distance($a, { type: "Point", coordinates: [$lng, $lat] })`,
        { a: existing[0].location, lat, lng },
      );
      if ((dist?.[0] ?? 0) > RADIUS_M) {
        await query(`DELETE check_ins WHERE user_id = $u`, { u: userId });
      }
    }

    // Upsert the check-in (UNIQUE index on user_id keeps it to one).
    await query(
      `INSERT INTO check_ins {
         user_id: $u,
         location: { type: "Point", coordinates: [$lng, $lat] },
         checked_in_at: time::now(),
         spot_label: $label,
         method: 'gps'
       } ON DUPLICATE KEY UPDATE
         location = { type: "Point", coordinates: [$lng, $lat] },
         checked_in_at = time::now(),
         spot_label = $label`,
      { u: userId, lat, lng, label: spot_label ?? null },
    );

    const nearby = await nearbySkaters(lat, lng, userId);
    res.json({ success: true, nearbySkaters: nearby });
  } catch (e) {
    console.error("[check-in] failed", e);
    res.status(500).json({ error: "Check-in failed" });
  }
});

// ── DELETE /check-in ──────────────────────────────────────────────────
checkinRouter.delete("/check-in", requireAuth, async (req, res) => {
  try {
    await query(`DELETE check_ins WHERE user_id = $u`, { u: req.user!.id });
    res.json({ success: true });
  } catch (e) {
    console.error("[check-out] failed", e);
    res.status(500).json({ error: "Check-out failed" });
  }
});

// ── GET /check-in/nearby ──────────────────────────────────────────────
checkinRouter.get("/check-in/nearby", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  try {
    const mine = await query<Array<{
      location: { coordinates: [number, number] };
      checked_in_at: string;
      spot_label: string | null;
    }>>(`SELECT location, checked_in_at, spot_label FROM check_ins WHERE user_id = $u LIMIT 1`, { u: userId });
    if (!mine?.[0]) return res.json({ isCheckedIn: false, nearbySkaters: [] });

    const [lng, lat] = mine[0].location.coordinates;
    const nearby = await nearbySkaters(lat, lng, userId);
    res.json({
      isCheckedIn: true,
      myCheckIn: { location: { lat, lng }, checked_in_at: mine[0].checked_in_at, spot_label: mine[0].spot_label },
      nearbySkaters: nearby,
    });
  } catch (e) {
    console.error("[nearby] failed", e);
    res.status(500).json({ error: "Could not load nearby" });
  }
});

// ── POST /check-in/spot ───────────────────────────────────────────────
// NFC sticker tap at a curated spot → award points, log history.
checkinRouter.post("/check-in/spot", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { spotId, spotName, city, lat, lng } = req.body ?? {};
  if (!spotId) return res.status(400).json({ error: "spotId is required" });

  try {
    // One scoring check-in per spot per calendar day.
    const today = await query<Array<{ count: number }>>(
      `SELECT count() AS count FROM spot_checkin
       WHERE user_id = $u AND spot_id = $s
         AND created_at > time::floor(time::now(), 1d) GROUP ALL`,
      { u: userId, s: spotId },
    );
    const already = (today?.[0]?.count ?? 0) > 0;

    if (!already) {
      await query(
        `CREATE spot_checkin SET
           user_id = $u, spot_id = $s, spot_name = $name, city = $city,
           created_at = time::now(), points = $pts`,
        { u: userId, s: spotId, name: spotName ?? null, city: city ?? null, pts: POINTS_SPOT },
      );
      await query(`UPDATE $u SET points += $pts`, { u: userId, pts: POINTS_SPOT });
      // also drop a presence check-in if coords were sent
      if (validCoords(lat, lng)) {
        await query(
          `INSERT INTO check_ins {
             user_id: $u, location: { type: "Point", coordinates: [$lng, $lat] },
             checked_in_at: time::now(), spot_label: $name, spot_id: $s, method: 'nfc'
           } ON DUPLICATE KEY UPDATE
             location = { type: "Point", coordinates: [$lng, $lat] },
             checked_in_at = time::now(), spot_label = $name, spot_id = $s, method = 'nfc'`,
          { u: userId, lat, lng, name: spotName ?? null, s: spotId },
        );
      }
    }

    res.json({ success: true, alreadyToday: already, pointsEarned: already ? 0 : POINTS_SPOT });
  } catch (e) {
    console.error("[spot check-in] failed", e);
    res.status(500).json({ error: "Spot check-in failed" });
  }
});

// ── GET /check-in/recent ──────────────────────────────────────────────
// Global recent check-ins feed of REAL users (no fake data).
checkinRouter.get("/check-in/recent", requireAuth, async (_req, res) => {
  try {
    const rows = await query<Array<Record<string, unknown>>>(
      `SELECT user_id.username AS username, spot_name, city, created_at
       FROM spot_checkin ORDER BY created_at DESC LIMIT 20`,
    );
    res.json({ feed: rows ?? [] });
  } catch (e) {
    console.error("[recent] failed", e);
    res.status(500).json({ error: "Could not load feed" });
  }
});

// ── helper: nearby skaters within 1mi, last 2h, excluding me ──────────
async function nearbySkaters(lat: number, lng: number, userId: string) {
  const rows = await query<Array<Record<string, unknown>>>(
    `SELECT
       user_id.id        AS userId,
       user_id.username  AS username,
       user_id.hasAvatar AS hasAvatar,
       geo::distance(location, { type: "Point", coordinates: [$lng, $lat] }) AS distanceMeters,
       checked_in_at,
       spot_label
     FROM check_ins
     WHERE geo::distance(location, { type: "Point", coordinates: [$lng, $lat] }) <= ${RADIUS_M}
       AND checked_in_at > time::now() - 2h
       AND user_id != $u
     ORDER BY distanceMeters ASC`,
    { lat, lng, u: userId },
  );
  return rows ?? [];
}
