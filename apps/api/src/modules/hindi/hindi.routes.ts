import { Router, Request, Response } from 'express';
import { hindiStreamService } from './hindi-stream.service';
import { prisma } from '../../config/db';
import { ANIME_TMDB_MAP } from '../episodes/episode.service';

const router = Router();

/**
 * GET /api/hindi/stream?id={animeSlug}&season={season}&ep={ep}
 * Compatibility route matching the extracted Hindi Anime API schema
 */
router.get(['/', '/stream'], async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || (req.query.slug as string);
    const season = parseInt((req.query.season as string) || '1', 10);
    const ep = parseInt((req.query.ep as string) || (req.query.episode as string) || '1', 10);
    const isMovie = req.query.movie === 'true';

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameter (id)'
      });
    }

    const data = await hindiStreamService.getHindiStreams(id, season, ep, isMovie);

    if (!data || data.servers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No Hindi streams found for this episode',
        results: []
      });
    }

    return res.json({
      success: true,
      message: 'Hindi Stream Found!!',
      results: data.servers,
      preferredEmbed: data.preferredEmbed
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
});

/**
 * GET /api/hindi/player?episodeId={uuid}&serverIndex={0..N}
 * Direct embed player for iframe insertion
 */
router.get('/player', async (req: Request, res: Response) => {
  try {
    const episodeId = req.query.episodeId as string;
    const animeSlug = req.query.slug as string;
    const seasonNum = parseInt((req.query.season as string) || '1', 10);
    const epNum = parseInt((req.query.ep as string) || '1', 10);
    const srvIdx = parseInt((req.query.server as string) || '0', 10);

    let slug = animeSlug;
    let s = seasonNum;
    let e = epNum;
    let isMovie = false;

    if (episodeId) {
      const ep = await prisma.episode.findUnique({
        where: { id: episodeId },
        include: {
          season: {
            include: {
              anime: true
            }
          }
        }
      });

      if (ep) {
        slug = ep.season.anime.slug;
        s = ep.season.seasonNumber;
        e = ep.episodeNumber;
        isMovie = ep.season.anime.format === 'MOVIE';
      }
    }

    if (!slug) {
      return res.status(400).send('Missing anime identification');
    }

    const streamData = await hindiStreamService.getHindiStreams(slug, s, e, isMovie);

    if (streamData && streamData.servers.length > 0) {
      const selected = streamData.servers[srvIdx] || streamData.servers[0];
      return res.redirect(302, selected.embed);
    }

    // Fallback if scraping mirror timed out: direct VidLink Anime Dub
    const tmdbInfo = ANIME_TMDB_MAP[slug];
    const seasonMalId = tmdbInfo?.seasonMalIds?.[s] || tmdbInfo?.malId || 20;
    return res.redirect(302, `https://vidlink.pro/anime/${seasonMalId}/${e}/dub?fallback=true&primaryColor=8b5cf6`);
  } catch {
    return res.redirect(302, 'https://vidlink.pro/anime/20/1/dub?fallback=true&primaryColor=8b5cf6');
  }
});

export default router;
