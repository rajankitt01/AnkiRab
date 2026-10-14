import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';

export class ScheduleController {
  async getWeeklySchedule(_req: Request, res: Response, next: NextFunction) {
    try {
      const schedules = await prisma.releaseSchedule.findMany({
        orderBy: [{ dayOfWeek: 'asc' }, { timeString: 'asc' }],
        include: {
          anime: {
            select: {
              id: true,
              slug: true,
              title: true,
              posterImage: true,
              format: true,
              hasHindiDub: true,
              hasEnglishDub: true
            }
          }
        }
      });

      // Group by day of week: 0=Sunday, 1=Monday... 6=Saturday
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const grouped = dayNames.map((dayName, idx) => {
        const items = schedules.filter(s => s.dayOfWeek === idx);
        return {
          dayIndex: idx,
          dayName,
          episodes: items.map(i => ({
            id: i.id,
            animeId: i.animeId,
            episodeNumber: i.episodeNumber,
            airDate: i.airDate.toISOString(),
            timeString: i.timeString,
            timezone: i.timezone,
            isReleased: i.isReleased,
            anime: i.anime
          }))
        };
      });

      res.json({
        success: true,
        data: {
          timezone: 'Asia/Kolkata (IST) / UTC reference',
          schedule: grouped
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
