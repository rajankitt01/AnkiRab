import { api, ApiResponse } from './api';
import { AnimeDto, AnimeFilterQuery, GenreDto, PaginatedResult } from '@ankirab/shared';

export const animeService = {
  async getFeatured(): Promise<AnimeDto[]> {
    const res = await api.get<ApiResponse<AnimeDto[]>>('/anime/featured');
    return res.data || [];
  },

  async getTrending(): Promise<AnimeDto[]> {
    const res = await api.get<ApiResponse<AnimeDto[]>>('/anime/trending');
    return res.data || [];
  },

  async getPopular(): Promise<AnimeDto[]> {
    const res = await api.get<ApiResponse<AnimeDto[]>>('/anime/popular');
    return res.data || [];
  },

  async getRecentlyAdded(): Promise<AnimeDto[]> {
    const res = await api.get<ApiResponse<AnimeDto[]>>('/anime/recent');
    return res.data || [];
  },

  async getHindiDubbed(): Promise<AnimeDto[]> {
    const res = await api.get<ApiResponse<AnimeDto[]>>('/anime/hindi-dubbed');
    return res.data || [];
  },

  async getEnglishDubbed(): Promise<AnimeDto[]> {
    const res = await api.get<ApiResponse<AnimeDto[]>>('/anime/english-dubbed');
    return res.data || [];
  },

  async getCatalog(query: AnimeFilterQuery): Promise<PaginatedResult<AnimeDto>> {
    const res = await api.get<ApiResponse<AnimeDto[]>>('/anime', query);
    return {
      data: res.data || [],
      pagination: res.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  },

  async getBySlug(slug: string): Promise<AnimeDto> {
    const res = await api.get<ApiResponse<AnimeDto>>(`/anime/${slug}`);
    if (!res.data) throw new Error('Anime not found');
    return res.data;
  },

  async getRelated(slug: string): Promise<AnimeDto[]> {
    const res = await api.get<ApiResponse<AnimeDto[]>>(`/anime/${slug}/related`);
    return res.data || [];
  },

  async getGenres(): Promise<GenreDto[]> {
    const res = await api.get<ApiResponse<GenreDto[]>>('/anime/genres');
    return res.data || [];
  }
};
