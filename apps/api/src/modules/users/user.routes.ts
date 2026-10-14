import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { updateProfileSchema, watchlistToggleSchema } from '@ankirab/shared';

const router = Router();
const controller = new UserController();

// All user routes are authenticated
router.use(authenticate);

router.get('/me', (req, res, next) => controller.getProfile(req, res, next));
router.patch('/me', validateBody(updateProfileSchema), (req, res, next) =>
  controller.updateProfile(req, res, next)
);
router.delete('/me', (req, res, next) => controller.deleteAccount(req, res, next));

router.get('/me/watchlist', (req, res, next) => controller.getWatchlist(req, res, next));
router.post('/me/watchlist', validateBody(watchlistToggleSchema), (req, res, next) =>
  controller.toggleWatchlist(req, res, next)
);
router.delete('/me/watchlist/:animeId', (req, res, next) =>
  controller.removeFromWatchlist(req, res, next)
);

router.get('/me/history', (req, res, next) => controller.getHistory(req, res, next));
router.patch('/me/anime-status/:animeId', (req, res, next) =>
  controller.updateAnimeStatus(req, res, next)
);

export default router;
