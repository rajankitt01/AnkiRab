import { IMetadataProvider, ExternalAnimeMetadata } from './metadata.provider';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class AniListProvider implements IMetadataProvider {
  name = 'AniList';
  private apiUrl = env.ANILIST_API_URL;

  async searchAnime(query: string, limit = 10): Promise<ExternalAnimeMetadata[]> {
    const graphqlQuery = `
      query ($search: String, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description(asHtml: false)
            coverImage {
              large
              extraLarge
            }
            bannerImage
            format
            status
            episodes
            duration
            genres
            averageScore
            seasonYear
            studios(isMain: true) {
              nodes {
                name
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { search: query, perPage: limit }
        })
      });

      if (!response.ok) {
        logger.warn(`AniList API returned HTTP ${response.status}`);
        return [];
      }

      const json = (await response.json()) as any;
      const mediaList = json.data?.Page?.media || [];

      return mediaList.map((item: any) => this.normalize(item));
    } catch (err) {
      logger.error('AniList API fetch error:', err);
      return [];
    }
  }

  async getAnimeDetails(externalId: string | number): Promise<ExternalAnimeMetadata | null> {
    const graphqlQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          coverImage {
            large
            extraLarge
          }
          bannerImage
          format
          status
          episodes
          duration
          genres
          averageScore
          seasonYear
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { id: Number(externalId) }
        })
      });

      if (!response.ok) return null;
      const json = (await response.json()) as any;
      if (!json?.data?.Media) return null;

      return this.normalize(json.data.Media);
    } catch (err) {
      logger.error('AniList getAnimeDetails error:', err);
      return null;
    }
  }

  private normalize(item: any): ExternalAnimeMetadata {
    return {
      id: item.id,
      title: {
        romaji: item.title?.romaji || undefined,
        english: item.title?.english || undefined,
        native: item.title?.native || undefined
      },
      synopsis: item.description ? item.description.replace(/<[^>]*>?/gm, '') : 'No synopsis available.',
      posterImage: item.coverImage?.extraLarge || item.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop',
      bannerImage: item.bannerImage || undefined,
      format: item.format || 'TV',
      status: item.status || 'FINISHED',
      episodes: item.episodes || undefined,
      duration: item.duration || undefined,
      genres: item.genres || [],
      averageScore: item.averageScore ? item.averageScore / 10 : undefined,
      year: item.seasonYear || undefined,
      studios: item.studios?.nodes?.map((s: any) => s.name) || []
    };
  }
}
