import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Configure pino-pretty for development
const transport = isProduction 
  ? undefined 
  : pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    });

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  // Base properties to include in every log
  base: {
    pid: process.pid,
  },
  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
}, transport);

export default logger;
