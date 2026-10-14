import { Router } from 'express';
import { EpisodeController } from './episode.controller';
import { optionalAuthenticate, authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { progressUpdateSchema } from '@ankirab/shared';

const router = Router();
const controller = new EpisodeController();

router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.get('/:id/playback', optionalAuthenticate, (req, res, next) =>
  controller.getPlayback(req, res, next)
);
router.post(
  '/:id/progress',
  authenticate,
  validateBody(progressUpdateSchema),
  (req, res, next) => controller.updateProgress(req, res, next)
);

export default router;
