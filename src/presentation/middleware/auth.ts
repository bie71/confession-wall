import { createMiddleware } from 'hono/factory';
import { jwt, decode } from 'hono/jwt';
import logger from '../../infrastructure/logger';

// This middleware just verifies the JWT is valid
export const authMiddleware = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logger.error('JWT_SECRET is not set in environment variables.');
        throw new Error('Server configuration error.');
    }
    return jwt({ secret });
}

// This middleware verifies the JWT AND checks for the 'admin' role
export const adminAuthMiddleware = () => createMiddleware(async (c, next) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logger.error('JWT_SECRET is not set in environment variables.');
        return c.json({ error: 'Server configuration error' }, 500);
    }
    
    const authHandler = jwt({ secret });
    const response = await authHandler(c, async () => {});

    if (response) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const payload = c.get('jwtPayload');
    if (!payload || payload.role !== 'admin') {
        logger.warn({ payload }, 'Admin role required');
        return c.json({ error: 'Forbidden' }, 403);
    }

    await next();
});

// This is an optional middleware to enrich the context with a user if a valid token is present
export const enrichAuthContext = () => createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { payload } = decode(token);
        if (payload && payload.sub) {
            c.set('userId', payload.sub);
        }
    }
    await next();
});
