import { Request, Response, NextFunction } from 'express';
import { EpisodeService } from './episode.service';
import { AuthenticatedRequest } from '../../middleware/auth';

const episodeService = new EpisodeService();

export class EpisodeController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const episode = await episodeService.getEpisodeById(req.params.id);
      res.json({ success: true, data: episode });
    } catch (err) {
      next(err);
    }
  }

  async getPlayback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const session = await episodeService.getPlaybackSession(req.params.id, userId);
      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  async updateProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await episodeService.saveProgress(req.params.id, userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
