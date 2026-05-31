// server/src/env.ts — centralized, validated environment config.

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const ENV = {
  port: Number(process.env.PORT ?? 3000),
  surreal: {
    url: req("SURREAL_URL", "ws://127.0.0.1:8000/rpc"),
    ns: req("SURREAL_NS", "streetchampz"),
    db: req("SURREAL_DB", "main"),
    user: req("SURREAL_USER", "root"),
    pass: req("SURREAL_PASS", "root"),
  },
  jwtSecret: req("JWT_SECRET", "dev-insecure-secret-change-me"),
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  isProd: process.env.NODE_ENV === "production",
};
