import { drizzle } from 'drizzle-orm/postgres-js';
import { users, badWords } from '../src/infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import logger from '../src/infrastructure/logger';
import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'supersecret';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin';

const BAD_WORDS_TO_SEED = [
    "anjing", "bangsat", "kontol", "memek", "goblok", "tolol", 
    "bajingan", "asu", "babi", "setan", "brengsek"
];

const seedClient = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(seedClient);

const seed = async () => {
    logger.info('Checking for admin user...');
    
    const existingAdmin = await db.select().from(users).where(eq(users.email, SEED_ADMIN_EMAIL));

    if (existingAdmin.length > 0) {
        logger.info('Admin user already exists.');
    } else {
        logger.info('Admin user not found, creating one...');

        const hashedPassword = await Bun.password.hash(SEED_ADMIN_PASSWORD, {
            algorithm: 'bcrypt',
            cost: 10,
        });

        await db.insert(users).values({
            name: SEED_ADMIN_NAME,
            email: SEED_ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
        });

        logger.info('Default admin user created successfully!');
    }
    
    logger.info('Seeding bad words...');
    const existingBadWords = await db.select().from(badWords);
    const existingWords = existingBadWords.map(bw => bw.word);
    
    const newWords = BAD_WORDS_TO_SEED.filter(w => !existingWords.includes(w));
    
    if (newWords.length === 0) {
        logger.info('All bad words are already seeded.');
    } else {
        await db.insert(badWords).values(newWords.map(word => ({ word })));
        logger.info(`Seeded ${newWords.length} new bad words.`);
    }

};

seed().catch((err) => {
    logger.error({ err }, 'Seeding failed');
    process.exit(1);
}).finally(async () => {
    logger.info('Seeding process finished. Closing connection...');
    await seedClient.end();
    logger.info('Connection closed.');
});
