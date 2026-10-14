import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, AppError } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './modules/auth/auth.routes';
import animeRoutes from './modules/anime/anime.routes';
import episodeRoutes from './modules/episodes/episode.routes';
import userRoutes from './modules/users/user.routes';
import searchRoutes from './modules/search/search.routes';
import scheduleRoutes from './modules/schedule/schedule.routes';
import adminRoutes from './modules/admin/admin.routes';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false // Allow HLS video playback & dynamic blob sources
    })
  );

  // CORS
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Request parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limiter for general API routes
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'ANKIRAB.COM API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/anime', animeRoutes);
  app.use('/api/episodes', episodeRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/schedule', scheduleRoutes);
  app.use('/api/admin', adminRoutes);

  // Fallback for unmatched API routes
  app.use('/api/*', (req: Request, _res: Response, next) => {
    next(new AppError(`Endpoint ${req.originalUrl} not found`, 404));
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
