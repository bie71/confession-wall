import { pgTable, serial, varchar, text, integer, timestamp, customType } from "drizzle-orm/pg-core";

// Define the dimension of the vector embeddings. 384 is common for small models.
const embeddingDimension = 384;

// Custom type for pgvector
const pgVector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return `vector(${embeddingDimension})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default('user').notNull(), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const confessions = pgTable("confessions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ipHash: varchar("ip_hash", { length: 64 }),
  status: text("status").default('APPROVED').notNull(),
  embedding: pgVector("embedding"),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  confessionId: integer("confession_id").notNull().references(() => confessions.id, { onDelete: 'cascade' }),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badWords = pgTable("bad_words", {
  id: serial("id").primaryKey(),
  word: varchar("word", { length: 256 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
