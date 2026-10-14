import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from api root or monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'ankirab_dev_access_secret_super_long_32_chars_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'ankirab_dev_refresh_secret_super_long_32_chars_key_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  ANILIST_API_URL: process.env.ANILIST_API_URL || 'https://graphql.anilist.co',
  VIDEO_PROVIDER_DEFAULT: process.env.VIDEO_PROVIDER_DEFAULT || 'demo',
  VIDEO_STREAM_TOKEN_SECRET: process.env.VIDEO_STREAM_TOKEN_SECRET || 'ankirab_stream_secret_2026'
};
