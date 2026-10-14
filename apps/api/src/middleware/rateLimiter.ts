import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 600 : 2000, // Generous limit to prevent false 429s
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/video') || req.path.startsWith('/subtitles') || req.path === '/health',
  message: {
    success: false,
    error: 'Too many requests, please slow down'
  }
});
