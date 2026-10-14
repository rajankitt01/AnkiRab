import { api, ApiResponse } from './api';
import { PlaybackSessionDto, ProgressUpdatePayload } from '@ankirab/shared';

export const playbackService = {
  async getPlaybackSession(episodeId: string): Promise<PlaybackSessionDto> {
    const res = await api.get<ApiResponse<PlaybackSessionDto>>(`/episodes/${episodeId}/playback`);
    if (!res.data) throw new Error('Failed to load playback session');
    return res.data;
  },

  async updateProgress(episodeId: string, payload: ProgressUpdatePayload) {
    return api.post<ApiResponse>(`/episodes/${episodeId}/progress`, payload);
  }
};

export const scheduleService = {
  async getWeeklySchedule() {
    const res = await api.get<ApiResponse<{ timezone: string; schedule: any[] }>>('/schedule');
    return res.data || { timezone: 'UTC', schedule: [] };
  }
};

export const searchService = {
  async search(q: string, limit = 15) {
    const res = await api.get<ApiResponse<{ query: string; total: number; suggestions: string[]; results: any[] }>>('/search', { q, limit });
    return res.data || { query: q, total: 0, suggestions: [], results: [] };
  }
};
