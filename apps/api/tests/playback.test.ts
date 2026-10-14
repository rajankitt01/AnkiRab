import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Playback and Episode Endpoints', () => {
  let episodeId: string;
  let authToken: string;

  beforeAll(async () => {
    // Get an episode ID from seeded anime
    const animeRes = await request(app).get('/api/anime/solo-leveling');
    episodeId = animeRes.body.data.seasons[0].episodes[0].id;

    // Login demo user
    const loginRes = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'demo@ankirab.com',
      password: 'DemoUserPass123!'
    });
    authToken = loginRes.body.data.accessToken;
  });

  it('should get playback session with authorized streams and audio tracks', async () => {
    const res = await request(app).get(`/api/episodes/${episodeId}/playback`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sources.length).toBeGreaterThan(0);
    expect(res.body.data.audioTracks.length).toBeGreaterThan(0);
    expect(res.body.data.subtitleTracks.length).toBeGreaterThan(0);
    expect(res.body.data.intro).toBeDefined();
  });

  it('should record playback progress for authenticated user', async () => {
    const res = await request(app)
      .post(`/api/episodes/${episodeId}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        progressSeconds: 350,
        durationSeconds: 1440,
        completed: false
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
