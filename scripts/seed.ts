import { db } from '../src/infrastructure/database';
import { users } from '../src/infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import logger from '../src/infrastructure/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'supersecret';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin';

const seed = async () => {
    logger.info('Checking for admin user...');
    
    const existingAdmin = await db.select().from(users).where(eq(users.email, SEED_ADMIN_EMAIL));

    if (existingAdmin.length > 0) {
        logger.info('Admin user already exists.');
        return;
    }

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
};

seed().catch((err) => {
    logger.error({ err }, 'Seeding failed');
    process.exit(1);
}).finally(() => {
    logger.info('Seeding process finished.');
});
