export interface ExternalAnimeMetadata {
  id: string | number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  synopsis: string;
  posterImage: string;
  bannerImage?: string;
  format: string; // 'TV' | 'MOVIE' | etc.
  status: string; // 'FINISHED' | 'RELEASING' | etc.
  episodes?: number;
  duration?: number;
  genres: string[];
  averageScore?: number; // 0-100
  year?: number;
  studios?: string[];
}

export interface IMetadataProvider {
  name: string;
  searchAnime(query: string, limit?: number): Promise<ExternalAnimeMetadata[]>;
  getAnimeDetails(externalId: string | number): Promise<ExternalAnimeMetadata | null>;
}
