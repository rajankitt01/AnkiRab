import { Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { AuthenticatedRequest } from '../../middleware/auth';

const adminService = new AdminService();

export class AdminController {
  async getAnalytics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getDashboardAnalytics();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listAnime(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const data = await adminService.listAnime(page, limit);
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  async createAnime(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.createAnime(req.body, req.user!.userId);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateAnime(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.updateAnime(req.params.id, req.body, req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteAnime(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.deleteAnime(req.params.id, req.user!.userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async createSeason(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { animeId, seasonNumber, title } = req.body;
      const data = await adminService.createSeason(animeId, seasonNumber, title);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createEpisode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.createEpisode(req.body, req.user!.userId);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async addVideoSource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.addVideoSource(req.params.episodeId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async addAudioTrack(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.addAudioTrack(req.params.episodeId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async addSubtitleTrack(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.addSubtitleTrack(req.params.episodeId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const data = await adminService.listUsers(page, limit);
      res.json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await adminService.updateUserRole(
        req.params.userId,
        req.body.role,
        req.user!.userId
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async importMetadata(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string || '').trim();
      const results = await adminService.importMetadata(query);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
}
