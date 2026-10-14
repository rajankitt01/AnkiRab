import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Anime Endpoints', () => {
  it('should list anime with pagination', async () => {
    const res = await request(app).get('/api/anime?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('should return featured anime', async () => {
    const res = await request(app).get('/api/anime/featured');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].isFeatured).toBe(true);
  });

  it('should filter by Hindi-dubbed', async () => {
    const res = await request(app).get('/api/anime/hindi-dubbed');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((item: any) => {
      expect(item.hasHindiDub).toBe(true);
    });
  });

  it('should fetch anime by slug with seasons', async () => {
    const res = await request(app).get('/api/anime/solo-leveling');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('solo-leveling');
    expect(res.body.data.seasons).toBeDefined();
    expect(res.body.data.seasons.length).toBeGreaterThan(0);
  });

  it('should return 404 for non-existent anime', async () => {
    const res = await request(app).get('/api/anime/non-existent-anime-slug-999');
    expect(res.status).toBe(404);
  });
});
