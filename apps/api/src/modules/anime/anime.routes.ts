import { Router } from 'express';
import { AnimeController } from './anime.controller';
import { validateQuery } from '../../middleware/validate';
import { animeFilterSchema } from '@ankirab/shared';

const router = Router();
const controller = new AnimeController();

router.get('/', validateQuery(animeFilterSchema), (req, res, next) =>
  controller.list(req, res, next)
);

router.get('/featured', (req, res, next) => controller.featured(req, res, next));
router.get('/trending', (req, res, next) => controller.trending(req, res, next));
router.get('/popular', (req, res, next) => controller.popular(req, res, next));
router.get('/recent', (req, res, next) => controller.recent(req, res, next));
router.get('/hindi-dubbed', (req, res, next) => controller.hindiDubbed(req, res, next));
router.get('/english-dubbed', (req, res, next) => controller.englishDubbed(req, res, next));
router.get('/genres', (req, res, next) => controller.getGenres(req, res, next));

router.get('/:slug', (req, res, next) => controller.getBySlug(req, res, next));
router.get('/:slug/seasons', (req, res, next) => controller.getSeasons(req, res, next));
router.get('/:slug/related', (req, res, next) => controller.getRelated(req, res, next));

export default router;
