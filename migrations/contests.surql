-- ------------------------------------------------------------------
-- S.K.A.T.E. Challenge — SurrealDB migration
-- See docs/SKATE_CHALLENGE_SPEC.md §5 for rationale.
-- Idempotent: safe to re-run.
-- ------------------------------------------------------------------

-- 1. Featured skater catalog (reusable across contests)
DEFINE TABLE skater SCHEMAFULL;
DEFINE FIELD name        ON skater TYPE string;
DEFINE FIELD slug        ON skater TYPE string;
DEFINE FIELD bio         ON skater TYPE string;
DEFINE FIELD avatar_url  ON skater TYPE string;
DEFINE FIELD socials     ON skater TYPE object;
DEFINE FIELD created_by  ON skater TYPE record(user);
DEFINE FIELD created_at  ON skater TYPE datetime VALUE time::now();
DEFINE INDEX uniq_skater_slug ON skater COLUMNS slug UNIQUE;

-- 2. Sponsor records
DEFINE TABLE sponsor SCHEMAFULL;
DEFINE FIELD name       ON sponsor TYPE string;
DEFINE FIELD logo_url   ON sponsor TYPE string;
DEFINE FIELD website    ON sponsor TYPE string;
DEFINE FIELD contact    ON sponsor TYPE string;
DEFINE FIELD created_at ON sponsor TYPE datetime VALUE time::now();

-- 3. Contest
DEFINE TABLE contest SCHEMAFULL;
DEFINE FIELD title                ON contest TYPE string;
DEFINE FIELD slug                 ON contest TYPE string;
DEFINE FIELD description          ON contest TYPE string;
DEFINE FIELD hero_image_url       ON contest TYPE string;
DEFINE FIELD prize_description    ON contest TYPE string;
DEFINE FIELD sponsor              ON contest TYPE record(sponsor);
DEFINE FIELD featured_skater      ON contest TYPE record(skater);
DEFINE FIELD tricks               ON contest TYPE array; -- [{letter,trick_name,difficulty,video_url,thumbnail_url,notes}]
DEFINE FIELD start_at             ON contest TYPE datetime;
DEFINE FIELD submissions_close_at ON contest TYPE datetime;
DEFINE FIELD judging_close_at     ON contest TYPE datetime;
DEFINE FIELD status               ON contest TYPE string
    ASSERT $value INSIDE ["draft","scheduled","live","judging","complete","archived"];
DEFINE FIELD judges               ON contest TYPE array;  -- array<record(user)>
DEFINE FIELD winner_count         ON contest TYPE int DEFAULT 1;
DEFINE FIELD winners              ON contest TYPE array DEFAULT [];
DEFINE FIELD created_by           ON contest TYPE record(user);
DEFINE FIELD created_at           ON contest TYPE datetime VALUE time::now();
DEFINE INDEX uniq_contest_slug ON contest COLUMNS slug UNIQUE;

-- 4. Submission
DEFINE TABLE submission SCHEMAFULL;
DEFINE FIELD contest      ON submission TYPE record(contest);
DEFINE FIELD player       ON submission TYPE record(user);
DEFINE FIELD clips        ON submission TYPE object; -- {S:{video_url,thumbnail_url,duration},K:{...},...}
DEFINE FIELD status       ON submission TYPE string
    ASSERT $value INSIDE ["draft","submitted","disqualified","winner"];
DEFINE FIELD submitted_at ON submission TYPE datetime;
DEFINE FIELD upvote_count ON submission TYPE int DEFAULT 0;
DEFINE FIELD judge_score  ON submission TYPE float DEFAULT 0;
DEFINE FIELD comment      ON submission TYPE string;
DEFINE INDEX uniq_player_contest ON submission COLUMNS contest, player UNIQUE;

-- 5. Upvotes
DEFINE TABLE upvote SCHEMAFULL;
DEFINE FIELD submission ON upvote TYPE record(submission);
DEFINE FIELD user       ON upvote TYPE record(user);
DEFINE FIELD created_at ON upvote TYPE datetime VALUE time::now();
DEFINE INDEX uniq_upvote ON upvote COLUMNS submission, user UNIQUE;

-- 6. Judge scorecards
DEFINE TABLE scorecard SCHEMAFULL;
DEFINE FIELD submission ON scorecard TYPE record(submission);
DEFINE FIELD judge      ON scorecard TYPE record(user);
DEFINE FIELD scores     ON scorecard TYPE object; -- {S,K,A,T,E:1-5, style:0-10}
DEFINE FIELD total      ON scorecard TYPE float;
DEFINE FIELD comment    ON scorecard TYPE string;
DEFINE FIELD submitted_at ON scorecard TYPE datetime;
DEFINE INDEX uniq_scorecard ON scorecard COLUMNS submission, judge UNIQUE;

-- 7. Optional skater profile link on user
DEFINE FIELD skater_profile ON user TYPE option<record(skater)>;
