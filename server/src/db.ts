// server/src/db.ts — single shared SurrealDB connection.

import { Surreal } from "surrealdb";
import { ENV } from "./env.js";

let db: Surreal | null = null;

export async function getDb(): Promise<Surreal> {
  if (db) return db;
  const s = new Surreal();
  await s.connect(ENV.surreal.url, {
    namespace: ENV.surreal.ns,
    database: ENV.surreal.db,
    auth: { username: ENV.surreal.user, password: ENV.surreal.pass },
  });
  db = s;
  console.log(`[db] connected to SurrealDB ${ENV.surreal.url} (${ENV.surreal.ns}/${ENV.surreal.db})`);
  return db;
}

/** Run a query and return the first result set (SurrealDB returns an array per statement). */
export async function query<T = unknown>(
  sql: string,
  vars?: Record<string, unknown>,
): Promise<T> {
  const s = await getDb();
  const res = await s.query<[T]>(sql, vars);
  return res[0] as T;
}
