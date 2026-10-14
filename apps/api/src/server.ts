import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`⚡ ANKIRAB API Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`📺 Allowed CORS Origin: ${env.CORS_ORIGIN}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
