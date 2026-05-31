// server/src/migrate.ts — apply schema.surql to the connected database.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getDb } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = readFileSync(join(__dirname, "schema.surql"), "utf8");
  const db = await getDb();
  console.log("[migrate] applying schema…");
  await db.query(sql);
  console.log("[migrate] done ✅");
  process.exit(0);
}

main().catch((e) => {
  console.error("[migrate] failed:", e);
  process.exit(1);
});
