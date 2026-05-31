// server/src/index.ts — StreetChampz API entrypoint.

import express from "express";
import cors from "cors";
import { ENV } from "./env.js";
import { getDb } from "./db.js";
import { checkinRouter } from "./routes/checkin.js";
import { usersRouter } from "./routes/users.js";

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / curl (no origin) and any allow-listed origin
      if (!origin || ENV.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "12mb" })); // base64 avatars/clips can be large

app.get("/health", (_req, res) => res.json({ ok: true, service: "street-champz-api" }));

app.use(checkinRouter);
app.use(usersRouter);

// Catch-all 404 for unknown API routes
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

async function start() {
  try {
    await getDb(); // fail fast if DB is unreachable
  } catch (e) {
    console.error("[startup] could not connect to SurrealDB:", e);
    // keep serving /health so the platform doesn't crash-loop; DB calls will 500
  }
  app.listen(ENV.port, () => {
    console.log(`[api] StreetChampz API listening on :${ENV.port}`);
    console.log(`[api] CORS origins: ${ENV.corsOrigins.join(", ")}`);
  });
}

start();
