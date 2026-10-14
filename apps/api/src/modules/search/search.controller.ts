import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string || '').trim();
      const limit = Math.min(parseInt(req.query.limit as string || '10', 10), 30);

      if (!q) {
        res.json({
          success: true,
          data: {
            results: [],
            suggestions: []
          }
        });
        return;
      }

      const results = await prisma.anime.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { englishTitle: { contains: q } },
            { japaneseTitle: { contains: q } },
            { aliases: { some: { title: { contains: q } } } }
          ]
        },
        take: limit,
        orderBy: { rating: 'desc' },
        include: {
          genres: { include: { genre: true } },
          aliases: true
        }
      });

      // Quick autocomplete suggestions list
      const suggestions = results.slice(0, 5).map(a => a.title);

      res.json({
        success: true,
        data: {
          query: q,
          total: results.length,
          suggestions,
          results: results.map(a => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            englishTitle: a.englishTitle,
            japaneseTitle: a.japaneseTitle,
            posterImage: a.posterImage,
            format: a.format,
            releaseYear: a.releaseYear,
            rating: a.rating,
            hasHindiDub: a.hasHindiDub,
            hasEnglishDub: a.hasEnglishDub,
            genres: a.genres.map(g => g.genre.name)
          }))
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
