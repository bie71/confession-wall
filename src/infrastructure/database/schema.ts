import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const confessions = sqliteTable("confessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  message: text("message").notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: integer("created_at").default(sql`(strftime('%s','now'))`).notNull(),
  ipHash: text("ip_hash"),
  status: text("status").default('APPROVED').notNull(),
});

export const votes = sqliteTable("votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  confessionId: integer("confession_id").notNull(),
  ipHash: text("ip_hash").notNull(),
  value: integer("value").notNull(),
  createdAt: integer("created_at").default(sql`(strftime('%s','now'))`).notNull(),
});
