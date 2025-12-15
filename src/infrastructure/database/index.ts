import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import logger from "../logger";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;

// Disable pre-fetching all rows from a query
const client = postgres(connectionString, { prepare: false });
logger.info("PostgreSQL client connected");

export const db = drizzle(client, { schema, logger: process.env.NODE_ENV !== 'production' });

export { schema };
