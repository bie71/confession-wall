import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as dotenv from 'dotenv';
import logger from '../logger';

dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env file');
}

const runMigrations = async () => {
  logger.info('Starting database migration...');
  
  // Create a new connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    logger.info('Ensuring pgvector extension is enabled...');
    await migrationClient`CREATE EXTENSION IF NOT EXISTS vector;`;
    logger.info('pgvector extension enabled.');
    await migrate(db, { migrationsFolder: 'drizzle' });
    logger.info('Migrations applied successfully!');
  } catch (error) {
    logger.error({ err: error }, 'Migration failed');
    process.exit(1);
  } finally {
    await migrationClient.end();
    logger.info('Migration client disconnected.');
  }
};

runMigrations();
