import { Request, Response, NextFunction } from 'express';
import { AnimeService } from './anime.service';

const animeService = new AnimeService();

export class AnimeController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await animeService.listAnime(req.query as any);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async featured(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getFeaturedAnime();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async trending(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getTrendingAnime();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async popular(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getPopularAnime();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async recent(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getRecentlyAdded();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async hindiDubbed(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getByAudioLanguage('hi');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async englishDubbed(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getByAudioLanguage('en');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getAnimeBySlug(req.params.slug);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getSeasons(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getAnimeSeasons(req.params.slug);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getRelated(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getRelatedAnime(req.params.slug);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getGenres(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await animeService.getAllGenres();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
