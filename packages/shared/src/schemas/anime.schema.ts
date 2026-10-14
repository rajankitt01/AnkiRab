import { z } from 'zod';

export const animeFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  format: z.enum(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL']).optional(),
  status: z.enum(['ONGOING', 'COMPLETED', 'UPCOMING']).optional(),
  audioLang: z.string().trim().optional(),
  subLang: z.string().trim().optional(),
  year: z.coerce.number().int().min(1950).max(2035).optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  sortBy: z.enum(['popularity', 'latest', 'alphabetical', 'rating']).default('popularity'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const progressUpdateSchema = z.object({
  progressSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
  completed: z.boolean().optional()
});

export const watchlistToggleSchema = z.object({
  animeId: z.string().uuid(),
  status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH']).default('PLAN_TO_WATCH'),
  rating: z.number().min(1).max(10).optional()
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  preferredAudio: z.string().min(2).max(10).optional(),
  preferredSubtitle: z.string().min(2).max(10).optional(),
  autoPlayNext: z.boolean().optional(),
  autoSkipIntro: z.boolean().optional()
});

export const adminAnimeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with dashes'),
  japaneseTitle: z.string().optional(),
  englishTitle: z.string().optional(),
  synopsis: z.string().min(10, 'Synopsis must be at least 10 characters'),
  posterImage: z.string().url('Must be valid URL'),
  coverImage: z.string().url('Must be valid URL').optional().or(z.literal('')),
  bannerImage: z.string().url('Must be valid URL').optional().or(z.literal('')),
  format: z.enum(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL']),
  status: z.enum(['ONGOING', 'COMPLETED', 'UPCOMING']),
  releaseYear: z.number().int().min(1960).max(2035),
  studio: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  hasHindiDub: z.boolean().default(false),
  hasEnglishDub: z.boolean().default(false),
  hasSubtitles: z.boolean().default(true),
  genreIds: z.array(z.string()).min(1, 'At least one genre is required')
});

export const adminEpisodeSchema = z.object({
  seasonId: z.string(),
  episodeNumber: z.number().int().positive(),
  title: z.string().min(1),
  synopsis: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal('')),
  durationMinutes: z.number().int().positive().optional(),
  introStart: z.number().min(0).optional(),
  introEnd: z.number().min(0).optional(),
  outroStart: z.number().min(0).optional(),
  outroEnd: z.number().min(0).optional(),
  airDate: z.string().optional()
});

export type AnimeFilterInput = z.infer<typeof animeFilterSchema>;
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
export type WatchlistToggleInput = z.infer<typeof watchlistToggleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminAnimeInput = z.infer<typeof adminAnimeSchema>;
export type AdminEpisodeInput = z.infer<typeof adminEpisodeSchema>;
