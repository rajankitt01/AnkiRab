import { Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { AuthenticatedRequest } from '../../middleware/auth';

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getProfile(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getWatchlist(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async toggleWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { animeId, status } = req.body;
      const data = await userService.toggleWatchlist(req.user!.userId, animeId, status);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async removeFromWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.removeFromWatchlist(req.user!.userId, req.params.animeId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getWatchHistory(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateAnimeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, rating } = req.body;
      const data = await userService.updateAnimeStatus(
        req.user!.userId,
        req.params.animeId,
        status,
        rating
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.deleteAccount(req.user!.userId);
      res.clearCookie('ankirab_token');
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
