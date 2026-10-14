import { Router } from 'express';
import { SearchController } from './search.controller';

const router = Router();
const controller = new SearchController();

router.get('/', (req, res, next) => controller.search(req, res, next));

export default router;
