import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { adminAnimeSchema, adminEpisodeSchema } from '@ankirab/shared';

const router = Router();
const controller = new AdminController();

// Protect all admin routes: Authentication + ADMIN / MODERATOR role check
router.use(authenticate, requireRole(['ADMIN', 'MODERATOR']));

router.get('/analytics', (req, res, next) => controller.getAnalytics(req, res, next));
router.get('/anime', (req, res, next) => controller.listAnime(req, res, next));
router.post('/anime', validateBody(adminAnimeSchema), (req, res, next) =>
  controller.createAnime(req, res, next)
);
router.patch('/anime/:id', (req, res, next) => controller.updateAnime(req, res, next));
router.delete('/anime/:id', requireRole(['ADMIN']), (req, res, next) =>
  controller.deleteAnime(req, res, next)
);

router.post('/seasons', (req, res, next) => controller.createSeason(req, res, next));
router.post('/episodes', validateBody(adminEpisodeSchema), (req, res, next) =>
  controller.createEpisode(req, res, next)
);

router.post('/episodes/:episodeId/sources', (req, res, next) =>
  controller.addVideoSource(req, res, next)
);
router.post('/episodes/:episodeId/audio', (req, res, next) =>
  controller.addAudioTrack(req, res, next)
);
router.post('/episodes/:episodeId/subtitles', (req, res, next) =>
  controller.addSubtitleTrack(req, res, next)
);

router.get('/users', requireRole(['ADMIN']), (req, res, next) =>
  controller.listUsers(req, res, next)
);
router.patch('/users/:userId/role', requireRole(['ADMIN']), (req, res, next) =>
  controller.updateUserRole(req, res, next)
);

router.get('/metadata/import', (req, res, next) => controller.importMetadata(req, res, next));

export default router;
