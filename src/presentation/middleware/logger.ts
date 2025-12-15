import { type MiddlewareHandler } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../infrastructure/logger';

export const loggerMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const requestId = uuidv4();
    const req = c.req;
    const startTime = Date.now();

    // Create a child logger with request-specific context
    const childLogger = logger.child({ requestId });
    c.set('logger', childLogger);

    childLogger.info({
      req: {
        method: req.method,
        url: req.url,
        // headers: Object.fromEntries(req.headers), // Can be too verbose
      },
    }, `--> ${req.method} ${req.path}`);

    await next();

    const duration = Date.now() - startTime;
    const { status } = c.res;

    const logPayload = {
      res: {
        status: c.res.status,
      },
      duration_ms: duration,
    };
    const logMessage = `<-- ${req.method} ${req.path} ${status} ${duration}ms`;

    if (status >= 500) {
      childLogger.error(logPayload, logMessage);
    } else if (status >= 400) {
      childLogger.warn(logPayload, logMessage);
    } else {
      childLogger.info(logPayload, logMessage);
    }
  };
};
