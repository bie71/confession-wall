import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database("confession.db", { create: true });

type RawQuery = { sql: string; params?: any[] };
const execRaw = <T = any>({ sql, params = [] }: RawQuery) => {
  const stmt = sqlite.prepare(sql);
  const isSelect = /^\s*(SELECT|PRAGMA|WITH)/i.test(sql);
  if (isSelect) {
    return { rows: stmt.all(...params) as T[] };
  }
  stmt.run(...params);
  return { rows: [] as T[] };
};

const drizzleDb = drizzle(sqlite, { schema });
export const db = Object.assign(drizzleDb, {
  execute: execRaw,
});

export { schema };
export { sqlite };
