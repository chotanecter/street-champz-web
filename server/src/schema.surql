-- StreetChampz SurrealDB schema (Phase 2)
-- Run via `npm run migrate`. Idempotent: safe to run repeatedly.

-- ── Users ─────────────────────────────────────────────────────────────
DEFINE TABLE user SCHEMALESS PERMISSIONS NONE;
DEFINE FIELD username   ON TABLE user TYPE string;
DEFINE FIELD avatar     ON TABLE user TYPE option<string>;   -- base64 data URL (Phase 2; object storage later)
DEFINE FIELD hasAvatar  ON TABLE user TYPE bool DEFAULT false;
DEFINE FIELD points     ON TABLE user TYPE number DEFAULT 0;
DEFINE FIELD role       ON TABLE user TYPE string DEFAULT 'user';
DEFINE FIELD country     ON TABLE user TYPE option<string>;
DEFINE FIELD countryCode ON TABLE user TYPE option<string>;
DEFINE FIELD city        ON TABLE user TYPE option<string>;
DEFINE INDEX user_username ON TABLE user FIELDS username UNIQUE;

-- ── Check-ins (presence + spot) ───────────────────────────────────────
-- One active check-in per user, enforced by the UNIQUE index.
DEFINE TABLE check_ins SCHEMALESS PERMISSIONS NONE;
DEFINE FIELD user_id       ON TABLE check_ins TYPE record<user>;
DEFINE FIELD location      ON TABLE check_ins TYPE geometry<point>;  -- GeoJSON [lng, lat]
DEFINE FIELD checked_in_at ON TABLE check_ins TYPE datetime;
DEFINE FIELD spot_label    ON TABLE check_ins TYPE option<string>;
DEFINE FIELD spot_id       ON TABLE check_ins TYPE option<string>;   -- curated spot id, when tapped at a sticker
DEFINE FIELD method        ON TABLE check_ins TYPE string DEFAULT 'gps';  -- 'gps' | 'nfc'
DEFINE INDEX check_ins_user_unique ON TABLE check_ins FIELDS user_id UNIQUE;
DEFINE INDEX check_ins_location    ON TABLE check_ins FIELDS location;

-- ── Spot check-in log (history, for the recent feed + passport) ────────
DEFINE TABLE spot_checkin SCHEMALESS PERMISSIONS NONE;
DEFINE FIELD user_id     ON TABLE spot_checkin TYPE record<user>;
DEFINE FIELD spot_id     ON TABLE spot_checkin TYPE string;
DEFINE FIELD spot_name   ON TABLE spot_checkin TYPE option<string>;
DEFINE FIELD city        ON TABLE spot_checkin TYPE option<string>;
DEFINE FIELD created_at  ON TABLE spot_checkin TYPE datetime DEFAULT time::now();
DEFINE FIELD points      ON TABLE spot_checkin TYPE number DEFAULT 0;
DEFINE INDEX spot_checkin_user ON TABLE spot_checkin FIELDS user_id;
DEFINE INDEX spot_checkin_spot ON TABLE spot_checkin FIELDS spot_id;
