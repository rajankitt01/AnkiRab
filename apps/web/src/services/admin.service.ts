import { api, ApiResponse } from './api';
import { AdminAnimeInput, AdminEpisodeInput } from '@ankirab/shared';

export const adminService = {
  async getAnalytics() {
    const res = await api.get<ApiResponse<any>>('/admin/analytics');
    return res.data;
  },

  async listAnime(page = 1, limit = 20) {
    return api.get<ApiResponse<any[]>>('/admin/anime', { page, limit });
  },

  async createAnime(data: AdminAnimeInput) {
    return api.post<ApiResponse<any>>('/admin/anime', data);
  },

  async updateAnime(id: string, data: Partial<AdminAnimeInput>) {
    return api.patch<ApiResponse<any>>(`/admin/anime/${id}`, data);
  },

  async deleteAnime(id: string) {
    return api.delete<ApiResponse<any>>(`/admin/anime/${id}`);
  },

  async createSeason(animeId: string, seasonNumber: number, title: string) {
    return api.post<ApiResponse<any>>('/admin/seasons', { animeId, seasonNumber, title });
  },

  async createEpisode(data: AdminEpisodeInput) {
    return api.post<ApiResponse<any>>('/admin/episodes', data);
  },

  async addVideoSource(episodeId: string, payload: any) {
    return api.post<ApiResponse<any>>(`/admin/episodes/${episodeId}/sources`, payload);
  },

  async addAudioTrack(episodeId: string, payload: any) {
    return api.post<ApiResponse<any>>(`/admin/episodes/${episodeId}/audio`, payload);
  },

  async addSubtitleTrack(episodeId: string, payload: any) {
    return api.post<ApiResponse<any>>(`/admin/episodes/${episodeId}/subtitles`, payload);
  },

  async listUsers(page = 1, limit = 20) {
    return api.get<ApiResponse<any>>('/admin/users', { page, limit });
  },

  async updateUserRole(userId: string, role: string) {
    return api.patch<ApiResponse<any>>(`/admin/users/${userId}/role`, { role });
  },

  async importMetadata(q: string) {
    const res = await api.get<ApiResponse<any[]>>('/admin/metadata/import', { q });
    return res.data || [];
  }
};
