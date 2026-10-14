import { api, ApiResponse } from './api';
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserDto,
  WatchlistItemDto,
  WatchHistoryItemDto,
  UpdateProfileInput,
  WatchStatus
} from '@ankirab/shared';

export const authService = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (!res.data) throw new Error('Registration failed');
    localStorage.setItem('ankirab_token', res.data.accessToken);
    return res.data;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (!res.data) throw new Error('Login failed');
    localStorage.setItem('ankirab_token', res.data.accessToken);
    return res.data;
  },

  async getMe(): Promise<UserDto> {
    const res = await api.get<ApiResponse<UserDto>>('/auth/me');
    if (!res.data) throw new Error('Not authenticated');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('ankirab_token');
    }
  },

  async forgotPassword(email: string) {
    return api.post<ApiResponse>('/auth/forgot-password', { email });
  }
};

export const userService = {
  async getProfile(): Promise<UserDto> {
    const res = await api.get<ApiResponse<UserDto>>('/users/me');
    if (!res.data) throw new Error('Failed to load profile');
    return res.data;
  },

  async updateProfile(data: UpdateProfileInput): Promise<UserDto> {
    const res = await api.patch<ApiResponse<UserDto>>('/users/me', data);
    if (!res.data) throw new Error('Failed to update profile');
    return res.data;
  },

  async getWatchlist(): Promise<WatchlistItemDto[]> {
    const res = await api.get<ApiResponse<WatchlistItemDto[]>>('/users/me/watchlist');
    return res.data || [];
  },

  async toggleWatchlist(animeId: string, status: WatchStatus = 'PLAN_TO_WATCH') {
    return api.post<ApiResponse>('/users/me/watchlist', { animeId, status });
  },

  async removeFromWatchlist(animeId: string) {
    return api.delete<ApiResponse>(`/users/me/watchlist/${animeId}`);
  },

  async getWatchHistory(): Promise<WatchHistoryItemDto[]> {
    const res = await api.get<ApiResponse<WatchHistoryItemDto[]>>('/users/me/history');
    return res.data || [];
  },

  async deleteAccount() {
    return api.delete<ApiResponse>('/users/me');
  }
};
