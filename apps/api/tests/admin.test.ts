import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Admin Endpoints & RBAC', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const adminLogin = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'admin@ankirab.com',
      password: 'AdminSecurePass123!'
    });
    adminToken = adminLogin.body.data.accessToken;

    const userLogin = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'demo@ankirab.com',
      password: 'DemoUserPass123!'
    });
    userToken = userLogin.body.data.accessToken;
  });

  it('should block regular user from accessing admin analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should block unauthenticated requests to admin routes', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(401);
  });

  it('should allow admin to access dashboard analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totals).toBeDefined();
    expect(res.body.data.totals.anime).toBeGreaterThan(0);
  });

  it('should allow admin to list users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });
});
