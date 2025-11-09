import { sql } from "drizzle-orm";
import { db } from "../db";

await db.run(sql`CREATE TABLE IF NOT EXISTS confessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  message TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  ip_hash TEXT
);`);

await db.run(sql`CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  confession_id INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);`);

console.log("DB ready");

// Add column status if not exists
const cols = await db.all(sql`PRAGMA table_info(confessions);`);
const hasStatus = cols.some((r: any) => r.name === "status");
if (!hasStatus) {
  await db.run(sql`ALTER TABLE confessions ADD COLUMN status TEXT NOT NULL DEFAULT 'APPROVED';`);
  console.log("Added status column");
}
