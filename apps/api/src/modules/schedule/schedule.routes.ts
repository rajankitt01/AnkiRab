import { Router } from 'express';
import { ScheduleController } from './schedule.controller';

const router = Router();
const controller = new ScheduleController();

router.get('/', (req, res, next) => controller.getWeeklySchedule(req, res, next));

export default router;
