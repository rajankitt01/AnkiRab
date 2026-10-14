/**
 * ANKIRAB — High-Performance Hindi Dubbed Stream Extraction Engine
 * Extracted from community Hindi Anime API (ToonStream / AnimeSalt scrapers)
 * Lightweight, resilient, and multi-mirror with memory caching
 */

interface HindiServerOption {
  server: string;
  embed: string;
}

interface HindiStreamResult {
  source: string;
  targetSlug: string;
  season: number;
  episode: number;
  servers: HindiServerOption[];
  preferredEmbed: string;
}

const SLUG_MAP: Record<string, string> = {
  'demon-slayer': 'demon-slayer-kimetsu-no-yaiba',
  'naruto': 'naruto',
  'naruto-shippuden': 'naruto-shippuden',
  'solo-leveling': 'solo-leveling',
  'jujutsu-kaisen': 'jujutsu-kaisen',
  'attack-on-titan': 'attack-on-titan',
  'chainsaw-man': 'chainsaw-man',
  'spy-x-family': 'spy-x-family',
  'death-note': 'death-note',
  'frieren-beyond-journeys-end': 'frieren-beyond-journeys-end',
  'one-piece': 'one-piece',
  'bleach-thousand-year-blood-war': 'bleach-thousand-year-blood-war',
  'your-name': 'your-name'
};

const MIRRORS = ['https://toonstream.us', 'https://animesalt.cx'];

// In-memory cache with 12 hour TTL
const cache = new Map<string, { data: HindiStreamResult; expiresAt: number }>();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export class HindiStreamService {
  /**
   * Scrapes real Hindi dubbed embed streaming sources
   */
  async getHindiStreams(
    animeSlug: string,
    season = 1,
    episode = 1,
    isMovie = false
  ): Promise<HindiStreamResult | null> {
    const targetSlug = SLUG_MAP[animeSlug] || animeSlug;
    const cacheKey = `${targetSlug}-${season}x${episode}-${isMovie ? 'movie' : 'series'}`;

    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    for (const base of MIRRORS) {
      const url = isMovie
        ? `${base}/movies/${targetSlug}/`
        : `${base}/episode/${targetSlug}-${season}x${episode}/`;

      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
            'Referer': `${base}/`,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) continue;
        const html = await res.text();

        // Extract iframes matching video players
        const regex = /<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
        const foundUrls: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(html)) !== null) {
          let src = match[1].replace(/&#038;/g, '&');
          if (src.startsWith('//')) src = 'https:' + src;

          // Filter out ads, analytics, and non-video iframes
          if (
            !foundUrls.includes(src) &&
            !src.includes('google') &&
            !src.includes('facebook') &&
            !src.includes('recaptcha') &&
            !src.includes('twitter')
          ) {
            foundUrls.push(src);
          }
        }

        if (foundUrls.length > 0) {
          const servers: HindiServerOption[] = foundUrls.map((embedUrl, idx) => {
            let label = `Server ${idx + 1}`;
            try {
              const u = new URL(embedUrl);
              label = u.hostname.replace(/^www\./, '');
            } catch {
              // fallback label
            }
            return {
              server: label,
              embed: embedUrl
            };
          });

          // Pick the most reliable embed (RubyStm, Ravok, AbyssPlayer, or first)
          const preferred =
            foundUrls.find((u) => u.includes('rubystm.com') || u.includes('ravok.buzz')) ||
            foundUrls[0];

          const result: HindiStreamResult = {
            source: base,
            targetSlug,
            season,
            episode,
            servers,
            preferredEmbed: preferred
          };

          cache.set(cacheKey, {
            data: result,
            expiresAt: Date.now() + CACHE_TTL_MS
          });

          return result;
        }
      } catch (err: any) {
        // Try next mirror
      }
    }

    return null;
  }
}

export const hindiStreamService = new HindiStreamService();
